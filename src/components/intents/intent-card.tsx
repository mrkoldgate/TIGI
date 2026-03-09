'use client'

// ---------------------------------------------------------------------------
// IntentCard — Display card for a single TransactionIntent.
//
// Shows:
//   - Listing title + location
//   - Intent type badge
//   - Status badge
//   - Financial details (offer, fractions)
//   - Created date
//   - Cancel button (PENDING / REVIEWING only)
//
// Calls PATCH /api/intents/[id] { action: 'cancel' } on cancel.
// On success, updates status to CANCELLED in local state via onCancel callback.
// ---------------------------------------------------------------------------

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PenLine,
  Loader2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserIntent } from '@/lib/intents/intent-query'
import { WalletPreparationPanel } from '@/components/wallet/wallet-preparation-panel'
import { IntentReadinessChecklist } from '@/components/wallet/intent-readiness-checklist'
import { INTENT_STATUS_GUIDANCE } from '@/lib/solana/transaction-programs'

// ── Label maps ─────────────────────────────────────────────────────────────

const INTENT_TYPE_LABELS: Record<string, { label: string; short: string }> = {
  EXPRESS_INTEREST:  { label: 'Express Interest',  short: 'Interest'  },
  PREPARE_PURCHASE:  { label: 'Purchase Intent',   short: 'Purchase'  },
  PREPARE_INVEST:    { label: 'Investment Intent', short: 'Investment' },
  PREPARE_LEASE:     { label: 'Lease Intent',      short: 'Lease'     },
}

const STATUS_CONFIG: Record<string, {
  icon:        React.ElementType
  badgeClass:  string
  dotClass:    string
}> = {
  PENDING: {
    icon:       Clock,
    badgeClass: 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]',
    dotClass:   'bg-[#F59E0B]',
  },
  REVIEWING: {
    icon:       AlertCircle,
    badgeClass: 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]',
    dotClass:   'bg-[#3B82F6]',
  },
  APPROVED: {
    icon:       CheckCircle2,
    badgeClass: 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]',
    dotClass:   'bg-[#22C55E] animate-pulse',
  },
  READY_TO_SIGN: {
    icon:       PenLine,
    badgeClass: 'border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C]',
    dotClass:   'bg-[#C9A84C] animate-pulse',
  },
  EXECUTED: {
    icon:       CheckCircle2,
    badgeClass: 'border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C]',
    dotClass:   'bg-[#C9A84C]',
  },
  CANCELLED: {
    icon:       XCircle,
    badgeClass: 'border-[#6B6B80]/20 bg-[#6B6B80]/10 text-[#6B6B80]',
    dotClass:   'bg-[#6B6B80]',
  },
  EXPIRED: {
    icon:       XCircle,
    badgeClass: 'border-[#6B6B80]/20 bg-[#6B6B80]/10 text-[#6B6B80]',
    dotClass:   'bg-[#6B6B80]',
  },
}

const CANCELLABLE_STATUSES = ['PENDING', 'REVIEWING']

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Component ──────────────────────────────────────────────────────────────

interface IntentCardProps {
  intent:    UserIntent
  onCancel?: (id: string) => void
}

interface WalletPreparationData {
  serialized:           string
  requiredSigner:       string
  blockhash:            string
  lastValidBlockHeight: number
  expiresAt:            string
  program:              string
  memoText:             string
}

export function IntentCard({ intent, onCancel }: IntentCardProps) {
  const [isCancelling,    setIsCancelling]    = useState(false)
  const [cancelError,     setCancelError]     = useState<string | null>(null)
  const [localStatus,     setLocalStatus]     = useState(intent.status)
  const [isPreparing,     setIsPreparing]     = useState(false)
  const [prepareError,    setPrepareError]    = useState<string | null>(null)
  const [preparation,     setPreparation]     = useState<WalletPreparationData | null>(() => {
    // If the intent was already prepared (READY_TO_SIGN), hydrate from metadata
    if (intent.status === 'READY_TO_SIGN') {
      const meta = intent.metadata as Record<string, unknown> | null
      return (meta?.walletPreparation as WalletPreparationData) ?? null
    }
    return null
  })

  const statusCfg      = STATUS_CONFIG[localStatus]   ?? STATUS_CONFIG.PENDING
  const statusGuidance = INTENT_STATUS_GUIDANCE[localStatus as keyof typeof INTENT_STATUS_GUIDANCE]
                       ?? INTENT_STATUS_GUIDANCE.PENDING
  const intentLabel    = INTENT_TYPE_LABELS[intent.intentType] ?? { label: intent.intentType, short: intent.intentType }
  const StatusIcon     = statusCfg.icon

  const canCancel  = CANCELLABLE_STATUSES.includes(localStatus)
  const canPrepare = localStatus === 'APPROVED'
  const showPanel  = localStatus === 'READY_TO_SIGN' && preparation !== null

  const handlePrepare = useCallback(async () => {
    setIsPreparing(true)
    setPrepareError(null)
    try {
      const res  = await fetch(`/api/intents/${intent.id}/prepare`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message ?? `Request failed (${res.status})`)
      setPreparation(json.data.preparation as WalletPreparationData)
      setLocalStatus('READY_TO_SIGN')
    } catch (err) {
      setPrepareError((err as Error).message)
    } finally {
      setIsPreparing(false)
    }
  }, [intent.id])

  const handleCancel = async () => {
    setIsCancelling(true)
    setCancelError(null)
    try {
      const res = await fetch(`/api/intents/${intent.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'cancel' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message ?? `Request failed (${res.status})`)
      setLocalStatus('CANCELLED')
      onCancel?.(intent.id)
    } catch (err) {
      setCancelError((err as Error).message)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className={cn(
      'rounded-xl border bg-[#0D0D14] p-4 transition-opacity',
      localStatus === 'CANCELLED' || localStatus === 'EXPIRED' ? 'opacity-60' : '',
      'border-[#1A1A24]',
    )}>
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <span className={cn('mt-1.5 h-2 w-2 flex-shrink-0 rounded-full', statusCfg.dotClass)} />

        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#F5F5F7]">
                {intent.property.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B6B80]">
                <MapPin className="h-3 w-3" />
                {intent.property.city}, {intent.property.state}
              </p>
            </div>

            {/* Status badge */}
            <div className={cn(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
              statusCfg.badgeClass,
            )}>
              <StatusIcon className="h-3 w-3" />
              {statusGuidance.label}
            </div>
          </div>

          {/* Intent type + details */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[#2A2A3A] bg-[#111118] px-2 py-0.5 text-[11px] font-medium text-[#A0A0B2]">
              {intentLabel.label}
            </span>

            {intent.property.isTokenized && intent.intentType === 'PREPARE_INVEST' && (
              <span className="flex items-center gap-1 text-[11px] text-[#C9A84C]">
                <Zap className="h-3 w-3" />
                Fractional
              </span>
            )}

            {intent.fractionQty != null && (
              <span className="text-[11px] text-[#6B6B80]">
                {intent.fractionQty} fraction{intent.fractionQty !== 1 ? 's' : ''}
              </span>
            )}

            {intent.offerAmount != null && (
              <span className="text-[11px] font-medium text-[#C9A84C]">
                Offer: {formatCurrency(intent.offerAmount)}
              </span>
            )}
          </div>

          {/* Note */}
          {intent.note && (
            <p className="mt-2 text-[11px] italic text-[#6B6B80]">
              &ldquo;{intent.note}&rdquo;
            </p>
          )}

          {/* Footer row */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[11px] text-[#4A4A60]">
              Submitted {formatDate(intent.createdAt)}
            </p>

            <div className="flex items-center gap-2">
              <Link
                href={`/marketplace/${intent.property.id}`}
                className="text-[11px] text-[#6B6B80] underline-offset-2 hover:text-[#A0A0B2] hover:underline"
              >
                View listing
              </Link>

              {canCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex items-center gap-1 rounded-lg border border-[#2A2A3A] px-2.5 py-1 text-[11px] text-[#6B6B80] transition-all hover:border-[#EF4444]/40 hover:text-[#EF4444] disabled:opacity-50"
                >
                  {isCancelling ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Cancel
                </button>
              )}
            </div>
          </div>

          {cancelError && (
            <p className="mt-1.5 text-[11px] text-[#EF4444]">{cancelError}</p>
          )}

          {/* Status meaning — shown for active non-terminal statuses */}
          {statusGuidance.nextStep && localStatus !== 'APPROVED' && localStatus !== 'READY_TO_SIGN' && (
            <p className="mt-2 text-[11px] leading-relaxed text-[#4A4A60]">
              {statusGuidance.nextStep}
            </p>
          )}

          {/* Readiness checklist — shown when APPROVED (replaces bare prepare button) */}
          {canPrepare && (
            <div className="mt-3 border-t border-[#1A1A24] pt-3">
              <IntentReadinessChecklist
                intentId={intent.id}
                intentType={intent.intentType}
                intentStatus={localStatus}
                isPreparing={isPreparing}
                prepareError={prepareError}
                onPrepare={handlePrepare}
              />
            </div>
          )}

          {/* Wallet preparation signing panel — shown when READY_TO_SIGN */}
          {showPanel && preparation && (
            <div className="mt-3 border-t border-[#1A1A24] pt-3">
              <WalletPreparationPanel
                intentId={intent.id}
                preparation={preparation}
                onSuccess={() => setLocalStatus('EXECUTED')}
                onRefreshed={(newPrep) => setPreparation(newPrep)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
