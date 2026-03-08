'use client'

// ---------------------------------------------------------------------------
// SellerListingsClient — Seller / property owner dashboard.
//
// Layout:
//   ┌─ Stats strip (4 KPI tiles) ──────────────────────────────────────────┐
//   ├─ Tab bar (All | Active | Pending | Draft | Paused | Archived) ────────┤
//   ├─ Toolbar (search + sort + view toggle) ────────────────────────────────┤
//   ├─ Table (md+) / Card stack (mobile) ───────────────────────────────────┤
//   └─ Empty state ──────────────────────────────────────────────────────────┘
//
// DB integration path: component is data-source-agnostic; swap prop with
//   server-fetched data. All filter/sort logic is client-side for now.
// ---------------------------------------------------------------------------

import React, { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  type SellerListing,
  type SellerListingStatus,
  getSellerStats,
  formatPrice,
  formatDate,
} from '@/lib/listings/seller-mock-data'

// ── Types ──────────────────────────────────────────────────────────────────

type TabFilter = SellerListingStatus | 'ALL'
type SortKey = 'updatedAt' | 'createdAt' | 'price' | 'viewCount' | 'title'
type ViewMode = 'table' | 'cards'

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SellerListingStatus,
  { label: string; dotColor: string; badgeBg: string; badgeText: string }
> = {
  ACTIVE: {
    label: 'Active',
    dotColor: '#22C55E',
    badgeBg: 'rgba(34,197,94,0.10)',
    badgeText: '#4ADE80',
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    dotColor: '#F59E0B',
    badgeBg: 'rgba(245,158,11,0.10)',
    badgeText: '#FBB03B',
  },
  DRAFT: {
    label: 'Draft',
    dotColor: '#6B6B80',
    badgeBg: 'rgba(107,107,128,0.12)',
    badgeText: '#A0A0B2',
  },
  PAUSED: {
    label: 'Paused',
    dotColor: '#60A5FA',
    badgeBg: 'rgba(96,165,250,0.10)',
    badgeText: '#93C5FD',
  },
  ARCHIVED: {
    label: 'Archived',
    dotColor: '#3A3A4E',
    badgeBg: 'rgba(58,58,78,0.20)',
    badgeText: '#6B6B80',
  },
}

const TABS: { id: TabFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'PENDING_REVIEW', label: 'Pending' },
  { id: 'DRAFT', label: 'Drafts' },
  { id: 'PAUSED', label: 'Paused' },
  { id: 'ARCHIVED', label: 'Archived' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'price', label: 'Price' },
  { value: 'viewCount', label: 'Most Viewed' },
  { value: 'title', label: 'Title A–Z' },
]

// ── Subtype labels ─────────────────────────────────────────────────────────

const SUBTYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  INDUSTRIAL: 'Industrial',
  MIXED_USE: 'Mixed-Use',
  AGRICULTURAL: 'Agricultural',
  RESIDENTIAL_DEV: 'Residential Dev',
  COMMERCIAL_DEV: 'Commercial Dev',
  RECREATIONAL: 'Recreational',
  WATERFRONT: 'Waterfront',
  RURAL: 'Rural / Ranch',
}

const LISTING_TYPE_LABELS: Record<string, string> = {
  BUY: 'For Sale',
  LEASE: 'For Lease',
  BOTH: 'Sale / Lease',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function displayPrice(listing: SellerListing): string {
  if (listing.listingType === 'LEASE' && listing.leaseRateMonthly) {
    return `${formatPrice(listing.leaseRateMonthly)}/mo`
  }
  if (listing.price) return formatPrice(listing.price)
  if (listing.leaseRateMonthly) return `${formatPrice(listing.leaseRateMonthly)}/mo`
  return '—'
}

function getSubtitle(listing: SellerListing): string {
  const parts: string[] = []
  if (listing.assetType === 'LAND') {
    if (listing.lotAcres) parts.push(`${listing.lotAcres.toLocaleString()} ac`)
    if (listing.zoningCode) parts.push(listing.zoningCode)
  } else {
    if (listing.sqft) parts.push(`${listing.sqft.toLocaleString()} sq ft`)
    if (listing.bedrooms) parts.push(`${listing.bedrooms} bd`)
    if (listing.bathrooms) parts.push(`${listing.bathrooms} ba`)
  }
  return parts.join(' · ')
}

function sortListings(listings: SellerListing[], key: SortKey): SellerListing[] {
  return [...listings].sort((a, b) => {
    switch (key) {
      case 'price':
        return (b.price ?? 0) - (a.price ?? 0)
      case 'viewCount':
        return b.viewCount - a.viewCount
      case 'title':
        return a.title.localeCompare(b.title)
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'updatedAt':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })
}

// ── Component props ────────────────────────────────────────────────────────

interface SellerListingsClientProps {
  listings: SellerListing[]
}

// ── Root component ─────────────────────────────────────────────────────────

export function SellerListingsClient({ listings }: SellerListingsClientProps) {
  const [tab, setTab] = useState<TabFilter>('ALL')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('updatedAt')
  const [view, setView] = useState<ViewMode>('table')

  const stats = useMemo(() => getSellerStats(listings), [listings])

  const filtered = useMemo(() => {
    let result = listings

    if (tab !== 'ALL') result = result.filter((l) => l.status === tab)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          SUBTYPE_LABELS[l.subtype]?.toLowerCase().includes(q),
      )
    }

    return sortListings(result, sort)
  }, [listings, tab, search, sort])

  // Counts per tab for badge display
  const tabCounts = useMemo(() => {
    const counts: Partial<Record<TabFilter, number>> = { ALL: listings.filter((l) => l.status !== 'ARCHIVED').length }
    for (const l of listings) {
      counts[l.status] = (counts[l.status] ?? 0) + 1
    }
    return counts
  }, [listings])

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      {/* ── Page header ── */}
      <PageHeader
        eyebrow="Seller Dashboard"
        title="My Listings"
        description="Manage your properties and land parcels listed on the TIGI marketplace."
        actions={
          <Link href="/listings/new">
            <Button variant="primary" size="md">
              <PlusIcon />
              New Listing
            </Button>
          </Link>
        }
      />

      {/* ── Stats strip ── */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Active Listings"
          value={stats.active}
          accent="#C9A84C"
          icon={<CheckCircleIcon />}
        />
        <StatTile
          label="Pending Review"
          value={stats.pending}
          accent="#F59E0B"
          icon={<ClockIcon />}
        />
        <StatTile
          label="Total Views"
          value={stats.totalViews.toLocaleString()}
          accent="#60A5FA"
          icon={<EyeIcon />}
        />
        <StatTile
          label="Total Inquiries"
          value={stats.totalInquiries.toLocaleString()}
          accent="#A78BFA"
          icon={<MessageIcon />}
        />
      </div>

      {/* ── Portfolio value callout ── */}
      {stats.totalPortfolioValue > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#2A2A3A] bg-[#111118] px-5 py-3">
          <span className="text-sm text-[#6B6B80]">Active listing portfolio value</span>
          <span className="text-lg font-bold text-[#C9A84C]">
            {formatPrice(stats.totalPortfolioValue)}
          </span>
        </div>
      )}

      {/* ── Tabs + toolbar ── */}
      <div className="mt-8 space-y-3">
        {/* Tab bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[#2A2A3A] pb-0">
          {TABS.map((t) => {
            const count = tabCounts[t.id]
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                  'focus-visible:outline-none',
                  isActive ? 'text-[#F5F5F7]' : 'text-[#6B6B80] hover:text-[#A0A0B2]',
                )}
              >
                {t.label}
                {count !== undefined && count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                      isActive
                        ? 'bg-[#C9A84C] text-[#0A0A0F]'
                        : 'bg-[#22222E] text-[#6B6B80]',
                    )}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#C9A84C]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-0 flex-1 max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B6B80]" />
            <input
              type="text"
              placeholder="Search listings…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full rounded-lg border border-[#2A2A3A] bg-[#22222E]',
                'py-2 pl-9 pr-4 text-sm text-[#F5F5F7] placeholder:text-[#6B6B80]',
                'outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20',
                'transition-colors duration-150',
              )}
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={cn(
              'rounded-lg border border-[#2A2A3A] bg-[#22222E]',
              'px-3 py-2 text-sm text-[#A0A0B2]',
              'outline-none focus:border-[#C9A84C]',
              'transition-colors duration-150',
            )}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-[#2A2A3A] overflow-hidden">
            <ViewToggleBtn
              active={view === 'table'}
              onClick={() => setView('table')}
              title="Table view"
            >
              <TableIcon />
            </ViewToggleBtn>
            <ViewToggleBtn
              active={view === 'cards'}
              onClick={() => setView('cards')}
              title="Card view"
            >
              <GridIcon />
            </ViewToggleBtn>
          </div>

          {/* Result count */}
          <span className="ml-auto text-xs text-[#6B6B80]">
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState tab={tab} search={search} />
        ) : view === 'table' ? (
          <ListingsTable listings={filtered} />
        ) : (
          <ListingsCards listings={filtered} />
        )}
      </div>
    </div>
  )
}

// ── Stat tile ──────────────────────────────────────────────────────────────

interface StatTileProps {
  label: string
  value: string | number
  accent: string
  icon: React.ReactNode
}

function StatTile({ label, value, accent, icon }: StatTileProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#2A2A3A] bg-[#111118] p-4">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}15` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#F5F5F7]">{value}</p>
        <p className="mt-0.5 text-xs text-[#6B6B80]">{label}</p>
      </div>
    </div>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SellerListingStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: cfg.dotColor }}
      />
      {cfg.label}
    </span>
  )
}

// ── Asset type badge ───────────────────────────────────────────────────────

function AssetTypeBadge({ listing }: { listing: SellerListing }) {
  const isLand = listing.assetType === 'LAND'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        isLand
          ? 'bg-[rgba(74,222,128,0.08)] text-[#4ADE80]'
          : 'bg-[rgba(201,168,76,0.08)] text-[#C9A84C]',
      )}
    >
      {isLand ? <LandDotIcon /> : <BuildingDotIcon />}
      {isLand ? 'Land' : 'Property'}
    </span>
  )
}

// ── Quick action menu ──────────────────────────────────────────────────────

interface ActionMenuProps {
  listing: SellerListing
}

function ActionMenu({ listing }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const canPublish = listing.status === 'DRAFT' || listing.status === 'PAUSED'
  const canPause = listing.status === 'ACTIVE'
  const canArchive = listing.status !== 'ARCHIVED'
  const canEdit = listing.status !== 'ARCHIVED'
  const canPreview = listing.status === 'ACTIVE' || listing.status === 'PENDING_REVIEW'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2A3A] text-[#6B6B80]',
          'transition-colors hover:border-[#C9A84C] hover:text-[#C9A84C]',
          open && 'border-[#C9A84C] text-[#C9A84C]',
        )}
        title="Actions"
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118] shadow-2xl">
          {canEdit && (
            <ActionItem
              href={`/listings/${listing.id}/edit`}
              icon={<EditIcon />}
              label="Edit"
              onClick={() => setOpen(false)}
            />
          )}
          {canPreview && (
            <ActionItem
              href={`/marketplace/${listing.id}`}
              icon={<EyeSmIcon />}
              label="Preview"
              onClick={() => setOpen(false)}
            />
          )}
          {canPublish && (
            <ActionItem
              icon={<PublishIcon />}
              label={listing.status === 'PAUSED' ? 'Resume' : 'Submit to Review'}
              onClick={() => setOpen(false)}
              accent="#C9A84C"
            />
          )}
          {canPause && (
            <ActionItem
              icon={<PauseIcon />}
              label="Pause Listing"
              onClick={() => setOpen(false)}
            />
          )}
          {canArchive && (
            <div className="border-t border-[#2A2A3A]">
              <ActionItem
                icon={<ArchiveIcon />}
                label="Archive"
                onClick={() => setOpen(false)}
                destructive
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ActionItemProps {
  href?: string
  icon: React.ReactNode
  label: string
  onClick: () => void
  accent?: string
  destructive?: boolean
}

function ActionItem({ href, icon, label, onClick, accent, destructive }: ActionItemProps) {
  const cls = cn(
    'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors',
    destructive
      ? 'text-[#EF4444] hover:bg-[#EF4444]/10'
      : 'text-[#A0A0B2] hover:bg-[#1A1A24] hover:text-[#F5F5F7]',
  )
  const style = accent ? { color: accent } : {}

  if (href) {
    return (
      <Link href={href} className={cls} style={style} onClick={onClick}>
        <span className="h-4 w-4 shrink-0">{icon}</span>
        {label}
      </Link>
    )
  }
  return (
    <button className={cls} style={style} onClick={onClick}>
      <span className="h-4 w-4 shrink-0">{icon}</span>
      {label}
    </button>
  )
}

// ── Table view ─────────────────────────────────────────────────────────────

function ListingsTable({ listings }: { listings: SellerListing[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A3A]">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#2A2A3A] bg-[#111118]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
                Listing
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
                Views
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
                Inquiries
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-[#6B6B80]">
                Updated
              </th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F2E] bg-[#0A0A0F]">
            {listings.map((listing, i) => (
              <TableRow key={listing.id} listing={listing} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card stack inside table container */}
      <div className="divide-y divide-[#1F1F2E] md:hidden">
        {listings.map((listing) => (
          <MobileRow key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}

function TableRow({ listing, index }: { listing: SellerListing; index: number }) {
  const isArchived = listing.status === 'ARCHIVED'

  return (
    <tr
      className={cn(
        'group transition-colors duration-100',
        isArchived ? 'opacity-50' : 'hover:bg-[#111118]',
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      {/* Listing cell — thumbnail + title + location */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
            <PlaceholderImage
              slot={listing.imageSlot}
              propertyType={listing.imagePropertyType}
              alt={listing.title}
              fill
            />
            {listing.assetType === 'LAND' && (
              <div className="absolute inset-0 ring-1 ring-inset ring-[#4ADE80]/20 rounded-lg" />
            )}
          </div>
          {/* Title */}
          <div className="min-w-0">
            <p className="truncate font-medium text-[#F5F5F7] max-w-[220px]">{listing.title}</p>
            <p className="mt-0.5 text-xs text-[#6B6B80]">
              {listing.city}, {listing.state}
              {getSubtitle(listing) && (
                <span className="ml-2 text-[#4A4A5E]">· {getSubtitle(listing)}</span>
              )}
            </p>
            {listing.isTokenized && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#C9A84C]">
                <TokenIcon /> Tokenized
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <AssetTypeBadge listing={listing} />
          <span className="text-xs text-[#6B6B80]">{SUBTYPE_LABELS[listing.subtype]}</span>
          <span className="text-[10px] text-[#4A4A5E]">{LISTING_TYPE_LABELS[listing.listingType]}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={listing.status} />
        {listing.status === 'ACTIVE' && listing.expiresAt && (
          <p className="mt-1 text-[10px] text-[#6B6B80]">
            Expires {formatDate(listing.expiresAt)}
          </p>
        )}
        {listing.status === 'PENDING_REVIEW' && (
          <p className="mt-1 text-[10px] text-[#F59E0B]/70">Est. 1–2 days</p>
        )}
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right">
        <span className="font-semibold text-[#F5F5F7]">{displayPrice(listing)}</span>
        {listing.aiEstimatedValue && listing.price && (
          <AiDelta price={listing.price} aiValue={listing.aiEstimatedValue} />
        )}
      </td>

      {/* Views */}
      <td className="px-4 py-3 text-right">
        <span className={listing.viewCount > 0 ? 'text-[#F5F5F7]' : 'text-[#3A3A4E]'}>
          {listing.viewCount > 0 ? listing.viewCount.toLocaleString() : '—'}
        </span>
      </td>

      {/* Inquiries */}
      <td className="px-4 py-3 text-right">
        <span
          className={cn(
            listing.inquiryCount > 0
              ? 'font-semibold text-[#C9A84C]'
              : 'text-[#3A3A4E]',
          )}
        >
          {listing.inquiryCount > 0 ? listing.inquiryCount : '—'}
        </span>
      </td>

      {/* Updated */}
      <td className="px-4 py-3 text-right text-xs text-[#6B6B80]">
        {formatDate(listing.updatedAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
          <ActionMenu listing={listing} />
        </div>
      </td>
    </tr>
  )
}

function MobileRow({ listing }: { listing: SellerListing }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 bg-[#0A0A0F] p-4',
        listing.status === 'ARCHIVED' && 'opacity-50',
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
        <PlaceholderImage
          slot={listing.imageSlot}
          propertyType={listing.imagePropertyType}
          alt={listing.title}
          fill
        />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight text-[#F5F5F7]">{listing.title}</p>
          <ActionMenu listing={listing} />
        </div>
        <p className="text-xs text-[#6B6B80]">
          {listing.city}, {listing.state}
          {getSubtitle(listing) && ` · ${getSubtitle(listing)}`}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StatusBadge status={listing.status} />
          <AssetTypeBadge listing={listing} />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#F5F5F7]">{displayPrice(listing)}</span>
          {listing.viewCount > 0 && (
            <span className="text-xs text-[#6B6B80]">
              {listing.viewCount.toLocaleString()} views
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Cards view ─────────────────────────────────────────────────────────────

function ListingsCards({ listings }: { listings: SellerListing[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing, i) => (
        <ListingCard key={listing.id} listing={listing} index={i} />
      ))}
    </div>
  )
}

function ListingCard({ listing, index }: { listing: SellerListing; index: number }) {
  const isLand = listing.assetType === 'LAND'
  const isArchived = listing.status === 'ARCHIVED'

  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border transition-all duration-200',
        isLand ? 'border-[#1E2D1E] bg-[#0D110D]' : 'border-[#2A2A3A] bg-[#111118]',
        isArchived ? 'opacity-50' : isLand ? 'hover:border-[#4ADE80]/40' : 'hover:border-[#C9A84C]/40',
        'animate-slide-up',
      )}
      style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
    >
      {/* Image */}
      <div className={cn('relative', isLand ? 'aspect-[21/9]' : 'aspect-[16/9]')}>
        <PlaceholderImage
          slot={listing.imageSlot}
          propertyType={listing.imagePropertyType}
          alt={listing.title}
          fill
          priority={index < 4}
        />
        {/* Status overlay pill */}
        <div className="absolute left-3 top-3">
          <StatusBadge status={listing.status} />
        </div>
        {/* Tokenized chip */}
        {listing.isTokenized && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#0A0A0F]/80 px-2 py-1 text-[10px] font-semibold text-[#C9A84C] backdrop-blur-sm">
            <TokenIcon /> Tokenized
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Asset type + subtype */}
        <div className="flex items-center gap-2">
          <AssetTypeBadge listing={listing} />
          <span className="text-xs text-[#6B6B80]">{SUBTYPE_LABELS[listing.subtype]}</span>
        </div>

        {/* Title */}
        <p className="font-semibold leading-snug text-[#F5F5F7] line-clamp-2">{listing.title}</p>

        {/* Location + specs */}
        <p className="text-xs text-[#6B6B80]">
          {listing.city}, {listing.state}
          {getSubtitle(listing) && (
            <span className="ml-1 text-[#4A4A5E]">· {getSubtitle(listing)}</span>
          )}
        </p>

        {/* Divider */}
        <div className={cn('my-1 h-px', isLand ? 'bg-[#1E2D1E]' : 'bg-[#1F1F2E]')} />

        {/* Price row */}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-[#F5F5F7]">{displayPrice(listing)}</span>
          {listing.aiEstimatedValue && listing.price && (
            <AiDelta price={listing.price} aiValue={listing.aiEstimatedValue} />
          )}
        </div>

        {/* Stats row */}
        {(listing.viewCount > 0 || listing.inquiryCount > 0 || listing.saveCount > 0) && (
          <div className="flex items-center gap-3 text-xs text-[#6B6B80]">
            {listing.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <EyeSmIcon /> {listing.viewCount.toLocaleString()}
              </span>
            )}
            {listing.saveCount > 0 && (
              <span className="flex items-center gap-1">
                <HeartSmIcon /> {listing.saveCount}
              </span>
            )}
            {listing.inquiryCount > 0 && (
              <span className="flex items-center gap-1 font-semibold text-[#C9A84C]">
                <MessageSmIcon /> {listing.inquiryCount} inquir{listing.inquiryCount === 1 ? 'y' : 'ies'}
              </span>
            )}
          </div>
        )}

        {/* Date */}
        <p className="text-[10px] text-[#4A4A5E]">Updated {formatDate(listing.updatedAt)}</p>
      </div>

      {/* Footer actions */}
      <div
        className={cn(
          'flex items-center justify-between border-t px-4 py-3',
          isLand ? 'border-[#1E2D1E]' : 'border-[#1F1F2E]',
        )}
      >
        {listing.status === 'DRAFT' ? (
          <Link
            href={`/listings/${listing.id}/edit`}
            className="text-xs font-medium text-[#C9A84C] hover:underline"
          >
            Continue editing →
          </Link>
        ) : listing.status === 'ACTIVE' ? (
          <Link
            href={`/marketplace/${listing.id}`}
            className="text-xs font-medium text-[#A0A0B2] hover:text-[#F5F5F7]"
          >
            View listing →
          </Link>
        ) : listing.status === 'PENDING_REVIEW' ? (
          <span className="text-xs text-[#F59E0B]/80">Under review · est. 1–2 days</span>
        ) : listing.status === 'PAUSED' ? (
          <button className="text-xs font-medium text-[#60A5FA] hover:underline">
            Resume listing
          </button>
        ) : (
          <span className="text-xs text-[#4A4A5E]">Archived</span>
        )}

        <ActionMenu listing={listing} />
      </div>
    </div>
  )
}

// ── AI Delta ──────────────────────────────────────────────────────────────

function AiDelta({ price, aiValue }: { price: number; aiValue: number }) {
  const pct = ((aiValue - price) / price) * 100
  const isUnder = pct > 2
  const isOver = pct < -2
  if (!isUnder && !isOver) return null

  return (
    <span
      className={cn(
        'ml-1 text-[10px] font-medium',
        isUnder ? 'text-[#4ADE80]' : 'text-[#EF4444]',
      )}
    >
      {isUnder ? `▲ ${pct.toFixed(1)}% AI est.` : `▼ ${Math.abs(pct).toFixed(1)}% AI est.`}
    </span>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ tab, search }: { tab: TabFilter; search: string }) {
  const isSearch = search.trim().length > 0

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118]/60 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A24] text-[#6B6B80]">
        {isSearch ? <SearchEmptyIcon /> : <ListingsEmptyIcon />}
      </div>

      <h3 className="mb-1.5 text-base font-semibold text-[#F5F5F7]">
        {isSearch
          ? `No results for "${search}"`
          : tab === 'ALL'
            ? 'No listings yet'
            : `No ${STATUS_CONFIG[tab as SellerListingStatus]?.label ?? tab} listings`}
      </h3>

      <p className="mb-6 max-w-xs text-sm text-[#6B6B80]">
        {isSearch
          ? 'Try a different search term or clear the filter.'
          : tab === 'ALL'
            ? 'Create your first listing to start selling or leasing on the TIGI marketplace.'
            : tab === 'DRAFT'
              ? 'Listings you start but haven\'t submitted will appear here.'
              : tab === 'PENDING_REVIEW'
                ? 'Listings awaiting TIGI compliance review will appear here.'
                : tab === 'ARCHIVED'
                  ? 'Archived listings will appear here.'
                  : 'No listings in this status.'}
      </p>

      {!isSearch && tab === 'ALL' && (
        <Link href="/listings/new">
          <Button variant="primary" size="lg">
            <PlusIcon /> Create Listing
          </Button>
        </Link>
      )}
    </div>
  )
}

// ── Misc sub-components ────────────────────────────────────────────────────

function ViewToggleBtn({
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
        'flex h-9 w-9 items-center justify-center text-sm transition-colors',
        active ? 'bg-[#1A1A24] text-[#C9A84C]' : 'bg-transparent text-[#6B6B80] hover:text-[#A0A0B2]',
      )}
    >
      {children}
    </button>
  )
}

// ── SVG Icons ──────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeSmIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function MessageSmIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function HeartSmIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function PublishIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  )
}

function TableIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="9" x2="9" y2="21" />
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

function TokenIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  )
}

function LandDotIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17l4-4 4 3 4-5 4 4v4H3z" />
    </svg>
  )
}

function BuildingDotIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="2" width="16" height="20" rx="1" />
    </svg>
  )
}

function ListingsEmptyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function SearchEmptyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}
