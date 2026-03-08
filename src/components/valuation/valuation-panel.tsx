'use client'

// ---------------------------------------------------------------------------
// ValuationPanel — Full AI valuation summary for property and land detail pages.
//
// Two modes:
//   RICH mode  — receives a full AiValuation object: shows range bar, value
//               drivers, comparable sales, and methodology note.
//   BASIC mode — receives only estimatedValue + confidence (no rich object):
//               shows estimate, delta, confidence meter, and disclaimer.
//               Graceful degradation for listings not yet in the valuation DB.
//
// assetType:
//   'property' — gold accent, $/sqft in comps
//   'land'     — green accent, $/ac in comps, green surfaces
//
// Usage (detail page):
//   const valuation = getMockValuation(listing.id)
//   <ValuationPanel
//     listPrice={listing.price}
//     estimatedValue={listing.aiEstimatedValue}
//     confidence={listing.aiConfidence ?? 'LOW'}
//     valuation={valuation}
//     assetType="property"
//   />
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  type AiValuation,
  type AiConfidence,
  CONFIDENCE_CONFIG,
  DIRECTION_CONFIG,
  IMPACT_LABEL,
} from '@/lib/valuation/valuation-types'

// ── Props ──────────────────────────────────────────────────────────────────

interface ValuationPanelProps {
  listPrice: number
  estimatedValue: number
  confidence: AiConfidence
  /** Full structured valuation — enables rich mode. */
  valuation?: AiValuation | null
  assetType?: 'property' | 'land'
  /** For land: $/ac display alongside total */
  lotAcres?: number
}

// ── Theme helpers ──────────────────────────────────────────────────────────

function theme(assetType: 'property' | 'land') {
  if (assetType === 'land') {
    return {
      border:       'border-[#1E2D1E]',
      bg:           'bg-[#0D110D]',
      headerBg:     'bg-[#111D11]',
      divider:      'border-[#1E2D1E]',
      subtleBg:     'bg-[#111D11]',
      accentColor:  '#4ADE80',
      accentMuted:  'rgba(74,222,128,0.08)',
      labelColor:   'text-[#4A6A4A]',
      subLabelColor:'text-[#5A7060]',
      textPrimary:  'text-[#E8F0E8]',
      rangeBg:      'bg-[#1A2B1A]',
      confBarBg:    'bg-[#1A2B1A]',
    }
  }
  return {
    border:       'border-[#2A2A3A]',
    bg:           'bg-[#0D0D14]',
    headerBg:     'bg-[#111118]',
    divider:      'border-[#2A2A3A]',
    subtleBg:     'bg-[#111118]',
    accentColor:  '#C9A84C',
    accentMuted:  'rgba(201,168,76,0.08)',
    labelColor:   'text-[#4A4A60]',
    subLabelColor:'text-[#6B6B80]',
    textPrimary:  'text-[#F5F5F7]',
    rangeBg:      'bg-[#2A2A3A]',
    confBarBg:    'bg-[#2A2A3A]',
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function fmtFull(n: number): string {
  return `$${n.toLocaleString()}`
}

function getDelta(estimate: number, listPrice: number) {
  const pct = ((estimate - listPrice) / listPrice) * 100
  if (pct >  2) return { label: `${pct.toFixed(1)}% below ask`, color: '#4ADE80', variant: 'under' as const }
  if (pct < -2) return { label: `${Math.abs(pct).toFixed(1)}% above ask`, color: '#F87171', variant: 'over' as const }
  return { label: 'At asking price', color: '#A0A0B2', variant: 'at' as const }
}

// Position of list price pin within range bar (0–100%)
function rangePin(listPrice: number, low: number, high: number): number {
  if (high <= low) return 50
  return Math.max(2, Math.min(98, ((listPrice - low) / (high - low)) * 100))
}

// ── Range bar ─────────────────────────────────────────────────────────────

function RangeBar({
  listPrice,
  low,
  mid,
  high,
  t,
}: {
  listPrice: number
  low: number
  mid: number
  high: number
  t: ReturnType<typeof theme>
}) {
  const pinPct = rangePin(listPrice, low, high)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className={cn('text-[10px] font-semibold uppercase tracking-wider', t.labelColor)}>
          Estimated Range
        </p>
        <p className={cn('text-[10px]', t.subLabelColor)}>
          {fmt(low)} — {fmt(high)}
        </p>
      </div>

      {/* Bar with gradient and list price pin */}
      <div className={cn('relative h-2 overflow-visible rounded-full', t.rangeBg)}>
        {/* Gradient fill */}
        <div
          className="absolute inset-y-0 left-0 right-0 rounded-full"
          style={{
            background: `linear-gradient(to right, ${t.accentColor}30, ${t.accentColor}80, ${t.accentColor}30)`,
          }}
        />
        {/* Midpoint dot */}
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[#0D0D14]"
          style={{
            left: `${rangePin(mid, low, high)}%`,
            backgroundColor: t.accentColor,
            transform: 'translate(-50%, -50%)',
          }}
          title={`AI estimate: ${fmtFull(mid)}`}
        />
        {/* List price pin */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${pinPct}%`, transform: 'translate(-50%, -50%)' }}
          title={`List price: ${fmtFull(listPrice)}`}
        >
          <div className="h-4 w-0.5 bg-[#6B6B80]" />
        </div>
      </div>

      {/* Labels */}
      <div className="mt-2 flex items-center justify-between text-[9px]">
        <span className={t.labelColor}>Conservative</span>
        <span className={cn('flex items-center gap-1', t.subLabelColor)}>
          <span className="inline-block h-0.5 w-2 bg-[#6B6B80]" />
          List ${(listPrice / 1000).toFixed(0)}K
        </span>
        <span className={t.labelColor}>Optimistic</span>
      </div>
    </div>
  )
}

// ── Confidence meter ───────────────────────────────────────────────────────

function ConfidenceMeter({
  confidence,
  t,
}: {
  confidence: AiConfidence
  t: ReturnType<typeof theme>
}) {
  const conf = CONFIDENCE_CONFIG[confidence]
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className={cn('text-[10px] font-semibold uppercase tracking-wider', t.labelColor)}>
          Model Confidence
        </p>
        <span
          className="text-[10px] font-semibold"
          style={{ color: conf.color }}
        >
          {conf.shortLabel}
        </span>
      </div>
      <div className={cn('h-1.5 overflow-hidden rounded-full', t.confBarBg)}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: conf.barWidth, backgroundColor: conf.color }}
        />
      </div>
      <p className={cn('mt-1 text-[9px]', t.subLabelColor)}>{conf.label}</p>
    </div>
  )
}

// ── Value drivers ──────────────────────────────────────────────────────────

function DriversSection({
  drivers,
  t,
}: {
  drivers: AiValuation['drivers']
  t: ReturnType<typeof theme>
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? drivers : drivers.slice(0, 3)

  return (
    <div>
      <p className={cn('mb-2 text-[10px] font-semibold uppercase tracking-wider', t.labelColor)}>
        Value Drivers
      </p>
      <div className="flex flex-col gap-2">
        {visible.map((d, i) => {
          const dir = DIRECTION_CONFIG[d.direction]
          const impactLabel = IMPACT_LABEL[d.impact]
          return (
            <div
              key={i}
              className="rounded-lg px-3 py-2.5"
              style={{ backgroundColor: dir.bg }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                    style={{ color: dir.color, backgroundColor: `${dir.color}15` }}
                  >
                    {dir.symbol}
                  </span>
                  <span className="text-[11px] font-semibold text-[#E0E0EE]">{d.label}</span>
                </div>
                <span
                  className="shrink-0 text-[9px] font-medium"
                  style={{ color: dir.color, opacity: 0.8 }}
                >
                  {impactLabel}
                </span>
              </div>
              <p className={cn('mt-1 pl-6 text-[10px] leading-relaxed', t.subLabelColor)}>
                {d.description}
              </p>
            </div>
          )
        })}
      </div>
      {drivers.length > 3 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn('mt-2 text-[10px] font-medium transition-colors hover:opacity-80', t.subLabelColor)}
        >
          {expanded ? '▲ Show fewer drivers' : `▼ Show ${drivers.length - 3} more driver${drivers.length - 3 !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  )
}

// ── Comparable sales ───────────────────────────────────────────────────────

function CompsSection({
  comps,
  assetType,
  t,
}: {
  comps: AiValuation['comparables']
  assetType: 'property' | 'land'
  t: ReturnType<typeof theme>
}) {
  return (
    <div>
      <p className={cn('mb-2 text-[10px] font-semibold uppercase tracking-wider', t.labelColor)}>
        Comparable Sales
      </p>
      <div className="flex flex-col divide-y" style={{ borderColor: t.divider.replace('border-', '') }}>
        {comps.map((c, i) => (
          <div key={i} className="flex items-start justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-[#D0D0E0]">{c.address}</p>
              <div className={cn('mt-0.5 flex items-center gap-2 text-[10px]', t.subLabelColor)}>
                <span>{c.soldDate}</span>
                {assetType === 'land' && c.acres && (
                  <span>· {c.acres} ac</span>
                )}
                {assetType === 'property' && c.sqft && (
                  <span>· {c.sqft.toLocaleString()} sqft</span>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-semibold text-[#F5F5F7]">{fmtFull(c.soldPrice)}</p>
              {assetType === 'land' && c.pricePerAcre && (
                <p className={cn('text-[9px]', t.subLabelColor)}>
                  ${c.pricePerAcre.toLocaleString()}/ac
                </p>
              )}
              {assetType === 'property' && c.pricePerSqft && (
                <p className={cn('text-[9px]', t.subLabelColor)}>
                  ${c.pricePerSqft}/sqft
                </p>
              )}
              <p
                className="text-[9px] font-medium"
                style={{ color: t.accentColor, opacity: 0.75 }}
              >
                {c.similarityScore}% match
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

export function ValuationPanel({
  listPrice,
  estimatedValue,
  confidence,
  valuation,
  assetType = 'property',
  lotAcres,
}: ValuationPanelProps) {
  const t = theme(assetType)
  const conf = CONFIDENCE_CONFIG[confidence]
  const delta = getDelta(estimatedValue, listPrice)
  const isRich = Boolean(valuation)

  return (
    <div className={cn('overflow-hidden rounded-xl border', t.border, t.bg)}>
      {/* ── Header ── */}
      <div className={cn('flex items-center gap-2 border-b px-4 py-3', t.headerBg, t.border)}>
        <SparkleIcon color={t.accentColor} size={13} />
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: t.accentColor }}
        >
          TIGI AI Valuation
        </span>
        <span
          className="ml-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ring-1 ring-inset"
          style={{
            color: t.accentColor,
            backgroundColor: t.accentMuted,
            boxShadow: `0 0 0 1px ${t.accentColor}30`,
          }}
        >
          Beta
        </span>
        {isRich && valuation && (
          <span className={cn('ml-auto text-[9px]', t.labelColor)}>
            {valuation.modelVersion}
          </span>
        )}
        {!isRich && (
          <span className={cn('ml-auto text-[9px]', t.labelColor)}>Preview</span>
        )}
      </div>

      <div className="space-y-4 p-4">
        {/* ── Estimate hero ── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={cn('text-[10px]', t.labelColor)}>Estimated Value</p>
            <p className={cn('font-heading text-2xl font-bold', t.textPrimary)}>
              {fmtFull(estimatedValue)}
            </p>
            {assetType === 'land' && lotAcres && lotAcres > 0 && (
              <p className={cn('text-[11px]', t.subLabelColor)}>
                ~${Math.round(estimatedValue / lotAcres).toLocaleString()}/ac
              </p>
            )}
          </div>
          <div className="text-right">
            <p className={cn('text-[10px]', t.labelColor)}>vs. List Price</p>
            <p className="text-sm font-semibold" style={{ color: delta.color }}>
              {delta.label}
            </p>
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ring-1 ring-inset',
                conf.ringClass,
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: conf.color }}
              />
              {conf.shortLabel} confidence
            </span>
          </div>
        </div>

        {/* ── Rich: range bar ── */}
        {isRich && valuation && (
          <RangeBar
            listPrice={listPrice}
            low={valuation.range.low}
            mid={valuation.range.mid}
            high={valuation.range.high}
            t={t}
          />
        )}

        {/* ── Confidence meter (always shown) ── */}
        <ConfidenceMeter confidence={confidence} t={t} />

        {/* ── Rich: value drivers ── */}
        {isRich && valuation && valuation.drivers.length > 0 && (
          <div className={cn('border-t pt-4', t.divider)}>
            <DriversSection drivers={valuation.drivers} t={t} />
          </div>
        )}

        {/* ── Rich: comparable sales ── */}
        {isRich && valuation && valuation.comparables.length > 0 && (
          <div className={cn('border-t pt-4', t.divider)}>
            <CompsSection comps={valuation.comparables} assetType={assetType} t={t} />
          </div>
        )}

        {/* ── Rich: methodology note ── */}
        {isRich && valuation && (
          <div className={cn('border-t pt-3', t.divider)}>
            <p className={cn('text-[9px] leading-relaxed', t.labelColor)}>
              <span className="font-semibold">Methodology:</span>{' '}
              {valuation.methodology}
            </p>
          </div>
        )}

        {/* ── Disclaimer ── */}
        <p className={cn('text-[9px] leading-relaxed', t.labelColor)}>
          TIGI AI estimate is generated using{' '}
          {assetType === 'land'
            ? 'comparable land sales, zoning data, and parcel attributes'
            : 'comparable sales, market trends, and property attributes'}
          . It is not a certified appraisal and should not be used as the sole basis for
          a purchase decision. TIGI assumes no liability for valuation accuracy.
        </p>
      </div>
    </div>
  )
}

// ── Inline SVG sparkle ─────────────────────────────────────────────────────

function SparkleIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 1 L9 6 L14 8 L9 10 L8 15 L7 10 L2 8 L7 6 Z" fill={color} opacity="0.9" />
    </svg>
  )
}
