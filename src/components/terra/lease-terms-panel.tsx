'use client'

// ---------------------------------------------------------------------------
// LeaseTermsPanel — Structured display of lease terms for a land parcel.
//
// Renders the full LeaseTerms object in a TIGI Glass panel with emerald accents.
// Used in:
//   - LandDetailClient ZoningTab (full terms section)
//   - LandActionPanel (summary card)
//
// Variants:
//   'summary'  — compact key metrics only (rate, duration, options)
//   'full'     — complete breakdown with all fields, use restrictions, terms
// ---------------------------------------------------------------------------

import { Check, X, AlertCircle, Clock, DollarSign, RefreshCw, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeaseTerms } from '@/lib/terra/terra-types'
import { formatLeaseDuration } from '@/lib/terra/terra-mock-data'

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtUSD(n: number): string {
  return `$${n.toLocaleString()}`
}

function escalationLabel(terms: LeaseTerms): string {
  switch (terms.escalationType) {
    case 'NONE':            return 'Fixed rate (no escalation)'
    case 'CPI':             return 'CPI-adjusted annually'
    case 'PERCENT_PER_YEAR': return `${terms.escalationRate}% per year`
    case 'FIXED':           return 'Fixed periodic increase'
    default:                return 'See terms'
  }
}

// ── Summary variant ────────────────────────────────────────────────────────

function MetricCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] px-3 py-3">
      <span className={cn(
        'font-heading text-base font-semibold leading-tight',
        accent ? 'text-emerald-400' : 'text-white',
      )}>
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-zinc-600">{label}</span>
    </div>
  )
}

interface LeaseTermsPanelProps {
  terms:    LeaseTerms
  acres?:   number | null
  variant?: 'summary' | 'full'
}

export function LeaseTermsPanel({ terms, acres, variant = 'summary' }: LeaseTermsPanelProps) {
  if (variant === 'summary') {
    return <LeaseTermsSummary terms={terms} acres={acres} />
  }
  return <LeaseTermsFull terms={terms} acres={acres} />
}

function LeaseTermsSummary({ terms, acres }: { terms: LeaseTerms; acres?: number | null }) {
  const duration    = formatLeaseDuration(terms)
  const rateDisplay = terms.rateMonthly
    ? `${fmtUSD(terms.rateMonthly)}/mo`
    : terms.rateAnnual
    ? `${fmtUSD(terms.rateAnnual)}/yr`
    : 'On request'
  const rateAcreDisplay = terms.ratePerAcre
    ? `${fmtUSD(Math.round(terms.ratePerAcre))}/ac/yr`
    : null

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-400/15 bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-4">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/[0.06] blur-[40px]" aria-hidden="true" />
      <div className="relative">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
          Lease Terms
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricCell label="Monthly rate"  value={rateDisplay} accent />
        <MetricCell label="Duration"      value={duration} />
        {rateAcreDisplay && (
          <MetricCell label="Rate per acre" value={rateAcreDisplay} />
        )}
        {terms.securityDeposit && (
          <MetricCell label="Deposit" value={fmtUSD(terms.securityDeposit)} />
        )}
      </div>

      {/* Option pills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {terms.hasRenewalOption && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
            <Check className="h-2.5 w-2.5" />
            Renewal option
          </span>
        )}
        {terms.hasPurchaseOption && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-400">
            <Check className="h-2.5 w-2.5" />
            Purchase option
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] text-zinc-500">
          <RefreshCw className="h-2.5 w-2.5" />
          {escalationLabel(terms)}
        </span>
      </div>
      </div>
    </div>
  )
}

// ── Full variant ────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
      {children}
    </p>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] py-2 last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={cn('text-xs font-medium', highlight ? 'text-emerald-400' : 'text-white')}>
        {value}
      </span>
    </div>
  )
}

function LeaseTermsFull({ terms, acres }: { terms: LeaseTerms; acres?: number | null }) {
  const duration     = formatLeaseDuration(terms)
  const rateMonthly  = terms.rateMonthly  ? `${fmtUSD(terms.rateMonthly)}/month` : '—'
  const rateAnnual   = terms.rateAnnual   ? `${fmtUSD(terms.rateAnnual)}/year`   : '—'
  const ratePerAcre  = terms.ratePerAcre
    ? `${fmtUSD(Math.round(terms.ratePerAcre))}/acre/year`
    : '—'
  const deposit      = terms.securityDeposit ? fmtUSD(terms.securityDeposit) : '—'

  return (
    <div className="space-y-6">

      {/* Duration & Rate */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-4">
        <SectionHeader>Rate &amp; Duration</SectionHeader>
        <div className="divide-y divide-white/[0.06]">
          <Row label="Monthly rate"   value={rateMonthly}                highlight={!!terms.rateMonthly} />
          <Row label="Annual rate"    value={rateAnnual} />
          <Row label="Rate per acre"  value={ratePerAcre} />
          <Row label="Duration type"  value={duration} />
          {terms.minimumMonths && (
            <Row label="Minimum term" value={`${terms.minimumMonths} months (${Math.round(terms.minimumMonths / 12 * 10) / 10} yr)`} />
          )}
          {terms.maximumMonths && (
            <Row label="Maximum term" value={`${terms.maximumMonths} months (${Math.round(terms.maximumMonths / 12 * 10) / 10} yr)`} />
          )}
          <Row label="Security deposit" value={deposit} />
        </div>
      </div>

      {/* Escalation */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-4">
        <SectionHeader>Rent Escalation</SectionHeader>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
          <p className="text-sm text-zinc-400">{escalationLabel(terms)}</p>
        </div>
      </div>

      {/* Options */}
      {(terms.hasRenewalOption || terms.hasPurchaseOption) && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-4">
          <SectionHeader>Lease Options</SectionHeader>
          <div className="space-y-3">
            {terms.hasRenewalOption && (
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-white">Renewal option</p>
                  {terms.renewalTermMonths && (
                    <p className="text-xs text-zinc-500">
                      {terms.renewalTermMonths} months ({Math.round(terms.renewalTermMonths / 12 * 10) / 10} yr) renewal term
                    </p>
                  )}
                </div>
              </div>
            )}
            {terms.hasPurchaseOption && (
              <div className="flex items-start gap-2">
                <DollarSign className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-white">Purchase option</p>
                  {terms.purchaseOptionPrice && (
                    <p className="text-xs text-zinc-500">
                      Option price: {fmtUSD(terms.purchaseOptionPrice)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Allowed uses */}
      {terms.allowedUses.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-4">
          <SectionHeader>Permitted Uses</SectionHeader>
          <ul className="space-y-1.5">
            {terms.allowedUses.map((use) => (
              <li key={use} className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                {use}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prohibited uses */}
      {terms.prohibitedUses.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-4">
          <SectionHeader>Restricted Uses</SectionHeader>
          <ul className="space-y-1.5">
            {terms.prohibitedUses.map((use) => (
              <li key={use} className="flex items-center gap-2 text-sm text-zinc-500">
                <X className="h-3 w-3 shrink-0 text-red-400/60" />
                {use}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional terms */}
      {terms.additionalTerms && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] p-4">
          <SectionHeader>Additional Terms</SectionHeader>
          <p className="text-sm leading-relaxed text-zinc-500 whitespace-pre-wrap">
            {terms.additionalTerms}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-white/[0.08] px-3 py-2.5">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-600" />
        <p className="text-[10px] leading-relaxed text-zinc-600">
          Lease terms shown are indicative and subject to negotiation. A formal lease agreement
          executed by both parties governs the actual tenancy. Consult legal counsel before signing.
        </p>
      </div>
    </div>
  )
}
