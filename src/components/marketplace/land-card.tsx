// ---------------------------------------------------------------------------
// Marketplace land-card adapter
//
// Converts MockListing (propertyType === 'LAND') → LandCardData and delegates
// to the canonical LandCard component.
//
// DB integration path: replace MockListing adapter with a Prisma Land model
// adapter that maps DB fields (including a dedicated zoningType column) to
// LandCardData. The `inferLandUse()` heuristic below is mock-only.
// ---------------------------------------------------------------------------

import { LandCard, type LandCardData, type LandUseType } from '@/components/land/land-card'
import { type MockListing } from '@/lib/marketplace/mock-data'

// ---------------------------------------------------------------------------
// Land use inference — reads features[] from mock data.
// Real schema will have an explicit `zoningType` column; swap this out then.
// ---------------------------------------------------------------------------

const DEV_OPPORTUNITY_SIGNALS = [
  'mixed-use zoning',
  'graded',
  'shovel-ready',
  'buildable',
  'permits',
  'utilities at site',
  'utilities at road',
  'rail spur',
  'transit adjacent',
]

export function inferLandUse(features: string[]): LandUseType {
  const lower = features.map((f) => f.toLowerCase())
  const has = (kw: string) => lower.some((f) => f.includes(kw))

  if (has('agricultural') || has('vineyard') || has('irrigation') || has('water rights'))
    return 'AGRICULTURAL'
  if (has('waterfront') || has('ocean frontage') || has('beachfront') || has('oceanside'))
    return 'WATERFRONT'
  if (has('industrial') || has('rail spur') || has('heavy industrial'))
    return 'INDUSTRIAL'
  if (has('mixed-use') || has('mixed use'))
    return 'COMMERCIAL_DEV'
  if (has('vacation rental') || has('vr zoning') || has('recreational') || has('hunting'))
    return 'RECREATIONAL'
  if (has('cattle') || has('grazing') || has('ranch'))
    return 'RURAL'
  if (has('residential') || has('buildable') || has('septic'))
    return 'RESIDENTIAL_DEV'
  return 'COMMERCIAL_DEV'
}

export function inferDevOpportunity(features: string[]): boolean {
  const lower = features.map((f) => f.toLowerCase()).join(' ')
  return DEV_OPPORTUNITY_SIGNALS.some((sig) => lower.includes(sig))
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

function toCardData(listing: MockListing): LandCardData {
  const features = listing.features ?? []
  const acres = listing.lotAcres ?? 0
  return {
    id: listing.id,
    title: listing.title,
    city: listing.city,
    state: listing.state,
    price: listing.price,
    acres,
    pricePerAcre: acres > 0 ? Math.round(listing.price / acres) : undefined,
    landUse: inferLandUse(features),
    listingType: listing.listingType,
    features,
    isDevelopmentOpportunity: inferDevOpportunity(features),
    imageUrl: listing.imageUrl ?? null,
    imageSlot: listing.imageSlot,
    isNew: listing.isNew,
    isTokenized: listing.isTokenized,
    tokenInfo:
      listing.isTokenized && listing.tokenTotalSupply
        ? {
          pricePerFraction: listing.tokenPricePerFraction ?? 0,
          totalSupply: listing.tokenTotalSupply,
          availableSupply: listing.tokenAvailableSupply ?? 0,
          investorCount: listing.tokenInvestorCount ?? undefined,
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
// Named exports — drop-in replacements for any consumer expecting these names
// ---------------------------------------------------------------------------

interface MarketplaceLandCardProps {
  listing: MockListing
  index?: number
  isSaved?: boolean
  onSave?: (id: string) => void
  priority?: boolean
}

export function MarketplaceLandCard({
  listing,
  index,
  isSaved,
  onSave,
  priority,
}: MarketplaceLandCardProps) {
  return (
    <LandCard
      data={toCardData(listing)}
      variant="card"
      index={index}
      isSaved={isSaved}
      onSave={onSave}
      priority={priority}
    />
  )
}

export function MarketplaceLandRow({
  listing,
  index,
  isSaved,
  onSave,
  priority,
}: MarketplaceLandCardProps) {
  return (
    <LandCard
      data={toCardData(listing)}
      variant="row"
      index={index}
      isSaved={isSaved}
      onSave={onSave}
      priority={priority}
    />
  )
}
