import { Skeleton } from '@/components/ui/skeleton'

// Shown while the async Transactions page loads transaction history.

export default function TransactionsLoading() {
  return (
    <div className="animate-pulse pt-6 pb-16 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-44" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg" />
        ))}
      </div>

      {/* Transaction rows */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-[#1A1A24] bg-[#0D0D14] p-4">
            <Skeleton variant="circle" className="h-10 w-10 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton variant="text" className="h-4 w-48" />
              <Skeleton variant="text" className="h-3 w-32" />
            </div>
            <div className="space-y-1 text-right">
              <Skeleton variant="text" className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
