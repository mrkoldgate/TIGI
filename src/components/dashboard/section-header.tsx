import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// SectionHeader — Consistent sub-section heading used throughout the dashboard.
//
// Shows:
//   - Title (text-h4 / label weight)
//   - Optional description line
//   - Optional "View all" link with arrow
//   - Optional milestone badge for deferred sections
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
  title: string
  description?: string
  viewAllHref?: string
  viewAllLabel?: string
  /** Milestone badge label, e.g. "M5" — shows when section is partially deferred */
  milestone?: string
  className?: string
}

export function SectionHeader({
  title,
  description,
  viewAllHref,
  viewAllLabel = 'View all',
  milestone,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-h4 text-white tracking-tight">{title}</h2>
          {milestone && (
            <span className="flex items-center gap-1.5 rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-[10px] text-[#94A3B8] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              {milestone}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-[#6B6B80]">{description}</p>
        )}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex flex-shrink-0 items-center gap-1 text-xs text-[#6B6B80] transition-colors hover:text-[#60A5FA]"
        >
          {viewAllLabel}
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}
