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
  LOW:    'text-[#6B6B80] border-[#3A3A4A]',
  MEDIUM: 'text-[#F59E0B] border-[#F59E0B]/30',
  HIGH:   'text-[#4ADE80] border-[#4ADE80]/30',
}

const PROPERTY_TYPE_LABEL: Record<string, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL:  'Commercial',
  LAND:        'Land',
  INDUSTRIAL:  'Industrial',
  MIXED_USE:   'Mixed Use',
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`
  if (price >= 1_000)     return `$${(price / 1_000).toFixed(0)}K`
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
        'group flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-[#2A2A3A] hover:bg-[#111118]',
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
        <p className="truncate text-sm font-medium text-[#F5F5F7] group-hover:text-[#C9A84C] transition-colors">
          {listing.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#6B6B80]">
          {listing.city}, {listing.state}
          {listing.lotAcres && listing.propertyType === 'LAND'
            ? ` · ${listing.lotAcres} ac`
            : listing.sqft
            ? ` · ${listing.sqft.toLocaleString()} sqft`
            : ''}
        </p>

        {/* Badges row */}
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <span className="rounded border border-[#2A2A3A] bg-[#0A0A0F] px-1.5 py-0.5 text-[10px] text-[#A0A0B2]">
            {PROPERTY_TYPE_LABEL[listing.propertyType] ?? listing.propertyType}
          </span>

          {listing.isTokenized && (
            <span className="flex items-center gap-0.5 rounded border border-[#C9A84C]/25 bg-[#C9A84C]/8 px-1.5 py-0.5 text-[10px] text-[#C9A84C]">
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
        <p className="font-heading text-sm font-semibold tabular-nums text-[#F5F5F7]">
          {formatPrice(listing.price)}
        </p>
        {listing.isTokenized && listing.tokenPricePerFraction && (
          <p className="mt-0.5 text-[11px] text-[#6B6B80]">
            from ${listing.tokenPricePerFraction.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  )
}
