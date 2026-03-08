// ---------------------------------------------------------------------------
// PATCH  /api/users/me/beneficiaries/[id] — update a beneficiary
// DELETE /api/users/me/beneficiaries/[id] — remove a beneficiary
//
// Both routes verify ownership via the plan's userId.
// Blocked if the plan is SUBMITTED or UNDER_REVIEW.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

async function getOwnedBeneficiary(beneficiaryId: string, userId: string) {
  return prisma.legacyBeneficiary.findFirst({
    where: {
      id:   beneficiaryId,
      plan: { userId },
    },
    include: { plan: { select: { id: true, status: true } } },
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id } = await params
  const record = await getOwnedBeneficiary(id, session.user.id)

  if (!record) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Beneficiary not found' } },
      { status: 404 },
    )
  }

  if (['SUBMITTED', 'UNDER_REVIEW'].includes(record.plan.status)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PLAN_LOCKED', message: 'Cannot modify beneficiaries while the plan is under review.' },
      },
      { status: 409 },
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

  if (
    body.allocationPercent !== undefined &&
    (body.allocationPercent < 0 || body.allocationPercent > 100)
  ) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: 'Allocation must be between 0 and 100.' } },
      { status: 422 },
    )
  }

  const updated = await prisma.legacyBeneficiary.update({
    where: { id },
    data: {
      ...(body.name              !== undefined && { name:              body.name.trim() }),
      ...(body.email             !== undefined && { email:             body.email?.trim() || null }),
      ...(body.phone             !== undefined && { phone:             body.phone?.trim() || null }),
      ...(body.relationship      !== undefined && { relationship:      body.relationship as never }),
      ...(body.allocationPercent !== undefined && { allocationPercent: body.allocationPercent }),
      ...(body.notes             !== undefined && { notes:             body.notes?.trim() || null }),
    },
  })

  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id } = await params
  const record = await getOwnedBeneficiary(id, session.user.id)

  if (!record) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Beneficiary not found' } },
      { status: 404 },
    )
  }

  if (['SUBMITTED', 'UNDER_REVIEW'].includes(record.plan.status)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PLAN_LOCKED', message: 'Cannot modify beneficiaries while the plan is under review.' },
      },
      { status: 409 },
    )
  }

  await prisma.legacyBeneficiary.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
