'use client'

// ---------------------------------------------------------------------------
// NotificationsClient — full notification center page.
//
// TIGI Hyper-Glass v3 — Novu/Wope nested-layer architecture:
//   Layer 0: Atmospheric orbs (handled by parent page)
//   Layer 1: Deep structural backdrop (bg-black/40, backdrop-blur-3xl)
//            with cyan inner wash and glowing internal shadow — wraps feed
//   Layer 2: Floating glass plates — header, tab bar, notification items
//
// Key Novu/Wope fidelity points:
//   • Glowing bell icon in header with neon cyan drop-shadow
//   • Sharp unread/read contrast — unread items glow, read items recede
//   • Layered glass modal aesthetic on the feed container
//   • Compound tab underline glow on active filter
//   • Unread count badge with neon halo
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
    <div className="relative space-y-6">

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 2 — Header plate (floating glass)
          Novu/Wope style: glowing bell icon, unread badge with neon halo
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-[#050505] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] p-6 sm:p-8">
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* h-[2px] cyan accent top-edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" aria-hidden="true" />
        {/* Dual corner glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/[0.08] blur-[40px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-indigo-500/[0.06] blur-[35px]" aria-hidden="true" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {/* ── Glowing bell icon — Novu/Wope signature ── */}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 backdrop-blur-xl shadow-[inset_0_0_16px_rgba(34,211,238,0.12),0_0_24px_rgba(34,211,238,0.15)]">
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-cyan-400/[0.08] blur-[8px]" aria-hidden="true" />
                <Bell
                  className="relative h-6 w-6 text-cyan-400"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.7))' }}
                />
                {/* Unread count badge — neon halo */}
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500 px-1 text-[10px] font-bold text-black shadow-[0_0_12px_rgba(34,211,238,0.6),0_0_4px_rgba(34,211,238,0.8)]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Activity</p>
                <h1 className="font-heading text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                  Notifications
                </h1>
              </div>
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Activity updates from your listings, compliance reviews, and transactions.
            </p>
          </div>

          {/* Mark all read button */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] px-3 py-1.5 text-xs text-zinc-500 transition-all hover:border-cyan-400/30 hover:text-cyan-300 hover:shadow-[0_0_16px_rgba(34,211,238,0.1)] disabled:opacity-50"
            >
              {markingAll
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <Check className="h-3 w-3" />
              }
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 2 — Tab bar plate (floating glass strip)
          Compound tab underline glow on active filter
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-[#050505] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* Top-edge lighting */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" aria-hidden="true" />

        <div className="relative flex">
          {([
            { key: 'all',    label: 'All',    count: total      },
            { key: 'unread', label: 'Unread', count: unreadCount },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'relative flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all',
                tab === key
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-all',
                  tab === key
                    ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-white/[0.04] text-zinc-500 border border-white/[0.05]',
                )}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
              {/* Active underline — compound glow */}
              {tab === key && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.5),0_2px_8px_rgba(34,211,238,0.3)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 1 — Deep structural backdrop (Novu nested-layer)
          Wraps the notification feed with glowing internal shadow
          ═══════════════════════════════════════════════════════════════════ */}
      {displayed.length === 0 ? (
        /* ── Empty state — floating glass modal ── */
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-[#050505] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_40px_rgba(0,0,0,0.4)] py-20 text-center">
          <div className="noise absolute inset-0 pointer-events-none" />
          {/* Internal glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_2px_40px_rgba(34,211,238,0.03),inset_0_-2px_40px_rgba(0,0,0,0.2)]" aria-hidden="true" />
          {/* Atmospheric cyan bloom */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-cyan-500/[0.06] blur-[60px]" aria-hidden="true" />

          {/* Glowing empty bell */}
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
            <Bell
              className="h-8 w-8 text-zinc-500"
              style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.3))' }}
            />
          </div>
          <p className="relative mt-4 text-sm font-medium text-zinc-400">
            {tab === 'unread' ? 'All caught up' : 'No notifications yet'}
          </p>
          <p className="relative mt-1 text-xs text-zinc-500">
            {tab === 'unread'
              ? 'You have no unread notifications.'
              : 'Activity from your listings and reviews will appear here.'}
          </p>
          {tab === 'unread' && (
            <button
              type="button"
              onClick={() => setTab('all')}
              className="relative mt-4 text-xs text-cyan-400 hover:underline underline-offset-2"
            >
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-[#050505] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_40px_rgba(0,0,0,0.4)]">
          <div className="noise absolute inset-0 pointer-events-none" />
          {/* ── Top-edge lighting (structural) ── */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" aria-hidden="true" />

          {/* ── Glowing internal shadow — Novu style ── */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_2px_40px_rgba(34,211,238,0.03),inset_0_-2px_40px_rgba(0,0,0,0.2)]" aria-hidden="true" />
          {/* Inner atmospheric bloom — soft cyan glow from top center */}
          <div className="pointer-events-none absolute left-1/2 -top-20 h-[250px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/[0.02] blur-[80px]" aria-hidden="true" />
          {/* Inner corner glows */}
          <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/[0.04] blur-[40px]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-indigo-400/[0.03] blur-[40px]" aria-hidden="true" />

          {/* ── Feed content (Layer 2 items float inside) ── */}
          <div className="relative p-4 space-y-1.5">
            {displayed.map((n, i) => (
              <div
                key={n.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 40, 600)}ms`, animationFillMode: 'both' }}
              >
                <NotificationItem
                  notification={n}
                  onRead={handleMarkRead}
                  compact={false}
                />
              </div>
            ))}

            {/* Load more — floating glass button */}
            {tab === 'all' && hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] py-3 text-sm text-zinc-500 transition-all hover:border-cyan-400/20 hover:shadow-[0_0_16px_rgba(34,211,238,0.08)] hover:text-zinc-400 disabled:opacity-50"
              >
                {loadingMore
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>
                  : <><ChevronDown className="h-4 w-4" /> Load more</>
                }
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer note */}
      {displayed.length > 0 && (
        <p className="text-center text-[11px] text-zinc-600">
          Notifications are retained for 90 days.{' '}
          <Link href="/dashboard" className="underline underline-offset-2 hover:text-zinc-400 transition-colors">
            Go to dashboard
          </Link>
        </p>
      )}
    </div>
  )
}
