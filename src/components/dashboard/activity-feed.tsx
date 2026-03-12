import Link from 'next/link'
import {
  Heart,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Send,
  HeartOff,
} from 'lucide-react'
import { type ActivityItem, type ActivityType } from '@/lib/dashboard/mock-dashboard'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// ActivityFeed — Recent event timeline for the dashboard sidebar column.
//
// Source: MOCK_ACTIVITY in MVP; replace with prisma.activityLog in M3+.
// ---------------------------------------------------------------------------

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; bg: string }
> = {
  SAVED: { icon: Heart, color: 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]', bg: 'bg-rose-500/10 border border-rose-500/20' },
  UNSAVED: { icon: HeartOff, color: 'text-[#94A3B8]', bg: 'bg-white/5 border border-white/10' },
  VIEWED: { icon: Eye, color: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]', bg: 'bg-indigo-400/10 border border-indigo-400/20' },
  INVESTED: { icon: TrendingUp, color: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]', bg: 'bg-emerald-400/10 border border-emerald-400/20' },
  PRICE_CHANGE: { icon: TrendingDown, color: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]', bg: 'bg-cyan-400/10 border border-cyan-400/20' },
  NEW_INVESTOR: { icon: Users, color: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]', bg: 'bg-indigo-400/10 border border-indigo-400/20' },
  VALUATION_UPDATE: { icon: BarChart3, color: 'text-[#FDE047] drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]', bg: 'bg-[#FDE047]/10 border border-[#FDE047]/20' },
  INTEREST_SENT: { icon: Send, color: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]', bg: 'bg-purple-500/10 border border-purple-500/20' },
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

interface ActivityFeedProps {
  items: ActivityItem[]
  className?: string
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-white/5 bg-white/[0.02]">
        <p className="text-sm text-[#94A3B8]">No recent activity yet.</p>
        <p className="mt-1 text-xs text-[#64748B]">Browse the marketplace to get started.</p>
      </div>
    )
  }

  return (
    <ol className={cn('space-y-0', className)}>
      {items.map((item, i) => {
        const { icon: Icon, color, bg } = ACTIVITY_CONFIG[item.type]
        const isLast = i === items.length - 1

        return (
          <li key={item.id} className="flex gap-3">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full', bg)}>
                <Icon className={cn('h-3.5 w-3.5', color)} />
              </div>
              {!isLast && (
                <div className="mt-1 h-full w-px bg-white/10" />
              )}
            </div>

            {/* Content */}
            <div className={cn('min-w-0 flex-1 pb-4', isLast && 'pb-0')}>
              <p className="text-xs text-[#94A3B8]">
                <span className="font-medium text-white">{item.label}</span>
                {' '}
                <Link
                  href={`/marketplace/${item.assetId}`}
                  className="text-cyan-400 transition-colors hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                >
                  {item.assetTitle}
                </Link>
              </p>
              {item.detail && (
                <p className="mt-0.5 font-mono text-[11px] text-[#64748B]">{item.detail}</p>
              )}
              <p className="mt-1 text-[11px] text-[#64748B]">{formatTimeAgo(item.timestamp)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
