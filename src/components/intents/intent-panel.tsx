'use client'

// ---------------------------------------------------------------------------
// IntentPanel — Action panel for property / land detail pages.
//
// Context-aware buttons:
//   BUY listing      → Purchase button (PREPARE_PURCHASE)
//   LEASE listing    → Lease button (PREPARE_LEASE)
//   BOTH listing     → Purchase + Lease
//   Tokenized        → Invest button (PREPARE_INVEST) with fractionQty
//   Always           → Express Interest (EXPRESS_INTEREST) as secondary
//
// Two-step flow:
//   1. Click CTA → inline confirm area expands (note textarea + optional qty)
//   2. Confirm → POST /api/intents → success state (intent ID shown)
//
// On success the button row is replaced with a confirmation card.
// The user can dismiss and see the "already submitted" state on re-open.
// ---------------------------------------------------------------------------

import { useState, useCallback } from 'react'
import { Zap, CheckCircle2, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

type IntentType = 'EXPRESS_INTEREST' | 'PREPARE_PURCHASE' | 'PREPARE_INVEST' | 'PREPARE_LEASE'

type ListingType = 'BUY' | 'LEASE' | 'BOTH' | string

interface IntentPanelProps {
  propertyId:              string
  listingType:             ListingType
  isTokenized:             boolean
  tokenPricePerFraction?:  number | null
  /**
   * Restrict which intent types are shown. Defaults to all relevant ones.
   * Pass an explicit list to render only a subset (e.g. invest-only panel).
   */
  only?:                   IntentType[]
  /** Optional: render in land-themed dark green palette */
  theme?:                  'default' | 'land'
}

interface PendingIntent {
  type:        IntentType
  label:       string
  confirmText: string
  showQty:     boolean
  showOffer:   boolean
}

// ── Config ─────────────────────────────────────────────────────────────────

const INTENT_CONFIG: Record<IntentType, { label: string; confirmText: string; color: string; icon?: React.ElementType }> = {
  PREPARE_PURCHASE:  { label: 'Prepare Purchase',  confirmText: 'Confirm purchase intent',  color: '#C9A84C' },
  PREPARE_LEASE:     { label: 'Prepare Lease',      confirmText: 'Confirm lease intent',      color: '#C9A84C' },
  PREPARE_INVEST:    { label: 'Invest',             confirmText: 'Confirm investment intent', color: '#C9A84C', icon: Zap },
  EXPRESS_INTEREST:  { label: 'Express Interest',   confirmText: 'Submit interest',           color: '#6B6B80' },
}

const INTENT_LABELS: Record<IntentType, string> = {
  PREPARE_PURCHASE: 'Purchase intent submitted',
  PREPARE_LEASE:    'Lease intent submitted',
  PREPARE_INVEST:   'Investment intent submitted',
  EXPRESS_INTEREST: 'Interest noted',
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SuccessCard({
  intentType,
  intentId,
  onDismiss,
  theme,
}: {
  intentType:  IntentType
  intentId:    string
  onDismiss:   () => void
  theme:       'default' | 'land'
}) {
  const borderColor = theme === 'land' ? 'border-[#22C55E]/25' : 'border-[#22C55E]/25'
  const bgColor     = theme === 'land' ? 'bg-[#0D110D]'        : 'bg-[#0D0D14]'

  return (
    <div className={cn('rounded-xl border p-4', borderColor, bgColor)}>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22C55E]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#F5F5F7]">{INTENT_LABELS[intentType]}</p>
          <p className="mt-0.5 text-[11px] text-[#6B6B80]">
            Our team will review and reach out within 1–2 business days.
          </p>
          <p className="mt-1 font-mono text-[10px] text-[#4A4A60]">ref: {intentId.slice(-8)}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-[#4A4A60] hover:text-[#6B6B80]"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Inline confirm panel ───────────────────────────────────────────────────

function ConfirmPanel({
  pending,
  isSubmitting,
  error,
  onConfirm,
  onCancel,
  theme,
}: {
  pending:      PendingIntent
  isSubmitting: boolean
  error:        string | null
  onConfirm:    (note: string, qty?: number, offer?: number) => void
  onCancel:     () => void
  theme:        'default' | 'land'
}) {
  const [note,  setNote]  = useState('')
  const [qty,   setQty]   = useState('')
  const [offer, setOffer] = useState('')

  const borderClass = theme === 'land' ? 'border-[#1E2D1E]' : 'border-[#2A2A3A]'
  const bgClass     = theme === 'land' ? 'bg-[#0D110D]'     : 'bg-[#0D0D14]'
  const inputClass  = theme === 'land'
    ? 'border-[#1E2D1E] bg-[#111A11] text-[#E8F0E8] placeholder-[#4A6A4A] focus:border-[#2A3A2A]'
    : 'border-[#2A2A3A] bg-[#111118] text-[#F5F5F7] placeholder-[#4A4A60] focus:border-[#3A3A4A]'

  return (
    <div className={cn('rounded-xl border p-4 space-y-3', borderClass, bgClass)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B80]">
        {pending.confirmText}
      </p>

      {pending.showQty && (
        <div>
          <label className="mb-1 block text-[11px] text-[#6B6B80]">
            Number of fractions
          </label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="e.g. 10"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
              inputClass,
            )}
          />
        </div>
      )}

      {pending.showOffer && (
        <div>
          <label className="mb-1 block text-[11px] text-[#6B6B80]">
            Offer amount (optional)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            placeholder="Leave blank to use list price"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
              inputClass,
            )}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-[11px] text-[#6B6B80]">
          Note <span className="text-[#4A4A60]">(optional)</span>
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any specific questions or requirements…"
          className={cn(
            'w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
            inputClass,
          )}
        />
      </div>

      {error && (
        <p className="text-xs text-[#EF4444]">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onConfirm(
            note,
            pending.showQty  && qty   ? parseInt(qty, 10)    : undefined,
            pending.showOffer && offer ? parseFloat(offer)    : undefined,
          )}
          disabled={isSubmitting}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#C9A84C] py-2.5 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4B55A] disabled:opacity-60 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            pending.confirmText
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-[#2A2A3A] px-4 py-2.5 text-sm text-[#6B6B80] transition-all hover:border-[#3A3A4A] hover:text-[#A0A0B2] disabled:opacity-50 active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function IntentPanel({
  propertyId,
  listingType,
  isTokenized,
  tokenPricePerFraction,
  only,
  theme = 'default',
}: IntentPanelProps) {
  const [pending,      setPending]      = useState<PendingIntent | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [success,      setSuccess]      = useState<{ intentType: IntentType; intentId: string } | null>(null)

  const openIntent = useCallback((type: IntentType) => {
    setError(null)
    setPending({
      type,
      label:       INTENT_CONFIG[type].label,
      confirmText: INTENT_CONFIG[type].confirmText,
      showQty:     type === 'PREPARE_INVEST',
      showOffer:   type === 'PREPARE_PURCHASE' || type === 'PREPARE_LEASE',
    })
  }, [])

  const handleConfirm = useCallback(async (note: string, qty?: number, offer?: number) => {
    if (!pending) return
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/intents', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          propertyId,
          intentType:  pending.type,
          fractionQty: qty    ?? undefined,
          offerAmount: offer  ?? undefined,
          note:        note || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error?.message ?? `Request failed (${res.status})`)
      }
      setSuccess({ intentType: pending.type, intentId: json.data.id })
      setPending(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }, [pending, propertyId])

  const handleCancel = useCallback(() => {
    setPending(null)
    setError(null)
  }, [])

  // ── Success state ──────────────────────────────────────────────────────
  if (success) {
    return (
      <SuccessCard
        intentType={success.intentType}
        intentId={success.intentId}
        onDismiss={() => setSuccess(null)}
        theme={theme}
      />
    )
  }

  // ── Confirm state ──────────────────────────────────────────────────────
  if (pending) {
    return (
      <ConfirmPanel
        pending={pending}
        isSubmitting={isSubmitting}
        error={error}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        theme={theme}
      />
    )
  }

  // ── Default button state ───────────────────────────────────────────────
  const allow = (type: IntentType) => !only || only.includes(type)

  const showBuy      = allow('PREPARE_PURCHASE') && (listingType === 'BUY'   || listingType === 'BOTH')
  const showLease    = allow('PREPARE_LEASE')    && (listingType === 'LEASE' || listingType === 'BOTH')
  const showInvest   = allow('PREPARE_INVEST')   && isTokenized && !!tokenPricePerFraction
  const showInterest = allow('EXPRESS_INTEREST')

  return (
    <div className="space-y-2">
      {showBuy && (
        <button
          type="button"
          onClick={() => openIntent('PREPARE_PURCHASE')}
          className="w-full rounded-xl bg-[#C9A84C] py-3 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4B55A] active:scale-[0.98]"
        >
          {theme === 'land' ? 'Acquire Land' : 'Buy Property'}
        </button>
      )}

      {showLease && (
        <button
          type="button"
          onClick={() => openIntent('PREPARE_LEASE')}
          className={cn(
            'w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]',
            showBuy
              ? 'border border-[#2A2A3A] text-[#A0A0B2] hover:border-[#3A3A4A] hover:text-[#F5F5F7]'
              : 'bg-[#C9A84C] text-[#0A0A0F] hover:bg-[#D4B55A]',
          )}
        >
          {theme === 'land' ? 'Lease Parcel' : 'Schedule Tour'}
        </button>
      )}

      {showInvest && (
        <button
          type="button"
          onClick={() => openIntent('PREPARE_INVEST')}
          className="w-full rounded-xl bg-[#C9A84C]/15 py-2.5 text-sm font-medium text-[#C9A84C] ring-1 ring-inset ring-[#C9A84C]/25 transition-all hover:bg-[#C9A84C]/25 active:scale-[0.98]"
        >
          <Zap className="mr-1.5 inline h-3.5 w-3.5" />
          Invest from ${tokenPricePerFraction!.toLocaleString()}
        </button>
      )}

      {showInterest && (
        <button
          type="button"
          onClick={() => openIntent('EXPRESS_INTEREST')}
          className="w-full rounded-xl border border-[#2A2A3A] py-2.5 text-sm font-medium text-[#6B6B80] transition-all hover:border-[#3A3A4A] hover:text-[#A0A0B2] active:scale-[0.98]"
        >
          Express Interest
        </button>
      )}
    </div>
  )
}
