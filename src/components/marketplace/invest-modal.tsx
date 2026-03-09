'use client'

// ---------------------------------------------------------------------------
// invest-modal.tsx — Full investment flow modal for tokenized properties.
//
// Opened from the InvestmentPanel on the property detail page.
// Sections (single scrollable sheet):
//   1. Property strip      — image, name, price-per-fraction
//   2. Amount selector     — slider + number input, live availability
//   3. Cost breakdown      — subtotal + platform fee + total
//   4. Disclosure          — static legal text (non-crypto language)
//   5. Acknowledgements    — 3 checkboxes; Submit enabled when all checked
//   6. Success state       — intent ref + next-steps message
//
// Submits to POST /api/intents with intentType=PREPARE_INVEST.
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  X,
  Zap,
  Users,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Info,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import type { MockListing } from '@/lib/marketplace/mock-data'
import { tokenSoldPercent } from '@/lib/marketplace/mock-data'

// ── Constants ──────────────────────────────────────────────────────────────

const PLATFORM_FEE_RATE = 0.015 // 1.5% displayed fee

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtUSD(n: number) {
  return n.toLocaleString('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function computeCost(fractions: number, pricePerFraction: number) {
  const subtotal    = fractions * pricePerFraction
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100
  const total       = subtotal + platformFee
  return { subtotal, platformFee, total }
}

// ── Acknowledgement definitions ────────────────────────────────────────────

const ACKS = [
  'I understand that TIGI fractions represent proportional economic interest in the property — not legal title, securities, or direct ownership.',
  'I acknowledge that distributions and returns are not guaranteed and may vary based on property performance.',
  'I confirm I have read the TIGI Disclosure Statement and agree to the Terms of Service governing fractional participation.',
] as const

// ── Sub-components ─────────────────────────────────────────────────────────

function CostRow({
  label,
  value,
  sub,
  gold,
  total,
}: {
  label: string
  value: string
  sub?:  string
  gold?: boolean
  total?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-2.5 text-sm',
        total && 'border-t border-[#2A2A3A] pt-3 mt-1',
      )}
    >
      <span className={cn('text-[#6B6B80]', total && 'font-medium text-[#A0A0B2]')}>
        {label}
        {sub && <span className="ml-1 text-[10px] text-[#4A4A60]">{sub}</span>}
      </span>
      <span
        className={cn(
          'font-mono font-medium',
          gold  ? 'text-[#C9A84C]' : 'text-[#F5F5F7]',
          total && 'text-base',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function Disclosure() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-[#2A2A3A] bg-[#0D0D14]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-[#4A4A60]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4A4A60]">
            Important Disclosures
          </span>
        </div>
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-[#4A4A60] transition-transform duration-200',
            expanded && 'rotate-90',
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-[#1E1E2A] px-4 pb-4 pt-3 text-[11px] leading-relaxed text-[#6B6B80] space-y-2">
          <p>
            TIGI fractional tokens represent a proportional economic interest in the underlying real
            estate asset. They do not confer legal title, voting rights, or any form of direct
            ownership recognised under applicable property law.
          </p>
          <p>
            Participation in fractional real estate carries risk. Property values may decline, rental
            income may be disrupted, and liquidity is not guaranteed. You should consider your financial
            circumstances and, where appropriate, seek independent legal or financial advice before
            participating.
          </p>
          <p>
            This is not an offer or solicitation to buy or sell securities in any jurisdiction where
            such activity is prohibited or would require registration, licensing, or qualification.
          </p>
          <p>
            Platform fees are collected at time of confirmed transaction execution, not intent submission.
            Submitted intents are non-binding until countersigned by the platform and the listing owner.
          </p>
        </div>
      )}
    </div>
  )
}

function SuccessScreen({
  intentId,
  listingId,
  fractions,
  total,
  onClose,
}: {
  intentId:  string
  listingId: string
  fractions: number
  total:     number
  onClose:   () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#22C55E]/10 ring-1 ring-[#22C55E]/20">
        <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
      </div>

      {/* Message */}
      <div className="max-w-sm space-y-2">
        <h2 className="font-heading text-xl font-semibold text-[#F5F5F7]">
          Investment intent submitted
        </h2>
        <p className="text-sm text-[#6B6B80]">
          Your intent to acquire{' '}
          <span className="font-medium text-[#C9A84C]">{fractions} fraction{fractions !== 1 ? 's' : ''}</span>{' '}
          ({fmtUSD(total)} total) is pending review. Our team will be in touch within 1–2 business
          days to guide you through next steps.
        </p>
      </div>

      {/* Ref */}
      <p className="font-mono text-[11px] text-[#3A3A4A]">
        ref: {intentId.slice(-12).toUpperCase()}
      </p>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/transactions"
          className="flex items-center gap-1.5 rounded-xl bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-[#0A0A0F] transition-opacity hover:opacity-90"
        >
          View in Transactions
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[#2A2A3A] px-5 py-2.5 text-sm font-medium text-[#A0A0B2] transition-colors hover:border-[#3A3A4A] hover:text-[#F5F5F7]"
        >
          Back to listing
        </button>
      </div>

      {/* Dashboard nudge */}
      <p className="text-xs text-[#4A4A60]">
        Your active interests appear on your{' '}
        <Link href="/dashboard" className="text-[#6B6B80] underline underline-offset-2 hover:text-[#A0A0B2]">
          dashboard
        </Link>
        .
      </p>
    </div>
  )
}

// ── Main modal ─────────────────────────────────────────────────────────────

interface InvestModalProps {
  listing: MockListing
  isOpen:  boolean
  onClose: () => void
}

export function InvestModal({ listing, isOpen, onClose }: InvestModalProps) {
  const overlayRef    = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // ── Investment state ─────────────────────────────────────────────────────
  const available = listing.tokenAvailableSupply ?? 0
  const pricePerFraction = listing.tokenPricePerFraction ?? 0
  const maxFractions = Math.max(available, 1)

  const [fractions,     setFractions]     = useState(1)
  const [acks,          setAcks]          = useState([false, false, false])
  const [note,          setNote]          = useState('')
  const [isSubmitting,  setIsSubmitting]  = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [success,       setSuccess]       = useState<{ intentId: string } | null>(null)

  const soldPct = tokenSoldPercent(listing)
  const cost    = useMemo(() => computeCost(fractions, pricePerFraction), [fractions, pricePerFraction])
  const allAcksChecked = acks.every(Boolean)
  const canSubmit = fractions >= 1 && fractions <= available && allAcksChecked && !isSubmitting

  // ── Close / escape ───────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose()
  }, [isSubmitting, onClose])

  useEffect(() => {
    if (!isOpen) return

    // Restore state on re-open
    setFractions(1)
    setAcks([false, false, false])
    setNote('')
    setError(null)
    setSuccess(null)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    // Prevent body scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus the close button for accessibility
    setTimeout(() => closeButtonRef.current?.focus(), 50)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, handleClose])

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/intents', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          propertyId:  listing.id,
          intentType:  'PREPARE_INVEST',
          fractionQty: fractions,
          note:        note.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error?.message ?? `Submission failed (${res.status})`)
      }
      setSuccess({ intentId: json.data.id })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0A0A0F]/80 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Invest in ${listing.title}`}
    >
      {/* Sheet */}
      <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[#2A2A3A] bg-[#0D0D14] shadow-2xl sm:rounded-2xl">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#1E1E2A] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C9A84C]/10">
              <Zap className="h-3.5 w-3.5 text-[#C9A84C]" />
            </div>
            <h2 className="font-heading text-sm font-semibold text-[#F5F5F7]">
              Invest in Property
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close investment modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4A4A60] transition-colors hover:bg-[#1A1A24] hover:text-[#A0A0B2] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {success ? (
            <SuccessScreen
              intentId={success.intentId}
              listingId={listing.id}
              fractions={fractions}
              total={cost.total}
              onClose={handleClose}
            />
          ) : (
            <div className="space-y-5 px-5 pb-6 pt-5">

              {/* ── Property strip ──────────────────────────────────────── */}
              <div className="flex items-center gap-3 rounded-xl border border-[#2A2A3A] bg-[#111118] p-3">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                  <PlaceholderImage
                    slot={listing.imageSlot}
                    propertyType={listing.imagePropertyType}
                    alt={listing.title}
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#F5F5F7]">{listing.title}</p>
                  <p className="text-xs text-[#6B6B80]">{listing.city}, {listing.state}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A84C]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#C9A84C] ring-1 ring-inset ring-[#C9A84C]/25">
                      <Zap className="h-2.5 w-2.5" />
                      Tokenized
                    </span>
                    <span className="text-[11px] text-[#4A4A60]">
                      {available.toLocaleString()} fractions available
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-[#4A4A60]">from</p>
                  <p className="font-heading text-base font-bold text-[#C9A84C]">
                    {fmtUSD(pricePerFraction)}
                  </p>
                  <p className="text-[10px] text-[#6B6B80]">/ fraction</p>
                </div>
              </div>

              {/* ── Availability progress ───────────────────────────────── */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B6B80]">{soldPct}% subscribed</span>
                  <span className="flex items-center gap-1 text-[#6B6B80]">
                    <Users className="h-3 w-3" />
                    {listing.tokenInvestorCount ?? 0} investors
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#2A2A3A]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#B8932F] to-[#C9A84C] transition-all duration-700"
                    style={{ width: `${soldPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#4A4A60]">
                  {available.toLocaleString()} of {(listing.tokenTotalSupply ?? 0).toLocaleString()} fractions remaining
                </p>
              </div>

              {/* ── Amount selector ─────────────────────────────────────── */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4A4A60]">
                  Number of Fractions
                </p>

                {/* Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min={1}
                    max={maxFractions}
                    step={1}
                    value={fractions}
                    onChange={(e) => setFractions(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#2A2A3A] accent-[#C9A84C]"
                    aria-label="Number of fractions"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#3A3A48]">
                    <span>1</span>
                    <span>{maxFractions.toLocaleString()}</span>
                  </div>
                </div>

                {/* Number input + economic context */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={available}
                      step={1}
                      value={fractions}
                      onChange={(e) => {
                        const v = Math.max(1, Math.min(available, Number(e.target.value) || 1))
                        setFractions(v)
                      }}
                      className="w-24 rounded-xl border border-[#2A2A3A] bg-[#111118] px-3 py-2.5 text-center font-mono text-sm font-semibold text-[#F5F5F7] outline-none transition-colors focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/20"
                      aria-label="Fraction count"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#6B6B80]">
                      {fractions} fraction{fractions !== 1 ? 's' : ''}{' '}
                      = proportional participation in{' '}
                      <span className="font-medium text-[#A0A0B2]">
                        {((fractions / (listing.tokenTotalSupply ?? 1)) * 100).toFixed(3)}%
                      </span>{' '}
                      of asset economics
                    </p>
                  </div>
                </div>

                {fractions > available && (
                  <p className="text-xs text-[#EF4444]">
                    Only {available.toLocaleString()} fractions are available.
                  </p>
                )}
              </div>

              {/* ── Cost breakdown ──────────────────────────────────────── */}
              <div className="rounded-xl border border-[#2A2A3A] bg-[#111118] px-4 py-1">
                <CostRow
                  label="Fractions"
                  sub={`× ${fmtUSD(pricePerFraction)}`}
                  value={fmtUSD(cost.subtotal)}
                />
                <CostRow
                  label="Platform fee"
                  sub="(1.5%)"
                  value={fmtUSD(cost.platformFee)}
                />
                <CostRow
                  label="Total"
                  value={fmtUSD(cost.total)}
                  gold
                  total
                />
              </div>

              {/* ── Disclosures ─────────────────────────────────────────── */}
              <Disclosure />

              {/* ── Acknowledgements ────────────────────────────────────── */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4A4A60]">
                  Acknowledgements
                </p>
                {ACKS.map((text, i) => (
                  <label
                    key={i}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors',
                      acks[i]
                        ? 'border-[#C9A84C]/30 bg-[#C9A84C]/5'
                        : 'border-[#2A2A3A] bg-[#111118] hover:border-[#3A3A4A]',
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all',
                        acks[i]
                          ? 'border-[#C9A84C] bg-[#C9A84C]'
                          : 'border-[#3A3A4A] bg-transparent',
                      )}
                    >
                      {acks[i] && <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-none stroke-[#0A0A0F] stroke-[1.5]"><path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={acks[i]}
                      onChange={(e) => {
                        const next = [...acks]
                        next[i] = e.target.checked
                        setAcks(next)
                      }}
                    />
                    <p className="text-xs leading-relaxed text-[#A0A0B2]">{text}</p>
                  </label>
                ))}
              </div>

              {/* ── Optional note ────────────────────────────────────────── */}
              <div>
                <label className="mb-1.5 block text-[11px] text-[#6B6B80]">
                  Note <span className="text-[#3A3A4A]">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any questions or additional context for the TIGI team…"
                  className="w-full resize-none rounded-xl border border-[#2A2A3A] bg-[#111118] px-3 py-2 text-sm text-[#F5F5F7] placeholder-[#3A3A4A] outline-none transition-colors focus:border-[#3A3A4A]"
                />
              </div>

              {/* ── Error ────────────────────────────────────────────────── */}
              {error && (
                <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 px-4 py-3">
                  <p className="text-xs text-[#EF4444]">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer (submit) ────────────────────────────────────────────── */}
        {!success && (
          <div className="shrink-0 border-t border-[#1E1E2A] px-5 py-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]',
                canSubmit
                  ? 'bg-[#C9A84C] text-[#0A0A0F] hover:bg-[#D4B55A]'
                  : 'cursor-not-allowed bg-[#C9A84C]/20 text-[#C9A84C]/40',
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </span>
              ) : (
                <>
                  Confirm — {fmtUSD(cost.total)}
                  {!allAcksChecked && (
                    <span className="ml-2 text-[11px] font-normal opacity-70">
                      (acknowledge all above)
                    </span>
                  )}
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[10px] text-[#3A3A4A]">
              This is a non-binding intent. No funds are collected at this stage.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
