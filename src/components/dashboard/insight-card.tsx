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
  PRICE_DROP:         { icon: TrendingDown, color: 'text-[#4ADE80]',  bg: 'bg-[#4ADE80]/10'  },
  PRICE_RISE:         { icon: TrendingUp,   color: 'text-[#F87171]',  bg: 'bg-[#F87171]/10'  },
  NEW_MATCH:          { icon: Sparkles,     color: 'text-[#C9A84C]',  bg: 'bg-[#C9A84C]/10'  },
  VALUATION_CHANGE:   { icon: BarChart3,    color: 'text-[#818CF8]',  bg: 'bg-[#818CF8]/10'  },
  MARKET_TREND:       { icon: TrendingUp,   color: 'text-[#818CF8]',  bg: 'bg-[#818CF8]/10'  },
  TOKEN_ALERT:        { icon: Coins,        color: 'text-[#C9A84C]',  bg: 'bg-[#C9A84C]/10'  },
  INVESTMENT_UPDATE:  { icon: AlertCircle,  color: 'text-[#A0A0B2]',  bg: 'bg-[#A0A0B2]/10'  },
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
        'relative flex gap-3 rounded-xl border bg-[#111118] p-4 transition-colors',
        isHigh
          ? 'border-[#C9A84C]/30 hover:border-[#C9A84C]/50'
          : 'border-[#2A2A3A] hover:border-[#3A3A4A]'
      )}
    >
      {/* High priority gold left accent */}
      {isHigh && (
        <span className="absolute inset-y-3 left-0 w-0.5 rounded-r bg-[#C9A84C]/60" />
      )}

      {/* Icon */}
      <div className={cn('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', bg)}>
        <Icon className={cn('h-4 w-4', color)} />
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-[#F5F5F7]">{insight.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#A0A0B2]">{insight.description}</p>

        {/* Footer: time + action */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#6B6B80]">{formatTimeAgo(insight.timestamp)}</span>

          {insight.actionHref && insight.actionLabel && (
            <Link
              href={insight.actionHref}
              className="text-xs font-medium text-[#C9A84C] transition-opacity hover:opacity-70"
            >
              {insight.actionLabel} →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
