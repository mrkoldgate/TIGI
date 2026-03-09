import { Skeleton, StatCardSkeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Dashboard loading skeleton — shown while the server component renders.
// Mirrors the two-column dashboard layout to prevent layout shift.
// ---------------------------------------------------------------------------

export default function DashboardLoading() {
  return (
    <div className="animate-pulse pt-6 pb-16 space-y-8">
      {/* Welcome bar skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton variant="text" className="h-3 w-32" />
          <Skeleton variant="text" className="h-8 w-48" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left col */}
        <div className="space-y-8 lg:col-span-2">
          {/* AI Insights */}
          <div>
            <Skeleton variant="text" className="mb-4 h-5 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
          {/* Recommended listings */}
          <div>
            <Skeleton variant="text" className="mb-4 h-5 w-44" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-8">
          {/* Activity feed */}
          <div>
            <Skeleton variant="text" className="mb-4 h-5 w-32" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          {/* Valuation alerts */}
          <div>
            <Skeleton variant="text" className="mb-4 h-5 w-36" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
