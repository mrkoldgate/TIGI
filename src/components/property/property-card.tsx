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
  /** 'card' = vertical grid card (default), 'row' = horizontal list row */
  variant?: 'card' | 'row'
  isSaved?: boolean
  onSave?: (id: string) => void
  /** Compare tray — show compare button when handler is provided */
  isComparing?: boolean
  onCompare?: (id: string, title: string) => void
  /** Override href; defaults to /marketplace/:id */
  href?: string
  className?: string
  /** Position in list — used for staggered animation delay */
  index?: number
  /** Pass true for above-the-fold cards to eagerly load images */
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
// Type badge — color-coded by property category
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<PropertyType, { label: string; className: string }> = {
  RESIDENTIAL: {
    label: 'Residential',
    className: 'bg-[#1A1A24]/90 text-[#A0A0B2] ring-[#2A2A3A]',
  },
  COMMERCIAL: {
    label: 'Commercial',
    className: 'bg-[#3B82F6]/15 text-[#60A5FA] ring-[#3B82F6]/25',
  },
  LAND: {
    label: 'Land',
    className: 'bg-[#22C55E]/15 text-[#4ADE80] ring-[#22C55E]/25',
  },
  INDUSTRIAL: {
    label: 'Industrial',
    className: 'bg-[#F59E0B]/15 text-[#FCD34D] ring-[#F59E0B]/25',
  },
  MIXED_USE: {
    label: 'Mixed Use',
    className: 'bg-[#C9A84C]/15 text-[#C9A84C] ring-[#C9A84C]/25',
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
    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#6B6B80]">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2">
          {i > 0 && <span className="h-1 w-1 rounded-full bg-[#3A3A48]" />}
          {item}
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Save / Favourite button
// ---------------------------------------------------------------------------

interface SaveButtonProps {
  isSaved: boolean
  onSave: () => void
  className?: string
}

// ---------------------------------------------------------------------------
// Compare button
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
        'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150',
        isComparing
          ? 'bg-[#C9A84C]/20 ring-1 ring-[#C9A84C]/40'
          : 'bg-[#0A0A0F]/70 backdrop-blur-sm ring-1 ring-[#2A2A3A]',
        'hover:bg-[#1A1A24] hover:ring-[#C9A84C]/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]',
        className,
      )}
    >
      {isComparing
        ? <Check className="h-3.5 w-3.5 text-[#C9A84C]" />
        : <GitCompare className="h-3.5 w-3.5 text-[#6B6B80] group-hover:text-[#A0A0B2]" />
      }
    </button>
  )
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
        'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150',
        'bg-[#0A0A0F]/70 backdrop-blur-sm ring-1 ring-[#2A2A3A]',
        'hover:bg-[#1A1A24] hover:ring-[#C9A84C]/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-3.5 w-3.5 transition-colors duration-150',
          isSaved ? 'fill-rose-400 text-rose-400' : 'text-[#6B6B80] group-hover:text-[#A0A0B2]',
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Token progress bar
// ---------------------------------------------------------------------------

function TokenProgress({ info }: { info: PropertyTokenInfo }) {
  const soldPct = tokenSoldPercent(info)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] text-[#6B6B80]">
        <span>{soldPct}% subscribed</span>
        {info.investorCount !== undefined && <span>{info.investorCount} investors</span>}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#2A2A3A]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#B8932F] to-[#C9A84C] transition-all duration-700"
          style={{ width: `${soldPct}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card variant — vertical, for grid layouts
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
        className="flex h-full flex-col overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A84C]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        style={{ animationDelay: `${Math.min(index ?? 0, 11) * 50}ms` }}
      >
        {/* ── Image ── */}
        <div className="relative overflow-hidden">
          <PlaceholderImage
            src={data.imageUrl}
            slot={data.imageSlot}
            propertyType={data.imagePropertyType}
            alt={data.title}
            className="aspect-[16/9] w-full transition-transform duration-500 group-hover:scale-[1.02]"
            priority={priority}
          />

          {/* Type badge — top-left */}
          <div className="absolute left-3 top-3">
            <TypeBadge type={data.propertyType} />
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
            {(data.listingType === 'LEASE' || data.listingType === 'BOTH') && (
              <span className="inline-flex items-center rounded-md bg-[#3B82F6]/20 px-2 py-0.5 text-[10px] font-medium text-[#60A5FA] backdrop-blur-sm ring-1 ring-inset ring-[#3B82F6]/30">
                {data.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
              </span>
            )}
          </div>

          {/* Compare button — bottom-left, hidden until hover */}
          {onCompare && (
            <div className="absolute bottom-3 left-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <CompareButton
                isComparing={isComparing ?? false}
                onCompare={() => onCompare(data.id, data.title)}
              />
            </div>
          )}

          {/* Save button — bottom-right, hidden until hover */}
          {onSave && (
            <div className="absolute bottom-3 right-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <SaveButton isSaved={isSaved ?? false} onSave={() => onSave(data.id)} />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col p-4">
          {/* Location */}
          <div className="mb-1.5 flex items-center gap-1 text-[11px] text-[#6B6B80]">
            <MapPin className="h-3 w-3 shrink-0" />
            {data.city}, {data.state}
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 font-heading text-sm font-medium leading-snug text-[#F5F5F7]">
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

          {/* Divider */}
          <div className="my-3 border-t border-[#1E1E2A]" />

          {/* Price row */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#4A4A60]">List Price</p>
              <p className="font-heading text-base font-semibold text-white">
                {formatPrice(data.price)}
              </p>
            </div>
            {data.isTokenized && data.tokenInfo && (
              <div className="text-right">
                <p className="text-[10px] text-[#4A4A60]">from</p>
                <p className="text-sm font-medium text-[#C9A84C]">
                  ${data.tokenInfo.pricePerFraction.toLocaleString()}
                  <span className="text-[10px] font-normal text-[#6B6B80]">/fraction</span>
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
        className="flex gap-4 overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118] p-3 transition-all duration-200 hover:border-[#C9A84C]/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
        style={{ animationDelay: `${Math.min(index ?? 0, 11) * 40}ms` }}
      >
        {/* Thumbnail */}
        <div className="relative w-32 shrink-0 overflow-hidden rounded-lg sm:w-44">
          <PlaceholderImage
            src={data.imageUrl}
            slot={data.imageSlot}
            propertyType={data.imagePropertyType}
            alt={data.title}
            className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]"
            priority={priority}
          />
          {data.isTokenized && (
            <div className="absolute left-2 top-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A84C]/20 px-1.5 py-0.5 text-[9px] font-medium text-[#C9A84C] backdrop-blur-sm ring-1 ring-inset ring-[#C9A84C]/30">
                <Zap className="h-2 w-2" />
                Tokenized
              </span>
            </div>
          )}
          {data.isNew && (
            <div className="absolute left-2 bottom-2">
              <span className="inline-flex items-center rounded-md bg-[#22C55E]/20 px-1.5 py-0.5 text-[9px] font-medium text-[#4ADE80] backdrop-blur-sm ring-1 ring-inset ring-[#22C55E]/30">
                New
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <TypeBadge type={data.propertyType} small />
              {(data.listingType === 'LEASE' || data.listingType === 'BOTH') && (
                <span className="inline-flex items-center rounded-md bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-medium text-[#60A5FA] ring-1 ring-inset ring-[#3B82F6]/25">
                  {data.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
                </span>
              )}
            </div>
            <h3 className="truncate font-heading text-sm font-medium text-[#F5F5F7]">
              {data.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B6B80]">
              <MapPin className="h-3 w-3 shrink-0" />
              {data.city}, {data.state}
            </p>
          </div>

          <div className="mt-2 space-y-2">
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
          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-[#4A4A60]">List Price</p>
              <p className="font-heading text-base font-semibold text-white">
                {formatPrice(data.price)}
              </p>
              {data.isTokenized && data.tokenInfo && (
                <p className="text-xs text-[#C9A84C]">
                  ${data.tokenInfo.pricePerFraction.toLocaleString()}
                  <span className="text-[10px] text-[#6B6B80]">/fraction</span>
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-0.5">
              {onSave && (
                <SaveButton
                  isSaved={isSaved ?? false}
                  onSave={() => onSave(data.id)}
                  className="opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                />
              )}
              {onCompare && (
                <CompareButton
                  isComparing={isComparing ?? false}
                  onCompare={() => onCompare(data.id, data.title)}
                  className="opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                />
              )}
            </div>
          </div>

          {data.isTokenized && data.tokenInfo && (
            <div className="w-24 text-right">
              <p className="mb-1 text-[10px] text-[#6B6B80]">
                {tokenSoldPercent(data.tokenInfo)}% subscribed
              </p>
              <div className="h-0.5 overflow-hidden rounded-full bg-[#2A2A3A]">
                <div
                  className="h-full rounded-full bg-[#C9A84C]"
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
