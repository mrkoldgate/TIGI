// ---------------------------------------------------------------------------
// Notification queries — server-side data access for the notification feed.
//
// All functions use React cache() for request-level deduplication when called
// from multiple Server Components in the same render tree.
// ---------------------------------------------------------------------------

import { cache } from 'react'
import { prisma } from '@/lib/db'
import type { NotificationType } from './notification-types'

// ── Types ───────────────────────────────────────────────────────────────────

export interface NotificationRecord {
  id:        string
  type:      NotificationType
  title:     string
  body:      string
  actionUrl: string | null
  metadata:  Record<string, unknown>
  readAt:    Date | null
  createdAt: Date
}

export interface NotificationPage {
  notifications: NotificationRecord[]
  unreadCount:   number
  total:         number
}

// ── Queries ─────────────────────────────────────────────────────────────────

/**
 * Paginated notification feed for a user.
 * Default: 30 most recent, newest first.
 */
export const getNotificationsForUser = cache(async (
  userId: string,
  opts?: {
    limit?:      number
    offset?:     number
    unreadOnly?: boolean
  },
): Promise<NotificationPage> => {
  const limit      = opts?.limit      ?? 30
  const offset     = opts?.offset     ?? 0
  const unreadOnly = opts?.unreadOnly ?? false

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
        id:        true,
        type:      true,
        title:     true,
        body:      true,
        actionUrl: true,
        metadata:  true,
        readAt:    true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ])

  return {
    notifications: rows.map((n) => ({
      ...n,
      type:     n.type as NotificationType,
      metadata: (n.metadata ?? {}) as Record<string, unknown>,
    })),
    unreadCount,
    total,
  }
})

/**
 * Unread count only — used by the notification bell badge.
 */
export const getUnreadNotificationCount = cache(async (userId: string): Promise<number> => {
  return prisma.notification.count({ where: { userId, readAt: null } })
})
