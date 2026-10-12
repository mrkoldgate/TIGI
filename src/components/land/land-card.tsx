'use client'

import Link from 'next/link'
import { Heart, MapPin, Zap, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { ValuationBadge } from '@/components/valuation/valuation-badge'
import { type AiConfidence } from '@/lib/valuation/valuation-types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LandUseType =
  | 'AGRICULTURAL'
  | 'RESIDENTIAL_DEV'
  | 'COMMERCIAL_DEV'
  | 'INDUSTRIAL'
  | 'MIXED_USE'
  | 'RECREATIONAL'
  | 'WATERFRONT'
  | 'RURAL'

export type LandListingType = 'BUY' | 'LEASE' | 'BOTH'

export interface LandTokenInfo {
  pricePerFraction: number
  totalSupply: number
  availableSupply: number
  investorCount?: number
}

export interface LandAiValuation {
  estimatedValue: number
  confidence: AiConfidence
}

export interface LandCardData {
  id: string
  title: string
  city: string
  state: string
  price: number
  acres: number
  landUse: LandUseType
  listingType?: LandListingType
  /** Key attributes: zoning details, utilities, development readiness, access */
  features?: string[]
  isDevelopmentOpportunity?: boolean
  imageUrl?: string | null
  imageSlot?: string
  isTokenized?: boolean
  tokenInfo?: LandTokenInfo
  aiValuation?: LandAiValuation
  isNew?: boolean
  /** Explicit price/acre override; computed from price/acres if omitted */
  pricePerAcre?: number
}

export interface LandCardProps {
  data: LandCardData
  /** 'card' = vertical grid card (default), 'row' = horizontal list row */
  variant?: 'card' | 'row'
  isSaved?: boolean
  onSave?: (id: string) => void
  /** Override href; defaults to /marketplace/:id */
  href?: string
  className?: string
  /** Position in list — staggered animation delay */
  index?: number
  /** Pass true for above-the-fold images */
  priority?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (price >= 1_000) {
    return `$${(price / 1_000).toFixed(0)}K`
  }
  return `$${price.toLocaleString()}`
}

function formatAcres(acres: number): string {
  if (acres >= 1000) return `${(acres / 1000).toFixed(1)}K ac`
  if (acres >= 100) return `${Math.round(acres)} ac`
  if (acres % 1 === 0) return `${acres} ac`
  return `${acres.toFixed(1)} ac`
}

function computePricePerAcre(data: LandCardData): string {
  const ppa = data.pricePerAcre ?? (data.acres > 0 ? data.price / data.acres : null)
  if (!ppa) return ''
  return `${formatPrice(Math.round(ppa))}/ac`
}

function tokenSoldPercent(info: LandTokenInfo): number {
  if (!info.totalSupply) return 0
  return Math.round(((info.totalSupply - info.availableSupply) / info.totalSupply) * 100)
}

// ---------------------------------------------------------------------------
// Land use badge — visually distinct color language from property type badges.
// Green family = natural/agricultural; blue = development; amber = industrial.
// ---------------------------------------------------------------------------

const LAND_USE_CONFIG: Record<LandUseType, { label: string; className: string; dotClass: string }> = {
  AGRICULTURAL: {
    label: 'Agricultural',
    className: 'bg-emerald-900/30 text-emerald-300 ring-emerald-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    dotClass: 'bg-emerald-400',
  },
  RESIDENTIAL_DEV: {
    label: 'Residential Dev.',
    className: 'bg-indigo-900/25 text-indigo-300 ring-indigo-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    dotClass: 'bg-indigo-400',
  },
  COMMERCIAL_DEV: {
    label: 'Commercial Dev.',
    className: 'bg-amber-900/25 text-amber-300 ring-amber-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    dotClass: 'bg-amber-400',
  },
  INDUSTRIAL: {
    label: 'Industrial',
    className: 'bg-amber-900/30 text-amber-200 ring-amber-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    dotClass: 'bg-amber-300',
  },
  MIXED_USE: {
    label: 'Mixed Use',
    className: 'bg-violet-900/30 text-violet-300 ring-violet-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    dotClass: 'bg-violet-400',
  },
  RECREATIONAL: {
    label: 'Recreational',
    className: 'bg-emerald-900/25 text-emerald-300 ring-emerald-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    dotClass: 'bg-emerald-300',
  },
  WATERFRONT: {
    label: 'Waterfront',
    className: 'bg-cyan-900/25 text-cyan-300 ring-cyan-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    dotClass: 'bg-cyan-400',
  },
  RURAL: {
    label: 'Rural',
    className: 'bg-white/[0.03] text-zinc-400 ring-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
    dotClass: 'bg-zinc-500',
  },
}

function LandUseBadge({ use, small }: { use: LandUseType; small?: boolean }) {
  const config = LAND_USE_CONFIG[use]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium backdrop-blur-sm ring-1 ring-inset',
        small ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
        config.className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass, small && 'h-1 w-1')} />
      {config.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Development opportunity badge
// ---------------------------------------------------------------------------

function DevOpportunityBadge({ small }: { small?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-semibold backdrop-blur-sm ring-1 ring-inset',
        'bg-[#166534]/25 text-[#4ADE80] ring-[#22C55E]/30 shadow-[0_0_12px_rgba(74,222,128,0.25)]',
        small ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]',
      )}
    >
      <Layers className={cn(small ? 'h-2 w-2' : 'h-2.5 w-2.5')} />
      Dev. Opportunity
    </span>
  )
}

// ---------------------------------------------------------------------------
// Feature chips — compact tags for zoning/attributes
// ---------------------------------------------------------------------------

function FeatureChips({
  features,
  max = 4,
}: {
  features: string[]
  max?: number
}) {
  const visible = features.slice(0, max)
  const overflow = features.length - max

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((f) => (
        <span
          key={f}
          className="inline-flex items-center rounded bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-zinc-400 ring-1 ring-inset ring-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          {f}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[10px] text-zinc-500">+{overflow}</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Save / favourite button — identical to PropertyCard's
// ---------------------------------------------------------------------------

function SaveButton({
  isSaved,
  onSave,
  className,
}: {
  isSaved: boolean
  onSave: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={isSaved ? 'Remove from saved' : 'Save land listing'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSave()
      }}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150',
        'bg-black/70 backdrop-blur-sm ring-1 ring-white/[0.08]',
        'hover:bg-white/[0.04] hover:ring-[#4ADE80]/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ADE80]',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-3.5 w-3.5 transition-colors duration-150',
          isSaved ? 'fill-rose-400 text-rose-400' : 'text-zinc-500',
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Token progress bar
// ---------------------------------------------------------------------------

function TokenProgress({ info }: { info: LandTokenInfo }) {
  const soldPct = tokenSoldPercent(info)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] text-zinc-500">
        <span>{soldPct}% subscribed</span>
        {info.investorCount !== undefined && (
          <span>{info.investorCount} investors</span>
        )}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
          style={{ width: `${soldPct}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Acreage hero — the primary metric for land cards
// ---------------------------------------------------------------------------

function AcreageHero({
  acres,
  pricePerAcreLabel,
}: {
  acres: number
  pricePerAcreLabel: string
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-heading text-2xl font-bold tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
        {formatAcres(acres)}
      </span>
      {pricePerAcreLabel && (
        <span className="text-[11px] text-zinc-500">{pricePerAcreLabel}</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Listing type pill
// ---------------------------------------------------------------------------

function ListingTypePill({ type }: { type: LandListingType }) {
  if (type === 'BUY') return null
  return (
    <span className="inline-flex items-center rounded-md bg-[#8B5CF6]/20 px-2 py-0.5 text-[10px] font-medium text-[#A78BFA] backdrop-blur-sm ring-1 ring-inset ring-[#8B5CF6]/30">
      {type === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Card variant — vertical, panoramic image, acreage hero
// ---------------------------------------------------------------------------

function CardVariant({
  data,
  isSaved,
  onSave,
  href,
  index,
  priority,
}: Omit<LandCardProps, 'variant' | 'className'>) {
  const resolvedHref = href ?? `/marketplace/${data.id}`
  const ppaLabel = computePricePerAcre(data)

  return (
    <Link href={resolvedHref} className="group block h-full" tabIndex={0}>
      <article
        className="panel panel-hover relative flex h-full flex-col overflow-hidden !rounded-[22px] transition-transform duration-500 ease-out hover:-translate-y-1"
        style={{ animationDelay: `${Math.min(index ?? 0, 11) * 50}ms` }}
      >
        {/* ── Paragon top-edge lighting ── */}
        <div className="absolute inset-x-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-opacity duration-300 group-hover:via-white/[0.2]" />

        {/* ── Panoramic image ── */}
        <div className="relative overflow-hidden">
          <PlaceholderImage
            src={data.imageUrl}
            slot={data.imageSlot}
            propertyType="land"
            alt={data.title}
            className="aspect-[21/9] w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            priority={priority}
          />

          {/* Land use badge — top-left */}
          <div className="absolute left-3 top-3">
            <LandUseBadge use={data.landUse} />
          </div>

          {/* Top-right badges */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {data.isNew && (
              <span className="inline-flex items-center rounded-md bg-[#22C55E]/20 px-2 py-0.5 text-[10px] font-medium text-[#4ADE80] backdrop-blur-sm ring-1 ring-inset ring-[#22C55E]/30">
                New
              </span>
            )}
            {data.isTokenized && (
              <span className="inline-flex items-center gap-1 rounded-md bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400 backdrop-blur-sm border border-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                <Zap className="h-2.5 w-2.5" />
                Tokenized
              </span>
            )}
            {data.listingType && data.listingType !== 'BUY' && (
              <ListingTypePill type={data.listingType} />
            )}
          </div>

          {/* Dev. opportunity — bottom-left */}
          {data.isDevelopmentOpportunity && (
            <div className="absolute bottom-3 left-3">
              <DevOpportunityBadge />
            </div>
          )}

          {/* Save — bottom-right, revealed on hover */}
          {onSave && (
            <div className="absolute bottom-3 right-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <SaveButton isSaved={isSaved ?? false} onSave={() => onSave(data.id)} />
            </div>
          )}

          {/* Landscape gradient overlay — heavier at bottom for readability */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col p-5">
          {/* ── Corner glow ── */}
          <div className="pointer-events-none absolute left-0 top-0 h-20 w-20 rounded-full bg-emerald-500 blur-[30px] opacity-20" />

          {/* Location */}
          <div className="mb-1.5 flex items-center gap-1 text-[11px] text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0" />
            {data.city}, {data.state}
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 font-display text-[17px] font-[520] leading-snug tracking-[-0.015em] text-[#F5F5F7]" style={{ fontStretch: '104%' }}>
            {data.title}
          </h3>

          {/* Acreage hero */}
          <div className="mt-3">
            <AcreageHero acres={data.acres} pricePerAcreLabel={ppaLabel} />
          </div>

          {/* Feature chips */}
          {data.features && data.features.length > 0 && (
            <div className="mt-3">
              <FeatureChips features={data.features} max={4} />
            </div>
          )}

          {/* AI valuation */}
          {data.aiValuation && (
            <div className="mt-3">
              <ValuationBadge
                estimatedValue={data.aiValuation.estimatedValue}
                confidence={data.aiValuation.confidence}
                listPrice={data.price}
                assetType="land"
              />
            </div>
          )}

          <div className="flex-1" />

          {/* Divider */}
          <div className="my-3 border-t border-white/[0.06]" />

          {/* Price row */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">List Price</p>
              <p className="figure text-[20px] leading-none">
                {formatPrice(data.price)}
              </p>
            </div>
            {data.isTokenized && data.tokenInfo && (
              <div className="text-right">
                <p className="text-[10px] text-zinc-500">from</p>
                <p className="text-sm font-medium text-amber-400">
                  ${data.tokenInfo.pricePerFraction.toLocaleString()}
                  <span className="text-[10px] font-normal text-zinc-500">/fraction</span>
                </p>
              </div>
            )}
          </div>

          {/* Token progress */}
          {data.isTokenized && data.tokenInfo && (
            <div className="mt-3">
              <TokenProgress info={data.tokenInfo} />
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Row variant — horizontal, for list layouts
// ---------------------------------------------------------------------------

function RowVariant({
  data,
  isSaved,
  onSave,
  href,
  index,
  priority,
}: Omit<LandCardProps, 'variant' | 'className'>) {
  const resolvedHref = href ?? `/marketplace/${data.id}`
  const ppaLabel = computePricePerAcre(data)

  return (
    <Link href={resolvedHref} className="group block" tabIndex={0}>
      <article
        className="relative flex gap-4 overflow-hidden rounded-2xl border border-white/[0.04] bg-[#050505] p-4 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.8)] hover:border-white/[0.15] hover:bg-[#0A0A0F] hover:shadow-[0_12px_48px_rgba(0,0,0,1),0_0_40px_rgba(74,222,128,0.08)]"
        style={{ animationDelay: `${Math.min(index ?? 0, 11) * 40}ms` }}
      >
        {/* ── Paragon top-edge lighting ── */}
        <div className="absolute inset-x-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-opacity duration-300 group-hover:via-white/[0.2]" />

        {/* Thumbnail — landscape crop */}
        <div className="relative w-36 shrink-0 overflow-hidden rounded-lg sm:w-52">
          <PlaceholderImage
            src={data.imageUrl}
            slot={data.imageSlot}
            propertyType="land"
            alt={data.title}
            className="aspect-[3/2] w-full transition-transform duration-500 group-hover:scale-110"
            priority={priority}
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            <LandUseBadge use={data.landUse} small />
            {data.isDevelopmentOpportunity && (
              <DevOpportunityBadge small />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              {data.isTokenized && (
                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-medium text-cyan-400 backdrop-blur-sm border border-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  <Zap className="h-2 w-2" />
                  Tokenized
                </span>
              )}
              {data.listingType && data.listingType !== 'BUY' && (
                <span className="inline-flex items-center rounded-md bg-[#8B5CF6]/15 px-1.5 py-0.5 text-[9px] font-medium text-[#A78BFA] ring-1 ring-inset ring-[#8B5CF6]/25">
                  {data.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
                </span>
              )}
              {data.isNew && (
                <span className="inline-flex items-center rounded-md bg-[#22C55E]/15 px-1.5 py-0.5 text-[9px] font-medium text-[#4ADE80] ring-1 ring-inset ring-[#22C55E]/25">
                  New
                </span>
              )}
            </div>

            <h3 className="truncate font-heading text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
              {data.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {data.city}, {data.state}
            </p>
          </div>

          <div className="mt-2 space-y-2">
            {/* Acreage inline */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
                {formatAcres(data.acres)}
              </span>
              {ppaLabel && (
                <span className="text-[11px] text-zinc-500">{ppaLabel}</span>
              )}
            </div>
            {data.features && data.features.length > 0 && (
              <FeatureChips features={data.features} max={3} />
            )}
            {data.aiValuation && (
              <ValuationBadge
                estimatedValue={data.aiValuation.estimatedValue}
                confidence={data.aiValuation.confidence}
                listPrice={data.price}
                variant="inline"
                assetType="land"
              />
            )}
          </div>
        </div>

        {/* Price + save column */}
        <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">List Price</p>
              <p className="figure text-[20px] leading-none">
                {formatPrice(data.price)}
              </p>
              {data.isTokenized && data.tokenInfo && (
                <p className="text-xs text-amber-400">
                  ${data.tokenInfo.pricePerFraction.toLocaleString()}
                  <span className="text-[10px] text-zinc-500">/fraction</span>
                </p>
              )}
            </div>
            {onSave && (
              <SaveButton
                isSaved={isSaved ?? false}
                onSave={() => onSave(data.id)}
                className="mt-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              />
            )}
          </div>

          {data.isTokenized && data.tokenInfo && (
            <div className="w-24 text-right">
              <p className="mb-1 text-[10px] text-zinc-500">
                {tokenSoldPercent(data.tokenInfo)}% subscribed
              </p>
              <div className="h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                  style={{ width: `${tokenSoldPercent(data.tokenInfo)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// LandCard — canonical export
// ---------------------------------------------------------------------------

export function LandCard({ variant = 'card', className, ...props }: LandCardProps) {
  return (
    <div className={className}>
      {variant === 'card' ? <CardVariant {...props} /> : <RowVariant {...props} />}
    </div>
  )
}
