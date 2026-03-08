'use client'

import Link from 'next/link'
import { MapPin, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import {
  type MockListing,
  type PropertyType,
  formatPrice,
  tokenSoldPercent,
} from '@/lib/marketplace/mock-data'

// ---------------------------------------------------------------------------
// Type badge — color-coded by property type (color = information, not decor)
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  PropertyType,
  { label: string; className: string }
> = {
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

function TypeBadge({ type }: { type: PropertyType }) {
  const config = TYPE_CONFIG[type]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm ring-1 ring-inset',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

function StatRow({ listing }: { listing: MockListing }) {
  const items: string[] = []

  if (listing.propertyType === 'LAND') {
    if (listing.lotAcres) items.push(`${listing.lotAcres.toLocaleString()} acres`)
  } else {
    if (listing.sqft) items.push(`${listing.sqft.toLocaleString()} sqft`)
    if (listing.bedrooms) items.push(`${listing.bedrooms} bd`)
    if (listing.bathrooms) items.push(`${listing.bathrooms} ba`)
  }

  if (listing.yearBuilt && listing.propertyType === 'RESIDENTIAL') {
    items.push(`Est. ${listing.yearBuilt}`)
  }

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
// PropertyCard — vertical card for grid view
// ---------------------------------------------------------------------------

interface PropertyCardProps {
  listing: MockListing
  index?: number
}

export function PropertyCard({ listing, index = 0 }: PropertyCardProps) {
  const soldPct = tokenSoldPercent(listing)

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="group block h-full"
      tabIndex={0}
    >
      <article
        className="flex h-full flex-col overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A84C]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        style={{ animationDelay: `${Math.min(index, 11) * 50}ms` }}
      >
        {/* ── Image ── */}
        <div className="relative overflow-hidden">
          <PlaceholderImage
            slot={listing.imageSlot}
            propertyType={listing.imagePropertyType}
            alt={listing.title}
            className="aspect-[16/9] w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />

          {/* Top-left: type badge */}
          <div className="absolute left-3 top-3">
            <TypeBadge type={listing.propertyType} />
          </div>

          {/* Top-right: tokenized + lease badges */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {listing.isTokenized && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A84C]/20 px-2 py-0.5 text-[10px] font-medium text-[#C9A84C] backdrop-blur-sm ring-1 ring-inset ring-[#C9A84C]/30">
                <Zap className="h-2.5 w-2.5" />
                Tokenized
              </span>
            )}
            {(listing.listingType === 'LEASE' || listing.listingType === 'BOTH') && (
              <span className="inline-flex items-center rounded-md bg-[#3B82F6]/20 px-2 py-0.5 text-[10px] font-medium text-[#60A5FA] backdrop-blur-sm ring-1 ring-inset ring-[#3B82F6]/30">
                {listing.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
              </span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col p-4">
          {/* Location */}
          <div className="mb-1.5 flex items-center gap-1 text-[11px] text-[#6B6B80]">
            <MapPin className="h-3 w-3 shrink-0" />
            {listing.city}, {listing.state}
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 font-heading text-sm font-medium leading-snug text-[#F5F5F7]">
            {listing.title}
          </h3>

          {/* Stats */}
          <div className="mt-2">
            <StatRow listing={listing} />
          </div>

          {/* Spacer pushes price to bottom */}
          <div className="flex-1" />

          {/* Divider */}
          <div className="my-3 border-t border-[#1E1E2A]" />

          {/* Price + fraction price */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#4A4A60]">List Price</p>
              <p className="font-heading text-base font-semibold text-white">
                {formatPrice(listing.price)}
              </p>
            </div>
            {listing.isTokenized && listing.tokenPricePerFraction && (
              <div className="text-right">
                <p className="text-[10px] text-[#4A4A60]">from</p>
                <p className="text-sm font-medium text-[#C9A84C]">
                  ${listing.tokenPricePerFraction.toLocaleString()}
                  <span className="text-[10px] font-normal text-[#6B6B80]">/fraction</span>
                </p>
              </div>
            )}
          </div>

          {/* Token progress bar */}
          {listing.isTokenized && listing.tokenTotalSupply && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] text-[#6B6B80]">
                <span>{soldPct}% subscribed</span>
                <span>{listing.tokenInvestorCount} investors</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[#2A2A3A]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#B8932F] to-[#C9A84C]"
                  style={{ width: `${soldPct}%` }}
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
// PropertyRow — horizontal card for list view
// ---------------------------------------------------------------------------

export function PropertyRow({ listing, index = 0 }: PropertyCardProps) {
  const soldPct = tokenSoldPercent(listing)

  return (
    <Link href={`/marketplace/${listing.id}`} className="group block" tabIndex={0}>
      <article
        className="flex gap-4 overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118] p-3 transition-all duration-200 hover:border-[#C9A84C]/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
        style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
      >
        {/* Thumbnail */}
        <div className="relative w-32 shrink-0 overflow-hidden rounded-lg sm:w-44">
          <PlaceholderImage
            slot={listing.imageSlot}
            propertyType={listing.imagePropertyType}
            alt={listing.title}
            className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {listing.isTokenized && (
            <div className="absolute left-2 top-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A84C]/20 px-1.5 py-0.5 text-[9px] font-medium text-[#C9A84C] backdrop-blur-sm ring-1 ring-inset ring-[#C9A84C]/30">
                <Zap className="h-2 w-2" />
                Tokenized
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <TypeBadge type={listing.propertyType} />
              {(listing.listingType === 'LEASE' || listing.listingType === 'BOTH') && (
                <span className="inline-flex items-center rounded-md bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-medium text-[#60A5FA] ring-1 ring-inset ring-[#3B82F6]/25">
                  {listing.listingType === 'BOTH' ? 'Buy or Lease' : 'For Lease'}
                </span>
              )}
            </div>
            <h3 className="truncate font-heading text-sm font-medium text-[#F5F5F7]">
              {listing.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B6B80]">
              <MapPin className="h-3 w-3 shrink-0" />
              {listing.city}, {listing.state}
            </p>
          </div>

          <div className="mt-2">
            <StatRow listing={listing} />
          </div>
        </div>

        {/* Price column */}
        <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-[#4A4A60]">List Price</p>
            <p className="font-heading text-base font-semibold text-white">
              {formatPrice(listing.price)}
            </p>
            {listing.isTokenized && listing.tokenPricePerFraction && (
              <p className="text-xs text-[#C9A84C]">
                ${listing.tokenPricePerFraction.toLocaleString()}
                <span className="text-[10px] text-[#6B6B80]">/fraction</span>
              </p>
            )}
          </div>
          {listing.isTokenized && listing.tokenTotalSupply && (
            <div className="w-24 text-right">
              <p className="mb-1 text-[10px] text-[#6B6B80]">{soldPct}% subscribed</p>
              <div className="h-0.5 overflow-hidden rounded-full bg-[#2A2A3A]">
                <div
                  className="h-full rounded-full bg-[#C9A84C]"
                  style={{ width: `${soldPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
