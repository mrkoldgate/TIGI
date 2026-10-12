import { BarChart3, Eye, Heart, MessageSquare, TrendingUp } from 'lucide-react'
import { type OwnerPerformanceStats } from '@/lib/listings/owner-mock-data'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// PerformancePanel — Listing analytics summary for the owner dashboard.
//
// MVP: Shows engagement totals (views, saves, inquiries) from listing records.
//      Conversion rate, funnel charts, and time-series data are deferred to M3.
//
// M3: Full analytics dashboard with funnel, days-on-market, response rate.
// M6: AI-generated listing optimisation recommendations.
// ---------------------------------------------------------------------------

interface PerformanceMetricProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  value: string | number
  iconColor: string
  iconBg: string
  subtext?: string
}

function PerformanceMetric({ icon: Icon, label, value, iconColor, iconBg, subtext }: PerformanceMetricProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">{label}</p>
        {subtext && <p className="text-[11px] text-zinc-700">{subtext}</p>}
      </div>
      <span className="flex-shrink-0 font-heading text-base font-semibold tabular-nums text-white">
        {value}
      </span>
    </div>
  )
}

interface PerformancePanelProps {
  stats: OwnerPerformanceStats
  className?: string
}

export function PerformancePanel({ stats, className }: PerformancePanelProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Live engagement metrics */}
      <div className="space-y-3">
        <PerformanceMetric
          icon={Eye}
          label="Total views"
          value={stats.totalViews.toLocaleString()}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-400/10"
          subtext="All non-archived listings"
        />
        <PerformanceMetric
          icon={Heart}
          label="Total saves"
          value={stats.totalSaves.toLocaleString()}
          iconColor="text-rose-400"
          iconBg="bg-rose-500/10"
          subtext="Saved to watchlists"
        />
        <PerformanceMetric
          icon={MessageSquare}
          label="Total inquiries"
          value={stats.totalInquiries.toLocaleString()}
          iconColor="text-violet-400"
          iconBg="bg-violet-400/10"
          subtext="All time"
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* Deferred metrics — M3 teaser */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500">Advanced analytics</p>

        {[
          { icon: TrendingUp,    label: 'View → inquiry rate',    milestone: 'M3' },
          { icon: BarChart3,     label: 'Avg days to first inquiry', milestone: 'M3' },
          { icon: MessageSquare, label: 'Avg response time',       milestone: 'M3' },
        ].map(({ icon: Icon, label, milestone }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border border-dashed border-white/[0.08] px-3 py-2"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
              <Icon className="h-3.5 w-3.5 text-zinc-700" />
            </div>
            <span className="flex-1 text-xs text-zinc-700">{label}</span>
            <span className="flex items-center gap-1 rounded border border-white/[0.08] bg-black/80 px-1.5 py-0.5 text-[10px] text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {milestone}
            </span>
          </div>
        ))}
      </div>

      {/* AI listing tips teaser — M6 */}
      <div className="rounded-lg border border-dashed border-white/[0.08] p-3 text-center">
        <p className="text-xs text-zinc-700">
          AI listing optimisation recommendations arrive in{' '}
          <span className="text-zinc-500">Milestone 6</span>
        </p>
      </div>
    </div>
  )
}
