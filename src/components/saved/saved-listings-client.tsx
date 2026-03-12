'use client'

// ---------------------------------------------------------------------------
// SavedListingsClient — Favorites / saved assets page.
//
// Reads saved IDs from SavedListingsContext (localStorage-backed for MVP).
// Intersects with the full listing catalogue passed from the server.
//
// Layout:
//   ┌─ Header (title + count + clear all) ────────────────────────────────┐
//   ├─ Stats strip (properties saved, land parcels saved, total value) ───┤
//   ├─ Tab bar (All | Properties | Land) + toolbar (sort + view) ─────────┤
//   ├─ Grid / List of cards ──────────────────────────────────────────────┤
//   └─ Empty state ──────────────────────────────────────────────────────┘
// ---------------------------------------------------------------------------

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useSavedListings } from '@/lib/saved/saved-context'
import { useCompare } from '@/lib/compare/compare-context'
import { PropertyCard, PropertyRow } from '@/components/marketplace/property-card'
import {
  MarketplaceLandCard,
  MarketplaceLandRow,
} from '@/components/marketplace/land-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type MockListing } from '@/lib/marketplace/mock-data'

// ── Types ──────────────────────────────────────────────────────────────────

type AssetTab = 'ALL' | 'PROPERTIES' | 'LAND'
type SortMode = 'DATE_SAVED' | 'PRICE_ASC' | 'PRICE_DESC' | 'TITLE'
type ViewMode = 'grid' | 'list'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`
  return `$${price}`
}

function formatSavedAt(ms: number): string {
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Root component ─────────────────────────────────────────────────────────

interface SavedListingsClientProps {
  allListings: MockListing[]
}

export function SavedListingsClient({ allListings }: SavedListingsClientProps) {
  const { savedIds, savedEntries, toggleSave, savedCount, clearAll } = useSavedListings()
  const { isComparing, addToCompare, removeFromCompare } = useCompare()
  const [tab, setTab] = useState<AssetTab>('ALL')
  const [sort, setSort] = useState<SortMode>('DATE_SAVED')
  const [view, setView] = useState<ViewMode>('grid')
  const [confirmClear, setConfirmClear] = useState(false)

  const handleCompare = useCallback(
    (id: string, title: string) => {
      if (isComparing(id)) removeFromCompare(id)
      else addToCompare(id, title)
    },
    [isComparing, addToCompare, removeFromCompare],
  )

  // Build a Map: id → savedAt for O(1) lookup when sorting
  const savedAtMap = useMemo(
    () => new Map(savedEntries.map((e) => [e.id, e.savedAt])),
    [savedEntries],
  )

  // Intersect full listing catalogue with saved IDs
  const savedListings = useMemo(
    () => allListings.filter((l) => savedIds.has(l.id)),
    [allListings, savedIds],
  )

  // Stats
  const propertyCount = savedListings.filter((l) => l.propertyType !== 'LAND').length
  const landCount = savedListings.filter((l) => l.propertyType === 'LAND').length
  const totalValue = savedListings.reduce((acc, l) => acc + l.price, 0)

  // Tab filter
  const tabFiltered = useMemo(() => {
    if (tab === 'PROPERTIES') return savedListings.filter((l) => l.propertyType !== 'LAND')
    if (tab === 'LAND') return savedListings.filter((l) => l.propertyType === 'LAND')
    return savedListings
  }, [savedListings, tab])

  // Sort
  const sorted = useMemo(() => {
    return [...tabFiltered].sort((a, b) => {
      switch (sort) {
        case 'PRICE_ASC':  return a.price - b.price
        case 'PRICE_DESC': return b.price - a.price
        case 'TITLE':      return a.title.localeCompare(b.title)
        case 'DATE_SAVED':
        default: {
          const aAt = savedAtMap.get(a.id) ?? 0
          const bAt = savedAtMap.get(b.id) ?? 0
          return bAt - aAt
        }
      }
    })
  }, [tabFiltered, sort, savedAtMap])

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    clearAll()
    setConfirmClear(false)
  }

  // ── Empty: no saved listings at all ─────────────────────────────────────
  if (savedCount === 0) {
    return (
      <div className="pt-8 pb-16 space-y-6">
        <SavedHeader count={0} onClearAll={handleClearAll} confirmClear={confirmClear} />
        <EmptyAll />
      </div>
    )
  }

  return (
    <div className="pt-8 pb-16 space-y-6">
      {/* ── Header ── */}
      <SavedHeader
        count={savedCount}
        onClearAll={handleClearAll}
        confirmClear={confirmClear}
      />

      {/* ── Stats strip ── */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Properties Saved"
          value={propertyCount}
          accent="#C9A84C"
          icon={<BuildingIcon />}
        />
        <StatCard
          label="Land Parcels Saved"
          value={landCount}
          accent="#4ADE80"
          icon={<LandIcon />}
        />
        <StatCard
          label="Total Listed Value"
          value={totalValue > 0 ? formatPrice(totalValue) : '—'}
          accent="#A78BFA"
          icon={<ValueIcon />}
          wide
        />
      </div>

      {/* ── Tabs + toolbar ── */}
      <div className="mt-8 space-y-3">
        {/* Tab bar */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-white/[0.08]">
          {(
            [
              { id: 'ALL' as AssetTab, label: 'All Saved', count: savedCount },
              { id: 'PROPERTIES' as AssetTab, label: 'Properties', count: propertyCount },
              { id: 'LAND' as AssetTab, label: 'Land', count: landCount },
            ] as const
          ).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                tab === id ? 'text-[#F5F5F7]' : 'text-[#6B6B80] hover:text-[#A0A0B2]',
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    tab === id
                      ? id === 'LAND'
                        ? 'bg-[#4ADE80] text-[#0A0A0F]'
                        : 'bg-[#C9A84C] text-[#0A0A0F]'
                      : 'bg-[#22222E] text-[#6B6B80]',
                  )}
                >
                  {count}
                </span>
              )}
              {tab === id && (
                <span
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full',
                    id === 'LAND' ? 'bg-[#4ADE80]' : 'bg-[#C9A84C]',
                  )}
                />
              )}
            </button>
          ))}
        </div>

        {/* Sort + view toolbar */}
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className={cn(
              'rounded-lg border border-white/[0.08] bg-[#22222E]',
              'px-3 py-2 text-sm text-[#A0A0B2]',
              'outline-none focus:border-[#C9A84C]',
              'transition-colors duration-150',
            )}
          >
            <option value="DATE_SAVED">Date Saved</option>
            <option value="PRICE_DESC">Price: High → Low</option>
            <option value="PRICE_ASC">Price: Low → High</option>
            <option value="TITLE">Title A–Z</option>
          </select>

          {/* View toggle */}
          <div className="flex overflow-hidden rounded-lg border border-white/[0.08]">
            <ViewBtn active={view === 'grid'} onClick={() => setView('grid')} title="Grid">
              <GridIcon />
            </ViewBtn>
            <ViewBtn active={view === 'list'} onClick={() => setView('list')} title="List">
              <ListIcon />
            </ViewBtn>
          </div>

          <span className="ml-auto text-xs text-[#6B6B80]">
            {sorted.length} {sorted.length === 1 ? 'asset' : 'assets'}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mt-5">
        {sorted.length === 0 ? (
          <EmptyTab tab={tab} />
        ) : view === 'grid' ? (
          <SavedGrid
            listings={sorted}
            savedAtMap={savedAtMap}
            savedIds={savedIds}
            onToggle={toggleSave}
            isLandTab={tab === 'LAND'}
            isComparing={isComparing}
            onCompare={handleCompare}
          />
        ) : (
          <SavedList
            listings={sorted}
            savedAtMap={savedAtMap}
            savedIds={savedIds}
            onToggle={toggleSave}
            isComparing={isComparing}
            onCompare={handleCompare}
          />
        )}
      </div>
    </div>
  )
}

// ── Header ─────────────────────────────────────────────────────────────────

function SavedHeader({
  count,
  onClearAll,
  confirmClear,
}: {
  count: number
  onClearAll: () => void
  confirmClear: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] sm:p-6">
      {/* Top accent hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-400/[0.04] blur-[50px]" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-label mb-1">Favorites</p>
          <h1 className="text-h1">
            Saved{count > 0 && <span className="ml-2 text-2xl font-medium text-[#6B6B80]">· {count}</span>}
          </h1>
          <p className="mt-1 text-[#A0A0B2]">
            {count === 0 ? 'Save properties and land to revisit them later.' : 'Your saved properties and land parcels.'}
          </p>
        </div>
        {count > 0 && (
          <button
            onClick={onClearAll}
            className={cn(
              'mt-1 shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200',
              confirmClear
                ? 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
                : 'border-white/[0.08] text-[#6B6B80] hover:border-[#EF4444]/30 hover:text-[#EF4444]',
            )}
          >
            {confirmClear ? 'Confirm clear all?' : 'Clear all'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
  icon,
  wide = false,
}: {
  label: string
  value: number | string
  accent: string
  icon: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl px-5 py-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}15` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-xl font-bold text-[#F5F5F7]">{value}</p>
        <p className="text-xs text-[#6B6B80]">{label}</p>
      </div>
    </div>
  )
}

// ── Grid view ──────────────────────────────────────────────────────────────

interface GridProps {
  listings: MockListing[]
  savedAtMap: Map<string, number>
  savedIds: Set<string>
  onToggle: (id: string) => void
  isLandTab: boolean
  isComparing: (id: string) => boolean
  onCompare: (id: string, title: string) => void
}

function SavedGrid({ listings, savedAtMap, savedIds, onToggle, isLandTab, isComparing, onCompare }: GridProps) {
  const cols = isLandTab
    ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={cn('grid gap-5', cols)}>
      {listings.map((listing, i) => (
        <div
          key={listing.id}
          className="animate-slide-up"
          style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}
        >
          <SavedCardWrapper
            listing={listing}
            savedAt={savedAtMap.get(listing.id) ?? 0}
            isSaved={savedIds.has(listing.id)}
            onToggle={onToggle}
            index={i}
            isComparing={isComparing}
            onCompare={onCompare}
          />
        </div>
      ))}
    </div>
  )
}

// ── List view ──────────────────────────────────────────────────────────────

function SavedList({
  listings,
  savedAtMap,
  savedIds,
  onToggle,
  isComparing,
  onCompare,
}: Omit<GridProps, 'isLandTab'>) {
  return (
    <div className="flex flex-col gap-3">
      {listings.map((listing, i) => (
        <div
          key={listing.id}
          className="animate-slide-up"
          style={{ animationDelay: `${Math.min(i, 11) * 30}ms` }}
        >
          {listing.propertyType === 'LAND' ? (
            <div className="relative">
              <MarketplaceLandRow
                listing={listing}
                index={i}
                isSaved={savedIds.has(listing.id)}
                onSave={onToggle}
              />
              <SavedAtChip savedAt={savedAtMap.get(listing.id) ?? 0} />
            </div>
          ) : (
            <div className="relative">
              <PropertyRow
                listing={listing}
                index={i}
                isSaved={savedIds.has(listing.id)}
                onSave={onToggle}
                isComparing={isComparing(listing.id)}
                onCompare={onCompare}
              />
              <SavedAtChip savedAt={savedAtMap.get(listing.id) ?? 0} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Card wrapper — renders card + saved-at timestamp overlay ───────────────

interface CardWrapperProps {
  listing: MockListing
  savedAt: number
  isSaved: boolean
  onToggle: (id: string) => void
  index: number
  isComparing: (id: string) => boolean
  onCompare: (id: string, title: string) => void
}

function SavedCardWrapper({ listing, savedAt, isSaved, onToggle, index, isComparing, onCompare }: CardWrapperProps) {
  return (
    <div className="group relative">
      {listing.propertyType === 'LAND' ? (
        <MarketplaceLandCard
          listing={listing}
          index={index}
          isSaved={isSaved}
          onSave={onToggle}
          priority={index < 4}
        />
      ) : (
        <PropertyCard
          listing={listing}
          index={index}
          isSaved={isSaved}
          onSave={onToggle}
          priority={index < 4}
          isComparing={isComparing(listing.id)}
          onCompare={onCompare}
        />
      )}
      {/* Saved-at timestamp — appears on hover */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between rounded-b-xl px-3 py-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="rounded-full bg-[#020409]/80/80 px-2.5 py-1 text-[10px] text-[#A0A0B2] backdrop-blur-sm">
          Saved {formatSavedAt(savedAt)}
        </span>
      </div>
    </div>
  )
}

// ── Saved-at chip for list rows ────────────────────────────────────────────

function SavedAtChip({ savedAt }: { savedAt: number }) {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-10">
      <span className="rounded-full bg-[#020409]/80/80 px-2 py-0.5 text-[10px] text-[#6B6B80] backdrop-blur-sm">
        {formatSavedAt(savedAt)}
      </span>
    </div>
  )
}

// ── Empty states ───────────────────────────────────────────────────────────

function EmptyAll() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      {/* Animated heart illustration */}
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl">
          <HeartOutlineIcon />
        </div>
        {/* Orbit ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-white/[0.08] animate-[spin_12s_linear_infinite]" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-[#F5F5F7]">Nothing saved yet</h2>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-[#6B6B80]">
        Tap the{' '}
        <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-xs text-[#A0A0B2]">
          <HeartSmallIcon /> save
        </span>{' '}
        icon on any property or land listing to add it here. Saved assets persist across
        sessions.
      </p>

      {/* CTA cards */}
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        <Link
          href="/marketplace"
          className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-5 transition-all hover:border-[#C9A84C]/40 hover:bg-white/[0.04]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C]/10">
            <BuildingGoldIcon />
          </div>
          <span className="text-sm font-medium text-[#F5F5F7]">Browse Properties</span>
          <span className="text-xs text-[#6B6B80]">Residential & commercial</span>
        </Link>
        <Link
          href="/marketplace?category=LAND"
          className="flex flex-col items-center gap-2 rounded-xl border border-[#1E2D1E] bg-[#0D110D] p-5 transition-all hover:border-[#4ADE80]/40 hover:bg-[#111D11]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4ADE80]/10">
            <LandGreenIcon />
          </div>
          <span className="text-sm font-medium text-[#E8F0E8]">Browse Land</span>
          <span className="text-xs text-[#6B6B80]">Parcels & development</span>
        </Link>
      </div>
    </div>
  )
}

function EmptyTab({ tab }: { tab: AssetTab }) {
  const isLand = tab === 'LAND'
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className={cn(
          'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border',
          isLand ? 'border-[#1E2D1E] bg-[#0D110D]' : 'border-white/[0.08] bg-white/[0.04] backdrop-blur-xl',
        )}
      >
        {isLand ? <LandGreenIcon /> : <BuildingGoldIcon />}
      </div>
      <p className="mb-1 text-sm font-medium text-[#A0A0B2]">
        No saved {isLand ? 'land parcels' : 'properties'} yet
      </p>
      <p className="mb-5 text-xs text-[#6B6B80]">
        {isLand
          ? 'Save land parcels from the marketplace to see them here.'
          : 'Save properties from the marketplace to see them here.'}
      </p>
      <Link href="/marketplace">
        <Button variant="secondary" size="sm">
          Browse {isLand ? 'land' : 'properties'}
        </Button>
      </Link>
    </div>
  )
}

// ── View toggle button ─────────────────────────────────────────────────────

function ViewBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center transition-colors',
        active ? 'bg-white/[0.04] text-[#C9A84C]' : 'bg-transparent text-[#6B6B80] hover:text-[#A0A0B2]',
      )}
    >
      {children}
    </button>
  )
}

// ── Inline icons ───────────────────────────────────────────────────────────

function HeartOutlineIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3A3A4E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function HeartSmallIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M3 9h6M3 15h6M15 9h6M15 15h6" />
    </svg>
  )
}

function BuildingGoldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M3 9h6M3 15h6M15 9h6M15 15h6" />
    </svg>
  )
}

function LandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l4-4 4 3 4-5 4 4" /><path d="M3 21h18" />
    </svg>
  )
}

function LandGreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l4-4 4 3 4-5 4 4" /><path d="M3 21h18" />
    </svg>
  )
}

function ValueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
