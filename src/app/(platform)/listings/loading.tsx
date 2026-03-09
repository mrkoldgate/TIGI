import { Skeleton, StatCardSkeleton } from '@/components/ui/skeleton'

// Shown while the async OwnerDashboard page fetches listing and inquiry data.

export default function ListingsLoading() {
  return (
    <div className="animate-pulse pt-6 pb-16 space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton variant="text" className="h-8 w-40" />
          <Skeleton variant="text" className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Listings table */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-5 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
