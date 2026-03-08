'use client'

// ---------------------------------------------------------------------------
// ValuationBadge — Small AI valuation indicator for cards and row views.
//
// Variants:
//   'block'  — dark bordered row, used in grid card bodies
//   'inline' — text-only one-liner, used in list row views
//   'chip'   — minimal floating pill, used for image overlay usage
//
// Accepts either the rich AiValuation type OR the minimal { estimatedValue,
// confidence } shape so cards don't need to load the full valuation object.
//
// Usage:
//   <ValuationBadge estimatedValue={492000} confidence="HIGH" />
//   <ValuationBadge estimatedValue={492000} confidence="HIGH" listPrice={485000} />
//   <ValuationBadge estimatedValue={492000} confidence="HIGH" variant="inline" />
// ---------------------------------------------------------------------------

import { cn } from '@/lib/utils'
import { type AiConfidence, CONFIDENCE_CONFIG } from '@/lib/valuation/valuation-types'

// ── Props ──────────────────────────────────────────────────────────────────

interface ValuationBadgeProps {
  estimatedValue: number
  confidence: AiConfidence
  /** When provided, renders a delta indicator (±X% vs. list) */
  listPrice?: number
  /** Visual variant */
  variant?: 'block' | 'inline' | 'chip'
  /** 'property' = gold AI icon, 'land' = green AI icon */
  assetType?: 'property' | 'land'
  className?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function getDelta(estimate: number, listPrice: number) {
  const pct = ((estimate - listPrice) / listPrice) * 100
  if (pct >  2) return { label: `${pct.toFixed(1)}% below ask`, color: '#4ADE80' }
  if (pct < -2) return { label: `${Math.abs(pct).toFixed(1)}% above ask`, color: '#F87171' }
  return { label: 'At ask', color: '#A0A0B2' }
}

// ── Block variant (grid cards) ─────────────────────────────────────────────

function BlockBadge({
  estimatedValue,
  confidence,
  listPrice,
  assetType = 'property',
}: ValuationBadgeProps) {
  const conf = CONFIDENCE_CONFIG[confidence]
  const accentColor = assetType === 'land' ? '#4ADE80' : '#C9A84C'
  const delta = listPrice != null ? getDelta(estimatedValue, listPrice) : null

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-[#0D0D14] px-3 py-2 ring-1 ring-[#2A2A3A]">
      {/* Left: icon + label */}
      <div className="flex items-center gap-1.5">
        <SparkleIcon color={accentColor} size={11} />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#4A4A60]">
          AI Estimate
        </span>
      </div>

      {/* Right: value + confidence pill */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-[#F5F5F7]">
          {formatPrice(estimatedValue)}
        </span>
        {delta && (
          <span className="text-[9px] font-medium" style={{ color: delta.color }}>
            {delta.label}
          </span>
        )}
        <span
          className={cn(
            'inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold ring-1 ring-inset',
            conf.ringClass,
          )}
        >
          {conf.shortLabel}
        </span>
      </div>
    </div>
  )
}

// ── Inline variant (list rows) ─────────────────────────────────────────────

function InlineBadge({
  estimatedValue,
  confidence,
  listPrice,
  assetType = 'property',
}: ValuationBadgeProps) {
  const conf = CONFIDENCE_CONFIG[confidence]
  const accentColor = assetType === 'land' ? '#4ADE80' : '#C9A84C'
  const delta = listPrice != null ? getDelta(estimatedValue, listPrice) : null

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B80]">
      <SparkleIcon color={accentColor} size={10} />
      <span>
        AI est.{' '}
        <span className="font-semibold text-[#F5F5F7]">{formatPrice(estimatedValue)}</span>
        {delta && (
          <span className="ml-1" style={{ color: delta.color }}>
            · {delta.label}
          </span>
        )}
        <span className="ml-1" style={{ color: conf.color }}>
          · {conf.shortLabel}
        </span>
      </span>
    </div>
  )
}

// ── Chip variant (image overlays / floating) ───────────────────────────────

function ChipBadge({
  estimatedValue,
  confidence,
  assetType = 'property',
}: ValuationBadgeProps) {
  const conf = CONFIDENCE_CONFIG[confidence]
  const accentColor = assetType === 'land' ? '#4ADE80' : '#C9A84C'

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(10,10,15,0.80)',
        color: accentColor,
        boxShadow: `0 0 0 1px rgba(${accentColor === '#4ADE80' ? '74,222,128' : '201,168,76'},0.20)`,
      }}
    >
      <SparkleIcon color={accentColor} size={9} />
      AI {formatPrice(estimatedValue)}
      <span style={{ color: conf.color }}>· {conf.shortLabel}</span>
    </span>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

export function ValuationBadge({
  variant = 'block',
  className,
  ...props
}: ValuationBadgeProps) {
  return (
    <div className={className}>
      {variant === 'block'  && <BlockBadge  {...props} />}
      {variant === 'inline' && <InlineBadge {...props} />}
      {variant === 'chip'   && <ChipBadge   {...props} />}
    </div>
  )
}

// ── Inline SVG sparkle icon ────────────────────────────────────────────────

function SparkleIcon({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Four-point star sparkle */}
      <path
        d="M8 1 L9 6 L14 8 L9 10 L8 15 L7 10 L2 8 L7 6 Z"
        fill={color}
        opacity="0.9"
      />
    </svg>
  )
}
