'use client'

// ---------------------------------------------------------------------------
// TerraHubClient — Main Terra module landing page.
//
// TIGI Hyper-Glass v4 Elite — Novu nested-layer architecture:
//   Layer 0: Atmospheric orbs (handled by parent page)
//   Layer 1: Deep structural backdrop (bg-black/40, backdrop-blur-3xl)
//            with emerald inner wash and glowing internal shadow
//   Layer 2: Floating glass plates — header, stats, controls, cards
//
// Layout:
//   1. Header plate — "Terra" branding with emerald accent + corner glows
//   2. Stats plates — floating glass cards with top-edge lighting
//   3. Controls plate — filters + search in structural glass strip
//   4. Deep structural backdrop wrapping the parcel grid
//   5. Milestone footer plate
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
  AGRICULTURAL: { label: 'Agricultural', cls: 'rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' },
  RESIDENTIAL_DEV: { label: 'Residential Dev', cls: 'rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' },
  COMMERCIAL_DEV: { label: 'Commercial Dev', cls: 'rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' },
  INDUSTRIAL: { label: 'Industrial', cls: 'rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' },
  MIXED_USE: { label: 'Mixed Use', cls: 'rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' },
  RECREATIONAL: { label: 'Recreational', cls: 'rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' },
  WATERFRONT: { label: 'Waterfront', cls: 'rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' },
  RURAL: { label: 'Rural', cls: 'rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' },
}

// ── Terra stats strip (v4 Elite floating glass plates) ──────────────────────

function TerraStatsStrip({
  totalParcels,
  leaseCount,
  devCount,
  totalAcres,
}: {
  totalParcels: number
  leaseCount: number
  devCount: number
  totalAcres: number
}) {
  const stats = [
    { value: String(totalParcels), label: 'Active parcels', accent: 'emerald', Icon: Map },
    { value: String(leaseCount), label: 'Lease opportunities', accent: 'emerald', Icon: Clock },
    { value: String(devCount), label: 'Development sites', accent: 'amber', Icon: Building2 },
    { value: `${totalAcres.toLocaleString()}+`, label: 'Total acres', accent: 'teal', Icon: Ruler },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ value, label, accent, Icon }) => (
        <div
          key={label}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-[#050505] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] px-5 py-5 text-center transition-all duration-300 hover:border-emerald-400/20 hover:-translate-y-0.5"
        >
          <div className="noise absolute inset-0 pointer-events-none" />
          {/* Top-edge lighting */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" aria-hidden="true" />
          {/* Accent corner glow */}
          <div
            className={cn(
              'pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-[30px] opacity-30 transition-opacity duration-500 group-hover:opacity-60',
              accent === 'emerald' && 'bg-emerald-400/40',
              accent === 'amber' && 'bg-amber-400/40',
              accent === 'teal' && 'bg-teal-400/40',
            )}
            aria-hidden="true"
          />
          {/* Glassflow 3D centerpiece */}
          <div className="relative mx-auto mb-3 h-14 w-14">
            {/* Layer 1: Diffused backlight */}
            <div className={cn(
              'absolute inset-0 rounded-full blur-[30px]',
              accent === 'emerald' && 'bg-emerald-500/15',
              accent === 'amber' && 'bg-amber-500/15',
              accent === 'teal' && 'bg-teal-500/15',
            )} />
            {/* Layer 2: Core glow */}
            <div className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full blur-[15px]',
              accent === 'emerald' && 'bg-emerald-400/20',
              accent === 'amber' && 'bg-amber-400/20',
              accent === 'teal' && 'bg-teal-400/20',
            )} />
            {/* Layer 3: Glass shell */}
            <div className="relative z-10 flex h-10 w-10 mx-auto mt-2 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-md">
              <Icon className={cn(
                'h-5 w-5 drop-shadow-[0_0_8px_currentColor]',
                accent === 'emerald' && 'text-emerald-400',
                accent === 'amber' && 'text-amber-400',
                accent === 'teal' && 'text-teal-400',
              )} />
            </div>
          </div>
          <p className="relative font-heading text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600">{value}</p>
          <p className="relative mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Terra parcel card (v4 Elite Paragon structural glass) ────────────────────

function TerraParcelCard({ listing }: { listing: TerraListing }) {
  const landUse = inferLandUse(listing.features)
  const useBadge = LAND_USE_BADGE[landUse] ?? { label: landUse, cls: 'bg-white/[0.06] text-zinc-400' }
  const acres = listing.lotAcres ?? 0
  const hasLease = listing.listingType === 'LEASE' || listing.listingType === 'BOTH'
  const hasDev = listing.devOpportunity !== null
  const stageCfg = listing.devOpportunity ? DEV_STAGE_CONFIG[listing.devOpportunity.stage] : null

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.05] bg-[#050505] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-emerald-500/20 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_48px_rgba(0,0,0,0.4),0_0_40px_rgba(52,211,153,0.06)]"
    >
      <div className="noise absolute inset-0 pointer-events-none" />
      {/* Top-edge lighting */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" aria-hidden="true" />
      {/* Corner glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-[30px] opacity-20 transition-opacity duration-500 group-hover:opacity-50" aria-hidden="true" />

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <PlaceholderImage
          alt={listing.title}
          slot={listing.imageSlot}
          propertyType={listing.imagePropertyType}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={cn('px-2 py-0.5 text-xs font-semibold', useBadge.cls)}>
            {useBadge.label}
          </span>
          {hasLease && (
            <span className="rounded-full border border-emerald-400/20 bg-black/60 backdrop-blur-2xl px-2 py-0.5 text-[10px] font-medium text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
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
        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="relative p-5">
        {/* Title + location */}
        <p className="truncate font-heading text-base font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500 group-hover:from-emerald-100 group-hover:to-white">
          {listing.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
          <Map className="h-3 w-3 text-emerald-400/60" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.4))' }} />
          {listing.city}, {listing.state}
        </p>

        {/* Key metrics row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
          {acres > 0 && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              {acres >= 100 ? `${acres.toLocaleString()} ac` : `${acres} ac`}
            </span>
          )}
          {listing.isTokenized && (
            <span className="flex items-center gap-1 text-amber-400">
              <Zap className="h-3 w-3" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' }} />
              Tokenized
            </span>
          )}
          {hasDev && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Building2 className="h-3 w-3" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.5))' }} />
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
                  <p className="font-heading text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br from-emerald-300 to-emerald-500">
                    {formatLeaseRate(listing.leaseRateMonthly)}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400">Rate on request</p>
                )}
                {listing.leaseTerms?.ratePerAcre && (
                  <p className="text-[10px] text-zinc-500">
                    {formatRatePerAcre(listing.leaseTerms.ratePerAcre)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-heading text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
                  {formatPrice(listing.price)}
                </p>
                {listing.leaseRateMonthly && listing.listingType === 'BOTH' && (
                  <p className="text-[10px] text-emerald-400">
                    Lease: {formatLeaseRate(listing.leaseRateMonthly)}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Lease duration chip */}
          {hasLease && listing.leaseTerms && (
            <span className="flex items-center gap-1 rounded-full border border-white/[0.05] bg-white/[0.02] px-2 py-0.5 text-[10px] text-zinc-400">
              <Clock className="h-2.5 w-2.5" />
              {formatLeaseDuration(listing.leaseTerms)}
            </span>
          )}
        </div>

        {/* Dev highlights — top 2 */}
        {hasDev && listing.devOpportunity!.highlights.length > 0 && (
          <div className="mt-3 space-y-1">
            {listing.devOpportunity!.highlights.slice(0, 2).map((h) => (
              <div key={h} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Check className="h-2.5 w-2.5 shrink-0 text-emerald-400" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.5))' }} />
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
                <span className="rounded border border-white/[0.05] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-500">Buy</span>
                <span className="rounded border border-emerald-500/20 bg-emerald-500/5 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-400">Lease</span>
              </>
            )}
            {listing.listingType === 'LEASE' && (
              <span className="rounded border border-emerald-500/20 bg-emerald-500/5 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-400">Lease only</span>
            )}
            {listing.listingType === 'BUY' && (
              <span className="rounded border border-white/[0.05] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-500">Purchase</span>
            )}
          </div>
          <span className="flex items-center gap-0.5 text-xs text-zinc-500 transition-colors group-hover:text-emerald-400">
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
    leaseCount: number
    devCount: number
    totalAcres: number
  }
}

export function TerraHubClient({ initialListings, stats }: TerraHubClientProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TerraListingTypeFilter>('ALL')
  const [devFilter, setDevFilter] = useState<'ALL' | 'DEV_ONLY'>('ALL')
  const [sortBy, setSortBy] = useState<TerraSortOption>('NEWEST')

  const filtered = useMemo(() => {
    let r = [...initialListings]

    // Type filter
    if (typeFilter === 'LEASE') r = r.filter((l) => l.listingType === 'LEASE' || l.listingType === 'BOTH')
    if (typeFilter === 'BUY') r = r.filter((l) => l.listingType === 'BUY' || l.listingType === 'BOTH')
    if (typeFilter === 'BOTH') r = r.filter((l) => l.listingType === 'BOTH')

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
      case 'PRICE_ASC': r.sort((a, b) => a.price - b.price); break
      case 'PRICE_DESC': r.sort((a, b) => b.price - a.price); break
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
    { value: 'ALL', label: 'All parcels' },
    { value: 'LEASE', label: 'For Lease' },
    { value: 'BUY', label: 'For Sale' },
    { value: 'BOTH', label: 'Buy or Lease' },
  ]

  return (
    <div className="relative space-y-8">

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 2 — Header plate (floating glass)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-[#050505] p-6 backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] sm:p-8">
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* h-[2px] emerald accent top-edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" aria-hidden="true" />
        {/* Dual corner glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/[0.08] blur-[40px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-teal-500/[0.06] blur-[35px]" aria-hidden="true" />
        {/* Decorative map grid lines */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015]" aria-hidden="true">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 backdrop-blur-xl shadow-[inset_0_0_12px_rgba(52,211,153,0.15),0_0_16px_rgba(52,211,153,0.1)]">
                <Trees className="h-5 w-5 text-emerald-400" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.6))' }} />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Terra — Land Platform
              </p>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-emerald-300">
              Land Leasing &amp; Development
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Agricultural leases, development sites, and investment parcels across the country.
            </p>
          </div>
          <Link
            href="/marketplace?category=LAND"
            className="hidden flex-shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl px-3 py-1.5 text-xs text-zinc-400 hover:border-emerald-400/30 hover:text-white transition-all sm:flex"
          >
            All marketplace
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 2 — Stats plates (floating glass)
          ═══════════════════════════════════════════════════════════════════ */}
      <TerraStatsStrip {...stats} />

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 2 — Controls plate (floating glass strip)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-[#050505] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] p-4 space-y-3">
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* Top-edge lighting */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" aria-hidden="true" />

        {/* Type filter pills */}
        <div className="relative flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                typeFilter === value
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.15),0_2px_8px_rgba(52,211,153,0.1)]'
                  : 'border-white/[0.05] text-zinc-400 hover:border-white/10 hover:text-white',
              )}
            >
              {value === 'LEASE' && <Clock className="h-3 w-3" />}
              {value === 'BUY' && <ArrowUpRight className="h-3 w-3" />}
              {label}
            </button>
          ))}

          {/* Dev opportunity toggle */}
          <button
            onClick={() => setDevFilter(devFilter === 'DEV_ONLY' ? 'ALL' : 'DEV_ONLY')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              devFilter === 'DEV_ONLY'
                ? 'border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.15),0_2px_8px_rgba(251,191,36,0.1)]'
                : 'border-white/[0.05] text-zinc-400 hover:border-white/10 hover:text-white',
            )}
          >
            <Layers className="h-3 w-3" />
            Dev opportunities
          </button>
        </div>

        {/* Search + sort row */}
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by location, features, use type…"
              className="w-full rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-400/40 focus:shadow-[0_0_12px_rgba(52,211,153,0.1)] transition-all"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TerraSortOption)}
              className="rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-400/40 focus:shadow-[0_0_12px_rgba(52,211,153,0.1)] transition-all"
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
        <p className="relative text-xs text-zinc-500">
          {filtered.length} parcel{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 1 — Deep structural backdrop (Novu nested-layer)
          Wraps the entire parcel grid with glowing internal shadow
          ═══════════════════════════════════════════════════════════════════ */}
      {filtered.length > 0 ? (
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-black backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_40px_rgba(0,0,0,0.4)]">
          <div className="noise absolute inset-0 pointer-events-none" />
          {/* ── Top-edge lighting (structural) ── */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" aria-hidden="true" />

          {/* ── Glowing internal shadow — Novu style ── */}
          {/* Inner emerald wash — gives the container its distinctive depth */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_2px_40px_rgba(52,211,153,0.03),inset_0_-2px_40px_rgba(0,0,0,0.2)]" aria-hidden="true" />
          {/* Inner atmospheric bloom — soft emerald glow from top center */}
          <div className="pointer-events-none absolute left-1/2 -top-20 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/[0.025] blur-[100px]" aria-hidden="true" />
          {/* Inner corner glows */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/[0.04] blur-[50px]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-teal-400/[0.03] blur-[50px]" aria-hidden="true" />

          {/* ── Grid content (Layer 2 cards float inside) ── */}
          <div className="relative p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((listing, i) => (
                <div
                  key={listing.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                >
                  <TerraParcelCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Empty state — floating glass plate ── */
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-black backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_40px_rgba(0,0,0,0.4)] py-16 text-center">
          <div className="noise absolute inset-0 pointer-events-none" />
          {/* Internal glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_2px_40px_rgba(52,211,153,0.03),inset_0_-2px_40px_rgba(0,0,0,0.2)]" aria-hidden="true" />
          {/* Atmospheric emerald bloom */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-emerald-500/[0.06] blur-[60px]" aria-hidden="true" />
          {/* Glassflow 3D centerpiece */}
          <div className="relative mx-auto mb-3 h-14 w-14">
            {/* Layer 1: Diffused backlight */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/15 blur-[30px]" />
            {/* Layer 2: Core glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-emerald-400/20 blur-[15px]" />
            {/* Layer 3: Glass shell */}
            <div className="relative z-10 flex h-10 w-10 mx-auto mt-2 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-md">
              <Trees className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_currentColor]" />
            </div>
          </div>
          <p className="relative mt-3 text-sm text-zinc-500">No parcels match your filters</p>
          <button
            onClick={() => { setTypeFilter('ALL'); setDevFilter('ALL'); setSearch('') }}
            className="relative mt-3 text-xs text-emerald-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          Layer 2 — Milestone footer plate (floating glass)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-[#050505] backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(255,255,255,0.01),0_4px_24px_rgba(0,0,0,0.3)] px-4 py-3">
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* Top-edge lighting */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" aria-hidden="true" />
        <div className="relative flex items-start gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          <p className="text-xs text-zinc-500">
            <span className="font-medium text-zinc-400">Terra land leasing and development intents are live.</span>{' '}
            Owner land-listing management in{' '}
            <span className="font-medium text-emerald-400">M4</span>.{' '}
            On-chain lease execution and fractional land crowdfunding in{' '}
            <span className="font-medium text-emerald-400">M6</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
