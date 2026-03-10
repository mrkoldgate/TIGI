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
  SAVED:            { icon: Heart,       color: 'text-rose-400',   bg: 'bg-rose-500/10'    },
  UNSAVED:          { icon: HeartOff,    color: 'text-[#6B6B80]',  bg: 'bg-[#2A2A3A]'      },
  VIEWED:           { icon: Eye,         color: 'text-[#818CF8]',  bg: 'bg-[#818CF8]/10'   },
  INVESTED:         { icon: TrendingUp,  color: 'text-[#4ADE80]',  bg: 'bg-[#4ADE80]/10'   },
  PRICE_CHANGE:     { icon: TrendingDown,color: 'text-[#C9A84C]',  bg: 'bg-[#C9A84C]/10'   },
  NEW_INVESTOR:     { icon: Users,       color: 'text-[#818CF8]',  bg: 'bg-[#818CF8]/10'   },
  VALUATION_UPDATE: { icon: BarChart3,   color: 'text-[#A0A0B2]',  bg: 'bg-[#A0A0B2]/10'   },
  INTEREST_SENT:    { icon: Send,        color: 'text-[#C9A84C]',  bg: 'bg-[#C9A84C]/10'   },
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
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-[#6B6B80]">No recent activity yet.</p>
        <p className="mt-1 text-xs text-[#3A3A4A]">Browse the marketplace to get started.</p>
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
                <div className="mt-1 h-full w-px bg-[#1F1F2E]" />
              )}
            </div>

            {/* Content */}
            <div className={cn('min-w-0 flex-1 pb-4', isLast && 'pb-0')}>
              <p className="text-xs text-[#A0A0B2]">
                <span className="font-medium text-[#F5F5F7]">{item.label}</span>
                {' '}
                <Link
                  href={`/marketplace/${item.assetId}`}
                  className="text-[#C9A84C] hover:underline"
                >
                  {item.assetTitle}
                </Link>
              </p>
              {item.detail && (
                <p className="mt-0.5 font-mono text-[11px] text-[#6B6B80]">{item.detail}</p>
              )}
              <p className="mt-1 text-[11px] text-[#3A3A4A]">{formatTimeAgo(item.timestamp)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
