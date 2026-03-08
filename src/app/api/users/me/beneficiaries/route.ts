// ---------------------------------------------------------------------------
// GET  /api/users/me/beneficiaries — list user's legacy beneficiaries
// POST /api/users/me/beneficiaries — add a beneficiary to the legacy plan
//
// The plan is auto-created (in DRAFT) if it doesn't exist when a beneficiary
// is added — so users don't need to explicitly create a plan first.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const plan = await prisma.legacyPlan.findUnique({
    where:  { userId: session.user.id },
    select: {
      beneficiaries: { orderBy: { createdAt: 'asc' } },
    },
  })

  return NextResponse.json({ success: true, data: plan?.beneficiaries ?? [] })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const body = await req.json().catch(() => ({})) as {
    name?:              string
    email?:             string
    phone?:             string
    relationship?:      string
    allocationPercent?: number
    notes?:             string
  }

  if (!body.name?.trim()) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: 'Beneficiary name is required.' } },
      { status: 422 },
    )
  }

  if (
    body.allocationPercent !== undefined &&
    (body.allocationPercent < 0 || body.allocationPercent > 100)
  ) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: 'Allocation must be between 0 and 100.' } },
      { status: 422 },
    )
  }

  const userId = session.user.id

  // Ensure plan exists (auto-create DRAFT if needed)
  const plan = await prisma.legacyPlan.upsert({
    where:  { userId },
    update: {},
    create: { userId },
    select: { id: true, status: true },
  })

  // Block adding beneficiaries to submitted/active plans (require update flow)
  if (['SUBMITTED', 'UNDER_REVIEW'].includes(plan.status)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code:    'PLAN_LOCKED',
          message: 'Cannot modify beneficiaries while the plan is under review.',
        },
      },
      { status: 409 },
    )
  }

  const beneficiary = await prisma.legacyBeneficiary.create({
    data: {
      legacyPlanId:      plan.id,
      name:              body.name.trim(),
      email:             body.email?.trim() || null,
      phone:             body.phone?.trim() || null,
      relationship:      (body.relationship as never) ?? 'OTHER',
      allocationPercent: body.allocationPercent ?? 0,
      notes:             body.notes?.trim() || null,
    },
  })

  return NextResponse.json({ success: true, data: beneficiary }, { status: 201 })
}
