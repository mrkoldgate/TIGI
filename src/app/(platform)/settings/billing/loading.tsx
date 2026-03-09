import { Skeleton } from '@/components/ui/skeleton'

export default function BillingLoading() {
  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <div className="max-w-5xl space-y-8">
        {/* Current plan card */}
        <Skeleton className="h-28 w-full rounded-2xl" />

        {/* Toggle */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-40 rounded-full" />
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
