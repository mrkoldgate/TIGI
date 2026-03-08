import Link from 'next/link'
import { TrendingUp, TrendingDown, Bell } from 'lucide-react'
import { type ValuationAlert } from '@/lib/dashboard/mock-dashboard'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// ValuationAlerts — AI price & valuation change alerts for watched assets.
//
// MVP: Shows mock alerts derived from price changes on saved properties.
// M5: Full AI alert system — threshold-based, push notifications, email digest.
// M6: AI-generated narrative alerts with confidence + driver explanations.
// ---------------------------------------------------------------------------

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`
  if (price >= 1_000)     return `$${(price / 1_000).toFixed(0)}K`
  return `$${price}`
}

function formatTimeAgo(isoString: string): string {
  const now = new Date('2026-03-08T10:00:00Z')
  const then = new Date(isoString)
  const diffMs = now.getTime() - then.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  const diffD = Math.floor(diffH / 24)

  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  if (diffD === 1) return 'Yesterday'
  return `${diffD}d ago`
}

interface ValuationAlertsProps {
  alerts: ValuationAlert[]
  className?: string
}

export function ValuationAlerts({ alerts, className }: ValuationAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className={cn('flex flex-col items-center gap-3 py-8 text-center', className)}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1A24] text-[#3A3A4A]">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-[#6B6B80]">No alerts yet</p>
          <p className="mt-0.5 text-xs text-[#3A3A4A]">Save listings to receive valuation alerts.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {alerts.map((alert) => {
        const isUp = alert.direction === 'UP'
        const Icon = isUp ? TrendingUp : TrendingDown

        return (
          <Link
            key={alert.id}
            href={`/marketplace/${alert.assetId}`}
            className="flex items-start gap-3 rounded-lg border border-[#2A2A3A] bg-[#111118] p-3 transition-colors hover:border-[#3A3A4A] hover:bg-[#151520]"
          >
            {/* Direction icon */}
            <div
              className={cn(
                'mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                isUp ? 'bg-[#4ADE80]/10' : 'bg-[#F87171]/10'
              )}
            >
              <Icon
                className={cn('h-3.5 w-3.5', isUp ? 'text-[#4ADE80]' : 'text-[#F87171]')}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#F5F5F7]">
                {alert.assetTitle}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-[#A0A0B2]">
                {formatPrice(alert.oldValue)} → {formatPrice(alert.newValue)}
              </p>
              <p className="mt-0.5 text-[11px] text-[#6B6B80]">
                {formatTimeAgo(alert.timestamp)}
              </p>
            </div>

            {/* Delta badge */}
            <span
              className={cn(
                'flex-shrink-0 self-center rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                isUp
                  ? 'bg-[#4ADE80]/10 text-[#4ADE80]'
                  : 'bg-[#F87171]/10 text-[#F87171]'
              )}
            >
              {isUp ? '+' : '-'}{alert.changePercent.toFixed(1)}%
            </span>
          </Link>
        )
      })}

      {/* M5 feature notice */}
      <p className="pt-1 text-center text-[11px] text-[#3A3A4A]">
        Custom alert thresholds available in{' '}
        <span className="text-[#6B6B80]">Milestone 5</span>
      </p>
    </div>
  )
}
