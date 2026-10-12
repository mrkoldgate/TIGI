import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// StatCard — Glassflow 3D centerpiece metric tile (Hyper-Glass v3).
//
// Three-layer icon: massive diffused backlight → secondary halo ring →
// thick frosted glass shell with icon drop-shadow.
// Paragon structural grid: deep black bg, ultra-thin borders, edge-lit hover.
//
// Accent colors: blue (portfolio), green (investments), cyan (activity),
//                rose (saved), gold (financial).
// ---------------------------------------------------------------------------

type AccentColor = 'gold' | 'green' | 'blue' | 'rose'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  accent?: AccentColor
  lockedUntil?: string
  trend?: number
  href?: string
  className?: string
}

const ACCENT_STYLES: Record<AccentColor, {
  iconColor: string
  glowBg: string
  haloBg: string
  edgeLight: string
  gradient: string
}> = {
  gold: {
    iconColor: 'text-indigo-400',
    glowBg: 'bg-indigo-500/20',
    haloBg: 'bg-indigo-500/10',
    edgeLight: 'via-indigo-400/30',
    gradient: 'from-indigo-400 via-indigo-300 to-violet-500',
  },
  green: {
    iconColor: 'text-emerald-400',
    glowBg: 'bg-emerald-500/20',
    haloBg: 'bg-emerald-500/10',
    edgeLight: 'via-emerald-400/30',
    gradient: 'from-emerald-400 via-emerald-300 to-green-500',
  },
  blue: {
    iconColor: 'text-cyan-400',
    glowBg: 'bg-cyan-500/20',
    haloBg: 'bg-cyan-500/10',
    edgeLight: 'via-cyan-400/30',
    gradient: 'from-cyan-400 via-cyan-300 to-violet-500',
  },
  rose: {
    iconColor: 'text-rose-400',
    glowBg: 'bg-rose-500/20',
    haloBg: 'bg-rose-500/10',
    edgeLight: 'via-rose-400/30',
    gradient: 'from-rose-400 via-rose-300 to-pink-500',
  },
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
        'group relative flex flex-col items-center overflow-hidden rounded-[22px] border border-white/[0.04] bg-[#0A0A0F]/80 p-8 backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 hover:border-white/[0.1] hover:bg-[#0A0A0F]/90',
        href && !isLocked && 'cursor-pointer',
        className,
      )}
    >
      {/* Paragon edge light — colored per accent */}
      <div className={cn(
        'pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100',
        styles.edgeLight,
      )} />

      {/* Glassflow 3D icon centerpiece */}
      <div className="relative flex items-center justify-center pt-1 pb-5">
        {/* Layer 1: Massive diffused backlight */}
        <div className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full blur-[80px] opacity-80',
          styles.glowBg,
        )} />
        {/* Layer 2: Secondary halo ring */}
        <div className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full blur-[30px] opacity-40',
          styles.haloBg,
        )} />
        {/* Layer 3: Thick frosted glass shell */}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-2xl backdrop-blur-md">
          <Icon className={cn('h-10 w-10 drop-shadow-[0_0_15px_currentColor]', styles.iconColor)} />
        </div>
      </div>

      {/* Locked milestone badge */}
      {lockedUntil && (
        <div className="mb-3 flex items-center gap-1.5 rounded-full border border-white/[0.04] bg-white/[0.02] px-2.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
          <span className="text-[10px] text-white/55">{lockedUntil}</span>
        </div>
      )}

      {/* Value */}
      <p
        className={cn(
          'text-center text-3xl font-extrabold tracking-tight tabular-nums',
          isLocked
            ? 'text-white/45'
            : cn('bg-clip-text text-transparent bg-gradient-to-r', styles.gradient),
        )}
      >
        {isLocked ? '—' : value}
      </p>

      {/* Trend delta */}
      {!isLocked && trend !== undefined && (
        <span
          className={cn(
            'mt-1.5 inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
            trend >= 0 ? 'text-emerald-400' : 'text-red-400',
          )}
        >
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
        </span>
      )}

      {/* Label + hint */}
      <div className="mt-3 text-center">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-white/55 uppercase">{label}</p>
        {hint && <p className="mt-1 text-[10px] text-white/45">{hint}</p>}
      </div>
    </div>
  )

  if (href && !isLocked) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
