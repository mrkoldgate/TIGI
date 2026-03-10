// ---------------------------------------------------------------------------
// GET /api/notifications
//
// Returns the authenticated user's notification feed.
//
// Query params:
//   limit        — max results (default 30, max 100)
//   offset       — pagination offset (default 0)
//   unread_only  — "true" to filter to unread only
//
// Response:
//   { success, data: { notifications, unreadCount, total } }
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import type { NotificationType } from '@/lib/notifications/notification-types'
import { logger } from '@/lib/logger'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const url        = new URL(req.url)
  const limit      = Math.min(parseInt(url.searchParams.get('limit')  ?? '30', 10), 100)
  const offset     = parseInt(url.searchParams.get('offset') ?? '0', 10)
  const unreadOnly = url.searchParams.get('unread_only') === 'true'

  const userId = session.user.id

  try {
    const where = {
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    }

    const [rows, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take:    limit,
        skip:    offset,
        select: {
          id: true, type: true, title: true, body: true,
          actionUrl: true, metadata: true, readAt: true, createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ])

    const notifications = rows.map((n) => ({
      ...n,
      type:     n.type as NotificationType,
      metadata: (n.metadata ?? {}) as Record<string, unknown>,
    }))

    return NextResponse.json({
      success: true,
      data: { notifications, unreadCount, total },
    })
  } catch (err) {
    logger.error('[api/notifications GET]', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notifications' } },
      { status: 500 },
    )
  }
}
