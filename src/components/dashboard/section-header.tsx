import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// SectionHeader — Dashboard sub-section heading (Hyper-Glass v3).
//
// Metallic gradient text, muted subtext, Paragon-style milestone badges,
// and hover-glow view-all links.
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
  title: string
  description?: string
  viewAllHref?: string
  viewAllLabel?: string
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
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
            {title}
          </h2>
          {milestone && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
              {milestone}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-[11px] tracking-wide text-white/50">{description}</p>
        )}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="group flex flex-shrink-0 items-center gap-1 text-[11px] text-white/50 transition-colors duration-300 hover:text-white/50"
        >
          {viewAllLabel}
          <ChevronRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
