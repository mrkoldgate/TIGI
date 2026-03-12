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

const ACCENT_STYLES: Record<AccentColor, { icon: string; ring: string; hoverGlow: string }> = {
  gold:  { icon: 'text-[#FDE047] drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]',  ring: 'bg-[#FDE047]/10 border border-[#FDE047]/20 shadow-[inset_0_0_12px_rgba(253,224,71,0.2)]',  hoverGlow: 'hover:shadow-[0_0_40px_rgba(253,224,71,0.07),inset_0_1px_0_0_rgba(255,255,255,0.1)]' },
  green: { icon: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]', ring: 'bg-emerald-400/10 border border-emerald-400/20 shadow-[inset_0_0_12px_rgba(52,211,153,0.2)]', hoverGlow: 'hover:shadow-[0_0_40px_rgba(52,211,153,0.07),inset_0_1px_0_0_rgba(255,255,255,0.1)]' },
  blue:  { icon: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]',   ring: 'bg-cyan-400/10 border border-cyan-400/20 shadow-[inset_0_0_12px_rgba(34,211,238,0.2)]',   hoverGlow: 'hover:shadow-[0_0_40px_rgba(34,211,238,0.07),inset_0_1px_0_0_rgba(255,255,255,0.1)]' },
  rose:  { icon: 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]',  ring: 'bg-rose-500/10 border border-rose-500/20 shadow-[inset_0_0_12px_rgba(251,113,133,0.2)]',  hoverGlow: 'hover:shadow-[0_0_40px_rgba(251,113,133,0.07),inset_0_1px_0_0_rgba(255,255,255,0.1)]' },
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
        'group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-white/20 hover:bg-white/[0.08]',
        styles.hoverGlow,
        href && 'cursor-pointer hover:-translate-y-1',
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
            'font-heading text-3xl font-bold tabular-nums tracking-tight',
            isLocked ? 'text-white/20' : 'bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]'
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
