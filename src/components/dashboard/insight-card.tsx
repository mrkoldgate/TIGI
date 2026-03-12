import Link from 'next/link'
import {
  TrendingDown,
  TrendingUp,
  Sparkles,
  BarChart3,
  Coins,
  AlertCircle,
} from 'lucide-react'
import { type InsightItem, type InsightType } from '@/lib/dashboard/mock-dashboard'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// InsightCard — A single AI-generated insight tile.
//
// Priority HIGH   → gold left border, more prominent text
// Priority MEDIUM → subtle border, standard rendering
// Priority LOW    → muted, no border accent
//
// Source: MOCK_INSIGHTS in MVP; replaced by AI recommendation service in M6.
// ---------------------------------------------------------------------------

const INSIGHT_CONFIG: Record<
  InsightType,
  { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; bg: string }
> = {
  PRICE_DROP: { icon: TrendingDown, color: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]', bg: 'bg-emerald-400/10 border border-emerald-400/20' },
  PRICE_RISE: { icon: TrendingUp, color: 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]', bg: 'bg-rose-500/10 border border-rose-500/20' },
  NEW_MATCH: { icon: Sparkles, color: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]', bg: 'bg-cyan-400/10 border border-cyan-400/20' },
  VALUATION_CHANGE: { icon: BarChart3, color: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]', bg: 'bg-indigo-400/10 border border-indigo-400/20' },
  MARKET_TREND: { icon: TrendingUp, color: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]', bg: 'bg-indigo-400/10 border border-indigo-400/20' },
  TOKEN_ALERT: { icon: Coins, color: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]', bg: 'bg-purple-500/10 border border-purple-500/20' },
  INVESTMENT_UPDATE: { icon: AlertCircle, color: 'text-slate-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]', bg: 'bg-slate-400/10 border border-slate-400/20' },
}

function formatTimeAgo(isoString: string): string {
  const now = new Date('2026-03-08T10:00:00Z') // fixed for mock; replace with Date.now() in prod
  const then = new Date(isoString)
  const diffMs = now.getTime() - then.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  const diffD = Math.floor(diffH / 24)

  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  if (diffD === 1) return 'Yesterday'
  return `${diffD}d ago`
}

interface InsightCardProps {
  insight: InsightItem
}

export function InsightCard({ insight }: InsightCardProps) {
  const { icon: Icon, color, bg } = INSIGHT_CONFIG[insight.type]
  const isHigh = insight.priority === 'HIGH'

  return (
    <div
      className={cn(
        'relative flex gap-3 rounded-2xl border bg-white/5 p-4 backdrop-blur-2xl transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:bg-white/10 hover:-translate-y-0.5',
        isHigh
          ? 'border-indigo-500/30 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] bg-gradient-to-r from-indigo-500/5 to-transparent'
          : 'border-white/10 hover:border-white/20'
      )}
    >
      {/* High priority accent */}
      {isHigh && (
        <span className="absolute inset-y-3 left-0 w-0.5 rounded-r bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.8)]" />
      )}

      {/* Icon */}
      <div className={cn('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', bg)}>
        <Icon className={cn('h-4 w-4', color)} />
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-white">{insight.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">{insight.description}</p>

        {/* Footer: time + action */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#6B6B80]">{formatTimeAgo(insight.timestamp)}</span>

          {insight.actionHref && insight.actionLabel && (
            <Link
              href={insight.actionHref}
              className="text-xs font-medium text-[#60A5FA] transition-opacity hover:opacity-70"
            >
              {insight.actionLabel} →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
