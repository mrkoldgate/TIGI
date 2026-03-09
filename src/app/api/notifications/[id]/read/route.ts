// ---------------------------------------------------------------------------
// PATCH /api/notifications/[id]/read
//
// Marks a single notification as read (sets readAt = now).
// Idempotent — already-read notifications are silently accepted.
// Ownership guard: only the owning user can mark their notification read.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function PATCH(
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

  try {
    // Ownership check + idempotent read
    const notification = await prisma.notification.findUnique({
      where:  { id },
      select: { userId: true, readAt: true },
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } },
        { status: 404 },
      )
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 },
      )
    }

    // Already read — nothing to do
    if (notification.readAt) {
      return NextResponse.json({ success: true, data: { id, alreadyRead: true } })
    }

    await prisma.notification.update({
      where: { id },
      data:  { readAt: new Date() },
    })

    return NextResponse.json({ success: true, data: { id, readAt: new Date() } })
  } catch (err) {
    logger.error('[api/notifications/[id]/read PATCH]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to mark notification read' } },
      { status: 500 },
    )
  }
}
