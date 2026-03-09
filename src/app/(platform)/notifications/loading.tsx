import { Skeleton } from '@/components/ui/skeleton'

// Shown while the async Notifications page fetches the notification feed.

export default function NotificationsLoading() {
  return (
    <div className="animate-pulse pt-6 pb-16 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton variant="text" className="h-8 w-36" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Notification rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-[#1A1A24] bg-[#0D0D14] p-4">
            <Skeleton variant="circle" className="h-8 w-8 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-3/4" />
              <Skeleton variant="text" className="h-3 w-1/2" />
            </div>
            <Skeleton variant="text" className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
