'use client'

import { useState } from 'react'
import { Coins, CheckCircle2, XCircle, RefreshCw, Archive, X } from 'lucide-react'
import {
  type ReviewQueueItem,
  type ReviewUrgency,
  formatAdminRelative,
  formatAdminPrice,
} from '@/lib/admin/mock-admin-data'
import { cn } from '@/lib/utils'

export type ListingAction = 'approve' | 'reject' | 'request_update' | 'archive'

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
  /** Called when an action is confirmed for a real DB-backed listing. */
  onAction?: (listingId: string, action: ListingAction, note?: string) => void
  /** listingId currently being actioned — disables that row's buttons. */
  actioningId?: string | null
}

export function ReviewQueue({ items, onAction, actioningId }: ReviewQueueProps) {
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

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <ReviewActionCell
                      item={item}
                      onAction={onAction}
                      actioning={actioningId === item.listingId}
                    />
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
              className={cn('flex flex-col gap-2 bg-[#0A0A0F] p-4', urgencyCfg.row)}
            >
              <div className="flex items-start gap-3">
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
              </div>
              <ReviewActionCell
                item={item}
                onAction={onAction}
                actioning={actioningId === item.listingId}
                compact
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ReviewActionCell — Approve / Reject / Request Update / Archive
//
// Two-step flow to prevent accidental irreversible actions:
//   1. Click action button → enters "pending confirmation" state for that row.
//   2. Optional note textarea + Confirm / Cancel shown inline.
//   3. Confirm calls onAction(listingId, action, note).
//
// When onAction is not provided (dashboard widget, read-only contexts),
// buttons render as ghosted placeholders.
// ---------------------------------------------------------------------------

const ACTION_CONFIG: Record<
  ListingAction,
  { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; confirmLabel: string; color: string; hoverBorder: string; hoverText: string; confirmBg: string }
> = {
  approve: {
    icon:         CheckCircle2,
    label:        'Approve',
    confirmLabel: 'Confirm Approval',
    color:        'text-[#3A3A4A]',
    hoverBorder:  'hover:border-[#4ADE80]/40',
    hoverText:    'hover:text-[#4ADE80]',
    confirmBg:    'bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 text-[#4ADE80]',
  },
  reject: {
    icon:         XCircle,
    label:        'Reject',
    confirmLabel: 'Confirm Rejection',
    color:        'text-[#3A3A4A]',
    hoverBorder:  'hover:border-[#EF4444]/40',
    hoverText:    'hover:text-[#EF4444]',
    confirmBg:    'bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444]',
  },
  request_update: {
    icon:         RefreshCw,
    label:        'Request Update',
    confirmLabel: 'Send Update Request',
    color:        'text-[#3A3A4A]',
    hoverBorder:  'hover:border-[#F59E0B]/40',
    hoverText:    'hover:text-[#F59E0B]',
    confirmBg:    'bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B]',
  },
  archive: {
    icon:         Archive,
    label:        'Archive',
    confirmLabel: 'Confirm Archive',
    color:        'text-[#3A3A4A]',
    hoverBorder:  'hover:border-[#6B6B80]/40',
    hoverText:    'hover:text-[#A0A0B2]',
    confirmBg:    'bg-[#1A1A24] hover:bg-[#2A2A3A] text-[#A0A0B2]',
  },
}

interface ReviewActionCellProps {
  item:       ReviewQueueItem
  onAction?:  (listingId: string, action: ListingAction, note?: string) => void
  actioning?: boolean
  compact?:   boolean
}

function ReviewActionCell({ item, onAction, actioning, compact }: ReviewActionCellProps) {
  const [pending, setPending] = useState<ListingAction | null>(null)
  const [note,    setNote]    = useState('')

  const live = !!onAction

  function startAction(action: ListingAction) {
    setNote('')
    setPending(action)
  }

  function cancel() {
    setPending(null)
    setNote('')
  }

  function confirm() {
    if (!pending || !onAction) return
    onAction(item.listingId, pending, note.trim() || undefined)
    setPending(null)
    setNote('')
  }

  // Inline confirmation panel
  if (pending) {
    const cfg = ACTION_CONFIG[pending]
    return (
      <div className="flex flex-col gap-1.5 rounded-lg border border-[#2A2A3A] bg-[#0D0D14] p-2">
        <p className="text-[11px] font-medium text-[#A0A0B2]">{cfg.confirmLabel}</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional — stored in audit log)"
          rows={2}
          className="w-full resize-none rounded border border-[#2A2A3A] bg-[#0A0A0F] px-2 py-1.5 text-xs text-[#F5F5F7] placeholder-[#4A4A5E] outline-none focus:border-[#3A3A4A]"
        />
        <div className="flex items-center gap-1.5">
          <button
            onClick={confirm}
            disabled={actioning}
            className={cn('flex-1 rounded px-2 py-1 text-xs font-semibold transition-colors', cfg.confirmBg)}
          >
            {actioning ? 'Processing…' : cfg.confirmLabel}
          </button>
          <button
            onClick={cancel}
            className="flex h-6 w-6 items-center justify-center rounded border border-[#2A2A3A] text-[#6B6B80] hover:text-[#A0A0B2]"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    )
  }

  if (compact) {
    // Mobile: icon-only row of 4 buttons
    return (
      <div className="flex items-center gap-1.5">
        {(Object.entries(ACTION_CONFIG) as [ListingAction, typeof ACTION_CONFIG[ListingAction]][]).map(
          ([action, cfg]) => {
            const Icon = cfg.icon
            return (
              <button
                key={action}
                disabled={!live || actioning}
                title={cfg.label}
                onClick={() => live && startAction(action)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded border border-[#2A2A3A] transition-all',
                  live && !actioning
                    ? `${cfg.color} ${cfg.hoverBorder} ${cfg.hoverText} opacity-50 hover:opacity-100`
                    : 'cursor-not-allowed opacity-20 text-[#3A3A4A]',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            )
          }
        )}
      </div>
    )
  }

  // Desktop: icon buttons in a row
  return (
    <div className="flex items-center gap-1">
      {(Object.entries(ACTION_CONFIG) as [ListingAction, typeof ACTION_CONFIG[ListingAction]][]).map(
        ([action, cfg]) => {
          const Icon = cfg.icon
          return (
            <button
              key={action}
              disabled={!live || actioning}
              title={live ? cfg.label : `${cfg.label} — live on review page`}
              onClick={() => live && startAction(action)}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded border border-[#2A2A3A] transition-all',
                live && !actioning
                  ? `${cfg.color} ${cfg.hoverBorder} ${cfg.hoverText} opacity-40 hover:opacity-100`
                  : 'cursor-not-allowed opacity-20 text-[#3A3A4A]',
              )}
            >
              {actioning
                ? <span className="h-3 w-3 animate-spin rounded-full border border-[#6B6B80] border-t-transparent" />
                : <Icon className="h-3.5 w-3.5" />}
            </button>
          )
        }
      )}
    </div>
  )
}
