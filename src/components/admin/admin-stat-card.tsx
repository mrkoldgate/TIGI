import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// AdminStatCard — KPI tile for the admin dashboard header row.
//
// Differs from the buyer/owner StatCard:
//   - Urgency system: critical (red) / warn (amber) / info (blue) / normal / positive
//   - Left border accent (not icon ring) — faster to scan at a glance
//   - Delta badge: show +N (last 24h) or a secondary count
//   - Denser layout — admin needs more tiles in the same space
//   - No milestone lock mechanism — admin always has access
// ---------------------------------------------------------------------------

export type AdminUrgency = 'critical' | 'warn' | 'info' | 'normal' | 'positive'

const URGENCY_STYLES: Record<
  AdminUrgency,
  { border: string; iconBg: string; icon: string; value: string }
> = {
  critical: {
    border:  'border-l-[#EF4444]',
    iconBg:  'bg-[#EF4444]/10',
    icon:    'text-[#EF4444]',
    value:   'text-[#EF4444]',
  },
  warn: {
    border:  'border-l-[#F59E0B]',
    iconBg:  'bg-[#F59E0B]/10',
    icon:    'text-[#F59E0B]',
    value:   'text-[#F59E0B]',
  },
  info: {
    border:  'border-l-[#818CF8]',
    iconBg:  'bg-[#818CF8]/10',
    icon:    'text-[#818CF8]',
    value:   'text-[#F5F5F7]',
  },
  normal: {
    border:  'border-l-[#3A3A4A]',
    iconBg:  'bg-[#1A1A24]',
    icon:    'text-[#6B6B80]',
    value:   'text-[#F5F5F7]',
  },
  positive: {
    border:  'border-l-[#4ADE80]',
    iconBg:  'bg-[#4ADE80]/10',
    icon:    'text-[#4ADE80]',
    value:   'text-[#F5F5F7]',
  },
}

interface AdminStatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  urgency?: AdminUrgency
  /** Secondary count shown in a small badge (e.g. "+N today", "N pending") */
  delta?: { label: string; value: number; urgent?: boolean }
  href?: string
  /** Lock with a milestone badge instead of showing real value */
  lockedUntil?: string
  className?: string
}

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  urgency = 'normal',
  delta,
  href,
  lockedUntil,
  className,
}: AdminStatCardProps) {
  const styles = URGENCY_STYLES[urgency]
  const isLocked = Boolean(lockedUntil)

  const content = (
    <div
      className={cn(
        'group flex flex-col gap-3 rounded-xl border border-[#2A2A3A] border-l-2 bg-[#111118] p-4 transition-colors',
        styles.border,
        href && !isLocked && 'cursor-pointer hover:border-[#3A3A4A] hover:bg-[#151520]',
        className
      )}
    >
      {/* Icon + delta badge */}
      <div className="flex items-start justify-between">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', styles.iconBg)}>
          <Icon className={cn('h-4 w-4', styles.icon)} />
        </div>

        {isLocked ? (
          <span className="flex items-center gap-1 rounded border border-[#2A2A3A] bg-[#0A0A0F] px-1.5 py-0.5 text-[10px] text-[#6B6B80]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
            {lockedUntil}
          </span>
        ) : delta ? (
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums',
              delta.urgent
                ? 'bg-[#EF4444]/10 text-[#EF4444]'
                : 'bg-[#1A1A24] text-[#6B6B80]'
            )}
          >
            {delta.value > 0 ? `+${delta.value}` : delta.value} {delta.label}
          </span>
        ) : null}
      </div>

      {/* Value */}
      <div>
        <p
          className={cn(
            'font-heading text-2xl font-semibold tabular-nums leading-none',
            isLocked ? 'text-[#3A3A4A]' : styles.value
          )}
        >
          {isLocked ? '—' : value}
        </p>
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
