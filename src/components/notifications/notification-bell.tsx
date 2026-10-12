'use client'

// ---------------------------------------------------------------------------
// NotificationBell — top-nav bell icon with unread badge + dropdown.
//
// Self-contained client component:
//   • Fetches /api/notifications?limit=20 on mount
//   • Polls every 60 seconds for fresh unread count
//   • Opens/closes an anchored dropdown on click
//   • Closes on outside click or Escape key
//   • Marks individual notifications read via PATCH /api/notifications/[id]/read
//   • "Mark all read" via PATCH /api/notifications/read-all
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Bell, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationItem } from './notification-item'
import type { NotificationRecord } from '@/lib/notifications/notification-query'

// ── Types ────────────────────────────────────────────────────────────────────

interface FeedState {
  notifications: NotificationRecord[]
  unreadCount:   number
  loading:       boolean
  error:         boolean
}

// ── Hook ─────────────────────────────────────────────────────────────────────

function useNotificationFeed() {
  const [state, setState] = useState<FeedState>({
    notifications: [],
    unreadCount:   0,
    loading:       true,
    error:         false,
  })

  const fetchFeed = useCallback(async () => {
    try {
      const res  = await fetch('/api/notifications?limit=20')
      const json = await res.json() as {
        success: boolean
        data?: { notifications: NotificationRecord[]; unreadCount: number }
      }
      if (json.success && json.data) {
        setState((prev) => ({
          ...prev,
          notifications: json.data!.notifications,
          unreadCount:   json.data!.unreadCount,
          loading:       false,
          error:         false,
        }))
      }
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: true }))
    }
  }, [])

  // Initial load + 60-second poll
  useEffect(() => {
    void fetchFeed()
    const interval = setInterval(() => { void fetchFeed() }, 60_000)
    return () => clearInterval(interval)
  }, [fetchFeed])

  const markRead = useCallback(async (id: string) => {
    // Optimistic update
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date() } : n,
      ),
      unreadCount: Math.max(0, prev.unreadCount - (
        prev.notifications.find((n) => n.id === id && !n.readAt) ? 1 : 0
      )),
    }))

    // Persist
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    } catch {
      // re-fetch to sync
      void fetchFeed()
    }
  }, [fetchFeed])

  const markAllRead = useCallback(async () => {
    // Optimistic update
    const now = new Date()
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, readAt: n.readAt ?? now })),
      unreadCount:   0,
    }))

    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
    } catch {
      void fetchFeed()
    }
  }, [fetchFeed])

  return { ...state, markRead, markAllRead, refresh: fetchFeed }
}

// ── Dropdown ─────────────────────────────────────────────────────────────────

function NotificationsDropdown({
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: {
  notifications: NotificationRecord[]
  unreadCount:   number
  loading:       boolean
  onMarkRead:    (id: string) => void
  onMarkAllRead: () => void
  onClose:       () => void
}) {
  const handleItemRead = (id: string) => {
    onMarkRead(id)
    onClose()
  }

  return (
    <div
      className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/95 backdrop-blur-2xl shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400/20 px-1.5 text-[10px] font-bold text-cyan-400 border border-cyan-400/30">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-cyan-400"
          >
            <Check className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Feed */}
      <div className="max-h-[400px] overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="mx-auto mb-2 h-7 w-7 text-zinc-500" />
            <p className="text-sm text-zinc-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={handleItemRead}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-4 py-2.5">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block text-center text-xs font-medium text-zinc-500 transition-colors hover:text-cyan-400"
        >
          See all notifications
        </Link>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef    = useRef<HTMLDivElement>(null)

  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotificationFeed()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
          open
            ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
            : 'border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:border-cyan-400/40 hover:text-white',
        )}
      >
        <Bell className="h-4 w-4" />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[9px] font-bold text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationsDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
