import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// StatCard — Summary metric tile for the dashboard header row.
//
// Variants:
//   default     — shows value with optional trend delta
//   locked      — shows "—" with a milestone badge (pre-integration placeholder)
//
// Accent colors map to stat categories:
//   gold    → portfolio / financial
//   green   → investments / gains
//   blue    → activity / interests
//   rose    → saved / watchlist
// ---------------------------------------------------------------------------

type AccentColor = 'gold' | 'green' | 'blue' | 'rose'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  accent?: AccentColor
  /** Milestone label shown when feature isn't available yet, e.g. "M4" */
  lockedUntil?: string
  /** Directional trend: positive number = green, negative = red */
  trend?: number
  href?: string
  className?: string
}

const ACCENT_STYLES: Record<AccentColor, { icon: string; ring: string }> = {
  gold:  { icon: 'text-[#3B82F6]',  ring: 'bg-[#3B82F6]/10' },
  green: { icon: 'text-[#4ADE80]',  ring: 'bg-[#4ADE80]/10' },
  blue:  { icon: 'text-[#818CF8]',  ring: 'bg-[#818CF8]/10' },
  rose:  { icon: 'text-rose-400',    ring: 'bg-rose-500/10'  },
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'gold',
  lockedUntil,
  trend,
  href,
  className,
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent]
  const isLocked = Boolean(lockedUntil)

  const content = (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm transition-colors',
        href && 'cursor-pointer hover:border-white/[0.10] hover:bg-white/[0.05]',
        className
      )}
    >
      {/* Icon + locked badge row */}
      <div className="flex items-start justify-between">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', styles.ring)}>
          <Icon className={cn('h-4 w-4', styles.icon)} />
        </div>

        {lockedUntil && (
          <span className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
            <span className="text-[10px] text-[#6B6B80]">{lockedUntil}</span>
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p
          className={cn(
            'font-heading text-2xl font-semibold tabular-nums leading-none',
            isLocked ? 'text-[#3A3A4A]' : 'text-[#F5F5F7]'
          )}
        >
          {isLocked ? '—' : value}
        </p>

        {/* Trend delta */}
        {!isLocked && trend !== undefined && (
          <span
            className={cn(
              'mt-1 inline-flex items-center gap-0.5 text-xs font-medium',
              trend >= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'
            )}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Label + hint */}
      <div>
        <p className="text-xs font-medium text-[#A0A0B2]">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-[#6B6B80]">{hint}</p>}
      </div>
    </div>
  )

  if (href && !isLocked) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
