'use client'

// ---------------------------------------------------------------------------
// SavedListingsClient — Favorites / saved assets page.
//
// Reads saved IDs from SavedListingsContext (localStorage-backed for MVP).
// Intersects with the full listing catalogue passed from the server.
//
// TIGI Hyper-Glass v4 — "Deep Well" architecture:
//   Layer 0: Pitch-black void + massive slow-drift rose/violet orbs (page.tsx)
//   Layer 1: Deep structural well (bg-black, rounded-[22px], ultra-thin border)
//   Layer 2: White-glass floating plates (high backdrop-blur, edge-lit hover)
//
// Layout:
//   ┌─ Header (white-glass plate with rose accent hairline) ─────────────────┐
//   ├─ Stats strip (3 white-glass floating plates with corner glows) ────────┤
//   ├─ Controls plate (tabs + sort + view) ──────────────────────────────────┤
//   ├─ Deep Well structural backdrop ────────────────────────────────────────┤
//   │  └─ Grid / List of floating card plates ───────────────────────────────│
//   └─ Footer (all-shown whisper) ───────────────────────────────────────────┘
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
import { PageHeader } from '@/components/shared/page-header'
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
      <div className="space-y-6">
        <SavedHeader count={0} onClearAll={handleClearAll} confirmClear={confirmClear} />
        <EmptyAll />
      </div>
    )
  }

  const isLandTab = tab === 'LAND'

  return (
    <div className="space-y-6">
      {/* ── Layer 2: Header — white-glass plate ── */}
      <SavedHeader
        count={savedCount}
        onClearAll={handleClearAll}
        confirmClear={confirmClear}
      />

      {/* ── Layer 2: Stats — white-glass floating plates ── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Properties Saved"
          value={propertyCount}
          accent="#FB7185"
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
        />
      </div>

      {/* ── Layer 2: Controls — white-glass plate (tabs + toolbar) ── */}
      <div className="relative mt-8 overflow-hidden rounded-[22px] border border-white/[0.04] bg-white/[0.03] backdrop-blur-3xl shadow-2xl">
        {/* Paragon top-edge rose accent */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-400/20 to-transparent" />

        {/* Tab bar */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-white/[0.04] px-2">
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
                'relative flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200',
                tab === id ? 'text-white' : 'text-white/50 hover:text-white/40',
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    tab === id
                      ? id === 'LAND'
                        ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/25 shadow-[0_0_8px_rgba(52,211,153,0.2)]'
                        : 'bg-rose-400/15 text-rose-400 border border-rose-400/25 shadow-[0_0_8px_rgba(251,113,133,0.2)]'
                      : 'bg-white/[0.03] text-white/50 border border-white/[0.05]',
                  )}
                >
                  {count}
                </span>
              )}
              {tab === id && (
                <span
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full',
                    id === 'LAND'
                      ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5),0_2px_8px_rgba(52,211,153,0.2)]'
                      : 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5),0_2px_8px_rgba(251,113,133,0.2)]',
                  )}
                />
              )}
            </button>
          ))}
        </div>

        {/* Sort + view toolbar */}
        <div className="flex items-center gap-3 px-4 py-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className={cn(
              'rounded-xl border border-white/[0.06] bg-black/40 backdrop-blur-3xl',
              'px-3 py-2 text-sm text-white/60',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
              'outline-none transition-all duration-200',
              'focus:border-rose-400/30 focus:shadow-[0_0_14px_rgba(251,113,133,0.08)]',
            )}
          >
            <option value="DATE_SAVED">Date Saved</option>
            <option value="PRICE_DESC">Price: High → Low</option>
            <option value="PRICE_ASC">Price: Low → High</option>
            <option value="TITLE">Title A–Z</option>
          </select>

          {/* View toggle — structural */}
          <div className="flex overflow-hidden rounded-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <ViewBtn active={view === 'grid'} onClick={() => setView('grid')} title="Grid">
              <GridIcon />
            </ViewBtn>
            <ViewBtn active={view === 'list'} onClick={() => setView('list')} title="List">
              <ListIcon />
            </ViewBtn>
          </div>

          <span className="ml-auto text-xs text-white/50">
            {sorted.length} {sorted.length === 1 ? 'asset' : 'assets'}
          </span>
        </div>
      </div>

      {/* ── Layer 1: Deep Well structural backdrop ── */}
      <div className="group/well relative overflow-hidden rounded-[22px] border border-white/[0.04] bg-black backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-white/[0.06]">
        {/* Paragon edge light — rose/emerald per tab */}
        <div
          className={cn(
            'pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent to-transparent transition-all duration-500',
            isLandTab
              ? 'via-emerald-400/[0.06] group-hover/well:via-emerald-400/[0.15]'
              : 'via-rose-400/[0.06] group-hover/well:via-rose-400/[0.15]',
          )}
          aria-hidden="true"
        />

        {/* Inner atmospheric orbs — Deep Well interior glow */}
        <div
          className={cn(
            'pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full blur-[100px] opacity-20 transition-opacity duration-700 group-hover/well:opacity-40',
            isLandTab ? 'bg-emerald-500' : 'bg-rose-500',
          )}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-violet-500/20 blur-[80px] opacity-20 transition-opacity duration-700 group-hover/well:opacity-40" aria-hidden="true" />
        <div
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full blur-[60px] opacity-10',
            isLandTab ? 'bg-cyan-500' : 'bg-pink-500',
          )}
          aria-hidden="true"
        />

        {/* Layer 2: Floating card plates inside the well */}
        <div className="relative p-6 sm:p-8">
          {sorted.length === 0 ? (
            <EmptyTab tab={tab} />
          ) : view === 'grid' ? (
            <SavedGrid
              listings={sorted}
              savedAtMap={savedAtMap}
              savedIds={savedIds}
              onToggle={toggleSave}
              isLandTab={isLandTab}
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

      {/* ── All shown whisper ── */}
      {sorted.length > 0 && (
        <p className="pt-2 text-center text-xs text-white/45">
          All {sorted.length} saved {sorted.length === 1 ? 'asset' : 'assets'} shown
        </p>
      )}
    </div>
  )
}

// ── Header — white-glass plate with rose accent ─────────────────────────

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
    <PageHeader
      eyebrow="Saved"
      title={count > 0 ? `Saved · ${count}` : 'Saved'}
      description={count === 0 ? 'Save properties and land to come back to them later.' : 'Properties and land you are keeping an eye on.'}
      actions={
        count > 0 ? (
          <button
            onClick={onClearAll}
            className={cn('btn-glass !px-4 !py-2 text-sm', confirmClear && '!border-red-400/40 !text-red-300')}
          >
            {confirmClear ? 'Confirm: clear all?' : 'Clear all'}
          </button>
        ) : undefined
      }
    />
  )
}

// ── Stat card — white-glass floating plate with corner glow ─────────────

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: number | string
  accent: string
  icon: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-white/[0.04] bg-white/[0.03] backdrop-blur-3xl px-6 py-6 transition-all duration-300 hover:border-white/[0.04] hover:bg-white/[0.05] hover:-translate-y-0.5 shadow-2xl">
      {/* Paragon top-edge lighting */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-all duration-500 group-hover:via-white/[0.12]" aria-hidden="true" />
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-[40px] opacity-30 transition-opacity duration-500 group-hover:opacity-60"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.3)]"
          style={{ backgroundColor: `${accent}0a` }}
        >
          <span style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent}80)` }}>{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">{value}</p>
          <p className="text-xs text-white/50">{label}</p>
        </div>
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
    <div className={cn('grid gap-6', cols)}>
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

// ── Card wrapper — floating plate + saved-at timestamp ───────────────────

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
        <span className="rounded-full border border-white/[0.06] bg-black/80 px-2.5 py-1 text-[10px] text-white/60 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]">
          Saved {formatSavedAt(savedAt)}
        </span>
      </div>
    </div>
  )
}

// ── Saved-at chip for list rows ──────────────────────────────────────────

function SavedAtChip({ savedAt }: { savedAt: number }) {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-10">
      <span className="rounded-full border border-white/[0.06] bg-black/80 px-2 py-0.5 text-[10px] text-white/55 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]">
        {formatSavedAt(savedAt)}
      </span>
    </div>
  )
}

// ── Empty states ─────────────────────────────────────────────────────────

function EmptyAll() {
  return (
    <div className="relative mt-12 flex flex-col items-center text-center overflow-hidden">
      {/* Glassflow 3-layer centerpiece */}
      <div className="relative mb-7">
        {/* Layer 1: Massive diffused backlight */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-rose-500/20 blur-[80px] opacity-60" aria-hidden="true" />
        {/* Layer 2: Secondary halo ring */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-rose-500/10 blur-[30px] opacity-40" aria-hidden="true" />
        {/* Layer 3: Frosted glass shell */}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-2xl backdrop-blur-md">
          <HeartOutlineIcon />
        </div>
        {/* Orbit ring */}
        <div className="absolute inset-[-8px] rounded-full border border-dashed border-white/[0.06] animate-[spin_12s_linear_infinite]" />
      </div>

      <h2 className="mb-2 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">Nothing saved yet</h2>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-white/55">
        Tap the{' '}
        <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-xs text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <HeartSmallIcon /> save
        </span>{' '}
        icon on any property or land listing to add it here. Saved assets persist across
        sessions.
      </p>

      {/* CTA cards — white-glass floating plates */}
      <div className="grid w-full max-w-sm grid-cols-2 gap-4">
        <Link
          href="/marketplace"
          className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-[22px] border border-white/[0.04] bg-white/[0.03] backdrop-blur-3xl p-6 transition-all duration-300 hover:border-rose-400/20 hover:bg-white/[0.06] hover:-translate-y-0.5 shadow-2xl"
        >
          <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-400/15 to-transparent" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-rose-400/[0.08] blur-[25px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/15 bg-rose-400/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <BuildingGoldIcon />
          </div>
          <span className="relative text-sm font-medium text-white">Browse Properties</span>
          <span className="relative text-xs text-white/50">Residential & commercial</span>
        </Link>
        <Link
          href="/marketplace?category=LAND"
          className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-[22px] border border-white/[0.04] bg-white/[0.03] backdrop-blur-3xl p-6 transition-all duration-300 hover:border-emerald-400/20 hover:bg-white/[0.06] hover:-translate-y-0.5 shadow-2xl"
        >
          <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/15 to-transparent" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-emerald-400/[0.08] blur-[25px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <LandGreenIcon />
          </div>
          <span className="relative text-sm font-medium text-white">Browse Land</span>
          <span className="relative text-xs text-white/50">Parcels & development</span>
        </Link>
      </div>
    </div>
  )
}

function EmptyTab({ tab }: { tab: AssetTab }) {
  const isLand = tab === 'LAND'
  return (
    <div className="relative flex flex-col items-center justify-center py-20 text-center overflow-hidden">
      {/* Glassflow 3-layer centerpiece */}
      <div className="relative mb-5">
        {/* Layer 1: Diffused backlight */}
        <div className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full blur-[60px] opacity-50',
          isLand ? 'bg-emerald-400/20' : 'bg-rose-400/20',
        )} aria-hidden="true" />
        {/* Layer 2: Halo */}
        <div className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full blur-[25px] opacity-30',
          isLand ? 'bg-emerald-400/10' : 'bg-rose-400/10',
        )} aria-hidden="true" />
        {/* Layer 3: Glass shell */}
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-2xl backdrop-blur-md">
          {isLand ? <LandGreenIcon /> : <BuildingGoldIcon />}
        </div>
      </div>
      <p className="mb-1 text-sm font-medium text-white/60">
        No saved {isLand ? 'land parcels' : 'properties'} yet
      </p>
      <p className="mb-5 text-xs text-white/50">
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

// ── View toggle button ───────────────────────────────────────────────────

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
        'flex h-9 w-9 items-center justify-center transition-all',
        active
          ? 'bg-white/[0.06] text-rose-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_8px_rgba(251,113,133,0.1)]'
          : 'bg-transparent text-white/50 hover:text-white/40',
      )}
    >
      {children}
    </button>
  )
}

// ── Inline icons ─────────────────────────────────────────────────────────

function HeartOutlineIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400 drop-shadow-[0_0_15px_currentColor]">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400" style={{ filter: 'drop-shadow(0 0 6px rgba(251,113,133,0.4))' }}>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.4))' }}>
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
