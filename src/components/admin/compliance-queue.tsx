'use client'

import { CheckCircle2, XCircle, ChevronsUp, ChevronRight, FileText, RefreshCw, ShieldCheck, Building2, Landmark, AlertTriangle } from 'lucide-react'
import {
  type ComplianceQueueItem,
  type ComplianceItemType,
  type ComplianceItemStatus,
  type CompliancePriority,
  formatAdminRelative,
} from '@/lib/admin/mock-admin-data'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// ComplianceQueue — Pure display table for the compliance review queue.
//
// Accepts pre-filtered items from ComplianceQueueClient. Renders:
//   Desktop: full 7-column table (Type | Subject | Notes | Docs | Queue | Status | Actions)
//   Mobile:  stacked card rows
//
// Row actions (Review / Approve / Reject / Escalate):
//   - Review: primary action button (workflow coming M2)
//   - Approve / Reject / Escalate: ghost icon buttons, opacity-40 at rest,
//     reveal color on hover, title="Coming in M2" tooltip
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  ComplianceItemType,
  { label: string; icon: React.ElementType; color: string; bg: string; badgeBg: string; badgeText: string }
> = {
  KYC: {
    label: 'KYC',
    icon: ShieldCheck,
    color: 'text-[#C9A84C]',
    bg: 'bg-[#C9A84C]/10',
    badgeBg: 'bg-[#C9A84C]/10',
    badgeText: 'text-[#C9A84C]',
  },
  LISTING_VERIFICATION: {
    label: 'Listing',
    icon: Building2,
    color: 'text-[#818CF8]',
    bg: 'bg-[#818CF8]/10',
    badgeBg: 'bg-[#818CF8]/10',
    badgeText: 'text-[#818CF8]',
  },
  INHERITANCE: {
    label: 'Inheritance',
    icon: Landmark,
    color: 'text-[#A78BFA]',
    bg: 'bg-[#A78BFA]/10',
    badgeBg: 'bg-[#A78BFA]/10',
    badgeText: 'text-[#A78BFA]',
  },
  FLAGGED_ANOMALY: {
    label: 'Anomaly',
    icon: AlertTriangle,
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10',
    badgeBg: 'bg-[#EF4444]/10',
    badgeText: 'text-[#EF4444]',
  },
}

const STATUS_CONFIG: Record<
  ComplianceItemStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  PENDING:   { label: 'Pending',   dot: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  IN_REVIEW: { label: 'In Review', dot: 'bg-[#818CF8]', text: 'text-[#818CF8]', bg: 'bg-[#818CF8]/10' },
  APPROVED:  { label: 'Approved',  dot: 'bg-[#4ADE80]', text: 'text-[#4ADE80]', bg: 'bg-[#4ADE80]/10' },
  REJECTED:  { label: 'Rejected',  dot: 'bg-[#EF4444]', text: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
  ESCALATED: { label: 'Escalated', dot: 'bg-[#FB923C]', text: 'text-[#FB923C]', bg: 'bg-[#FB923C]/10' },
}

const PRIORITY_ROW: Record<CompliancePriority, string> = {
  CRITICAL: 'border-l-2 border-l-[#EF4444] bg-[#EF4444]/5',
  HIGH:     'border-l-2 border-l-[#F59E0B]',
  NORMAL:   'border-l-2 border-l-[#3A3A4A]',
  NEW:      'border-l-2 border-l-[#2A2A3A]',
}

function QueueBadge({ daysInQueue, priority }: { daysInQueue: number; priority: CompliancePriority }) {
  const label = daysInQueue === 0 ? 'New' : `${daysInQueue}d`
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
        priority === 'CRITICAL' ? 'bg-[#EF4444]/15 text-[#EF4444]' :
        priority === 'HIGH'     ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                                  'bg-[#1A1A24] text-[#6B6B80]'
      )}
    >
      {label}
    </span>
  )
}

export type KycAction = 'approve' | 'reject' | 'escalate' | 'request_update'

interface ComplianceQueueProps {
  items: ComplianceQueueItem[]
  /** Called when Approve / Reject / Escalate is clicked for a real KYC submission. */
  onKycAction?: (submissionId: string, action: KycAction) => void
  /** ID of the submission currently being actioned — disables its buttons. */
  actioningId?: string | null
}

export function ComplianceQueue({ items, onKycAction, actioningId }: ComplianceQueueProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[#2A2A3A] bg-[#111118] py-16 text-sm text-[#6B6B80]">
        No items match the current filters.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A3A]">

      {/* ── Desktop table ─────────────────────────────────────────────── */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#2A2A3A] bg-[#0D0D14]">
              {['Type', 'Subject', 'Notes', 'Docs', 'Queue', 'Status', ''].map((h) => (
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
              const typeCfg   = TYPE_CONFIG[item.type]
              const statusCfg = STATUS_CONFIG[item.status]
              const TypeIcon  = typeCfg.icon

              return (
                <tr
                  key={item.id}
                  className={cn('group transition-colors hover:bg-[#111118]', PRIORITY_ROW[item.priority])}
                >
                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        typeCfg.badgeBg,
                        typeCfg.badgeText
                      )}
                    >
                      <TypeIcon className="h-3 w-3" />
                      {typeCfg.label}
                    </span>
                  </td>

                  {/* Subject */}
                  <td className="px-4 py-3">
                    <p className="max-w-[160px] truncate text-sm font-medium text-[#F5F5F7]">
                      {item.subjectLabel}
                    </p>
                    {item.subjectMeta && (
                      <p className="text-[10px] text-[#6B6B80]">{item.subjectMeta}</p>
                    )}
                    {item.subjectCountry && (
                      <p className="text-[10px] text-[#4A4A5E]">{item.subjectCountry}</p>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="px-4 py-3">
                    <p className="max-w-[240px] truncate text-xs text-[#6B6B80]">
                      {item.notes}
                    </p>
                    {item.assignedTo && (
                      <p className="text-[10px] text-[#4A4A5E]">→ {item.assignedTo}</p>
                    )}
                  </td>

                  {/* Docs */}
                  <td className="px-4 py-3">
                    {item.documentCount !== undefined ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#A0A0B2]">
                        <FileText className="h-3 w-3" />
                        {item.documentCount}
                      </span>
                    ) : (
                      <span className="text-xs text-[#4A4A5E]">—</span>
                    )}
                  </td>

                  {/* Queue age */}
                  <td className="px-4 py-3">
                    <QueueBadge daysInQueue={item.daysInQueue} priority={item.priority} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-medium',
                        statusCfg.bg,
                        statusCfg.text
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <KycActionButtons
                      item={item}
                      onKycAction={onKycAction}
                      actioning={actioningId === item.kycSubmissionId && !!item.kycSubmissionId}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: stacked cards ──────────────────────────────────────── */}
      <div className="divide-y divide-[#1A1A24] lg:hidden">
        {items.map((item) => {
          const typeCfg   = TYPE_CONFIG[item.type]
          const statusCfg = STATUS_CONFIG[item.status]
          const TypeIcon  = typeCfg.icon

          return (
            <div
              key={item.id}
              className={cn('flex items-start gap-3 bg-[#0A0A0F] p-4', PRIORITY_ROW[item.priority])}
            >
              {/* Type icon */}
              <div className={cn('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', typeCfg.bg)}>
                <TypeIcon className={cn('h-4 w-4', typeCfg.color)} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {/* Badge row */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      typeCfg.badgeBg,
                      typeCfg.badgeText
                    )}
                  >
                    {typeCfg.label}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]',
                      statusCfg.bg,
                      statusCfg.text
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
                    {statusCfg.label}
                  </span>
                  <QueueBadge daysInQueue={item.daysInQueue} priority={item.priority} />
                </div>

                {/* Subject */}
                <p className="mt-1 truncate text-sm font-medium text-[#F5F5F7]">{item.subjectLabel}</p>
                {item.subjectMeta && (
                  <p className="text-[10px] text-[#6B6B80]">{item.subjectMeta}</p>
                )}

                {/* Notes */}
                <p className="mt-0.5 line-clamp-2 text-xs text-[#6B6B80]">{item.notes}</p>

                {/* Footer row */}
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[#4A4A5E]">
                  {item.documentCount !== undefined && (
                    <span className="flex items-center gap-0.5">
                      <FileText className="h-3 w-3" />
                      {item.documentCount} docs
                    </span>
                  )}
                  {item.assignedTo && <span>→ {item.assignedTo}</span>}
                  <span>{formatAdminRelative(item.submittedAt)}</span>
                </div>
              </div>

              {/* Mobile action buttons */}
              <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                <KycActionButtons
                  item={item}
                  onKycAction={onKycAction}
                  actioning={actioningId === item.kycSubmissionId && !!item.kycSubmissionId}
                  compact
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KycActionButtons — Review / Approve / Reject / Escalate row
//
// When `item.kycSubmissionId` is set the action buttons are live and call
// `onKycAction(submissionId, action)`. Otherwise they render as disabled
// placeholders (mock / non-KYC items).
// ---------------------------------------------------------------------------

interface KycActionButtonsProps {
  item: ComplianceQueueItem
  onKycAction?: (submissionId: string, action: KycAction) => void
  actioning?: boolean
  compact?: boolean
}

function KycActionButtons({ item, onKycAction, actioning, compact }: KycActionButtonsProps) {
  const sid  = item.kycSubmissionId
  const live = !!sid && !!onKycAction

  const reviewBtn = (
    <button
      disabled={actioning}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-[#2A2A3A] px-2.5 py-1 text-xs font-medium text-[#A0A0B2] transition-colors',
        live ? 'hover:border-[#C9A84C]/40 hover:text-[#C9A84C]' : 'cursor-default opacity-50',
        compact && 'py-1.5',
      )}
    >
      Review
      <ChevronRight className="h-3 w-3" />
    </button>
  )

  if (compact) {
    // Mobile: just the Review button (keep it small)
    return reviewBtn
  }

  return (
    <div className="flex items-center gap-1">
      {reviewBtn}

      {/* Approve */}
      <button
        disabled={!live || actioning}
        title={live ? 'Approve' : 'Approve — not available for this item type'}
        onClick={() => live && onKycAction!(sid!, 'approve')}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded border border-[#2A2A3A] transition-all',
          live && !actioning
            ? 'text-[#3A3A4A] hover:border-[#4ADE80]/40 hover:text-[#4ADE80] hover:opacity-100 opacity-40'
            : 'cursor-not-allowed text-[#3A3A4A] opacity-20',
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
      </button>

      {/* Reject */}
      <button
        disabled={!live || actioning}
        title={live ? 'Reject' : 'Reject — not available for this item type'}
        onClick={() => live && onKycAction!(sid!, 'reject')}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded border border-[#2A2A3A] transition-all',
          live && !actioning
            ? 'text-[#3A3A4A] hover:border-[#EF4444]/40 hover:text-[#EF4444] hover:opacity-100 opacity-40'
            : 'cursor-not-allowed text-[#3A3A4A] opacity-20',
        )}
      >
        <XCircle className="h-3.5 w-3.5" />
      </button>

      {/* Request Update */}
      <button
        disabled={!live || actioning}
        title={live ? 'Request Update' : 'Request Update — not available for this item type'}
        onClick={() => live && onKycAction!(sid!, 'request_update')}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded border border-[#2A2A3A] transition-all',
          live && !actioning
            ? 'text-[#3A3A4A] hover:border-[#F59E0B]/40 hover:text-[#F59E0B] hover:opacity-100 opacity-40'
            : 'cursor-not-allowed text-[#3A3A4A] opacity-20',
        )}
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>

      {/* Escalate */}
      <button
        disabled={!live || actioning}
        title={live ? 'Escalate' : 'Escalate — not available for this item type'}
        onClick={() => live && onKycAction!(sid!, 'escalate')}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded border border-[#2A2A3A] transition-all',
          live && !actioning
            ? 'text-[#3A3A4A] hover:border-[#FB923C]/40 hover:text-[#FB923C] hover:opacity-100 opacity-40'
            : 'cursor-not-allowed text-[#3A3A4A] opacity-20',
        )}
      >
        {actioning
          ? <span className="h-3 w-3 animate-spin rounded-full border border-[#6B6B80] border-t-transparent" />
          : <ChevronsUp className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
