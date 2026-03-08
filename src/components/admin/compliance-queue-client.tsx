'use client'

import { useState, useMemo, useCallback } from 'react'
import { ShieldCheck, Building2, Landmark, AlertTriangle } from 'lucide-react'
import {
  type ComplianceQueueItem,
  type ComplianceItemType,
  type ComplianceItemStatus,
} from '@/lib/admin/mock-admin-data'
import { cn } from '@/lib/utils'
import { ComplianceQueue, type KycAction } from './compliance-queue'

// ---------------------------------------------------------------------------
// ComplianceQueueClient — Compliance review queue with interactive filters.
//
// Layout:
//   1. Page header + critical count badge
//   2. Summary strip — 4 clickable type cards (act as type filter, toggle)
//   3. Filter bar — status chips + result count
//   4. ComplianceQueue table (receives pre-filtered items)
//   5. Milestone footer notice
//
// Filter state:
//   activeType   — one of the 4 ComplianceItemType values, or 'ALL'
//   activeStatus — one of the 5 ComplianceItemStatus values, or 'ALL'
//
// Clicking an active summary card resets the type filter to 'ALL' (toggle).
// The result count reflects both filters applied simultaneously.
// ---------------------------------------------------------------------------

const TYPE_SUMMARY_CONFIG: Array<{
  type: ComplianceItemType
  label: string
  icon: React.ElementType
  color: string
  activeBorder: string
  bg: string
}> = [
  { type: 'KYC',                  label: 'KYC',         icon: ShieldCheck,   color: 'text-[#C9A84C]', activeBorder: 'border-[#C9A84C]/40', bg: 'bg-[#C9A84C]/10' },
  { type: 'LISTING_VERIFICATION', label: 'Listing',      icon: Building2,     color: 'text-[#818CF8]', activeBorder: 'border-[#818CF8]/40', bg: 'bg-[#818CF8]/10' },
  { type: 'INHERITANCE',          label: 'Inheritance',  icon: Landmark,      color: 'text-[#A78BFA]', activeBorder: 'border-[#A78BFA]/40', bg: 'bg-[#A78BFA]/10' },
  { type: 'FLAGGED_ANOMALY',      label: 'Anomaly',      icon: AlertTriangle, color: 'text-[#EF4444]', activeBorder: 'border-[#EF4444]/40', bg: 'bg-[#EF4444]/10' },
]

const STATUS_FILTER_OPTIONS: Array<{ value: ComplianceItemStatus | 'ALL'; label: string }> = [
  { value: 'ALL',       label: 'All statuses' },
  { value: 'PENDING',   label: 'Pending'      },
  { value: 'IN_REVIEW', label: 'In Review'    },
  { value: 'ESCALATED', label: 'Escalated'    },
  { value: 'APPROVED',  label: 'Approved'     },
  { value: 'REJECTED',  label: 'Rejected'     },
]

const STATUS_DOT: Partial<Record<ComplianceItemStatus | 'ALL', string>> = {
  PENDING:   'bg-[#F59E0B]',
  IN_REVIEW: 'bg-[#818CF8]',
  APPROVED:  'bg-[#4ADE80]',
  REJECTED:  'bg-[#EF4444]',
  ESCALATED: 'bg-[#FB923C]',
}

interface ComplianceQueueClientProps {
  items: ComplianceQueueItem[]
}

export function ComplianceQueueClient({ items: initialItems }: ComplianceQueueClientProps) {
  const [items,        setItems]        = useState<ComplianceQueueItem[]>(initialItems)
  const [activeType,   setActiveType]   = useState<ComplianceItemType | 'ALL'>('ALL')
  const [activeStatus, setActiveStatus] = useState<ComplianceItemStatus | 'ALL'>('ALL')
  const [actioningId,  setActioningId]  = useState<string | null>(null)
  const [actionError,  setActionError]  = useState<string | null>(null)

  const handleKycAction = useCallback(async (submissionId: string, action: KycAction) => {
    setActioningId(submissionId)
    setActionError(null)
    try {
      const res = await fetch(`/api/admin/kyc/${submissionId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error?.message ?? `Request failed (${res.status})`)
      }
      // Optimistically update status in local list
      const newStatus: ComplianceItemStatus =
        action === 'approve'        ? 'APPROVED'  :
        action === 'reject'         ? 'REJECTED'  :
        action === 'request_update' ? 'PENDING'   :
        /* escalate */                'ESCALATED'
      setItems((prev) =>
        prev.map((item) =>
          item.kycSubmissionId === submissionId
            ? { ...item, status: newStatus }
            : item,
        ),
      )
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setActioningId(null)
    }
  }, [])

  // Count per type (unfiltered, for summary cards)
  const typeCounts = useMemo(() => {
    const m: Partial<Record<ComplianceItemType, number>> = {}
    for (const item of items) {
      m[item.type] = (m[item.type] ?? 0) + 1
    }
    return m
  }, [items])

  // Post-filter items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (activeType !== 'ALL' && item.type !== activeType) return false
      if (activeStatus !== 'ALL' && item.status !== activeStatus) return false
      return true
    })
  }, [items, activeType, activeStatus])

  const criticalCount  = items.filter((i) => i.priority === 'CRITICAL').length
  const escalatedCount = items.filter((i) => i.status === 'ESCALATED').length

  return (
    <div className="space-y-6">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
            Administration
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">Compliance</h1>
          <p className="mt-1 text-sm text-[#6B6B80]">
            KYC verification, listing reviews, inheritance submissions, and flagged anomalies.
          </p>
        </div>

        {/* Urgency badges */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-semibold text-[#EF4444]">
              <AlertTriangle className="h-3.5 w-3.5" />
              {criticalCount} critical
            </div>
          )}
          {escalatedCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#FB923C]/30 bg-[#FB923C]/10 px-3 py-1.5 text-xs font-semibold text-[#FB923C]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
              {escalatedCount} escalated
            </div>
          )}
        </div>
      </div>

      {/* ── Summary type cards (double as type filter) ────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TYPE_SUMMARY_CONFIG.map(({ type, label, icon: Icon, color, activeBorder, bg }) => {
          const count    = typeCounts[type] ?? 0
          const isActive = activeType === type

          return (
            <button
              key={type}
              onClick={() => setActiveType(isActive ? 'ALL' : type)}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                isActive
                  ? `bg-[#111118] ${activeBorder} ${color}`
                  : 'border-[#2A2A3A] bg-[#111118] hover:border-[#3A3A4A]'
              )}
            >
              <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', bg)}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <div>
                <p className={cn('font-heading text-lg font-semibold tabular-nums', isActive ? color : 'text-[#F5F5F7]')}>
                  {count}
                </p>
                <p className="text-[11px] text-[#6B6B80]">{label}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTER_OPTIONS.map(({ value, label }) => {
          const isActive = activeStatus === value
          const dot      = value !== 'ALL' ? STATUS_DOT[value] : undefined

          return (
            <button
              key={value}
              onClick={() =>
                setActiveStatus(isActive && value !== 'ALL' ? 'ALL' : (value as ComplianceItemStatus | 'ALL'))
              }
              className={cn(
                'inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-all',
                isActive
                  ? 'border-[#3A3A4A] bg-[#1A1A24] text-[#F5F5F7]'
                  : 'border-[#2A2A3A] text-[#6B6B80] hover:border-[#3A3A4A] hover:text-[#A0A0B2]'
              )}
            >
              {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
              {label}
            </button>
          )
        })}

        {/* Live count */}
        <span className="ml-auto text-xs text-[#4A4A5E]">
          {filtered.length} of {items.length}
        </span>
      </div>

      {/* ── Queue table ───────────────────────────────────────────────── */}
      <ComplianceQueue
        items={filtered}
        onKycAction={handleKycAction}
        actioningId={actioningId}
      />

      {/* ── Action error toast ────────────────────────────────────────── */}
      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
          <span className="font-medium">Action failed:</span> {actionError}
          <button
            onClick={() => setActionError(null)}
            className="ml-auto text-[#EF4444]/60 hover:text-[#EF4444]"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Milestone footer ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-4 py-3">
        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22C55E]" />
        <p className="text-xs text-[#6B6B80]">
          <span className="font-medium text-[#A0A0B2]">KYC Approve / Reject / Escalate</span>{' '}
          actions are live for submitted KYC verifications.{' '}
          Document viewer and full audit trail in{' '}
          <span className="font-medium text-[#C9A84C]">M3</span>.{' '}
          AML automated screening in{' '}
          <span className="font-medium text-[#C9A84C]">M5</span>.{' '}
          FINCEN / SEC regulatory exports in{' '}
          <span className="font-medium text-[#C9A84C]">M10</span>.
        </p>
      </div>
    </div>
  )
}
