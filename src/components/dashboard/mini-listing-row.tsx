import Link from 'next/link'
import { Coins } from 'lucide-react'
import { type MockListing } from '@/lib/marketplace/mock-data'
import { PlaceholderImage } from '@/components/shared/placeholder-image'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// MiniListingRow — Compact horizontal listing preview for dashboard sections.
//
// Used in:
//   - "Recommended for you" — top 3-4 curated listings
//   - "Watchlist" — user's saved listings preview
//
// Deliberately lighter than the full PropertyCard / LandCard.
// Shows: thumbnail | title + location | price | tokenized badge
// ---------------------------------------------------------------------------

interface MiniListingRowProps {
  listing: MockListing
  /** Show AI confidence badge (used in Recommended section) */
  showConfidence?: boolean
  /** Show saved heart state */
  isSaved?: boolean
  onSave?: (id: string) => void
  index?: number
  className?: string
}

const CONFIDENCE_COLORS = {
  LOW: 'text-[#94A3B8] border-white/10 bg-white/5',
  MEDIUM: 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10 shadow-[inset_0_0_8px_rgba(245,158,11,0.2)]',
  HIGH: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10 shadow-[inset_0_0_8px_rgba(52,211,153,0.2)]',
}

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  LAND: 'Land',
  INDUSTRIAL: 'Industrial',
  MIXED_USE: 'Mixed Use',
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`
  return `$${price}`
}

export function MiniListingRow({
  listing,
  showConfidence = false,
  index = 0,
  className,
}: MiniListingRowProps) {
  const confidenceStyle =
    listing.aiConfidence ? CONFIDENCE_COLORS[listing.aiConfidence] : null

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-white/10 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
        <PlaceholderImage
          slot={listing.imageSlot as Parameters<typeof PlaceholderImage>[0]['slot']}
          propertyType={listing.imagePropertyType}
          alt={listing.title}
          fill
          priority={index < 3}
          className="h-full w-full"
        />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white transition-all group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
          {listing.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#94A3B8]">
          {listing.city}, {listing.state}
          {listing.lotAcres && listing.propertyType === 'LAND'
            ? ` · ${listing.lotAcres} ac`
            : listing.sqft
              ? ` · ${listing.sqft.toLocaleString()} sqft`
              : ''}
        </p>

        {/* Badges row */}
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <span className="rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-[10px] text-[#94A3B8] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            {PROPERTY_TYPE_LABEL[listing.propertyType] ?? listing.propertyType}
          </span>

          {listing.isTokenized && (
            <span className="flex items-center gap-0.5 rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] text-cyan-400 shadow-[inset_0_0_8px_rgba(34,211,238,0.2)]">
              <Coins className="h-2.5 w-2.5" />
              Tokenized
            </span>
          )}

          {showConfidence && listing.aiConfidence && confidenceStyle && (
            <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', confidenceStyle)}>
              AI {listing.aiConfidence}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="flex-shrink-0 text-right">
        <p className="font-heading text-sm font-semibold tabular-nums text-white">
          {formatPrice(listing.price)}
        </p>
        {listing.isTokenized && listing.tokenPricePerFraction && (
          <p className="mt-0.5 text-[11px] text-[#94A3B8]">
            from ${listing.tokenPricePerFraction.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  )
}
