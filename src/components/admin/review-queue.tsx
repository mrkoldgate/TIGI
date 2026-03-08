import Link from 'next/link'
import { Coins, ChevronRight } from 'lucide-react'
import {
  type ReviewQueueItem,
  type ReviewUrgency,
  formatAdminRelative,
  formatAdminPrice,
} from '@/lib/admin/mock-admin-data'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// ReviewQueue — Pending listing review table for the admin dashboard.
//
// Urgency signals:
//   CRITICAL  → red left border, red days badge (>5 days in queue)
//   HIGH      → amber left border, amber days badge (2-5 days)
//   NORMAL    → muted, 1 day
//   NEW       → neutral (0 days — just submitted)
//
// Full review workflow (approve/reject/request-changes) lives at
// /admin/reviews — this component shows the overview queue only.
// ---------------------------------------------------------------------------

const URGENCY_CONFIG: Record<
  ReviewUrgency,
  { row: string; daysBg: string; daysText: string; label: string }
> = {
  CRITICAL: {
    row:      'border-l-2 border-l-[#EF4444] bg-[#EF4444]/5',
    daysBg:   'bg-[#EF4444]/15',
    daysText: 'text-[#EF4444]',
    label:    'Overdue',
  },
  HIGH: {
    row:      'border-l-2 border-l-[#F59E0B]',
    daysBg:   'bg-[#F59E0B]/10',
    daysText: 'text-[#F59E0B]',
    label:    'Review',
  },
  NORMAL: {
    row:      'border-l-2 border-l-[#3A3A4A]',
    daysBg:   'bg-[#1A1A24]',
    daysText: 'text-[#A0A0B2]',
    label:    'Review',
  },
  NEW: {
    row:      'border-l-2 border-l-[#2A2A3A]',
    daysBg:   'bg-[#1A1A24]',
    daysText: 'text-[#6B6B80]',
    label:    'Review',
  },
}

function DaysBadge({ days, urgency }: { days: number; urgency: ReviewUrgency }) {
  const { daysBg, daysText } = URGENCY_CONFIG[urgency]
  const label = days === 0 ? 'New' : `${days}d`
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums', daysBg, daysText)}>
      {label}
    </span>
  )
}

interface ReviewQueueProps {
  items: ReviewQueueItem[]
}

export function ReviewQueue({ items }: ReviewQueueProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-[#6B6B80]">
        No pending reviews. Queue is clear.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A3A]">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#2A2A3A] bg-[#0D0D14]">
              {['Listing', 'Type', 'Owner', 'Price', 'Queue', 'Submitted', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A24] bg-[#0A0A0F]">
            {items.map((item) => {
              const urgencyCfg = URGENCY_CONFIG[item.urgency]
              return (
                <tr
                  key={item.id}
                  className={cn(
                    'group transition-colors hover:bg-[#111118]',
                    urgencyCfg.row
                  )}
                >
                  {/* Listing */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="max-w-[180px] truncate text-sm font-medium text-[#F5F5F7]">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#6B6B80]">
                          {item.city}, {item.state}
                        </p>
                        {item.isTokenized && (
                          <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] text-[#C9A84C]">
                            <Coins className="h-2.5 w-2.5" />
                            Tokenized
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <span
                        className={cn(
                          'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          item.assetType === 'LAND'
                            ? 'bg-[#4ADE80]/10 text-[#4ADE80]'
                            : 'bg-[#C9A84C]/10 text-[#C9A84C]'
                        )}
                      >
                        {item.assetType === 'LAND' ? 'Land' : 'Property'}
                      </span>
                      <p className="text-[10px] text-[#6B6B80]">{item.subtype}</p>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="px-4 py-3 text-sm text-[#A0A0B2]">
                    {item.ownerName}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-sm font-semibold tabular-nums text-[#F5F5F7]">
                    {formatAdminPrice(item.price)}
                  </td>

                  {/* Queue age */}
                  <td className="px-4 py-3">
                    <DaysBadge days={item.daysInQueue} urgency={item.urgency} />
                  </td>

                  {/* Submitted */}
                  <td className="px-4 py-3 text-xs text-[#6B6B80]">
                    {formatAdminRelative(item.submittedAt)}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/reviews?id=${item.listingId}`}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                        item.urgency === 'CRITICAL'
                          ? 'border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10'
                          : 'border-[#2A2A3A] text-[#A0A0B2] hover:border-[#C9A84C]/40 hover:text-[#C9A84C]'
                      )}
                    >
                      Review
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked rows */}
      <div className="divide-y divide-[#1A1A24] md:hidden">
        {items.map((item) => {
          const urgencyCfg = URGENCY_CONFIG[item.urgency]
          return (
            <div
              key={item.id}
              className={cn('flex items-start justify-between gap-3 bg-[#0A0A0F] p-4', urgencyCfg.row)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                      item.assetType === 'LAND'
                        ? 'bg-[#4ADE80]/10 text-[#4ADE80]'
                        : 'bg-[#C9A84C]/10 text-[#C9A84C]'
                    )}
                  >
                    {item.assetType === 'LAND' ? 'Land' : 'Prop'}
                  </span>
                  <DaysBadge days={item.daysInQueue} urgency={item.urgency} />
                </div>
                <p className="mt-1 truncate text-sm font-medium text-[#F5F5F7]">{item.title}</p>
                <p className="text-xs text-[#6B6B80]">
                  {item.city}, {item.state} · {item.ownerName} · {formatAdminPrice(item.price)}
                </p>
              </div>
              <Link
                href={`/admin/reviews?id=${item.listingId}`}
                className="flex-shrink-0 rounded-lg border border-[#2A2A3A] px-2.5 py-1.5 text-xs text-[#A0A0B2] hover:text-[#C9A84C]"
              >
                Review
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
