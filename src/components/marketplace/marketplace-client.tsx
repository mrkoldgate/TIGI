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
import { PropertyCardSkeleton, LandCardSkeleton } from '@/components/ui/skeleton'
import { PropertyCard, PropertyRow } from '@/components/marketplace/property-card'
import {
  MarketplaceLandCard,
  MarketplaceLandRow,
  inferDevOpportunity,
} from '@/components/marketplace/land-card'
import {
  MOCK_LISTINGS,
  MARKETPLACE_STATS,
  type MockListing,
} from '@/lib/marketplace/mock-data'
import { useSavedListings } from '@/lib/saved/saved-context'

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

function getAccentColor(category: CategoryTab) {
  return category === 'LAND' ? '#4ADE80' : '#C9A84C'
}

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
// StatChip
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
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
        gold  && 'border-[#C9A84C]/20 bg-[#C9A84C]/5',
        green && 'border-[#4ADE80]/20 bg-[#4ADE80]/5',
        !gold && !green && 'border-[#2A2A3A] bg-[#111118]',
        onClick && 'cursor-pointer transition-opacity hover:opacity-80',
      )}
    >
      <span
        className={cn(
          'font-heading text-sm font-semibold tabular-nums',
          gold  ? 'text-[#C9A84C]' : green ? 'text-[#4ADE80]' : 'text-[#F5F5F7]',
        )}
      >
        {value}
      </span>
      <span className="text-xs text-[#6B6B80]">{label}</span>
    </Tag>
  )
}

// ---------------------------------------------------------------------------
// CategoryTabs — accent color matches the active category's design language
// ---------------------------------------------------------------------------

function CategoryTabs({
  active,
  onChange,
}: {
  active: CategoryTab
  onChange: (tab: CategoryTab) => void
}) {
  const accentColor = getAccentColor(active)

  const tabs: { key: CategoryTab; label: string; icon?: React.ReactNode }[] = [
    { key: 'ALL', label: 'All Listings' },
    { key: 'PROPERTIES', label: 'Residential & Commercial', icon: <Building2 className="h-3.5 w-3.5" /> },
    { key: 'LAND', label: 'Land & Development', icon: <Trees className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="flex overflow-x-auto border-b border-[#2A2A3A] scrollbar-none">
      {tabs.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            'relative flex shrink-0 items-center gap-1.5 px-5 py-3 text-sm font-medium transition-colors duration-150',
            active === key ? 'text-[#F5F5F7]' : 'text-[#6B6B80] hover:text-[#A0A0B2]',
          )}
        >
          {icon && (
            <span
              className={cn(
                'transition-colors duration-150',
                active === key ? '' : 'text-[#4A4A60]',
              )}
              style={active === key ? { color: accentColor } : undefined}
            >
              {icon}
            </span>
          )}
          {label}
          {active === key && (
            <span
              className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full"
              style={{ backgroundColor: accentColor }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SearchBar
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
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A4A60]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getSearchPlaceholder(category)}
        className={cn(
          'w-full rounded-xl border bg-[#111118] py-2.5 pl-10 pr-10 text-sm text-[#F5F5F7]',
          'placeholder-[#4A4A60] outline-none transition-colors focus:ring-0',
          category === 'LAND'
            ? 'border-[#1E2D1E] focus:border-[#4ADE80]/30'
            : 'border-[#2A2A3A] focus:border-[#C9A84C]/40',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4A4A60] hover:text-[#A0A0B2]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FilterBar — category-aware: dev opportunity toggle appears for LAND/ALL
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
    <div className="flex flex-wrap items-center gap-2">
      {/* Listing type pills */}
      <div className="flex items-center rounded-lg border border-[#2A2A3A] p-0.5">
        {listingTypeOptions.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ listingType: key })}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150',
              filters.listingType === key
                ? 'bg-[#1A1A24] text-[#F5F5F7]'
                : 'text-[#6B6B80] hover:text-[#A0A0B2]',
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
          'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-150',
          filters.tokenizedOnly
            ? 'border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C]'
            : 'border-[#2A2A3A] text-[#6B6B80] hover:border-[#3A3A4A] hover:text-[#A0A0B2]',
        )}
      >
        <Zap className="h-3.5 w-3.5" />
        Tokenized
      </button>

      {/* Dev. opportunity toggle — land and all tabs */}
      {showDevOpportunity && (
        <button
          type="button"
          onClick={() => onChange({ devOpportunityOnly: !filters.devOpportunityOnly })}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-150',
            filters.devOpportunityOnly
              ? 'border-[#4ADE80]/30 bg-[#4ADE80]/10 text-[#4ADE80]'
              : 'border-[#2A2A3A] text-[#6B6B80] hover:border-[#1E2D1E] hover:text-[#A0A0B2]',
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          Dev. Opportunity
        </button>
      )}

      {/* Clear */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-[#6B6B80] transition-colors hover:text-[#A0A0B2]"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ResultsHeader
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
  const accentColor = getAccentColor(filters.category)

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-[#6B6B80]">
        <span className="font-medium" style={{ color: accentColor }}>
          {count}
        </span>{' '}
        {label} found
      </p>

      <div className="flex items-center gap-2">
        {/* Sort */}
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortOption })}
            className="appearance-none rounded-lg border border-[#2A2A3A] bg-[#111118] py-2 pl-3 pr-8 text-xs text-[#A0A0B2] outline-none transition-colors hover:border-[#3A3A4A] focus:border-[#C9A84C]/40"
          >
            <option value="NEWEST">Newest</option>
            <option value="PRICE_ASC">Price: Low → High</option>
            <option value="PRICE_DESC">Price: High → Low</option>
            <option value="POPULAR">Most Popular</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-[#4A4A60]">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex overflow-hidden rounded-lg border border-[#2A2A3A]">
          <button
            type="button"
            onClick={() => onChange({ view: 'grid' })}
            title="Grid view"
            className={cn(
              'px-2.5 py-2 transition-colors',
              filters.view === 'grid'
                ? 'bg-[#1A1A24] text-[#F5F5F7]'
                : 'text-[#4A4A60] hover:text-[#A0A0B2]',
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ view: 'list' })}
            title="List view"
            className={cn(
              'border-l border-[#2A2A3A] px-2.5 py-2 transition-colors',
              filters.view === 'list'
                ? 'bg-[#1A1A24] text-[#F5F5F7]'
                : 'text-[#4A4A60] hover:text-[#A0A0B2]',
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
// EmptyState — category-aware icon and messaging
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
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className={cn(
          'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border',
          isLand
            ? 'border-[#1E2D1E] bg-[#0D110D]'
            : 'border-[#2A2A3A] bg-[#111118]',
        )}
      >
        {isLand ? (
          <Trees className="h-7 w-7 text-[#2A4A2A]" />
        ) : (
          <Building2 className="h-7 w-7 text-[#4A4A60]" />
        )}
      </div>
      <h3 className="font-heading text-base font-medium text-[#A0A0B2]">
        {hasSearch
          ? `No ${isLand ? 'land parcels' : 'listings'} match your search`
          : `No ${isLand ? 'land parcels' : 'listings'} match your filters`}
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-[#6B6B80]">
        {hasSearch
          ? 'Try a different keyword or location.'
          : 'Try adjusting your filters or broadening your search.'}
      </p>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          'mt-5 rounded-xl border px-5 py-2.5 text-sm text-[#A0A0B2] transition-all hover:text-white',
          isLand
            ? 'border-[#1E2D1E] hover:border-[#4ADE80]/30'
            : 'border-[#2A2A3A] hover:border-[#C9A84C]/40',
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
  priority,
}: {
  listing: MockListing
  index: number
  savedIds: Set<string>
  onSave: (id: string) => void
  priority?: boolean
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
      priority={priority}
    />
  )
}

function ListingRow({
  listing,
  index,
  savedIds,
  onSave,
  priority,
}: {
  listing: MockListing
  index: number
  savedIds: Set<string>
  onSave: (id: string) => void
  priority?: boolean
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
      priority={priority}
    />
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function MarketplaceClient() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoading] = useState(false) // replace with real loading state when DB integrated

  // Shared save state — persists across marketplace, detail pages, and /saved
  const { savedIds, toggleSave } = useSavedListings()

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
    () => applyFilters(MOCK_LISTINGS, filters),
    [filters],
  )

  const visibleListings = filteredListings.slice(0, visibleCount)
  const hasMore = visibleCount < filteredListings.length
  const totalValueDisplay = `$${(MARKETPLACE_STATS.totalValue / 1_000_000).toFixed(1)}M`
  const gridCols = getGridCols(filters.category)

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Stats strip — landCount chip navigates to LAND tab ── */}
      <div className="flex flex-wrap items-center gap-2">
        <StatChip value={String(MARKETPLACE_STATS.totalActive)} label="active listings" />
        <StatChip value={String(MARKETPLACE_STATS.tokenizedCount)} label="tokenized" gold />
        <StatChip value={totalValueDisplay} label="total listed value" />
        <StatChip
          value={String(MARKETPLACE_STATS.landCount)}
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

      {/* ── Search ── */}
      <SearchBar
        value={filters.search}
        category={filters.category}
        onChange={(v) => patchFilters({ search: v })}
      />

      {/* ── Filter bar ── */}
      <FilterBar
        filters={filters}
        onChange={patchFilters}
        onClear={clearFilters}
      />

      {/* ── Results header ── */}
      <ResultsHeader
        count={filteredListings.length}
        filters={filters}
        onChange={patchFilters}
      />

      {/* ── Grid / List ── */}
      {isLoading ? (
        <div className={cn(filters.view === 'grid' ? `grid ${gridCols} gap-6` : 'flex flex-col gap-3')}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) =>
            filters.category === 'LAND' ? (
              <LandCardSkeleton key={i} />
            ) : (
              <PropertyCardSkeleton key={i} />
            ),
          )}
        </div>
      ) : filteredListings.length === 0 ? (
        <EmptyState
          category={filters.category}
          hasSearch={filters.search.trim().length > 0}
          onClear={clearFilters}
        />
      ) : filters.view === 'grid' ? (
        <div className={cn('grid gap-6', gridCols)}>
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
                priority={i < 3}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
                priority={i < 5}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Load more ── */}
      {hasMore && !isLoading && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium',
              'text-[#A0A0B2] transition-all hover:text-white active:scale-[0.98]',
              filters.category === 'LAND'
                ? 'border-[#1E2D1E] hover:border-[#4ADE80]/30'
                : 'border-[#2A2A3A] hover:border-[#C9A84C]/40',
            )}
          >
            <ChevronDown className="h-4 w-4" />
            {getLoadMoreLabel(filters.category)}
          </button>
          <p className="text-xs text-[#4A4A60]">
            Showing {visibleCount} of {filteredListings.length}{' '}
            {getListingLabel(filteredListings.length, filters.category)}
          </p>
        </div>
      )}

      {/* ── All shown indicator ── */}
      {!hasMore && filteredListings.length > PAGE_SIZE && (
        <p className="pt-4 text-center text-xs text-[#4A4A60]">
          All {filteredListings.length}{' '}
          {getListingLabel(filteredListings.length, filters.category)} shown
        </p>
      )}
    </div>
  )
}
