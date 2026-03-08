// ---------------------------------------------------------------------------
// Marketplace property-card adapter
//
// Converts MockListing → PropertyCardData and delegates to the canonical
// PropertyCard component. All rendering logic lives in
// src/components/property/property-card.tsx.
//
// DB integration path: replace MockListing adapter with a Prisma Property
// adapter that maps DB fields to PropertyCardData.
// ---------------------------------------------------------------------------

import {
  PropertyCard as CanonicalPropertyCard,
  type PropertyCardData,
} from '@/components/property/property-card'
import { type MockListing } from '@/lib/marketplace/mock-data'

function toCardData(listing: MockListing): PropertyCardData {
  return {
    id: listing.id,
    title: listing.title,
    city: listing.city,
    state: listing.state,
    price: listing.price,
    propertyType: listing.propertyType,
    listingType: listing.listingType,
    sqft: listing.sqft,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    lotAcres: listing.lotAcres,
    yearBuilt: listing.yearBuilt,
    imageSlot: listing.imageSlot,
    imagePropertyType: listing.imagePropertyType,
    isNew: listing.isNew,
    isTokenized: listing.isTokenized,
    tokenInfo: listing.isTokenized && listing.tokenTotalSupply
      ? {
          pricePerFraction: listing.tokenPricePerFraction ?? 0,
          totalSupply: listing.tokenTotalSupply,
          availableSupply: listing.tokenAvailableSupply ?? 0,
          investorCount: listing.tokenInvestorCount,
        }
      : undefined,
    aiValuation: listing.aiEstimatedValue
      ? {
          estimatedValue: listing.aiEstimatedValue,
          confidence: listing.aiConfidence ?? 'LOW',
        }
      : undefined,
  }
}

// ---------------------------------------------------------------------------
// PropertyCard — vertical card for grid view
// ---------------------------------------------------------------------------

interface PropertyCardProps {
  listing: MockListing
  index?: number
  isSaved?: boolean
  onSave?: (id: string) => void
  priority?: boolean
}

export function MarketplacePropertyCard({
  listing,
  index,
  isSaved,
  onSave,
  priority,
}: PropertyCardProps) {
  return (
    <CanonicalPropertyCard
      data={toCardData(listing)}
      variant="card"
      index={index}
      isSaved={isSaved}
      onSave={onSave}
      priority={priority}
    />
  )
}

// ---------------------------------------------------------------------------
// PropertyRow — horizontal card for list view
// ---------------------------------------------------------------------------

export function MarketplacePropertyRow({
  listing,
  index,
  isSaved,
  onSave,
}: PropertyCardProps) {
  return (
    <CanonicalPropertyCard
      data={toCardData(listing)}
      variant="row"
      index={index}
      isSaved={isSaved}
      onSave={onSave}
    />
  )
}

// ---------------------------------------------------------------------------
// Named exports matching the original API — no changes needed in consumers
// ---------------------------------------------------------------------------

export const PropertyCard = MarketplacePropertyCard
export const PropertyRow = MarketplacePropertyRow
