import { Skeleton, PropertyCardSkeleton } from '@/components/ui/skeleton'

// Shown while the async Saved Listings page fetches bookmarked properties.

export default function SavedLoading() {
  return (
    <div className="animate-pulse pt-6 pb-16 space-y-6">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-44" />
        <Skeleton variant="text" className="h-4 w-60" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
