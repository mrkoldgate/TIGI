// ---------------------------------------------------------------------------
// PATCH /api/admin/legacy/[planId]
//
// Compliance officer review action for a LegacyPlan submission.
//
// Access: ADMIN or COMPLIANCE_OFFICER only.
//
// Body:
//   { action: 'approve' | 'reject' | 'request_update', note?: string }
//
// approve:        SUBMITTED/UNDER_REVIEW → ACTIVE
// reject:         → SUSPENDED (plan on file but not active)
// request_update: → DRAFT (user can edit and re-submit, reviewNote preserved)
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications/notification-service'

const DecisionSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_update']),
  note:   z.string().max(2000).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const allowed = ['ADMIN', 'COMPLIANCE_OFFICER']
  if (!allowed.includes(session.user.role ?? '')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 },
    )
  }

  const { planId } = await params

  const body = await req.json().catch(() => ({}))
  const parse = DecisionSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: parse.error.issues[0]?.message ?? 'Invalid body' } },
      { status: 422 },
    )
  }

  const { action, note } = parse.data

  const plan = await prisma.legacyPlan.findUnique({
    where:  { id: planId },
    select: { id: true, status: true, userId: true },
  })

  if (!plan) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Legacy plan not found' } },
      { status: 404 },
    )
  }

  const reviewable = ['SUBMITTED', 'UNDER_REVIEW']
  if (!reviewable.includes(plan.status)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code:    'INVALID_STATUS',
          message: `Plan is not in a reviewable state. Current status: ${plan.status}`,
        },
      },
      { status: 409 },
    )
  }

  const newStatus =
    action === 'approve'        ? 'ACTIVE'     :
    action === 'reject'         ? 'SUSPENDED'  :
    /* request_update */          'DRAFT'

  const updated = await prisma.legacyPlan.update({
    where: { id: planId },
    data:  {
      status:     newStatus as never,
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      reviewNote: note ?? null,
    },
  })

  await prisma.auditLog.create({
    data: {
      userId:       session.user.id,
      action:       `legacy.${action}`,
      resourceType: 'LegacyPlan',
      resourceId:   planId,
      metadata: {
        previousStatus: plan.status,
        newStatus,
        reviewNote:     note ?? null,
        planUserId:     plan.userId,
      },
    },
  })

  // Notify the plan owner — non-blocking
  const legacyNotifMap: Record<string, { type: string; title: string; body: string }> = {
    approve: {
      type:  'LEGACY_APPROVED',
      title: 'Legacy plan approved',
      body:  'Your legacy plan has been reviewed and is now active on file.',
    },
    reject: {
      type:  'LEGACY_REJECTED',
      title: 'Legacy plan suspended',
      body:  note
        ? `Your legacy plan has been suspended. ${note}`
        : 'Your legacy plan has been suspended. Please contact support.',
    },
    request_update: {
      type:  'LEGACY_UPDATE_REQUESTED',
      title: 'Updates needed on your legacy plan',
      body:  note
        ? `Please update your legacy plan and resubmit. ${note}`
        : 'Please review and resubmit your legacy plan.',
    },
  }
  const notif = legacyNotifMap[action]
  if (notif) {
    void createNotification({
      userId:    plan.userId,
      type:      notif.type as never,
      title:     notif.title,
      body:      notif.body,
      actionUrl: '/inheritance',
      metadata:  { planId },
    })
  }

  return NextResponse.json({ success: true, data: { id: updated.id, status: updated.status } })
}
