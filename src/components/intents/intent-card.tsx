'use client'

// ---------------------------------------------------------------------------
// IntentCard — Display card for a single TransactionIntent (Hyper-Glass v4 Elite).
//
// Paragon structural grid: deep black bg, ultra-thin borders, edge-lit hover.
// High-contrast ambient glows for status indicators.
// Dimension nested inner panels for detail sections.
//
// All business logic preserved: cancel, prepare, wallet signing.
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
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserIntent } from '@/lib/intents/intent-query'
import { WalletPreparationPanel } from '@/components/wallet/wallet-preparation-panel'
import { IntentReadinessChecklist } from '@/components/wallet/intent-readiness-checklist'
import { INTENT_STATUS_GUIDANCE, type TIGIProgramId } from '@/lib/solana/transaction-programs'

// ── Label maps ─────────────────────────────────────────────────────────────

const INTENT_TYPE_LABELS: Record<string, { label: string; short: string }> = {
  EXPRESS_INTEREST: { label: 'Express Interest', short: 'Interest' },
  PREPARE_PURCHASE: { label: 'Purchase Intent', short: 'Purchase' },
  PREPARE_INVEST: { label: 'Investment Intent', short: 'Investment' },
  PREPARE_LEASE: { label: 'Lease Intent', short: 'Lease' },
}

// v3 status config: high-contrast glows sized for Paragon deep-black cards.
// Each status has a massive ambient orb color, an edge-light color, and
// a dot with vivid box-shadow for the status indicator.

const STATUS_CONFIG: Record<string, {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badgeClass: string
  dotColor: string
  dotGlow: string
  ambientOrb: string
  edgeLight: string
  iconDrop: string
}> = {
  PENDING: {
    icon: Clock,
    badgeClass: 'border-amber-400/15 bg-amber-400/[0.06] text-amber-400',
    dotColor: 'bg-amber-400',
    dotGlow: 'shadow-[0_0_12px_rgba(251,191,36,0.7)]',
    ambientOrb: 'bg-amber-500/[0.08]',
    edgeLight: 'via-amber-400/30',
    iconDrop: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  },
  REVIEWING: {
    icon: AlertCircle,
    badgeClass: 'border-blue-400/15 bg-blue-400/[0.06] text-blue-400',
    dotColor: 'bg-blue-400',
    dotGlow: 'shadow-[0_0_12px_rgba(96,165,250,0.7)]',
    ambientOrb: 'bg-blue-500/[0.08]',
    edgeLight: 'via-blue-400/30',
    iconDrop: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]',
  },
  APPROVED: {
    icon: CheckCircle2,
    badgeClass: 'border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-400',
    dotColor: 'bg-emerald-400',
    dotGlow: 'shadow-[0_0_14px_rgba(52,211,153,0.8)] animate-pulse',
    ambientOrb: 'bg-emerald-500/[0.1]',
    edgeLight: 'via-emerald-400/40',
    iconDrop: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]',
  },
  READY_TO_SIGN: {
    icon: PenLine,
    badgeClass: 'border-indigo-400/15 bg-indigo-400/[0.06] text-indigo-400',
    dotColor: 'bg-indigo-400',
    dotGlow: 'shadow-[0_0_14px_rgba(129,140,248,0.8)] animate-pulse',
    ambientOrb: 'bg-indigo-500/[0.1]',
    edgeLight: 'via-indigo-400/40',
    iconDrop: 'drop-shadow-[0_0_8px_rgba(129,140,248,0.7)]',
  },
  EXECUTED: {
    icon: CheckCircle2,
    badgeClass: 'border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-400',
    dotColor: 'bg-cyan-400',
    dotGlow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]',
    ambientOrb: 'bg-cyan-500/[0.05]',
    edgeLight: 'via-cyan-400/20',
    iconDrop: 'drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]',
  },
  CANCELLED: {
    icon: XCircle,
    badgeClass: 'border-zinc-600/15 bg-zinc-600/[0.04] text-zinc-500',
    dotColor: 'bg-zinc-600',
    dotGlow: '',
    ambientOrb: 'bg-transparent',
    edgeLight: 'via-transparent',
    iconDrop: '',
  },
  EXPIRED: {
    icon: XCircle,
    badgeClass: 'border-zinc-600/15 bg-zinc-600/[0.04] text-zinc-500',
    dotColor: 'bg-zinc-600',
    dotGlow: '',
    ambientOrb: 'bg-transparent',
    edgeLight: 'via-transparent',
    iconDrop: '',
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
  intent: UserIntent
  onCancel?: (id: string) => void
}

interface WalletPreparationData {
  serialized: string
  requiredSigner: string
  blockhash: string
  lastValidBlockHeight: number
  expiresAt: string
  program: TIGIProgramId
  memoText: string
}

export function IntentCard({ intent, onCancel }: IntentCardProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [localStatus, setLocalStatus] = useState(intent.status)
  const [isPreparing, setIsPreparing] = useState(false)
  const [prepareError, setPrepareError] = useState<string | null>(null)
  const [preparation, setPreparation] = useState<WalletPreparationData | null>(() => {
    if (intent.status === 'READY_TO_SIGN') {
      const meta = intent.metadata as Record<string, unknown> | null
      return (meta?.walletPreparation as WalletPreparationData) ?? null
    }
    return null
  })

  const statusCfg = STATUS_CONFIG[localStatus] ?? STATUS_CONFIG.PENDING
  const statusGuidance = INTENT_STATUS_GUIDANCE[localStatus as keyof typeof INTENT_STATUS_GUIDANCE]
    ?? INTENT_STATUS_GUIDANCE.PENDING
  const intentLabel = INTENT_TYPE_LABELS[intent.intentType] ?? { label: intent.intentType, short: intent.intentType }
  const StatusIcon = statusCfg.icon

  const canCancel = CANCELLABLE_STATUSES.includes(localStatus)
  const canPrepare = localStatus === 'APPROVED'
  const showPanel = localStatus === 'READY_TO_SIGN' && preparation !== null
  const isTerminal = localStatus === 'CANCELLED' || localStatus === 'EXPIRED'
  const isUrgent = localStatus === 'APPROVED' || localStatus === 'READY_TO_SIGN'

  const handlePrepare = useCallback(async () => {
    setIsPreparing(true)
    setPrepareError(null)
    try {
      const res = await fetch(`/api/intents/${intent.id}/prepare`, { method: 'POST' })
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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
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
      'group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-black transition-all duration-500',
      !isTerminal && 'hover:border-white/[0.1] hover:bg-white/[0.01]',
      isTerminal && 'opacity-40',
      isUrgent && 'border-white/[0.06]',
    )}>
      {/* Noise texture overlay */}
      <div className="noise absolute inset-0 pointer-events-none" />

      {/* Paragon edge light — colored per status, reveals on hover */}
      {!isTerminal && (
        <div className={cn(
          'pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent to-transparent transition-all duration-500',
          isUrgent ? statusCfg.edgeLight : 'group-hover:via-white/15',
          isUrgent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )} />
      )}

      {/* High-contrast ambient status orb */}
      <div className={cn(
        'pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-[60px] transition-opacity duration-500',
        statusCfg.ambientOrb,
        isTerminal ? 'opacity-0' : 'opacity-70 group-hover:opacity-100',
      )} />

      {/* Urgency gradient wash */}
      {isUrgent && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-purple-500/[0.015]" aria-hidden />
      )}

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Status indicator — Glassflow mini-centerpiece (v4 Elite) */}
          <div className="relative mt-0.5 flex-shrink-0">
            {/* Diffused backlight glow */}
            {!isTerminal && (
              <div className={cn(
                'pointer-events-none absolute inset-0 rounded-full blur-[20px] opacity-60',
                statusCfg.ambientOrb,
              )} />
            )}
            {/* Status dot backlight */}
            {!isTerminal && (
              <div className={cn(
                'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full blur-[12px] opacity-50',
                statusCfg.ambientOrb,
              )} />
            )}
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm">
              <span className={cn('h-2.5 w-2.5 rounded-full drop-shadow-[0_0_8px_currentColor]', statusCfg.dotColor, statusCfg.dotGlow)} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
                  {intent.property.title}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/20">
                  <MapPin className="h-3 w-3" />
                  {intent.property.city}, {intent.property.state}
                </p>
              </div>

              {/* Status badge — vivid on deep black */}
              <div className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase',
                statusCfg.badgeClass,
              )}>
                <StatusIcon className={cn('h-3 w-3', statusCfg.iconDrop)} />
                {statusGuidance.label}
              </div>
            </div>

            {/* Intent type + detail pills — elevated inner row */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-1 text-[10px] font-medium tracking-wide text-white/40">
                {intentLabel.label}
              </span>

              {intent.property.isTokenized && intent.intentType === 'PREPARE_INVEST' && (
                <span className="flex items-center gap-1 rounded-xl border border-purple-500/12 bg-purple-500/[0.04] px-2.5 py-1 text-[10px] font-medium text-purple-400">
                  <Zap className="h-3 w-3 drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]" />
                  Fractional
                </span>
              )}

              {intent.fractionQty != null && (
                <span className="rounded-xl border border-white/[0.04] bg-white/[0.01] px-2.5 py-1 text-[10px] text-white/30 tabular-nums">
                  {intent.fractionQty} fraction{intent.fractionQty !== 1 ? 's' : ''}
                </span>
              )}

              {intent.offerAmount != null && (
                <span className="rounded-xl border border-blue-500/12 bg-blue-500/[0.04] px-3 py-1 text-[10px] font-bold text-blue-400 tabular-nums shadow-[0_0_8px_rgba(96,165,250,0.08)]">
                  {formatCurrency(intent.offerAmount)}
                </span>
              )}
            </div>

            {/* Note — Dimension nested inner panel */}
            {intent.note && (
              <div className="relative mt-4 overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.01] px-4 py-3">
                <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                <p className="text-[11px] italic leading-relaxed text-white/25">
                  &ldquo;{intent.note}&rdquo;
                </p>
              </div>
            )}

            {/* Footer — date + actions */}
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.03] pt-4">
              <p className="text-[11px] text-white/15 tabular-nums">
                {formatDate(intent.createdAt)}
              </p>

              <div className="flex items-center gap-2.5">
                <Link
                  href={`/marketplace/${intent.property.id}`}
                  className="group/link flex items-center gap-1 text-[11px] text-white/20 transition-colors duration-300 hover:text-white/50"
                >
                  View listing
                  <ExternalLink className="h-2.5 w-2.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                </Link>

                {canCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="group/cancel flex items-center gap-1.5 rounded-xl border border-white/[0.04] bg-white/[0.01] px-3 py-1.5 text-[11px] font-medium text-white/30 transition-all duration-300 hover:border-red-400/20 hover:bg-red-400/[0.04] hover:text-red-400 disabled:opacity-50"
                  >
                    {isCancelling ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3 transition-transform duration-200 group-hover/cancel:rotate-90" />
                    )}
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {cancelError && (
              <p className="mt-2 text-[11px] text-red-400">{cancelError}</p>
            )}

            {/* Status guidance */}
            {statusGuidance.nextStep && localStatus !== 'APPROVED' && localStatus !== 'READY_TO_SIGN' && (
              <p className="mt-3 text-[11px] leading-relaxed text-white/15">
                {statusGuidance.nextStep}
              </p>
            )}

            {/* Readiness checklist — APPROVED */}
            {canPrepare && (
              <div className="relative mt-4 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
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

            {/* Wallet signing panel — READY_TO_SIGN */}
            {showPanel && preparation && (
              <div className="relative mt-4 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />
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
    </div>
  )
}
