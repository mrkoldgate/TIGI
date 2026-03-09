import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Portfolio loading skeleton — mirrors summary bar + holdings grid layout.
// ---------------------------------------------------------------------------

export default function PortfolioLoading() {
  return (
    <div className="animate-pulse pt-6 pb-16 space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-36" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      {/* Preview banner */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
            <Skeleton variant="text" className="mb-2 h-3 w-24" />
            <Skeleton variant="text" className="mb-1 h-7 w-28" />
            <Skeleton variant="text" className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Holdings grid */}
      <div>
        <Skeleton variant="text" className="mb-4 h-5 w-28" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118]">
              <Skeleton className="h-24 w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton variant="text" className="h-5 w-3/4" />
                <Skeleton variant="text" className="h-3 w-1/2" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <div className="flex gap-4">
                  <Skeleton variant="text" className="h-4 w-16" />
                  <Skeleton variant="text" className="h-4 w-16" />
                  <Skeleton variant="text" className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
