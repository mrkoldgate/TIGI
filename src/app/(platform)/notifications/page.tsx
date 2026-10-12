import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { getNotificationsForUser } from '@/lib/notifications/notification-query'
import { NotificationsClient } from '@/components/notifications/notifications-client'

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'Your activity feed — listing updates, compliance reviews, and transaction alerts.',
}

// ---------------------------------------------------------------------------
// /notifications — notification center
//
// Server component: fetches first page of notifications server-side for
// zero-layout-shift initial render, passes to NotificationsClient for
// interactive filtering, mark-read, and load-more.
//
// TIGI Hyper-Glass v4 Elite: Pure black (#000000) base, massive atmospheric
// depth field (cyan/indigo), Paragon structural containers.
// ---------------------------------------------------------------------------

export default async function NotificationsPage() {
  const user = await requireAuth('/notifications')

  const { notifications, unreadCount, total } = await getNotificationsForUser(user.id, {
    limit: 30,
  })

  return (
    <div className="animate-fade-in relative pt-8 pb-16">
      {/* ── TIGI v4 Elite atmospheric depth field — massive slow-drifting orbs ── */}
      <div
        className="pointer-events-none absolute -left-60 -top-32 h-[720px] w-[720px] rounded-full bg-cyan-500/[0.06] blur-[200px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-48 top-[280px] h-[600px] w-[600px] rounded-full bg-indigo-500/[0.05] blur-[180px] animate-float"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 top-[800px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[160px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/4 top-[1300px] h-[400px] w-[400px] rounded-full bg-violet-500/[0.025] blur-[160px] animate-float"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[500px] h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-white/[0.005] blur-[240px]"
        aria-hidden="true"
      />

      <NotificationsClient
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
        initialTotal={total}
      />
    </div>
  )
}
