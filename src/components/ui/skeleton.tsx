import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Skeleton — Shimmer loading placeholder.
// Design: shimmer animation matching card/content shapes.
// Rule: ALWAYS use skeleton, never a spinner. (design-principles.md §2.11)
// ---------------------------------------------------------------------------

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'block' | 'circle' | 'card'
}

export function Skeleton({ className, variant = 'block', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        variant === 'text' && 'h-4 rounded',
        variant === 'block' && 'rounded-lg',
        variant === 'circle' && 'rounded-full',
        variant === 'card' && 'rounded-xl',
        className
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// PropertyCardSkeleton — matches PropertyCard dimensions exactly
// ---------------------------------------------------------------------------

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
      {/* Image */}
      <Skeleton className="mb-4 h-48 w-full rounded-lg" />
      {/* Type badge */}
      <Skeleton variant="text" className="mb-3 h-3 w-20" />
      {/* Title */}
      <Skeleton variant="text" className="mb-2 h-5 w-3/4" />
      {/* Location */}
      <Skeleton variant="text" className="mb-4 h-4 w-1/2" />
      {/* Price row */}
      <div className="flex justify-between">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-3 w-16" />
          <Skeleton variant="text" className="h-5 w-20" />
        </div>
        <div className="space-y-1.5 text-right">
          <Skeleton variant="text" className="h-3 w-12" />
          <Skeleton variant="text" className="h-5 w-10" />
        </div>
      </div>
      {/* Progress bar */}
      <Skeleton className="mt-3 h-1 w-full rounded-full" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatCardSkeleton — for dashboard stat cards
// ---------------------------------------------------------------------------

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#2A2A3A] bg-[#111118] p-5">
      <Skeleton variant="text" className="mb-3 h-3 w-24" />
      <Skeleton variant="text" className="mb-2 h-8 w-32" />
      <Skeleton variant="text" className="h-3 w-20" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// TableRowSkeleton — for data table loading states
// ---------------------------------------------------------------------------

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" className="h-4 w-full" style={{ maxWidth: `${60 + (i * 15)}%` }} />
        </td>
      ))}
    </tr>
  )
}
