// ---------------------------------------------------------------------------
// PATCH /api/intents/[id]
//
// User-initiated intent update. Currently supports one action:
//   cancel → status = CANCELLED
//
// Only the intent owner may cancel their own intent.
// Intents in APPROVED / EXECUTED / CANCELLED / EXPIRED state cannot be cancelled.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

const PatchIntentSchema = z.object({
  action: z.enum(['cancel']),
})

const TERMINAL_STATUSES = ['APPROVED', 'EXECUTED', 'CANCELLED', 'EXPIRED']

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

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const parsed = PatchIntentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 422 },
    )
  }

  try {
    const intent = await prisma.transactionIntent.findUnique({
      where:  { id },
      select: { id: true, userId: true, status: true, intentType: true, propertyId: true },
    })

    if (!intent) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Intent not found' } },
        { status: 404 },
      )
    }

    if (intent.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not your intent' } },
        { status: 403 },
      )
    }

    if (TERMINAL_STATUSES.includes(intent.status)) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_TERMINAL', message: `Intent is already ${intent.status.toLowerCase()}` } },
        { status: 409 },
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.transactionIntent.update({
        where: { id },
        data:  { status: 'CANCELLED' as never },
      })

      await tx.auditLog.create({
        data: {
          userId:       session.user.id,
          action:       'intent.cancel',
          resourceType: 'TransactionIntent',
          resourceId:   id,
          metadata: {
            intentType:     intent.intentType,
            propertyId:     intent.propertyId,
            previousStatus: intent.status,
          },
        },
      })

      return result
    })

    return NextResponse.json({ success: true, data: { id: updated.id, status: updated.status } })
  } catch (err) {
    logger.error('[api/intents/[id] PATCH]', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update intent' } },
      { status: 500 },
    )
  }
}
