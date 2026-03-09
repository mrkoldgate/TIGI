import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Listing detail loading skeleton — mirrors the two-column gallery + sidebar.
// ---------------------------------------------------------------------------

export default function ListingDetailLoading() {
  return (
    <div className="animate-pulse pt-6 pb-16 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton variant="text" className="h-3 w-24" />
        <Skeleton variant="text" className="h-3 w-3" />
        <Skeleton variant="text" className="h-3 w-32" />
      </div>

      {/* Gallery mosaic */}
      <div className="grid h-80 grid-cols-4 gap-2">
        <Skeleton className="col-span-2 row-span-2 h-full rounded-xl" />
        <Skeleton className="h-full rounded-xl" />
        <Skeleton className="h-full rounded-xl" />
        <Skeleton className="h-full rounded-xl" />
        <Skeleton className="h-full rounded-xl" />
      </div>

      {/* Title bar */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-2/3" />
        <div className="flex items-center gap-3">
          <Skeleton variant="text" className="h-4 w-40" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
      </div>

      <div className="border-t border-[#1E1E2A]" />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left — main content */}
        <div className="space-y-6 lg:col-span-7">
          {/* Tab bar */}
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
          {/* Content area */}
          <div className="space-y-4">
            <Skeleton variant="text" className="h-5 w-36" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
          </div>
          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Right — action panel */}
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
