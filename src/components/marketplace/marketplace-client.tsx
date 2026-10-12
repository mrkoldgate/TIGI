'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  X,
  LayoutGrid,
  List,
  Zap,
  Building2,
  Layers,
  ChevronDown,
  Trees,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PropertyCard, PropertyRow } from '@/components/marketplace/property-card'
import {
  MarketplaceLandCard,
  MarketplaceLandRow,
  inferDevOpportunity,
} from '@/components/marketplace/land-card'
import type { MockListing } from '@/lib/marketplace/mock-data'
import type { MarketplaceStats } from '@/lib/listings/listing-query'
import { useSavedListings } from '@/lib/saved/saved-context'
import { useCompare } from '@/lib/compare/compare-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CategoryTab = 'ALL' | 'PROPERTIES' | 'LAND'
type ListingTypeFilter = 'ALL' | 'BUY' | 'LEASE'
type SortOption = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'POPULAR'
type ViewMode = 'grid' | 'list'

interface Filters {
  category: CategoryTab
  search: string
  listingType: ListingTypeFilter
  tokenizedOnly: boolean
  devOpportunityOnly: boolean
  sort: SortOption
  view: ViewMode
}

const DEFAULT_FILTERS: Filters = {
  category: 'ALL',
  search: '',
  listingType: 'ALL',
  tokenizedOnly: false,
  devOpportunityOnly: false,
  sort: 'NEWEST',
  view: 'grid',
}

const PAGE_SIZE = 12

// ---------------------------------------------------------------------------
// Filter + sort pipeline
// ---------------------------------------------------------------------------

function applyFilters(listings: MockListing[], filters: Filters): MockListing[] {
  let result = listings.filter((l) => l.status === 'ACTIVE')

  // Category
  if (filters.category === 'LAND') {
    result = result.filter((l) => l.propertyType === 'LAND')
  } else if (filters.category === 'PROPERTIES') {
    result = result.filter((l) => l.propertyType !== 'LAND')
  }

  // Search — title, city, state, description, features
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.features.some((f) => f.toLowerCase().includes(q)),
    )
  }

  // Listing type
  if (filters.listingType === 'BUY') {
    result = result.filter((l) => l.listingType === 'BUY' || l.listingType === 'BOTH')
  } else if (filters.listingType === 'LEASE') {
    result = result.filter((l) => l.listingType === 'LEASE' || l.listingType === 'BOTH')
  }

  // Tokenized only
  if (filters.tokenizedOnly) {
    result = result.filter((l) => l.isTokenized)
  }

  // Dev. opportunity — applies to LAND and ALL
  if (filters.devOpportunityOnly) {
    result = result.filter((l) => inferDevOpportunity(l.features))
  }

  // Sort
  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case 'PRICE_ASC':  return a.price - b.price
      case 'PRICE_DESC': return b.price - a.price
      case 'POPULAR':    return b.viewCount - a.viewCount
      case 'NEWEST':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return result
}

// ---------------------------------------------------------------------------
// Context helpers
// ---------------------------------------------------------------------------

function getListingLabel(count: number, category: CategoryTab): string {
  if (category === 'LAND') return count === 1 ? 'parcel' : 'parcels'
  return count === 1 ? 'listing' : 'listings'
}

function getSearchPlaceholder(category: CategoryTab): string {
  if (category === 'LAND') return 'Search by location, acreage, zoning, or keyword…'
  if (category === 'PROPERTIES') return 'Search by location, property type, or keyword…'
  return 'Search properties and land by location or keyword…'
}

function getLoadMoreLabel(category: CategoryTab): string {
  if (category === 'LAND') return 'Load more parcels'
  return 'Load more listings'
}

// ---------------------------------------------------------------------------
// Grid columns — land benefits from wider cards (panoramic 21/9 image)
// ---------------------------------------------------------------------------

function getGridCols(category: CategoryTab): string {
  if (category === 'LAND') return 'grid-cols-1 sm:grid-cols-2'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}

// ---------------------------------------------------------------------------
// StatChip — v4 Elite: #050505 bg, sharp 1px border, inset shadow, neon glow
// ---------------------------------------------------------------------------

function StatChip({
  value,
  label,
  gold = false,
  green = false,
  onClick,
}: {
  value: string
  label: string
  gold?: boolean
  green?: boolean
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border px-4 py-2 transition-all duration-300',
        'bg-[#050505] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.5)]',
        gold  && 'border-indigo-400/20',
        green && 'border-emerald-400/20',
        !gold && !green && 'border-white/[0.04]',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.6)]',
      )}
    >
      {/* Ambient glow */}
      {(gold || green) && (
        <div
          className={cn(
            'pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full blur-[20px] opacity-30 transition-opacity duration-500 group-hover:opacity-60',
            gold ? 'bg-indigo-400/50' : 'bg-emerald-400/50',
          )}
          aria-hidden="true"
        />
      )}
      {/* Top-edge light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" aria-hidden="true" />
      <span
        className={cn(
          'relative font-heading text-sm font-semibold tabular-nums',
          gold  ? 'text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]' : green ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'text-white',
        )}
      >
        {value}
      </span>
      <span className="relative text-[12px] font-medium tracking-wide uppercase text-zinc-500">{label}</span>
    </Tag>
  )
}

// ---------------------------------------------------------------------------
// CategoryTabs — v4 Elite: #050505 base, structural underline, neon accents
// ---------------------------------------------------------------------------

function CategoryTabs({
  active,
  onChange,
}: {
  active: CategoryTab
  onChange: (tab: CategoryTab) => void
}) {
  const tabs: { key: CategoryTab; label: string; icon?: React.ReactNode; accent: string; glow: string }[] = [
    { key: 'ALL', label: 'All Listings', accent: 'bg-indigo-400', glow: 'shadow-[0_0_12px_rgba(99,102,241,0.6),0_2px_8px_rgba(99,102,241,0.3)]' },
    { key: 'PROPERTIES', label: 'Residential & Commercial', icon: <Building2 className="h-3.5 w-3.5" />, accent: 'bg-indigo-400', glow: 'shadow-[0_0_12px_rgba(99,102,241,0.6),0_2px_8px_rgba(99,102,241,0.3)]' },
    { key: 'LAND', label: 'Land & Development', icon: <Trees className="h-3.5 w-3.5" />, accent: 'bg-emerald-400', glow: 'shadow-[0_0_12px_rgba(52,211,153,0.6),0_2px_8px_rgba(52,211,153,0.3)]' },
  ]

  return (
    <div className="flex overflow-x-auto border-b border-white/[0.04] scrollbar-none">
      {tabs.map(({ key, label, icon, accent, glow }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            'relative flex shrink-0 items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300',
            active === key ? 'text-white' : 'text-zinc-500 hover:text-zinc-400',
          )}
        >
          {icon && (
            <span
              className={cn(
                'transition-all duration-300',
                active === key
                  ? key === 'LAND'
                    ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                    : 'text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]'
                  : 'text-zinc-500',
              )}
            >
              {icon}
            </span>
          )}
          {label}
          {active === key && (
            <span
              className={cn('absolute inset-x-0 bottom-0 h-[2px] rounded-t-full', accent, glow)}
            />
          )}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SearchBar — v4 Elite: #050505 input, sharp border, inset shadow
// ---------------------------------------------------------------------------

function SearchBar({
  value,
  category,
  onChange,
}: {
  value: string
  category: CategoryTab
  onChange: (v: string) => void
}) {
  const isLand = category === 'LAND'
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getSearchPlaceholder(category)}
        className={cn(
          'w-full rounded-2xl border bg-[#050505] py-3.5 pl-12 pr-12 text-sm text-white',
          'placeholder-zinc-500 outline-none transition-all duration-300',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-1px_0_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.4)]',
          'border-white/[0.04]',
          isLand
            ? 'focus:border-emerald-400/30 focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_24px_rgba(52,211,153,0.08)]'
            : 'focus:border-indigo-400/30 focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_24px_rgba(99,102,241,0.08)]',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FilterBar — v4 Elite: #050505 pill containers, sharp structural borders
// ---------------------------------------------------------------------------

function FilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}) {
  const showDevOpportunity = filters.category === 'LAND' || filters.category === 'ALL'
  const hasActiveFilters =
    filters.listingType !== 'ALL' ||
    filters.tokenizedOnly ||
    filters.devOpportunityOnly

  const listingTypeOptions: { key: ListingTypeFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'BUY', label: 'For Sale' },
    { key: 'LEASE', label: 'For Lease' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Listing type pills — Paragon structural container */}
      <div className="flex items-center rounded-xl border border-white/[0.04] bg-[#050505] p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        {listingTypeOptions.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ listingType: key })}
            className={cn(
              'rounded-lg px-4 py-2 text-xs font-medium transition-all duration-300',
              filters.listingType === key
                ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]'
                : 'text-zinc-500 hover:text-zinc-400',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tokenized toggle */}
      <button
        type="button"
        onClick={() => onChange({ tokenizedOnly: !filters.tokenizedOnly })}
        className={cn(
          'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-300',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
          filters.tokenizedOnly
            ? 'border-indigo-400/25 bg-indigo-400/[0.08] text-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(99,102,241,0.12)]'
            : 'border-white/[0.04] bg-[#050505] text-zinc-500 hover:border-white/[0.1] hover:text-zinc-400',
        )}
      >
        <Zap className="h-3.5 w-3.5" style={filters.tokenizedOnly ? { filter: 'drop-shadow(0 0 6px currentColor)' } : undefined} />
        Tokenized
      </button>

      {/* Dev. opportunity toggle */}
      {showDevOpportunity && (
        <button
          type="button"
          onClick={() => onChange({ devOpportunityOnly: !filters.devOpportunityOnly })}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-300',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
            filters.devOpportunityOnly
              ? 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.15),inset_0_1px_0_rgba(52,211,153,0.12)]'
              : 'border-white/[0.04] bg-[#050505] text-zinc-500 hover:border-white/[0.1] hover:text-zinc-400',
          )}
        >
          <Layers className="h-3.5 w-3.5" style={filters.devOpportunityOnly ? { filter: 'drop-shadow(0 0 6px currentColor)' } : undefined} />
          Dev. Opportunity
        </button>
      )}

      {/* Clear */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ResultsHeader — v4 Elite with Paragon structural controls
// ---------------------------------------------------------------------------

function ResultsHeader({
  count,
  filters,
  onChange,
}: {
  count: number
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
}) {
  const label = getListingLabel(count, filters.category)
  const isLand = filters.category === 'LAND'

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-zinc-500">
        <span className={cn(
          'font-semibold',
          isLand ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]',
        )}>
          {count}
        </span>{' '}
        {label} found
      </p>

      <div className="flex items-center gap-3">
        {/* Sort */}
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortOption })}
            className={cn(
              'appearance-none rounded-xl border border-white/[0.04] bg-[#050505] py-2.5 pl-4 pr-9 text-xs text-zinc-400 outline-none transition-all duration-300',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/[0.1]',
              isLand
                ? 'focus:border-emerald-400/30 focus:shadow-[0_0_18px_rgba(52,211,153,0.08)]'
                : 'focus:border-indigo-400/30 focus:shadow-[0_0_18px_rgba(99,102,241,0.08)]',
            )}
          >
            <option value="NEWEST">Newest</option>
            <option value="PRICE_ASC">Price: Low → High</option>
            <option value="PRICE_DESC">Price: High → Low</option>
            <option value="POPULAR">Most Popular</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </div>
        </div>

        {/* View toggle — Paragon structural */}
        <div className="flex overflow-hidden rounded-xl border border-white/[0.04] bg-[#050505] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <button
            type="button"
            onClick={() => onChange({ view: 'grid' })}
            title="Grid view"
            className={cn(
              'px-3 py-2.5 transition-all duration-300',
              filters.view === 'grid'
                ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'text-zinc-500 hover:text-zinc-400',
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ view: 'list' })}
            title="List view"
            className={cn(
              'border-l border-white/[0.04] px-3 py-2.5 transition-all duration-300',
              filters.view === 'list'
                ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'text-zinc-500 hover:text-zinc-400',
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EmptyState — Glassflow 3-layer centerpiece + Dimension container
// ---------------------------------------------------------------------------

function EmptyState({
  category,
  hasSearch,
  onClear,
}: {
  category: CategoryTab
  hasSearch: boolean
  onClear: () => void
}) {
  const isLand = category === 'LAND'
  return (
    <div className="relative flex flex-col items-center justify-center py-32 text-center">
      {/* Glassflow 3-layer centerpiece */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Layer 1: Massive diffused backlight */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full blur-[120px]',
            isLand ? 'bg-emerald-500/10' : 'bg-indigo-500/10',
          )}
          aria-hidden="true"
        />
        {/* Layer 2: Secondary core glow */}
        <div
          className={cn(
            'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full blur-[60px]',
            isLand ? 'bg-emerald-400/20' : 'bg-indigo-400/20',
          )}
          aria-hidden="true"
        />
        {/* Layer 3: Nested glass icon shell */}
        <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {isLand ? (
            <Trees className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
          ) : (
            <Building2 className="h-12 w-12 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
          )}
        </div>
      </div>

      <h3 className="relative font-heading text-lg font-extrabold tracking-[-0.05em] bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
        {hasSearch
          ? `No ${isLand ? 'land parcels' : 'listings'} match your search`
          : `No ${isLand ? 'land parcels' : 'listings'} match your filters`}
      </h3>
      <p className="relative mt-3 max-w-xs text-sm text-zinc-500">
        {hasSearch
          ? 'Try a different keyword or location.'
          : 'Try adjusting your filters or broadening your search.'}
      </p>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          'relative mt-8 rounded-xl border px-7 py-3 text-sm font-medium text-zinc-500 transition-all duration-300',
          'bg-[#050505] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
          'hover:text-white hover:-translate-y-0.5 hover:border-white/[0.15]',
          'border-white/[0.04]',
        )}
      >
        Clear all filters
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ListingCard — routes to the right card component by type
// ---------------------------------------------------------------------------

function ListingCard({
  listing,
  index,
  savedIds,
  onSave,
  compareIds,
  onCompare,
  priority,
}: {
  listing:    MockListing
  index:      number
  savedIds:   Set<string>
  onSave:     (id: string) => void
  compareIds: Set<string>
  onCompare:  (id: string, title: string) => void
  priority?:  boolean
}) {
  if (listing.propertyType === 'LAND') {
    return (
      <MarketplaceLandCard
        listing={listing}
        index={index}
        isSaved={savedIds.has(listing.id)}
        onSave={onSave}
        priority={priority}
      />
    )
  }
  return (
    <PropertyCard
      listing={listing}
      index={index}
      isSaved={savedIds.has(listing.id)}
      onSave={onSave}
      isComparing={compareIds.has(listing.id)}
      onCompare={onCompare}
      priority={priority}
    />
  )
}

function ListingRow({
  listing,
  index,
  savedIds,
  onSave,
  compareIds,
  onCompare,
  priority,
}: {
  listing:    MockListing
  index:      number
  savedIds:   Set<string>
  onSave:     (id: string) => void
  compareIds: Set<string>
  onCompare:  (id: string, title: string) => void
  priority?:  boolean
}) {
  if (listing.propertyType === 'LAND') {
    return (
      <MarketplaceLandRow
        listing={listing}
        index={index}
        isSaved={savedIds.has(listing.id)}
        onSave={onSave}
        priority={priority}
      />
    )
  }
  return (
    <PropertyRow
      listing={listing}
      index={index}
      isSaved={savedIds.has(listing.id)}
      onSave={onSave}
      isComparing={compareIds.has(listing.id)}
      onCompare={onCompare}
      priority={priority}
    />
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface MarketplaceClientProps {
  listings: MockListing[]
  stats: MarketplaceStats
}

export function MarketplaceClient({ listings, stats }: MarketplaceClientProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const { savedIds, toggleSave } = useSavedListings()
  const { compareIds: compareIdsArr, addToCompare, removeFromCompare, isComparing } = useCompare()
  const compareIdsSet = useMemo(() => new Set(compareIdsArr), [compareIdsArr])

  const handleCompare = (id: string, title: string) => {
    if (isComparing(id)) removeFromCompare(id)
    else addToCompare(id, title)
  }

  function patchFilters(patch: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...patch }))
    if (!('view' in patch) && !('sort' in patch)) {
      setVisibleCount(PAGE_SIZE)
    }
  }

  function clearFilters() {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      category: prev.category,
      view: prev.view,
      sort: prev.sort,
    }))
    setVisibleCount(PAGE_SIZE)
  }

  const handleSave = toggleSave

  const filteredListings = useMemo(
    () => applyFilters(listings, filters),
    [listings, filters],
  )

  const visibleListings = filteredListings.slice(0, visibleCount)
  const hasMore = visibleCount < filteredListings.length
  const totalValueDisplay = `$${(stats.totalValue / 1_000_000).toFixed(1)}M`
  const gridCols = getGridCols(filters.category)
  const isLand = filters.category === 'LAND'

  return (
    <div className="animate-fade-in space-y-8">

      {/* ── Stats strip ── */}
      <div className="flex flex-wrap items-center gap-3">
        <StatChip value={String(stats.totalActive)} label="active listings" />
        <StatChip value={String(stats.tokenizedCount)} label="tokenized" gold />
        <StatChip value={totalValueDisplay} label="total listed value" />
        <StatChip
          value={String(stats.landCount)}
          label="land parcels"
          green
          onClick={() => patchFilters({ category: 'LAND' })}
        />
      </div>

      {/* ── Category tabs ── */}
      <CategoryTabs
        active={filters.category}
        onChange={(cat) => patchFilters({ category: cat })}
      />

      {/* ── Controls bar — v4 Outer Tray: #050505/50, rounded-[24px] ── */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.04] bg-[#050505]/50 p-8 backdrop-blur-3xl shadow-[inset_0_2px_60px_rgba(99,102,241,0.02),0_4px_40px_rgba(0,0,0,0.5)]">
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* Paragon top-edge light */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />
        {/* Corner atmospheric glow */}
        <div className={cn(
          'pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full blur-[60px] opacity-30',
          isLand ? 'bg-emerald-500' : 'bg-indigo-500',
        )} aria-hidden="true" />
        <div className="relative space-y-5">
          <SearchBar
            value={filters.search}
            category={filters.category}
            onChange={(v) => patchFilters({ search: v })}
          />
          <FilterBar
            filters={filters}
            onChange={patchFilters}
            onClear={clearFilters}
          />
        </div>
      </div>

      {/* ── Results header ── */}
      <ResultsHeader
        count={filteredListings.length}
        filters={filters}
        onChange={patchFilters}
      />

      {/* ── v4 Outer Tray wrapping the listing grid ── */}
      <div className="group/container relative overflow-hidden rounded-[24px] border border-white/[0.04] bg-[#050505]/50 backdrop-blur-3xl shadow-[inset_0_2px_60px_rgba(99,102,241,0.02),0_4px_40px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/[0.08]">
        <div className="noise absolute inset-0 pointer-events-none" />
        {/* Paragon top-edge structural lighting */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500 group-hover/container:via-white/30" aria-hidden="true" />

        {/* Inner atmospheric orbs — category-colored */}
        <div
          className={cn(
            'pointer-events-none absolute -left-28 -top-28 h-64 w-64 rounded-full blur-[100px] opacity-25 transition-opacity duration-700 group-hover/container:opacity-40',
            isLand ? 'bg-emerald-500' : 'bg-indigo-500',
          )}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-52 w-52 rounded-full bg-violet-500/20 blur-[80px] opacity-25 transition-opacity duration-700 group-hover/container:opacity-40" aria-hidden="true" />
        <div
          className={cn(
            'pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full blur-[80px] opacity-10',
            isLand ? 'bg-cyan-500' : 'bg-rose-500',
          )}
          aria-hidden="true"
        />

        {/* Inner content — v4 uses p-10 for massive breathing room */}
        <div className="relative p-8 sm:p-10">
          {filteredListings.length === 0 ? (
            <EmptyState
              category={filters.category}
              hasSearch={filters.search.trim().length > 0}
              onClear={clearFilters}
            />
          ) : filters.view === 'grid' ? (
            <div className={cn('grid gap-12', gridCols)}>
              {visibleListings.map((listing, i) => (
                <div
                  key={listing.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}
                >
                  <ListingCard
                    listing={listing}
                    index={i}
                    savedIds={savedIds}
                    onSave={handleSave}
                    compareIds={compareIdsSet}
                    onCompare={handleCompare}
                    priority={i < 3}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visibleListings.map((listing, i) => (
                <div
                  key={listing.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}
                >
                  <ListingRow
                    listing={listing}
                    index={i}
                    savedIds={savedIds}
                    onSave={handleSave}
                    compareIds={compareIdsSet}
                    onCompare={handleCompare}
                    priority={i < 5}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Load more — v4 structural glass button ── */}
      {hasMore && (
        <div className="flex flex-col items-center gap-4 pt-6">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className={cn(
              'flex items-center gap-2.5 rounded-xl border px-8 py-3.5 text-sm font-medium',
              'bg-[#050505] text-zinc-500 transition-all duration-300 hover:text-white hover:-translate-y-0.5 active:scale-[0.98]',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_16px_rgba(0,0,0,0.5)]',
              'border-white/[0.04] hover:border-white/[0.15]',
            )}
          >
            <ChevronDown className="h-4 w-4" />
            {getLoadMoreLabel(filters.category)}
          </button>
          <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-500">
            Showing {visibleCount} of {filteredListings.length}{' '}
            {getListingLabel(filteredListings.length, filters.category)}
          </p>
        </div>
      )}

      {/* ── All shown indicator ── */}
      {!hasMore && filteredListings.length > PAGE_SIZE && (
        <p className="pt-6 text-center text-[12px] font-medium tracking-wide uppercase text-zinc-500">
          All {filteredListings.length}{' '}
          {getListingLabel(filteredListings.length, filters.category)} shown
        </p>
      )}
    </div>
  )
}
