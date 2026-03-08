// ---------------------------------------------------------------------------
// GET  /api/users/me/legacy — fetch current user's LegacyPlan (with beneficiaries)
// POST /api/users/me/legacy — create or update LegacyPlan
//
// The POST endpoint handles both create (if no plan exists) and update
// (upsert semantics). It also accepts `action: 'submit'` to advance the
// plan status from DRAFT → SUBMITTED.
//
// Body fields (all optional for partial saves):
//   instructions, specialConditions, executorName, executorEmail, executorPhone,
//   onboardingStep, action ('save' | 'submit')
//
// Guards for submit:
//   - Must be in DRAFT status (or re-submitting after REQUEST_UPDATE review)
//   - Must have at least one beneficiary
//   - Total allocation across beneficiaries must equal 100
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications/notification-service'

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
    include: {
      beneficiaries: { orderBy: { createdAt: 'asc' } },
    },
  })

  return NextResponse.json({ success: true, data: plan })
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
    instructions?:      string
    specialConditions?: string
    executorName?:      string
    executorEmail?:     string
    executorPhone?:     string
    onboardingStep?:    number
    action?:            'save' | 'submit'
  }

  const userId = session.user.id
  const isSubmit = body.action === 'submit'

  if (isSubmit) {
    // Validate before submitting
    const existing = await prisma.legacyPlan.findUnique({
      where:  { userId },
      include: { beneficiaries: { select: { allocationPercent: true } } },
    })

    const submittableStatuses = ['DRAFT', 'SUSPENDED']
    if (existing && !submittableStatuses.includes(existing.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code:    'INVALID_STATUS',
            message: `Plan cannot be submitted in current status: ${existing.status}`,
          },
        },
        { status: 409 },
      )
    }

    if (!existing || existing.beneficiaries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NO_BENEFICIARIES', message: 'Add at least one beneficiary before submitting.' },
        },
        { status: 422 },
      )
    }

    const totalAlloc = existing.beneficiaries.reduce((s, b) => s + b.allocationPercent, 0)
    if (totalAlloc !== 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code:    'ALLOCATION_MISMATCH',
            message: `Beneficiary allocations must sum to 100%. Currently at ${totalAlloc}%.`,
          },
        },
        { status: 422 },
      )
    }
  }

  const data = {
    ...(body.instructions      !== undefined && { instructions:      body.instructions }),
    ...(body.specialConditions !== undefined && { specialConditions: body.specialConditions }),
    ...(body.executorName      !== undefined && { executorName:      body.executorName }),
    ...(body.executorEmail     !== undefined && { executorEmail:     body.executorEmail }),
    ...(body.executorPhone     !== undefined && { executorPhone:     body.executorPhone }),
    ...(body.onboardingStep    !== undefined && { onboardingStep:    body.onboardingStep }),
    ...(isSubmit && {
      status:      'SUBMITTED' as never,
      submittedAt: new Date(),
    }),
  }

  const plan = await prisma.legacyPlan.upsert({
    where:  { userId },
    update: data,
    create: { userId, ...data },
    include: { beneficiaries: { orderBy: { createdAt: 'asc' } } },
  })

  if (isSubmit) {
    await prisma.auditLog.create({
      data: {
        userId,
        action:       'legacy.submit',
        resourceType: 'LegacyPlan',
        resourceId:   plan.id,
        metadata:     { beneficiaryCount: plan.beneficiaries.length },
      },
    })

    // Confirm submission to the user — non-blocking
    void createNotification({
      userId,
      type:      'LEGACY_SUBMITTED',
      title:     'Legacy plan submitted for review',
      body:      `Your legacy plan with ${plan.beneficiaries.length} beneficiar${plan.beneficiaries.length === 1 ? 'y' : 'ies'} has been submitted and is under compliance review. We'll notify you when it's approved.`,
      actionUrl: '/inheritance',
      metadata:  { planId: plan.id },
    })
  }

  return NextResponse.json({ success: true, data: plan })
}
