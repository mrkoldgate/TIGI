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
    <div className="relative">

      <NotificationsClient
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
        initialTotal={total}
      />
    </div>
  )
}
