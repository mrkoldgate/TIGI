'use client'

// ---------------------------------------------------------------------------
// NotificationsClient — full notification center page.
//
// Features:
//   • Filter tabs: All | Unread
//   • "Mark all read" bulk action
//   • Paginated feed (load more)
//   • Optimistic read state on item click
// ---------------------------------------------------------------------------

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Bell, Check, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'
import { NotificationItem } from './notification-item'
import type { NotificationRecord } from '@/lib/notifications/notification-query'

// ── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'unread'

interface NotificationsClientProps {
  initialNotifications: NotificationRecord[]
  initialUnreadCount:   number
  initialTotal:         number
}

const PAGE_SIZE = 30

// ── Main component ────────────────────────────────────────────────────────────

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
  initialTotal,
}: NotificationsClientProps) {
  const [tab,           setTab]           = useState<FilterTab>('all')
  const [notifications, setNotifications] = useState<NotificationRecord[]>(initialNotifications)
  const [unreadCount,   setUnreadCount]   = useState(initialUnreadCount)
  const [total,         setTotal]         = useState(initialTotal)
  const [offset,        setOffset]        = useState(initialNotifications.length)
  const [loadingMore,   setLoadingMore]   = useState(false)
  const [markingAll,    setMarkingAll]    = useState(false)

  // Filtered view (client-side from loaded data)
  const displayed = tab === 'unread'
    ? notifications.filter((n) => !n.readAt)
    : notifications

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleMarkRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, readAt: new Date() } : n),
    )
    setUnreadCount((c) => Math.max(0, c - 1))

    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    } catch {
      // revert is skipped — staleness is acceptable, page refresh restores state
    }
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return
    setMarkingAll(true)

    const now = new Date()
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })))
    setUnreadCount(0)

    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
    } catch {
      // no-op — optimistic state preserved
    } finally {
      setMarkingAll(false)
    }
  }, [markingAll, unreadCount])

  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return
    setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        limit:  String(PAGE_SIZE),
        offset: String(offset),
      })
      const res  = await fetch(`/api/notifications?${params}`)
      const json = await res.json() as {
        success: boolean
        data?: { notifications: NotificationRecord[]; total: number; unreadCount: number }
      }
      if (json.success && json.data) {
        setNotifications((prev) => [...prev, ...json.data!.notifications])
        setTotal(json.data.total)
        setUnreadCount(json.data.unreadCount)
        setOffset((o) => o + json.data!.notifications.length)
      }
    } catch {
      // no-op
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, offset])

  // ── Render ───────────────────────────────────────────────────────────────────

  const hasMore = offset < total

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Notifications"
          description="Activity updates from your listings, compliance reviews, and transactions."
        />

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#2A2A3A] px-3 py-1.5 text-xs text-[#6B6B80] transition-colors hover:border-[#C9A84C]/40 hover:text-[#C9A84C] disabled:opacity-50"
          >
            {markingAll
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Check className="h-3 w-3" />
            }
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-[#1F1F2E]">
        {([
          { key: 'all',    label: 'All',    count: total      },
          { key: 'unread', label: 'Unread', count: unreadCount },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === key ? 'text-[#C9A84C]' : 'text-[#6B6B80] hover:text-[#A0A0B2]',
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                tab === key
                  ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                  : 'bg-[#2A2A3A] text-[#6B6B80]',
              )}>
                {count > 99 ? '99+' : count}
              </span>
            )}
            {tab === key && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full bg-[#C9A84C]" />
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#1F1F2E] bg-[#111118] py-16">
          <Bell className="mb-3 h-10 w-10 text-[#2A2A3A]" />
          <p className="text-sm font-medium text-[#4A4A5E]">
            {tab === 'unread' ? 'All caught up' : 'No notifications yet'}
          </p>
          <p className="mt-1 text-xs text-[#3A3A4A]">
            {tab === 'unread'
              ? 'You have no unread notifications.'
              : 'Activity from your listings and reviews will appear here.'}
          </p>
          {tab === 'unread' && (
            <button
              type="button"
              onClick={() => setTab('all')}
              className="mt-4 text-xs text-[#6B6B80] underline underline-offset-2 hover:text-[#C9A84C]"
            >
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={handleMarkRead}
              compact={false}
            />
          ))}

          {/* Load more — only shown in "all" tab, since "unread" is client-filtered */}
          {tab === 'all' && hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1F1F2E] bg-[#111118] py-3 text-sm text-[#6B6B80] transition-colors hover:border-[#2A2A3A] hover:text-[#A0A0B2] disabled:opacity-50"
            >
              {loadingMore
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>
                : <><ChevronDown className="h-4 w-4" /> Load more</>
              }
            </button>
          )}
        </div>
      )}

      {/* Footer note */}
      {displayed.length > 0 && (
        <p className="text-center text-[11px] text-[#3A3A4A]">
          Notifications are retained for 90 days.{' '}
          <Link href="/dashboard" className="underline underline-offset-2 hover:text-[#6B6B80]">
            Go to dashboard
          </Link>
        </p>
      )}
    </div>
  )
}
