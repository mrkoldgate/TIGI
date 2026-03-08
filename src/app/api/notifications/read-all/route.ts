// ---------------------------------------------------------------------------
// PATCH /api/notifications/read-all
//
// Marks ALL unread notifications for the authenticated user as read.
// Bulk updateMany — efficient single query regardless of unread count.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function PATCH() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const now = new Date()

    const result = await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data:  { readAt: now },
    })

    return NextResponse.json({ success: true, data: { markedRead: result.count } })
  } catch (err) {
    console.error('[api/notifications/read-all PATCH]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to mark all notifications read' } },
      { status: 500 },
    )
  }
}
