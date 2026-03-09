'use client'

// ---------------------------------------------------------------------------
// compare-client.tsx — Side-by-side property comparison grid.
//
// Rendered by /compare page. Shows 2–3 listings in a responsive column grid
// with labelled row-based attribute comparison:
//   • Price + AI valuation delta
//   • Property type + listing type
//   • Size specs (sqft / beds / baths / acres)
//   • Year built
//   • Tokenization / investment info
//   • Features
//   • Action CTAs (Invest / View Listing)
//
// No props drilling needed — listings are passed from the server page.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Zap,
  Check,
  Minus,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { InvestModal } from '@/components/marketplace/invest-modal'
import type { MockListing, PropertyType } from '@/lib/marketplace/mock-data'
import { formatPrice, tokenSoldPercent } from '@/lib/marketplace/mock-data'

// ── Type helpers ──────────────────────────────────────────────────────────

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL:  'Commercial',
  LAND:        'Land',
  INDUSTRIAL:  'Industrial',
  MIXED_USE:   'Mixed Use',
}

const TYPE_BADGE: Record<PropertyType, string> = {
  RESIDENTIAL: 'bg-[#1A1A24]/90 text-[#A0A0B2] ring-[#2A2A3A]',
  COMMERCIAL:  'bg-[#3B82F6]/15 text-[#60A5FA] ring-[#3B82F6]/25',
  LAND:        'bg-[#22C55E]/15 text-[#4ADE80] ring-[#22C55E]/25',
  INDUSTRIAL:  'bg-[#F59E0B]/15 text-[#FCD34D] ring-[#F59E0B]/25',
  MIXED_USE:   'bg-[#C9A84C]/15 text-[#C9A84C] ring-[#C9A84C]/25',
}

function formatVal(v: number | null | undefined, prefix = '', suffix = '') {
  if (v == null) return null
  return `${prefix}${v.toLocaleString()}${suffix}`
}

// ── Section header row ────────────────────────────────────────────────────

function SectionRow({ label, cols }: { label: string; cols: number }) {
  return (
    <div
      className="col-span-full grid border-t border-[#1E1E2A] bg-[#0D0D14] px-4 py-2.5"
      style={{ gridTemplateColumns: `1fr repeat(${cols}, 1fr)` }}
    >
      <p className="col-span-full text-[10px] font-semibold uppercase tracking-widest text-[#4A4A60]">
        {label}
      </p>
    </div>
  )
}

// ── Data row ──────────────────────────────────────────────────────────────

function DataRow({
  label,
  values,
  highlight,
}: {
  label:     string
  values:    (React.ReactNode | null)[]
  highlight?: number  // index of the "best" column to gold-highlight
}) {
  return (
    <div
      className={cn(
        'col-span-full grid border-t border-[#1A1A24] px-4 py-3',
      )}
      style={{ gridTemplateColumns: `180px repeat(${values.length}, 1fr)` }}
    >
      <span className="self-start text-xs text-[#6B6B80]">{label}</span>
      {values.map((v, i) => (
        <span
          key={i}
          className={cn(
            'self-start text-sm font-medium',
            v == null    ? 'text-[#3A3A48]'  : 'text-[#F5F5F7]',
            i === highlight && v != null && 'text-[#C9A84C]',
          )}
        >
          {v ?? <Minus className="inline h-3 w-3" />}
        </span>
      ))}
    </div>
  )
}

// ── AI delta badge ────────────────────────────────────────────────────────

function AiDelta({ listPrice, estimated }: { listPrice: number; estimated: number }) {
  const delta    = estimated - listPrice
  const deltaPct = Math.round((delta / listPrice) * 100)
  const pos      = delta >= 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset',
        pos
          ? 'bg-[#22C55E]/10 text-[#4ADE80] ring-[#22C55E]/20'
          : 'bg-[#EF4444]/10 text-[#F87171] ring-[#EF4444]/20',
      )}
    >
      {pos ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {pos ? '+' : ''}{deltaPct}%
    </span>
  )
}

// ── Single column header (image + title + CTA) ────────────────────────────

function PropertyHeader({
  listing,
  onInvest,
}: {
  listing:  MockListing
  onInvest: (l: MockListing) => void
}) {
  const soldPct = tokenSoldPercent(listing)

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Image */}
      <div className="overflow-hidden rounded-xl">
        <PlaceholderImage
          slot={listing.imageSlot}
          propertyType={listing.imagePropertyType}
          alt={listing.title}
          className="aspect-[4/3] w-full"
        />
      </div>

      {/* Type badge */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset',
            TYPE_BADGE[listing.propertyType],
          )}
        >
          {PROPERTY_TYPE_LABELS[listing.propertyType]}
        </span>
        {listing.isTokenized && (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A84C]/15 px-2 py-0.5 text-[10px] font-medium text-[#C9A84C] ring-1 ring-inset ring-[#C9A84C]/25">
            <Zap className="h-2.5 w-2.5" />
            Tokenized
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <h3 className="font-heading text-sm font-semibold leading-snug text-[#F5F5F7] line-clamp-2">
          {listing.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-[#6B6B80]">
          <MapPin className="h-3 w-3 shrink-0" />
          {listing.city}, {listing.state}
        </p>
      </div>

      {/* Price */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#4A4A60]">List Price</p>
        <p className="font-heading text-xl font-bold text-white">
          {formatPrice(listing.price)}
        </p>
        {listing.isTokenized && listing.tokenPricePerFraction && (
          <p className="text-xs text-[#C9A84C]">
            from ${listing.tokenPricePerFraction.toLocaleString()}
            <span className="text-[10px] text-[#6B6B80]">/fraction</span>
          </p>
        )}
      </div>

      {/* Token progress */}
      {listing.isTokenized && listing.tokenTotalSupply && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#6B6B80]">
            <span>{soldPct}% subscribed</span>
            <span className="flex items-center gap-1">
              <Users className="h-2.5 w-2.5" />
              {listing.tokenInvestorCount ?? 0}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-[#2A2A3A]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B8932F] to-[#C9A84C]"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-2 pt-1">
        {listing.isTokenized && listing.tokenPricePerFraction && (
          <button
            type="button"
            onClick={() => onInvest(listing)}
            className="w-full rounded-xl bg-[#C9A84C] py-2.5 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4B55A] active:scale-[0.98]"
          >
            <Zap className="mr-1.5 inline h-3.5 w-3.5" />
            Invest from ${listing.tokenPricePerFraction.toLocaleString()}
          </button>
        )}
        <Link
          href={`/marketplace/${listing.id}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#2A2A3A] py-2.5 text-sm font-medium text-[#A0A0B2] transition-colors hover:border-[#C9A84C]/30 hover:text-[#F5F5F7]"
        >
          View full listing
        </Link>
      </div>
    </div>
  )
}

// ── Feature row — special cell rendering ─────────────────────────────────

function FeaturesRow({ listings }: { listings: MockListing[] }) {
  return (
    <div
      className="col-span-full grid border-t border-[#1A1A24] px-4 py-3"
      style={{ gridTemplateColumns: `180px repeat(${listings.length}, 1fr)` }}
    >
      <span className="pt-1 text-xs text-[#6B6B80]">Highlights</span>
      {listings.map((l) => (
        <div key={l.id} className="flex flex-wrap gap-1.5">
          {l.features.slice(0, 4).map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-md border border-[#2A2A3A] bg-[#111118] px-2 py-1 text-[10px] text-[#6B6B80]"
            >
              <Check className="h-2.5 w-2.5 shrink-0 text-[#C9A84C]" />
              {f}
            </span>
          ))}
          {l.features.length > 4 && (
            <span className="text-[10px] text-[#4A4A60]">+{l.features.length - 4} more</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────

interface CompareClientProps {
  listings: MockListing[]
}

export function CompareClient({ listings }: CompareClientProps) {
  const [investTarget, setInvestTarget] = useState<MockListing | null>(null)

  const count = listings.length

  if (count < 2) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-heading text-lg font-semibold text-[#F5F5F7]">
          Select at least 2 properties to compare
        </p>
        <p className="max-w-sm text-sm text-[#6B6B80]">
          Browse the marketplace and use the compare button on property cards to build your comparison.
        </p>
        <Link
          href="/marketplace"
          className="mt-2 flex items-center gap-1.5 rounded-xl border border-[#2A2A3A] px-5 py-2.5 text-sm font-medium text-[#A0A0B2] transition-colors hover:border-[#C9A84C]/30 hover:text-[#F5F5F7]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
      </div>
    )
  }

  // ── Derived best-value highlights ────────────────────────────────────────
  const prices = listings.map((l) => l.price)
  const lowestPriceIdx = prices.indexOf(Math.min(...prices))

  const sqfts = listings.map((l) => l.sqft ?? 0)
  const largestSqftIdx = sqfts.indexOf(Math.max(...sqfts))

  const aiVals = listings.map((l) => l.aiEstimatedValue ?? 0)
  const bestAiIdx = aiVals.indexOf(Math.max(...aiVals))

  return (
    <div className="animate-fade-in pb-16 pt-6">
      {/* Back nav */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/marketplace"
          className="flex items-center gap-1.5 text-xs text-[#6B6B80] transition-colors hover:text-[#A0A0B2]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Marketplace
        </Link>
        <span className="text-[#3A3A48]">/</span>
        <span className="text-xs text-[#A0A0B2]">Compare ({count} properties)</span>
      </div>

      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-[#F5F5F7]">Property Comparison</h1>
        <p className="mt-1 text-sm text-[#6B6B80]">
          Side-by-side analysis of {count} selected properties.
          <Link href="/marketplace" className="ml-1.5 text-[#C9A84C] hover:opacity-80">
            Change selection
          </Link>
        </p>
      </div>

      {/* Comparison grid */}
      <div className="overflow-x-auto rounded-2xl border border-[#2A2A3A] bg-[#0A0A0F]">
        {/* ── Column headers (property cards) ─────────────────────────── */}
        <div
          className="grid border-b border-[#2A2A3A]"
          style={{ gridTemplateColumns: `180px repeat(${count}, 1fr)`, minWidth: '600px' }}
        >
          {/* Row label cell */}
          <div className="border-r border-[#1E1E2A] bg-[#0D0D14] p-4">
            <p className="text-xs font-semibold text-[#4A4A60]">Property</p>
          </div>
          {listings.map((l) => (
            <div key={l.id} className="border-l border-[#1E1E2A] first:border-l-0">
              <PropertyHeader listing={l} onInvest={(listing) => setInvestTarget(listing)} />
            </div>
          ))}
        </div>

        {/* ── Row-based comparison ─────────────────────────────────────── */}
        <div style={{ minWidth: '600px' }}>

          {/* PRICING */}
          <div
            className="grid border-t border-[#2A2A3A] bg-[#0D0D14] px-4 py-2.5"
            style={{ gridTemplateColumns: `180px repeat(${count}, 1fr)` }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A60]">Pricing</p>
          </div>

          <DataRow
            label="List price"
            values={listings.map((l) => formatPrice(l.price))}
            highlight={lowestPriceIdx}
          />

          <DataRow
            label="Price per sqft"
            values={listings.map((l) =>
              l.sqft && l.price ? `$${Math.round(l.price / l.sqft).toLocaleString()}` : null,
            )}
          />

          <DataRow
            label="Price per acre"
            values={listings.map((l) =>
              l.lotAcres ? `$${Math.round(l.price / l.lotAcres).toLocaleString()}` : null,
            )}
          />

          <DataRow
            label="AI estimated value"
            values={listings.map((l, i) =>
              l.aiEstimatedValue ? (
                <span key={i} className="flex flex-col gap-1">
                  <span>{formatPrice(l.aiEstimatedValue)}</span>
                  <AiDelta listPrice={l.price} estimated={l.aiEstimatedValue} />
                </span>
              ) : null,
            )}
            highlight={bestAiIdx}
          />

          {/* SPECS */}
          <div
            className="grid border-t border-[#2A2A3A] bg-[#0D0D14] px-4 py-2.5"
            style={{ gridTemplateColumns: `180px repeat(${count}, 1fr)` }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A60]">Specs</p>
          </div>

          <DataRow
            label="Total area"
            values={listings.map((l) => formatVal(l.sqft, '', ' sqft'))}
            highlight={largestSqftIdx}
          />
          <DataRow
            label="Bedrooms"
            values={listings.map((l) => formatVal(l.bedrooms))}
          />
          <DataRow
            label="Bathrooms"
            values={listings.map((l) => formatVal(l.bathrooms))}
          />
          <DataRow
            label="Lot size"
            values={listings.map((l) => formatVal(l.lotAcres, '', ' acres'))}
          />
          <DataRow
            label="Year built"
            values={listings.map((l) => formatVal(l.yearBuilt))}
          />
          <DataRow
            label="Listing type"
            values={listings.map((l) =>
              l.listingType === 'BUY'   ? 'For Sale'    :
              l.listingType === 'LEASE' ? 'For Lease'   :
                                         'Buy or Lease',
            )}
          />

          {/* INVESTMENT */}
          <div
            className="grid border-t border-[#2A2A3A] bg-[#0D0D14] px-4 py-2.5"
            style={{ gridTemplateColumns: `180px repeat(${count}, 1fr)` }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A60]">Investment</p>
          </div>

          <DataRow
            label="Fractional"
            values={listings.map((l) =>
              l.isTokenized ? (
                <span className="inline-flex items-center gap-1 text-[#C9A84C]">
                  <Zap className="h-3 w-3" /> Yes
                </span>
              ) : (
                <span className="text-[#4A4A60]">No</span>
              ),
            )}
          />
          <DataRow
            label="Entry price"
            values={listings.map((l) =>
              l.isTokenized && l.tokenPricePerFraction
                ? `$${l.tokenPricePerFraction.toLocaleString()}/fraction`
                : null,
            )}
          />
          <DataRow
            label="Total fractions"
            values={listings.map((l) =>
              l.isTokenized ? formatVal(l.tokenTotalSupply) : null,
            )}
          />
          <DataRow
            label="Available"
            values={listings.map((l) =>
              l.isTokenized ? formatVal(l.tokenAvailableSupply) : null,
            )}
          />
          <DataRow
            label="Investors"
            values={listings.map((l) =>
              l.isTokenized ? formatVal(l.tokenInvestorCount) : null,
            )}
          />

          {/* HIGHLIGHTS */}
          <div
            className="grid border-t border-[#2A2A3A] bg-[#0D0D14] px-4 py-2.5"
            style={{ gridTemplateColumns: `180px repeat(${count}, 1fr)` }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A60]">Highlights</p>
          </div>

          {/* Features row (custom layout) */}
          <FeaturesRow listings={listings} />

        </div>
      </div>

      {/* Legal note */}
      <p className="mt-4 text-center text-[10px] text-[#3A3A48]">
        AI valuations are estimates only. Fractional tokens represent economic interest, not legal title or securities.
      </p>

      {/* InvestModal */}
      {investTarget && (
        <InvestModal
          listing={investTarget}
          isOpen
          onClose={() => setInvestTarget(null)}
        />
      )}
    </div>
  )
}
