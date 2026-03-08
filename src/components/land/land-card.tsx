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
    className: 'bg-[#166534]/20 text-[#4ADE80] ring-[#22C55E]/25',
    dotClass: 'bg-[#4ADE80]',
  },
  RESIDENTIAL_DEV: {
    label: 'Residential Dev.',
    className: 'bg-[#1D4ED8]/15 text-[#93C5FD] ring-[#3B82F6]/25',
    dotClass: 'bg-[#93C5FD]',
  },
  COMMERCIAL_DEV: {
    label: 'Commercial Dev.',
    className: 'bg-[#C9A84C]/15 text-[#C9A84C] ring-[#C9A84C]/25',
    dotClass: 'bg-[#C9A84C]',
  },
  INDUSTRIAL: {
    label: 'Industrial',
    className: 'bg-[#92400E]/20 text-[#FCD34D] ring-[#F59E0B]/25',
    dotClass: 'bg-[#FCD34D]',
  },
  MIXED_USE: {
    label: 'Mixed Use',
    className: 'bg-[#4C1D95]/20 text-[#C4B5FD] ring-[#7C3AED]/25',
    dotClass: 'bg-[#C4B5FD]',
  },
  RECREATIONAL: {
    label: 'Recreational',
    className: 'bg-[#065F46]/20 text-[#6EE7B7] ring-[#10B981]/25',
    dotClass: 'bg-[#6EE7B7]',
  },
  WATERFRONT: {
    label: 'Waterfront',
    className: 'bg-[#0C4A6E]/20 text-[#7DD3FC] ring-[#0EA5E9]/25',
    dotClass: 'bg-[#7DD3FC]',
  },
  RURAL: {
    label: 'Rural',
    className: 'bg-[#1E293B]/80 text-[#94A3B8] ring-[#334155]/60',
    dotClass: 'bg-[#94A3B8]',
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
        'bg-[#166534]/25 text-[#4ADE80] ring-[#22C55E]/30',
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
          className="inline-flex items-center rounded bg-[#1A1A24] px-1.5 py-0.5 text-[10px] text-[#8080A0] ring-1 ring-inset ring-[#2A2A3A]"
        >
          {f}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[10px] text-[#4A4A60]">+{overflow}</span>
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
        'bg-[#0A0A0F]/70 backdrop-blur-sm ring-1 ring-[#2A2A3A]',
        'hover:bg-[#1A1A24] hover:ring-[#4ADE80]/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ADE80]',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-3.5 w-3.5 transition-colors duration-150',
          isSaved ? 'fill-rose-400 text-rose-400' : 'text-[#6B6B80]',
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
      <div className="mb-1 flex items-center justify-between text-[10px] text-[#6B6B80]">
        <span>{soldPct}% subscribed</span>
        {info.investorCount !== undefined && (
          <span>{info.investorCount} investors</span>
        )}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#2A2A3A]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#166534] to-[#4ADE80] transition-all duration-700"
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
      <span className="font-heading text-2xl font-bold tabular-nums text-[#F5F5F7]">
        {formatAcres(acres)}
      </span>
      {pricePerAcreLabel && (
        <span className="text-[11px] text-[#4A4A60]">{pricePerAcreLabel}</span>
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
    <span className="inline-flex items-center rounded-md bg-[#3B82F6]/20 px-2 py-0.5 text-[10px] font-medium text-[#60A5FA] backdrop-blur-sm ring-1 ring-inset ring-[#3B82F6]/30">
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
        className="flex h-full flex-col overflow-hidden rounded-xl border border-[#1E2D1E] bg-[#0D110D] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4ADE80]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{ animationDelay: `${Math.min(index ?? 0, 11) * 50}ms` }}
      >
        {/* ── Panoramic image ── */}
        <div className="relative overflow-hidden">
          <PlaceholderImage
            slot={data.imageSlot}
            propertyType="land"
            alt={data.title}
            className="aspect-[21/9] w-full transition-transform duration-500 group-hover:scale-[1.03]"
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
              <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A84C]/20 px-2 py-0.5 text-[10px] font-medium text-[#C9A84C] backdrop-blur-sm ring-1 ring-inset ring-[#C9A84C]/30">
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D110D]/50 via-transparent to-transparent" />
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col p-4">
          {/* Location */}
          <div className="mb-1.5 flex items-center gap-1 text-[11px] text-[#5A7060]">
            <MapPin className="h-3 w-3 shrink-0" />
            {data.city}, {data.state}
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 font-heading text-sm font-medium leading-snug text-[#E8F0E8]">
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
          <div className="my-3 border-t border-[#1A2B1A]" />

          {/* Price row */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#3A4F3A]">List Price</p>
              <p className="font-heading text-base font-semibold text-[#E8F0E8]">
                {formatPrice(data.price)}
              </p>
            </div>
            {data.isTokenized && data.tokenInfo && (
              <div className="text-right">
                <p className="text-[10px] text-[#3A4F3A]">from</p>
                <p className="text-sm font-medium text-[#C9A84C]">
                  ${data.tokenInfo.pricePerFraction.toLocaleString()}
                  <span className="text-[10px] font-normal text-[#5A7060]">/fraction</span>
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
        className="flex gap-4 overflow-hidden rounded-xl border border-[#1E2D1E] bg-[#0D110D] p-3 transition-all duration-200 hover:border-[#4ADE80]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
        style={{ animationDelay: `${Math.min(index ?? 0, 11) * 40}ms` }}
      >
        {/* Thumbnail — landscape crop */}
        <div className="relative w-36 shrink-0 overflow-hidden rounded-lg sm:w-52">
          <PlaceholderImage
            slot={data.imageSlot}
            propertyType="land"
            alt={data.title}
            className="aspect-[3/2] w-full transition-transform duration-500 group-hover:scale-[1.04]"
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
                <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A84C]/15 px-1.5 py-0.5 text-[9px] font-medium text-[#C9A84C] ring-1 ring-inset ring-[#C9A84C]/25">
                  <Zap className="h-2 w-2" />
                  Tokenized
                </span>
              )}
              {data.listingType && data.listingType !== 'BUY' && (
                <span className="inline-flex items-center rounded-md bg-[#3B82F6]/15 px-1.5 py-0.5 text-[9px] font-medium text-[#60A5FA] ring-1 ring-inset ring-[#3B82F6]/25">
                  {data.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
                </span>
              )}
              {data.isNew && (
                <span className="inline-flex items-center rounded-md bg-[#22C55E]/15 px-1.5 py-0.5 text-[9px] font-medium text-[#4ADE80] ring-1 ring-inset ring-[#22C55E]/25">
                  New
                </span>
              )}
            </div>

            <h3 className="truncate font-heading text-sm font-medium text-[#E8F0E8]">
              {data.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[#5A7060]">
              <MapPin className="h-3 w-3 shrink-0" />
              {data.city}, {data.state}
            </p>
          </div>

          <div className="mt-2 space-y-2">
            {/* Acreage inline */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-base font-semibold text-[#E8F0E8]">
                {formatAcres(data.acres)}
              </span>
              {ppaLabel && (
                <span className="text-[11px] text-[#4A4A60]">{ppaLabel}</span>
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
              <p className="text-[10px] uppercase tracking-wider text-[#3A4F3A]">List Price</p>
              <p className="font-heading text-base font-semibold text-[#E8F0E8]">
                {formatPrice(data.price)}
              </p>
              {data.isTokenized && data.tokenInfo && (
                <p className="text-xs text-[#C9A84C]">
                  ${data.tokenInfo.pricePerFraction.toLocaleString()}
                  <span className="text-[10px] text-[#5A7060]">/fraction</span>
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
              <p className="mb-1 text-[10px] text-[#5A7060]">
                {tokenSoldPercent(data.tokenInfo)}% subscribed
              </p>
              <div className="h-0.5 overflow-hidden rounded-full bg-[#1A2B1A]">
                <div
                  className="h-full rounded-full bg-[#4ADE80]"
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
