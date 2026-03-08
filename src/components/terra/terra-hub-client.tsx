'use client'

// ---------------------------------------------------------------------------
// TerraHubClient — Main Terra module landing page.
//
// Displays all land parcels with lease + development opportunity data.
//
// Layout:
//   1. Hero strip — "Terra" branding + stats (parcels, lease opps, dev sites, acres)
//   2. Filter bar — type pills (ALL / LEASE / BUY / DEV), search, sort
//   3. Parcel grid — TerraParcelCard for each listing
//   4. Milestone footer note
//
// All filtering is client-side over the initialListings passed from the server.
// ---------------------------------------------------------------------------

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Map,
  Layers,
  SlidersHorizontal,
  ArrowUpRight,
  Ruler,
  Trees,
  Building2,
  Zap,
  Clock,
  Check,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import type { TerraListing, TerraListingTypeFilter, TerraSortOption } from '@/lib/terra/terra-types'
import { DEV_STAGE_CONFIG } from '@/lib/terra/terra-types'
import {
  formatLeaseRate,
  formatRatePerAcre,
  formatLeaseDuration,
} from '@/lib/terra/terra-mock-data'
import { formatPrice } from '@/lib/marketplace/mock-data'
import { inferLandUse } from '@/components/marketplace/land-card'

// ── Land use display config (compact, for card badges) ─────────────────────

const LAND_USE_BADGE: Record<string, { label: string; cls: string }> = {
  AGRICULTURAL:    { label: 'Agricultural',    cls: 'bg-[#166534]/20 text-[#4ADE80]' },
  RESIDENTIAL_DEV: { label: 'Residential Dev', cls: 'bg-[#1D4ED8]/15 text-[#93C5FD]' },
  COMMERCIAL_DEV:  { label: 'Commercial Dev',  cls: 'bg-[#C9A84C]/15 text-[#C9A84C]' },
  INDUSTRIAL:      { label: 'Industrial',       cls: 'bg-[#92400E]/20 text-[#FCD34D]' },
  MIXED_USE:       { label: 'Mixed Use',        cls: 'bg-[#4C1D95]/20 text-[#C4B5FD]' },
  RECREATIONAL:    { label: 'Recreational',     cls: 'bg-[#1E3A5F]/20 text-[#7DD3FC]' },
  WATERFRONT:      { label: 'Waterfront',       cls: 'bg-[#164E63]/20 text-[#67E8F9]' },
  RURAL:           { label: 'Rural',            cls: 'bg-[#374151]/20 text-[#D1D5DB]' },
}

// ── Terra stats strip ───────────────────────────────────────────────────────

function TerraStatsStrip({
  totalParcels,
  leaseCount,
  devCount,
  totalAcres,
}: {
  totalParcels: number
  leaseCount:   number
  devCount:     number
  totalAcres:   number
}) {
  const stats = [
    { value: String(totalParcels), label: 'Active parcels' },
    { value: String(leaseCount),   label: 'Lease opportunities' },
    { value: String(devCount),     label: 'Development sites' },
    { value: `${totalAcres.toLocaleString()}+`, label: 'Total acres' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ value, label }) => (
        <div
          key={label}
          className="rounded-xl border border-[#1E2D1E] bg-[#0D110D] px-4 py-3 text-center"
        >
          <p className="font-heading text-2xl font-bold text-[#4ADE80]">{value}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#4A6A4A]">{label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Terra parcel card ───────────────────────────────────────────────────────

function TerraParcelCard({ listing }: { listing: TerraListing }) {
  const landUse    = inferLandUse(listing.features)
  const useBadge   = LAND_USE_BADGE[landUse] ?? { label: landUse, cls: 'bg-[#1A2D1A] text-[#5A7060]' }
  const acres      = listing.lotAcres ?? 0
  const hasLease   = listing.listingType === 'LEASE' || listing.listingType === 'BOTH'
  const hasDev     = listing.devOpportunity !== null
  const stageCfg   = listing.devOpportunity ? DEV_STAGE_CONFIG[listing.devOpportunity.stage] : null

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-[#1E2D1E] bg-[#0D110D] transition-all hover:border-[#2A3A2A] hover:shadow-lg hover:shadow-[#0A0A0F]/50"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <PlaceholderImage
          slot={listing.imageSlot}
          propertyType={listing.imagePropertyType}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', useBadge.cls)}>
            {useBadge.label}
          </span>
          {hasLease && (
            <span className="rounded-full bg-[#0D110D]/80 px-2 py-0.5 text-[10px] font-medium text-[#4ADE80]">
              For Lease
            </span>
          )}
        </div>
        {hasDev && stageCfg && (
          <div className={cn(
            'absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
            stageCfg.color, stageCfg.border, stageCfg.bg,
          )}>
            {stageCfg.label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title + location */}
        <p className="truncate font-heading text-base font-semibold text-[#E8F0E8] group-hover:text-white">
          {listing.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#5A7060]">
          <Map className="h-3 w-3" />
          {listing.city}, {listing.state}
        </p>

        {/* Key metrics row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-[#5A7060]">
          {acres > 0 && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              {acres >= 100 ? `${acres.toLocaleString()} ac` : `${acres} ac`}
            </span>
          )}
          {listing.isTokenized && (
            <span className="flex items-center gap-1 text-[#C9A84C]">
              <Zap className="h-3 w-3" />
              Tokenized
            </span>
          )}
          {hasDev && (
            <span className="flex items-center gap-1 text-[#4ADE80]">
              <Building2 className="h-3 w-3" />
              Dev opp
            </span>
          )}
        </div>

        {/* Price row */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            {listing.listingType === 'LEASE' ? (
              <>
                {listing.leaseRateMonthly ? (
                  <p className="font-heading text-lg font-bold text-[#4ADE80]">
                    {formatLeaseRate(listing.leaseRateMonthly)}
                  </p>
                ) : (
                  <p className="text-sm text-[#5A7060]">Rate on request</p>
                )}
                {listing.leaseTerms?.ratePerAcre && (
                  <p className="text-[10px] text-[#4A6A4A]">
                    {formatRatePerAcre(listing.leaseTerms.ratePerAcre)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-heading text-lg font-bold text-[#E8F0E8]">
                  {formatPrice(listing.price)}
                </p>
                {listing.leaseRateMonthly && listing.listingType === 'BOTH' && (
                  <p className="text-[10px] text-[#4ADE80]">
                    Lease: {formatLeaseRate(listing.leaseRateMonthly)}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Lease duration chip */}
          {hasLease && listing.leaseTerms && (
            <span className="flex items-center gap-1 rounded-full border border-[#1E2D1E] px-2 py-0.5 text-[10px] text-[#5A7060]">
              <Clock className="h-2.5 w-2.5" />
              {formatLeaseDuration(listing.leaseTerms)}
            </span>
          )}
        </div>

        {/* Dev highlights — top 2 */}
        {hasDev && listing.devOpportunity!.highlights.length > 0 && (
          <div className="mt-3 space-y-1">
            {listing.devOpportunity!.highlights.slice(0, 2).map((h) => (
              <div key={h} className="flex items-center gap-1.5 text-[11px] text-[#5A7060]">
                <Check className="h-2.5 w-2.5 shrink-0 text-[#4ADE80]" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {listing.listingType === 'BOTH' && (
              <>
                <span className="rounded border border-[#1E2D1E] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#5A7060]">Buy</span>
                <span className="rounded border border-[#22C55E]/20 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#4ADE80]">Lease</span>
              </>
            )}
            {listing.listingType === 'LEASE' && (
              <span className="rounded border border-[#22C55E]/20 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#4ADE80]">Lease only</span>
            )}
            {listing.listingType === 'BUY' && (
              <span className="rounded border border-[#1E2D1E] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#5A7060]">Purchase</span>
            )}
          </div>
          <span className="flex items-center gap-0.5 text-xs text-[#4A6A4A] transition-colors group-hover:text-[#4ADE80]">
            View
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Main TerraHubClient ─────────────────────────────────────────────────────

interface TerraHubClientProps {
  initialListings: TerraListing[]
  stats: {
    totalParcels: number
    leaseCount:   number
    devCount:     number
    totalAcres:   number
  }
}

export function TerraHubClient({ initialListings, stats }: TerraHubClientProps) {
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState<TerraListingTypeFilter>('ALL')
  const [devFilter,  setDevFilter]  = useState<'ALL' | 'DEV_ONLY'>('ALL')
  const [sortBy,     setSortBy]     = useState<TerraSortOption>('NEWEST')

  const filtered = useMemo(() => {
    let r = [...initialListings]

    // Type filter
    if (typeFilter === 'LEASE') r = r.filter((l) => l.listingType === 'LEASE' || l.listingType === 'BOTH')
    if (typeFilter === 'BUY')   r = r.filter((l) => l.listingType === 'BUY'   || l.listingType === 'BOTH')
    if (typeFilter === 'BOTH')  r = r.filter((l) => l.listingType === 'BOTH')

    // Dev filter
    if (devFilter === 'DEV_ONLY') r = r.filter((l) => l.devOpportunity !== null)

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.features.some((f) => f.toLowerCase().includes(q)),
      )
    }

    // Sort
    switch (sortBy) {
      case 'PRICE_ASC':    r.sort((a, b) => a.price - b.price); break
      case 'PRICE_DESC':   r.sort((a, b) => b.price - a.price); break
      case 'ACREAGE_DESC': r.sort((a, b) => (b.lotAcres ?? 0) - (a.lotAcres ?? 0)); break
      case 'RATE_ASC':
        r.sort((a, b) => {
          const ra = a.leaseRateMonthly ?? Infinity
          const rb = b.leaseRateMonthly ?? Infinity
          return ra - rb
        })
        break
      default: r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return r
  }, [initialListings, typeFilter, devFilter, search, sortBy])

  const TYPE_FILTERS: Array<{ value: TerraListingTypeFilter; label: string }> = [
    { value: 'ALL',   label: 'All parcels' },
    { value: 'LEASE', label: 'For Lease'   },
    { value: 'BUY',   label: 'For Sale'    },
    { value: 'BOTH',  label: 'Buy or Lease'},
  ]

  return (
    <div className="space-y-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trees className="h-5 w-5 text-[#4ADE80]" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A6A4A]">
              Terra — Land Platform
            </p>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-[#E8F0E8]">
            Land Leasing &amp; Development
          </h1>
          <p className="mt-1 text-sm text-[#5A7060]">
            Agricultural leases, development sites, and investment parcels across the country.
          </p>
        </div>
        <Link
          href="/marketplace?category=LAND"
          className="hidden flex-shrink-0 items-center gap-1.5 rounded-lg border border-[#1E2D1E] px-3 py-1.5 text-xs text-[#5A7060] hover:border-[#2A3A2A] hover:text-[#E8F0E8] transition-colors sm:flex"
        >
          All marketplace
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <TerraStatsStrip {...stats} />

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Type filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                typeFilter === value
                  ? 'border-[#4ADE80]/40 bg-[#4ADE80]/10 text-[#4ADE80]'
                  : 'border-[#1E2D1E] text-[#5A7060] hover:border-[#2A3A2A] hover:text-[#8A9E8A]',
              )}
            >
              {value === 'LEASE' && <Clock className="h-3 w-3" />}
              {value === 'BUY'   && <ArrowUpRight className="h-3 w-3" />}
              {label}
            </button>
          ))}

          {/* Dev opportunity toggle */}
          <button
            onClick={() => setDevFilter(devFilter === 'DEV_ONLY' ? 'ALL' : 'DEV_ONLY')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              devFilter === 'DEV_ONLY'
                ? 'border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C]'
                : 'border-[#1E2D1E] text-[#5A7060] hover:border-[#2A3A2A] hover:text-[#8A9E8A]',
            )}
          >
            <Layers className="h-3 w-3" />
            Dev opportunities
          </button>
        </div>

        {/* Search + sort row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#4A6A4A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by location, features, use type…"
              className="w-full rounded-xl border border-[#1E2D1E] bg-[#0D110D] py-2.5 pl-9 pr-4 text-sm text-[#E8F0E8] placeholder-[#4A6A4A] outline-none focus:border-[#2A3A2A] focus:ring-1 focus:ring-[#4ADE80]/10"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#4A6A4A]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TerraSortOption)}
              className="rounded-xl border border-[#1E2D1E] bg-[#0D110D] py-2.5 pl-9 pr-3 text-sm text-[#E8F0E8] outline-none focus:border-[#2A3A2A]"
            >
              <option value="NEWEST">Newest</option>
              <option value="PRICE_ASC">Price: Low</option>
              <option value="PRICE_DESC">Price: High</option>
              <option value="ACREAGE_DESC">Largest</option>
              <option value="RATE_ASC">Lease rate: Low</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-[#4A6A4A]">
          {filtered.length} parcel{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <TerraParcelCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#1E2D1E] py-16 text-center">
          <Trees className="mx-auto h-8 w-8 text-[#2A3A2A]" />
          <p className="mt-3 text-sm text-[#4A6A4A]">No parcels match your filters</p>
          <button
            onClick={() => { setTypeFilter('ALL'); setDevFilter('ALL'); setSearch('') }}
            className="mt-3 text-xs text-[#4ADE80] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Milestone footer ──────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-lg border border-[#1E2D1E] bg-[#0A100A] px-4 py-3">
        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4ADE80]" />
        <p className="text-xs text-[#4A6A4A]">
          <span className="font-medium text-[#8A9E8A]">Terra land leasing and development intents are live.</span>{' '}
          Owner land-listing management in{' '}
          <span className="font-medium text-[#4ADE80]">M4</span>.{' '}
          On-chain lease execution and fractional land crowdfunding in{' '}
          <span className="font-medium text-[#4ADE80]">M6</span>.
        </p>
      </div>
    </div>
  )
}
