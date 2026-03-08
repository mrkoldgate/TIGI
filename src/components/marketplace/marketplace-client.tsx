'use client'

import { useState, useMemo } from 'react'
import { Search, X, LayoutGrid, List, Zap, Building2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PropertyCardSkeleton } from '@/components/ui/skeleton'
import { PropertyCard, PropertyRow } from '@/components/marketplace/property-card'
import { MarketplaceLandCard, MarketplaceLandRow } from '@/components/marketplace/land-card'
import {
  MOCK_LISTINGS,
  MARKETPLACE_STATS,
  formatPrice,
  type MockListing,
  type ListingType,
} from '@/lib/marketplace/mock-data'

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
  sort: SortOption
  view: ViewMode
}

const DEFAULT_FILTERS: Filters = {
  category: 'ALL',
  search: '',
  listingType: 'ALL',
  tokenizedOnly: false,
  sort: 'NEWEST',
  view: 'grid',
}

const PAGE_SIZE = 12

// ---------------------------------------------------------------------------
// Filter + sort logic
// ---------------------------------------------------------------------------

function applyFilters(listings: MockListing[], filters: Filters): MockListing[] {
  let result = listings.filter((l) => l.status === 'ACTIVE')

  // Category
  if (filters.category === 'LAND') {
    result = result.filter((l) => l.propertyType === 'LAND')
  } else if (filters.category === 'PROPERTIES') {
    result = result.filter((l) => l.propertyType !== 'LAND')
  }

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q),
    )
  }

  // Listing type
  if (filters.listingType === 'BUY') {
    result = result.filter(
      (l) => l.listingType === 'BUY' || l.listingType === 'BOTH',
    )
  } else if (filters.listingType === 'LEASE') {
    result = result.filter(
      (l) => l.listingType === 'LEASE' || l.listingType === 'BOTH',
    )
  }

  // Tokenized only
  if (filters.tokenizedOnly) {
    result = result.filter((l) => l.isTokenized)
  }

  // Sort
  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case 'PRICE_ASC':
        return a.price - b.price
      case 'PRICE_DESC':
        return b.price - a.price
      case 'POPULAR':
        return b.viewCount - a.viewCount
      case 'NEWEST':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return result
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatChip({
  value,
  label,
  gold = false,
}: {
  value: string
  label: string
  gold?: boolean
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
        gold
          ? 'border-[#C9A84C]/20 bg-[#C9A84C]/5'
          : 'border-[#2A2A3A] bg-[#111118]',
      )}
    >
      <span
        className={cn(
          'font-heading text-sm font-semibold tabular-nums',
          gold ? 'text-[#C9A84C]' : 'text-[#F5F5F7]',
        )}
      >
        {value}
      </span>
      <span className="text-xs text-[#6B6B80]">{label}</span>
    </div>
  )
}

function CategoryTabs({
  active,
  onChange,
}: {
  active: CategoryTab
  onChange: (tab: CategoryTab) => void
}) {
  const tabs: { key: CategoryTab; label: string }[] = [
    { key: 'ALL', label: 'All Properties' },
    { key: 'PROPERTIES', label: 'Residential & Commercial' },
    { key: 'LAND', label: 'Land & Development' },
  ]

  return (
    <div className="flex border-b border-[#2A2A3A]">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            'relative px-5 py-3 text-sm font-medium transition-colors duration-150',
            active === key
              ? 'text-[#C9A84C]'
              : 'text-[#6B6B80] hover:text-[#A0A0B2]',
          )}
        >
          {label}
          {active === key && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full bg-[#C9A84C]" />
          )}
        </button>
      ))}
    </div>
  )
}

function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A4A60]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by location, property type, or keyword…"
        className="w-full rounded-xl border border-[#2A2A3A] bg-[#111118] py-2.5 pl-10 pr-10 text-sm text-[#F5F5F7] placeholder-[#4A4A60] outline-none transition-colors focus:border-[#C9A84C]/40 focus:ring-0"
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

function FilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}) {
  const hasActiveFilters =
    filters.listingType !== 'ALL' || filters.tokenizedOnly

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
        Tokenized Only
      </button>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-[#6B6B80] hover:text-[#A0A0B2]"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  )
}

function ResultsHeader({
  count,
  filters,
  onChange,
}: {
  count: number
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-[#6B6B80]">
        <span className="font-medium text-[#A0A0B2]">{count}</span>{' '}
        {count === 1 ? 'property' : 'properties'} found
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
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              className="text-[#4A4A60]"
            >
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

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2A2A3A] bg-[#111118]">
        <Building2 className="h-7 w-7 text-[#4A4A60]" />
      </div>
      <h3 className="font-heading text-base font-medium text-[#A0A0B2]">
        No properties match your filters
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-[#6B6B80]">
        Try adjusting your search or broadening your filters.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-xl border border-[#2A2A3A] px-5 py-2.5 text-sm text-[#A0A0B2] transition-all hover:border-[#C9A84C]/40 hover:text-white"
      >
        Clear all filters
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function MarketplaceClient() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoading] = useState(false) // wire to real loading state when DB integrated

  function patchFilters(patch: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...patch }))
    // Reset pagination when filters change (not view/sort)
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

  const filteredListings = useMemo(
    () => applyFilters(MOCK_LISTINGS, filters),
    [filters],
  )

  const visibleListings = filteredListings.slice(0, visibleCount)
  const hasMore = visibleCount < filteredListings.length

  // Derived total value for display
  const totalValueDisplay = `$${(MARKETPLACE_STATS.totalValue / 1_000_000).toFixed(1)}M`

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Stats strip ── */}
      <div className="flex flex-wrap items-center gap-2">
        <StatChip value={String(MARKETPLACE_STATS.totalActive)} label="active listings" />
        <StatChip
          value={String(MARKETPLACE_STATS.tokenizedCount)}
          label="tokenized"
          gold
        />
        <StatChip value={totalValueDisplay} label="total listed value" />
        <StatChip value={String(MARKETPLACE_STATS.landCount)} label="land parcels" />
      </div>

      {/* ── Category tabs ── */}
      <CategoryTabs
        active={filters.category}
        onChange={(cat) => patchFilters({ category: cat })}
      />

      {/* ── Search ── */}
      <SearchBar
        value={filters.search}
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
        <div
          className={cn(
            filters.view === 'grid'
              ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-3',
          )}
        >
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <EmptyState onClear={clearFilters} />
      ) : filters.view === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleListings.map((listing, i) =>
            listing.propertyType === 'LAND' ? (
              <div key={listing.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}>
                <MarketplaceLandCard listing={listing} index={i} />
              </div>
            ) : (
              <div key={listing.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}>
                <PropertyCard listing={listing} index={i} />
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleListings.map((listing, i) =>
            listing.propertyType === 'LAND' ? (
              <div key={listing.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}>
                <MarketplaceLandRow listing={listing} index={i} />
              </div>
            ) : (
              <div key={listing.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}>
                <PropertyRow listing={listing} index={i} />
              </div>
            )
          )}
        </div>
      )}

      {/* ── Load more ── */}
      {hasMore && !isLoading && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="flex items-center gap-2 rounded-xl border border-[#2A2A3A] px-6 py-3 text-sm font-medium text-[#A0A0B2] transition-all hover:border-[#C9A84C]/40 hover:text-white active:scale-[0.98]"
          >
            <TrendingUp className="h-4 w-4" />
            Load more properties
          </button>
          <p className="text-xs text-[#4A4A60]">
            Showing {visibleCount} of {filteredListings.length} properties
          </p>
        </div>
      )}

      {/* ── All shown indicator ── */}
      {!hasMore && filteredListings.length > PAGE_SIZE && (
        <p className="pt-4 text-center text-xs text-[#4A4A60]">
          All {filteredListings.length} properties shown
        </p>
      )}
    </div>
  )
}
