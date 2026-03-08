import Link from 'next/link'
import { Landmark, ShieldCheck, HeadphonesIcon, ChevronRight } from 'lucide-react'
import { type DeferredQueueCounts } from '@/lib/admin/mock-admin-data'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// DeferredQueues — Placeholder panels for feature queues not yet fully built.
//
// Three sub-panels stacked vertically:
//   1. Inheritance Submissions — M8 feature
//   2. Compliance Queue       — KYC reviews, AML checks (live in MVP but limited)
//   3. Support Tickets        — M3 feature
//
// Each panel shows current count, urgency signal, milestone badge, and a
// link to the relevant admin sub-route (stub in MVP).
// ---------------------------------------------------------------------------

interface QueueRowProps {
  icon: React.ElementType
  title: string
  primaryCount: number
  primaryLabel: string
  urgentCount?: number
  urgentLabel?: string
  /** Time context — e.g. "oldest: 26h" */
  timeHint?: string
  href: string
  milestone?: string
  iconColor: string
  iconBg: string
  /** When true, show urgent count in red */
  hasUrgent?: boolean
}

function QueueRow({
  icon: Icon,
  title,
  primaryCount,
  primaryLabel,
  urgentCount,
  urgentLabel,
  timeHint,
  href,
  milestone,
  iconColor,
  iconBg,
  hasUrgent,
}: QueueRowProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#2A2A3A] bg-[#111118] p-4 transition-colors hover:border-[#3A3A4A]">
      {/* Icon */}
      <div className={cn('mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#F5F5F7]">{title}</p>
          {milestone && (
            <span className="flex items-center gap-1 rounded border border-[#2A2A3A] bg-[#0A0A0F] px-1.5 py-0.5 text-[10px] text-[#6B6B80]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
              {milestone}
            </span>
          )}
        </div>

        {/* Count row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <span className="flex items-baseline gap-1.5">
            <span className="font-heading text-xl font-semibold tabular-nums text-[#F5F5F7]">
              {primaryCount}
            </span>
            <span className="text-xs text-[#6B6B80]">{primaryLabel}</span>
          </span>

          {urgentCount !== undefined && urgentCount > 0 && (
            <span className="flex items-baseline gap-1">
              <span
                className={cn(
                  'font-heading text-base font-semibold tabular-nums',
                  hasUrgent ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                )}
              >
                {urgentCount}
              </span>
              <span className="text-xs text-[#6B6B80]">{urgentLabel}</span>
            </span>
          )}

          {timeHint && (
            <span className="text-xs text-[#4A4A5E]">{timeHint}</span>
          )}
        </div>
      </div>

      {/* Action link */}
      <Link
        href={href}
        className="flex flex-shrink-0 items-center gap-0.5 self-center text-xs text-[#6B6B80] transition-colors hover:text-[#C9A84C]"
      >
        View
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

interface DeferredQueuesProps {
  counts: DeferredQueueCounts
}

export function DeferredQueues({ counts }: DeferredQueuesProps) {
  return (
    <div className="space-y-3">
      {/* Inheritance Submissions */}
      <QueueRow
        icon={Landmark}
        title="Inheritance Submissions"
        primaryCount={counts.inheritanceSubmissions}
        primaryLabel="pending"
        href="/admin/compliance"
        milestone="M8"
        iconColor="text-[#818CF8]"
        iconBg="bg-[#818CF8]/10"
      />

      {/* Compliance Queue */}
      <QueueRow
        icon={ShieldCheck}
        title="Compliance Queue"
        primaryCount={counts.compliancePending}
        primaryLabel="pending"
        urgentCount={counts.complianceEscalated}
        urgentLabel="escalated"
        href="/admin/compliance"
        iconColor="text-[#C9A84C]"
        iconBg="bg-[#C9A84C]/10"
        hasUrgent={counts.complianceEscalated > 0}
      />

      {/* Support Tickets */}
      <QueueRow
        icon={HeadphonesIcon}
        title="Support Tickets"
        primaryCount={counts.supportTicketsOpen}
        primaryLabel="open"
        urgentCount={counts.supportTicketsUrgent}
        urgentLabel="urgent"
        timeHint={`oldest: ${counts.supportOldestHours}h`}
        href="/admin/compliance"
        milestone="M3"
        iconColor="text-[#A0A0B2]"
        iconBg="bg-[#A0A0B2]/10"
        hasUrgent={counts.supportTicketsUrgent > 0}
      />
    </div>
  )
}
