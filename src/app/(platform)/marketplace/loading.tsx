import { Skeleton, PropertyCardSkeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Marketplace loading skeleton — shown while the server component renders.
// Matches the filter bar + card grid layout.
// ---------------------------------------------------------------------------

export default function MarketplaceLoading() {
  return (
    <div className="animate-pulse pt-6 pb-16 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-4 w-72" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <div className="ml-auto">
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Results bar */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-4 w-32" />
        <Skeleton variant="text" className="h-4 w-24" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
