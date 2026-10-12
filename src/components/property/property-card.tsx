'use client'

import Link from 'next/link'
import { Heart, MapPin, Zap, GitCompare, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { ValuationBadge } from '@/components/valuation/valuation-badge'
import { type AiConfidence } from '@/lib/valuation/valuation-types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PropertyType = 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' | 'INDUSTRIAL' | 'MIXED_USE'
export type ListingType = 'BUY' | 'LEASE' | 'BOTH'
export interface PropertyTokenInfo {
  pricePerFraction: number
  totalSupply: number
  availableSupply: number
  investorCount?: number
}

export interface PropertyAiValuation {
  estimatedValue: number
  confidence: AiConfidence
}

export interface PropertyCardData {
  id: string
  title: string
  city: string
  state: string
  price: number
  propertyType: PropertyType
  listingType?: ListingType
  sqft?: number
  bedrooms?: number
  bathrooms?: number
  lotAcres?: number
  yearBuilt?: number
  imageUrl?: string | null
  imageSlot?: string
  imagePropertyType?: 'residential' | 'commercial' | 'land' | 'industrial' | 'mixed'
  isTokenized?: boolean
  tokenInfo?: PropertyTokenInfo
  aiValuation?: PropertyAiValuation
  isNew?: boolean
}

export interface PropertyCardProps {
  data: PropertyCardData
  variant?: 'card' | 'row'
  isSaved?: boolean
  onSave?: (id: string) => void
  isComparing?: boolean
  onCompare?: (id: string, title: string) => void
  href?: string
  className?: string
  index?: number
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

function tokenSoldPercent(info: PropertyTokenInfo): number {
  if (!info.totalSupply) return 0
  const sold = info.totalSupply - info.availableSupply
  return Math.round((sold / info.totalSupply) * 100)
}

// ---------------------------------------------------------------------------
// Paragon accent glow — maps property type to corner glow color
// ---------------------------------------------------------------------------

const CORNER_GLOW: Record<PropertyType, string> = {
  RESIDENTIAL:  'bg-indigo-500',
  COMMERCIAL:   'bg-violet-500',
  LAND:         'bg-emerald-500',
  INDUSTRIAL:   'bg-amber-500',
  MIXED_USE:    'bg-violet-500',
}

// ---------------------------------------------------------------------------
// Type badge — v4 Elite: #050505 background, sharp ring, neon text
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<PropertyType, { label: string; className: string }> = {
  RESIDENTIAL: {
    label: 'Residential',
    className: 'bg-[#050505]/90 text-zinc-400 ring-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  },
  COMMERCIAL: {
    label: 'Commercial',
    className: 'bg-[#050505]/90 text-indigo-400 ring-indigo-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  },
  LAND: {
    label: 'Land',
    className: 'bg-[#050505]/90 text-emerald-400 ring-emerald-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  },
  INDUSTRIAL: {
    label: 'Industrial',
    className: 'bg-[#050505]/90 text-amber-400 ring-amber-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  },
  MIXED_USE: {
    label: 'Mixed Use',
    className: 'bg-[#050505]/90 text-violet-400 ring-violet-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  },
}

function TypeBadge({ type, small }: { type: PropertyType; small?: boolean }) {
  const config = TYPE_CONFIG[type]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium backdrop-blur-sm ring-1 ring-inset',
        small ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Property stats row (sqft / beds / baths / acres / year)
// ---------------------------------------------------------------------------

function StatRow({ data }: { data: PropertyCardData }) {
  const items: string[] = []

  if (data.propertyType === 'LAND') {
    if (data.lotAcres) items.push(`${data.lotAcres.toLocaleString()} acres`)
  } else {
    if (data.sqft)      items.push(`${data.sqft.toLocaleString()} sqft`)
    if (data.bedrooms)  items.push(`${data.bedrooms} bd`)
    if (data.bathrooms) items.push(`${data.bathrooms} ba`)
  }

  if (data.yearBuilt && data.propertyType === 'RESIDENTIAL') {
    items.push(`Est. ${data.yearBuilt}`)
  }

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 text-[11px] text-zinc-500">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2.5">
          {i > 0 && <span className="h-[3px] w-[3px] rounded-full bg-white/[0.06]" />}
          {item}
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Save / Favourite button — v4: #050505 bg, sharp border
// ---------------------------------------------------------------------------

interface SaveButtonProps {
  isSaved: boolean
  onSave: () => void
  className?: string
}

function SaveButton({ isSaved, onSave, className }: SaveButtonProps) {
  return (
    <button
      type="button"
      aria-label={isSaved ? 'Remove from saved' : 'Save property'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSave()
      }}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
        'bg-[#050505]/90 backdrop-blur-sm ring-1 ring-white/[0.06]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        'hover:bg-white/[0.06] hover:ring-white/[0.15]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-3.5 w-3.5 transition-colors duration-200',
          isSaved ? 'fill-rose-400 text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.5)]' : 'text-zinc-500 group-hover:text-zinc-400',
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Compare button — v4: #050505 bg, sharp border
// ---------------------------------------------------------------------------

interface CompareButtonProps {
  isComparing: boolean
  onCompare:   () => void
  className?:  string
}

function CompareButton({ isComparing, onCompare, className }: CompareButtonProps) {
  return (
    <button
      type="button"
      aria-label={isComparing ? 'Remove from comparison' : 'Add to comparison'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onCompare()
      }}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
        isComparing
          ? 'bg-indigo-400/15 ring-1 ring-indigo-400/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
          : 'bg-[#050505]/90 backdrop-blur-sm ring-1 ring-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        'hover:bg-white/[0.06] hover:ring-white/[0.15]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
        className,
      )}
    >
      {isComparing
        ? <Check className="h-3.5 w-3.5 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
        : <GitCompare className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400" />
      }
    </button>
  )
}

// ---------------------------------------------------------------------------
// Token progress bar — v4: deeper contrast, neon gradient
// ---------------------------------------------------------------------------

function TokenProgress({ info }: { info: PropertyTokenInfo }) {
  const soldPct = tokenSoldPercent(info)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[10px] text-zinc-500">
        <span>{soldPct}% subscribed</span>
        {info.investorCount !== undefined && <span>{info.investorCount} investors</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
          style={{ width: `${soldPct}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card variant — v4 Elite Paragon Border Spec
//
// Pure black #050505 background, 1px sharp borders (border-white/[0.04]),
// top-edge gradient lighting, corner glow matched to asset type,
// hover: border-white/20, translate-y lift, deep shadow + accent glow.
// ---------------------------------------------------------------------------

function CardVariant({
  data,
  isSaved,
  onSave,
  isComparing,
  onCompare,
  href,
  index,
  priority,
}: Omit<PropertyCardProps, 'variant' | 'className'>) {
  const resolvedHref = href ?? `/marketplace/${data.id}`

  return (
    <Link href={resolvedHref} className="group block h-full" tabIndex={0}>
      <article
        className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.04] bg-[#050505] transition-all duration-400 shadow-[0_4px_32px_rgba(0,0,0,0.9)] hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_16px_64px_rgba(0,0,0,1),0_0_48px_rgba(99,102,241,0.06)]"
        style={{ animationDelay: `${Math.min(index ?? 0, 11) * 50}ms` }}
      >
        {/* ── Paragon top-edge lighting — 1px gradient ── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500 group-hover:via-white/30" />

        {/* ── Corner accent glow — matched to property type ── */}
        <div
          className={cn(
            'pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full blur-[40px] opacity-0 transition-opacity duration-500 group-hover:opacity-30',
            CORNER_GLOW[data.propertyType],
          )}
          aria-hidden="true"
        />

        {/* ── Image ── */}
        <div className="relative overflow-hidden">
          <PlaceholderImage
            src={data.imageUrl}
            slot={data.imageSlot}
            propertyType={data.imagePropertyType}
            alt={data.title}
            className="aspect-[16/9] w-full transition-transform duration-700 group-hover:scale-110"
            priority={priority}
          />

          {/* Hard gradient wipe to black */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent" />

          {/* Type badge — top-left */}
          <div className="absolute left-3.5 top-3.5">
            <TypeBadge type={data.propertyType} />
          </div>

          {/* Top-right badges */}
          <div className="absolute right-3.5 top-3.5 flex flex-col items-end gap-1.5">
            {data.isNew && (
              <span className="inline-flex items-center rounded-md bg-[#050505]/90 px-2 py-0.5 text-[10px] font-medium text-emerald-400 backdrop-blur-sm ring-1 ring-inset ring-emerald-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_10px_rgba(52,211,153,0.2)]">
                New
              </span>
            )}
            {data.isTokenized && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#050505]/90 px-2 py-0.5 text-[10px] font-medium text-cyan-400 backdrop-blur-sm border border-cyan-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_14px_rgba(34,211,238,0.3)]">
                <Zap className="h-2.5 w-2.5" />
                Tokenized
              </span>
            )}
            {(data.listingType === 'LEASE' || data.listingType === 'BOTH') && (
              <span className="inline-flex items-center rounded-md bg-[#050505]/90 px-2 py-0.5 text-[10px] font-medium text-indigo-400 backdrop-blur-sm ring-1 ring-inset ring-indigo-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                {data.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
              </span>
            )}
          </div>

          {/* Compare button — bottom-left, hidden until hover */}
          {onCompare && (
            <div className="absolute bottom-3.5 left-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <CompareButton
                isComparing={isComparing ?? false}
                onCompare={() => onCompare(data.id, data.title)}
              />
            </div>
          )}

          {/* Save button — bottom-right, hidden until hover */}
          {onSave && (
            <div className="absolute bottom-3.5 right-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <SaveButton isSaved={isSaved ?? false} onSave={() => onSave(data.id)} />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="relative flex flex-1 flex-col p-5">
          {/* Location */}
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0" />
            {data.city}, {data.state}
          </div>

          {/* Title — metallic gradient */}
          <h3 className="line-clamp-1 font-heading text-sm font-extrabold tracking-[-0.02em] leading-snug bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
            {data.title}
          </h3>

          {/* Stats */}
          <div className="mt-2">
            <StatRow data={data} />
          </div>

          {/* AI Valuation */}
          {data.aiValuation && (
            <div className="mt-3">
              <ValuationBadge
                estimatedValue={data.aiValuation.estimatedValue}
                confidence={data.aiValuation.confidence}
                listPrice={data.price}
                assetType="property"
              />
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Divider — sharp 1px */}
          <div className="my-3.5 border-t border-white/[0.04]" />

          {/* Price row */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-medium tracking-wide uppercase text-zinc-500">List Price</p>
              <p className="font-heading text-base font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">
                {formatPrice(data.price)}
              </p>
            </div>
            {data.isTokenized && data.tokenInfo && (
              <div className="text-right">
                <p className="text-[10px] text-zinc-500">from</p>
                <p className="text-sm font-semibold text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]">
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
// Row variant — v4 Elite Paragon Border Spec (horizontal)
// ---------------------------------------------------------------------------

function RowVariant({
  data,
  isSaved,
  onSave,
  isComparing,
  onCompare,
  href,
  index,
  priority,
}: Omit<PropertyCardProps, 'variant' | 'className'>) {
  const resolvedHref = href ?? `/marketplace/${data.id}`

  return (
    <Link href={resolvedHref} className="group block" tabIndex={0}>
      <article
        className="relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.04] bg-[#050505] transition-all duration-400 shadow-[0_4px_24px_rgba(0,0,0,0.8)] hover:border-white/20 hover:shadow-[0_12px_48px_rgba(0,0,0,1),0_0_40px_rgba(99,102,241,0.06)]"
        style={{ animationDelay: `${Math.min(index ?? 0, 11) * 40}ms` }}
      >
        {/* ── Paragon top-edge lighting ── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500 group-hover:via-white/30" />

        {/* Row content wrapper */}
        <div className="flex gap-5 p-4">
        {/* Thumbnail */}
        <div className="relative w-36 shrink-0 overflow-hidden rounded-xl sm:w-48">
          <PlaceholderImage
            src={data.imageUrl}
            slot={data.imageSlot}
            propertyType={data.imagePropertyType}
            alt={data.title}
            className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-110"
            priority={priority}
          />
          {data.isTokenized && (
            <div className="absolute left-2.5 top-2.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#050505]/90 px-1.5 py-0.5 text-[9px] font-medium text-cyan-400 backdrop-blur-sm border border-cyan-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_12px_rgba(34,211,238,0.3)]">
                <Zap className="h-2 w-2" />
                Tokenized
              </span>
            </div>
          )}
          {data.isNew && (
            <div className="absolute left-2.5 bottom-2.5">
              <span className="inline-flex items-center rounded-md bg-[#050505]/90 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400 backdrop-blur-sm ring-1 ring-inset ring-emerald-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                New
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <TypeBadge type={data.propertyType} small />
              {(data.listingType === 'LEASE' || data.listingType === 'BOTH') && (
                <span className="inline-flex items-center rounded-md bg-[#050505]/90 px-2 py-0.5 text-[10px] font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  {data.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
                </span>
              )}
            </div>
            <h3 className="truncate font-heading text-sm font-extrabold tracking-[-0.02em] bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
              {data.title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {data.city}, {data.state}
            </p>
          </div>

          <div className="mt-2.5 space-y-2">
            <StatRow data={data} />
            {data.aiValuation && (
              <ValuationBadge
                estimatedValue={data.aiValuation.estimatedValue}
                confidence={data.aiValuation.confidence}
                listPrice={data.price}
                variant="inline"
                assetType="property"
              />
            )}
          </div>
        </div>

        {/* Price + save column */}
        <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
          <div className="flex items-start gap-2.5">
            <div className="text-right">
              <p className="text-[10px] font-medium tracking-wide uppercase text-zinc-500">List Price</p>
              <p className="font-heading text-base font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">
                {formatPrice(data.price)}
              </p>
              {data.isTokenized && data.tokenInfo && (
                <p className="text-xs text-indigo-400 drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]">
                  ${data.tokenInfo.pricePerFraction.toLocaleString()}
                  <span className="text-[10px] text-zinc-500">/fraction</span>
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 mt-0.5">
              {onSave && (
                <SaveButton
                  isSaved={isSaved ?? false}
                  onSave={() => onSave(data.id)}
                  className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              )}
              {onCompare && (
                <CompareButton
                  isComparing={isComparing ?? false}
                  onCompare={() => onCompare(data.id, data.title)}
                  className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              )}
            </div>
          </div>

          {data.isTokenized && data.tokenInfo && (
            <div className="w-28 text-right">
              <p className="mb-1 text-[10px] text-zinc-500">
                {tokenSoldPercent(data.tokenInfo)}% subscribed
              </p>
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                  style={{ width: `${tokenSoldPercent(data.tokenInfo)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        </div>
      </article>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// PropertyCard — canonical export
// ---------------------------------------------------------------------------

export function PropertyCard({
  variant = 'card',
  className,
  ...props
}: PropertyCardProps) {
  return (
    <div className={className}>
      {variant === 'card' ? (
        <CardVariant {...props} />
      ) : (
        <RowVariant {...props} />
      )}
    </div>
  )
}
