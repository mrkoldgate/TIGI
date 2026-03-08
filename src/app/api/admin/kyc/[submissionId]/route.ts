// ---------------------------------------------------------------------------
// PATCH /api/admin/kyc/[submissionId]
//
// Compliance officer decision endpoint: approve, reject, or escalate a
// KYC submission. Updates both the KycVerification record and the
// corresponding User.kycStatus field. Writes an immutable AuditLog entry.
//
// Access: ADMIN or COMPLIANCE_OFFICER only.
//
// Body:
//   { action: 'approve' | 'reject' | 'escalate' | 'request_update', note?: string }
//
// request_update: returns submission to PENDING (user must re-submit).
//   KycVerification.status → PENDING, User.kycStatus → PENDING.
//
// Vendor integration path:
//   On 'approve', call the KYC provider's verification confirmation endpoint
//   using kycVerification.providerRef so the provider mirrors the decision.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const DecisionSchema = z.object({
  action: z.enum(['approve', 'reject', 'escalate', 'request_update']),
  note:   z.string().max(2000).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const isAdminOrCompliance =
    session.user.role === 'ADMIN' || session.user.role === 'COMPLIANCE_OFFICER'
  if (!isAdminOrCompliance) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 },
    )
  }

  const { submissionId } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const parsed = DecisionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 422 },
    )
  }

  const { action, note } = parsed.data

  try {
    const verification = await prisma.kycVerification.findUnique({
      where:  { id: submissionId },
      select: { id: true, userId: true, status: true },
    })
    if (!verification) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'KYC submission not found' } },
        { status: 404 },
      )
    }

    // Map action → KycVerification status
    const newVerifStatus =
      action === 'approve'         ? 'VERIFIED'            :
      action === 'reject'          ? 'REJECTED'            :
      action === 'request_update'  ? 'PENDING'             :
      /* escalate */                 verification.status   // keep current status, just log it

    // Map action → User.kycStatus
    const newUserStatus =
      action === 'approve'        ? 'VERIFIED' :
      action === 'reject'         ? 'REJECTED' :
      action === 'request_update' ? 'PENDING'  :
      null // escalate doesn't change the user's visible status

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.kycVerification.update({
        where: { id: submissionId },
        data:  {
          status:      newVerifStatus as never,
          reviewedBy:  session.user.id,
          reviewNote:  note ?? null,
          reviewedAt:  new Date(),
        },
      })

      if (newUserStatus) {
        await tx.user.update({
          where: { id: verification.userId },
          data:  { kycStatus: newUserStatus as never },
        })
      }

      await tx.auditLog.create({
        data: {
          userId:       session.user.id,
          action:       `kyc.${action}`,
          resourceType: 'KycVerification',
          resourceId:   submissionId,
          metadata: {
            targetUserId: verification.userId,
            previousStatus: verification.status,
            newStatus: newVerifStatus,
            note: note ?? null,
          },
        },
      })

      return updated
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('[api/admin/kyc PATCH]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process KYC decision' } },
      { status: 500 },
    )
  }
}
