'use client'

import { useState, useMemo, useEffect } from 'react'
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
  SlidersHorizontal,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
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
// Header stats — Mercury-style figures separated by hairlines
// ---------------------------------------------------------------------------

function HeaderStats({ stats, onLand }: { stats: MarketplaceStats; onLand: () => void }) {
  const items: { value: string; label: string; onClick?: () => void }[] = [
    { value: String(stats.totalActive), label: 'Active listings' },
    { value: String(stats.tokenizedCount), label: 'Tokenized' },
    { value: `$${(stats.totalValue / 1_000_000).toFixed(1)}M`, label: 'Listed value' },
    { value: String(stats.landCount), label: 'Land parcels', onClick: onLand },
  ]
  return (
    <dl className="grid grid-cols-2 gap-y-5 sm:grid-cols-4 sm:divide-x sm:divide-white/[0.06]">
      {items.map((it, i) => {
        const inner = (
          <>
            <dd className="figure text-[28px] leading-none">{it.value}</dd>
            <dt className="text-label mt-2 !text-[10px]">{it.label}</dt>
          </>
        )
        return (
          <div key={it.label} className={cn('flex flex-col', i > 0 && 'sm:pl-6')}>
            {it.onClick ? (
              <button type="button" onClick={it.onClick} className="group flex flex-col text-left">
                {inner}
              </button>
            ) : (
              inner
            )}
          </div>
        )
      })}
    </dl>
  )
}

// ---------------------------------------------------------------------------
// Controls — one glass bar: category pills, search, filters, sort, view
// ---------------------------------------------------------------------------

const CATEGORY_TABS: { key: CategoryTab; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
  { key: 'ALL', label: 'Everything' },
  { key: 'PROPERTIES', label: 'Homes & buildings', icon: Building2 },
  { key: 'LAND', label: 'Land', icon: Trees },
]

const LISTING_TYPES: { key: ListingTypeFilter; label: string }[] = [
  { key: 'ALL', label: 'Buy or lease' },
  { key: 'BUY', label: 'For sale' },
  { key: 'LEASE', label: 'For lease' },
]

function Controls({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}) {
  const showDev = filters.category === 'LAND' || filters.category === 'ALL'
  const hasActive = filters.listingType !== 'ALL' || filters.tokenizedOnly || filters.devOpportunityOnly || filters.search.trim() !== ''

  return (
    <div className="panel !bg-[#09090D]/90 p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none" role="tablist" aria-label="Category">
          {CATEGORY_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filters.category === key}
              onClick={() => onChange({ category: key })}
              className="pill shrink-0"
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7E7E8E]" aria-hidden="true" />
          <label htmlFor="market-search" className="sr-only">Search listings</label>
          <input
            id="market-search"
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder={getSearchPlaceholder(filters.category)}
            className="field !rounded-full !py-2.5 !pl-11 !pr-10 !text-[14px]"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: '' })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E9C] transition-colors hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <SlidersHorizontal className="mr-1 h-4 w-4 text-[#7E7E8E]" aria-hidden="true" />
        {LISTING_TYPES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={filters.listingType === key}
            onClick={() => onChange({ listingType: key })}
            className="pill !py-1.5 !text-[12.5px]"
          >
            {label}
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-white/[0.08] sm:block" aria-hidden="true" />
        <button
          type="button"
          aria-pressed={filters.tokenizedOnly}
          onClick={() => onChange({ tokenizedOnly: !filters.tokenizedOnly })}
          className="pill !py-1.5 !text-[12.5px]"
        >
          <Zap className="h-3.5 w-3.5" />
          Tokenized only
        </button>
        {showDev && (
          <button
            type="button"
            aria-pressed={filters.devOpportunityOnly}
            onClick={() => onChange({ devOpportunityOnly: !filters.devOpportunityOnly })}
            className="pill !py-1.5 !text-[12.5px]"
          >
            <Layers className="h-3.5 w-3.5" />
            Development potential
          </button>
        )}
        {hasActive && (
          <button
            type="button"
            onClick={onClear}
            className="ml-1 inline-flex items-center gap-1.5 text-[12.5px] text-[#A0A0B2] transition-colors hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <label htmlFor="market-sort" className="sr-only">Sort</label>
            <select
              id="market-sort"
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortOption })}
              className="field !w-auto appearance-none !rounded-full !py-1.5 !pl-4 !pr-9 !text-[12.5px]"
            >
              <option value="NEWEST">Newest</option>
              <option value="PRICE_ASC">Price: low to high</option>
              <option value="PRICE_DESC">Price: high to low</option>
              <option value="POPULAR">Most viewed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8E8E9C]" />
          </div>
          <div className="flex rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
            {([
              { key: 'grid', icon: LayoutGrid, label: 'Grid view' },
              { key: 'list', icon: List, label: 'List view' },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={filters.view === key}
                aria-label={label}
                onClick={() => onChange({ view: key })}
                className={cn(
                  'rounded-full px-2.5 py-1.5 transition-all duration-300',
                  filters.view === key
                    ? 'bg-violet-500/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_0_16px_-4px_rgba(139,92,246,0.8)]'
                    : 'text-[#8E8E9C] hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ category, hasSearch, onClear }: { category: CategoryTab; hasSearch: boolean; onClear: () => void }) {
  const isLand = category === 'LAND'
  const Icon = isLand ? Trees : Building2
  return (
    <div className="panel flex flex-col items-center px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/[0.08] text-violet-200 shadow-[0_0_40px_-8px_rgba(139,92,246,0.7)]">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="section-title mt-6">
        No {isLand ? 'parcels' : 'listings'} match {hasSearch ? 'that search' : 'these filters'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[#A0A0B2]">
        {hasSearch ? 'Try a city, a state or a simpler keyword.' : 'Loosen a filter or switch category.'}
      </p>
      <button type="button" onClick={onClear} className="btn-glass mt-7 !px-6 !py-2.5 text-sm">
        Clear filters
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
  /** Search passed in from the URL (?q=) — e.g. from the top-bar search. */
  initialQuery?: string
}

export function MarketplaceClient({ listings, stats, initialQuery = '' }: MarketplaceClientProps) {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, search: initialQuery })
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Keep in sync when the top-bar search navigates here again with a new ?q=
  useEffect(() => {
    setFilters((prev) => (prev.search === initialQuery ? prev : { ...prev, search: initialQuery }))
  }, [initialQuery])

  const { savedIds, toggleSave } = useSavedListings()
  const { compareIds: compareIdsArr, addToCompare, removeFromCompare, isComparing } = useCompare()
  const compareIdsSet = useMemo(() => new Set(compareIdsArr), [compareIdsArr])

  const handleCompare = (id: string, title: string) => {
    if (isComparing(id)) removeFromCompare(id)
    else addToCompare(id, title)
  }

  function patchFilters(patch: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...patch }))
    if (!('view' in patch) && !('sort' in patch)) setVisibleCount(PAGE_SIZE)
  }

  function clearFilters() {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, category: prev.category, view: prev.view, sort: prev.sort }))
    setVisibleCount(PAGE_SIZE)
  }

  const filteredListings = useMemo(() => applyFilters(listings, filters), [listings, filters])
  const visibleListings = filteredListings.slice(0, visibleCount)
  const hasMore = visibleCount < filteredListings.length
  const gridCols = getGridCols(filters.category)
  const label = getListingLabel(filteredListings.length, filters.category)

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Marketplace"
        title="Own a share of real places"
        description="Homes, apartment blocks and land, split into shares from $100. Filter, compare, then invest."
        meta={<HeaderStats stats={stats} onLand={() => patchFilters({ category: 'LAND' })} />}
      />

      <div className="z-20 lg:sticky lg:top-[80px]" data-reveal="fade">
        <Controls filters={filters} onChange={patchFilters} onClear={clearFilters} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#A0A0B2]" aria-live="polite">
          <span className="font-mono tabular-nums text-[#F5F5F7]">{filteredListings.length}</span> {label}
          {filters.search.trim() && (
            <> for <span className="text-[#F5F5F7]">“{filters.search.trim()}”</span></>
          )}
        </p>
        <p className="hidden text-label !text-[10px] sm:block">Sample listings · devnet</p>
      </div>

      {filteredListings.length === 0 ? (
        <EmptyState category={filters.category} hasSearch={filters.search.trim().length > 0} onClear={clearFilters} />
      ) : filters.view === 'grid' ? (
        <div className={cn('grid gap-6 lg:gap-7', gridCols)}>
          {visibleListings.map((listing, i) => (
            <div key={listing.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}>
              <ListingCard
                listing={listing}
                index={i}
                savedIds={savedIds}
                onSave={toggleSave}
                compareIds={compareIdsSet}
                onCompare={handleCompare}
                priority={i < 3}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleListings.map((listing, i) => (
            <div key={listing.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 11) * 35}ms` }}>
              <ListingRow
                listing={listing}
                index={i}
                savedIds={savedIds}
                onSave={toggleSave}
                compareIds={compareIdsSet}
                onCompare={handleCompare}
                priority={i < 5}
              />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <button type="button" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className="btn-glass !px-7 !py-3 text-sm">
            <ChevronDown className="h-4 w-4" />
            {getLoadMoreLabel(filters.category)}
          </button>
          <p className="text-label !text-[10px]">
            Showing {visibleCount} of {filteredListings.length}
          </p>
        </div>
      )}
    </div>
  )
}
