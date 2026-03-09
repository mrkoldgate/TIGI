// ---------------------------------------------------------------------------
// owner-query.ts — Server-side owner listings retrieval and DTO adaptation.
//
// Converts Prisma Property rows → SellerListing shape consumed by
// OwnerDashboardClient and SellerListingsClient.
//
// Also builds the OwnerUser object from session data so the server page
// can pass real user context (name, role, KYC status) to the dashboard.
//
// Falls back to MOCK_SELLER_LISTINGS if the DB is unavailable (dev without DB).
// ---------------------------------------------------------------------------

import { cache } from 'react'
import type { Property, Token, AiValuation as PrismaAiValuation, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import {
  MOCK_SELLER_LISTINGS,
  type SellerListing,
  type SellerListingStatus,
  type SellerAssetType,
  type SellerPropertySubtype,
  type SellerLandSubtype,
} from './seller-mock-data'
import type { OwnerUser } from '@/lib/listings/owner-mock-data'

// ── Type alias ───────────────────────────────────────────────────────────────

type PropertyWithIncludes = Property & {
  token: Token | null
  aiValuations: PrismaAiValuation[]
}

// ── Image slot derivation (matches listing-query.ts) ─────────────────────────

const TYPE_TO_IMAGE_SLOT: Record<string, string> = {
  RESIDENTIAL: 'residential-1',
  COMMERCIAL:  'commercial-1',
  INDUSTRIAL:  'industrial-1',
  MIXED_USE:   'mixed-1',
  LAND:        'land-1',
}

const TYPE_TO_IMAGE_PROP_TYPE: Record<string, SellerListing['imagePropertyType']> = {
  RESIDENTIAL: 'residential',
  COMMERCIAL:  'commercial',
  INDUSTRIAL:  'industrial',
  MIXED_USE:   'mixed',
  LAND:        'land',
}

// ── Status mapping ────────────────────────────────────────────────────────────

const LISTING_STATUS_MAP: Record<string, SellerListingStatus> = {
  DRAFT:        'DRAFT',
  UNDER_REVIEW: 'PENDING_REVIEW',
  ACTIVE:       'ACTIVE',
  SOLD:         'ARCHIVED',
  LEASED:       'ARCHIVED',
  DELISTED:     'ARCHIVED',
}

// ── DTO adapter ───────────────────────────────────────────────────────────────

export function propertyToSellerListing(p: PropertyWithIncludes): SellerListing {
  const latestValuation = p.aiValuations[0] ?? null
  const isLand = p.type === 'LAND'

  const assetType: SellerAssetType = isLand ? 'LAND' : 'PROPERTY'

  // Subtype is not stored in the DB schema (only PropertyType enum exists).
  // Derive a sensible default; real subtype would come from a future sub-type field.
  const subtype: SellerPropertySubtype | SellerLandSubtype = isLand
    ? 'RURAL'  // land default; TODO: add landSubtype field to schema
    : (p.type as SellerPropertySubtype) // RESIDENTIAL | COMMERCIAL | INDUSTRIAL | MIXED_USE

  return {
    id:    p.id,
    title: p.title,
    city:  p.city,
    state: p.state,

    assetType,
    subtype,
    listingType:    (p.listingType  as SellerListing['listingType'])  ?? 'BUY',
    ownershipModel: (p.ownershipModel as SellerListing['ownershipModel']) ?? 'FULL',
    status: LISTING_STATUS_MAP[p.status] ?? 'DRAFT',

    price:            p.price != null ? Number(p.price) : null,
    leaseRateMonthly: p.leaseRateMonthly != null ? Number(p.leaseRateMonthly) : null,

    sqft:      p.sqft ?? null,
    bedrooms:  p.bedrooms ?? null,
    bathrooms: p.bathrooms ?? null,
    yearBuilt: p.yearBuilt ?? null,
    lotAcres:  p.lotAcres ?? null,
    zoningCode: p.zoningCode ?? null,

    isTokenized:           p.isTokenized,
    tokenTotalSupply:      p.token?.totalSupply ?? null,
    tokenAvailableSupply:  p.token?.availableSupply ?? null,
    tokenPricePerFraction: p.token ? Number(p.token.pricePerFraction) : null,

    imageSlot:         TYPE_TO_IMAGE_SLOT[p.type]      ?? 'residential-1',
    imagePropertyType: TYPE_TO_IMAGE_PROP_TYPE[p.type] ?? 'residential',

    viewCount:    p.viewCount,
    saveCount:    p.saveCount,
    inquiryCount: p.inquiryCount,

    aiEstimatedValue: latestValuation ? Number(latestValuation.estimatedValue) : null,

    createdAt:   p.createdAt.toISOString(),
    updatedAt:   p.updatedAt.toISOString(),
    publishedAt: p.listedAt?.toISOString() ?? null,
    expiresAt:   null, // not tracked in schema yet

    reviewNote: p.reviewNote ?? null,
  }
}

// ── Prisma include ────────────────────────────────────────────────────────────

const OWNER_LISTING_INCLUDE = {
  token: true,
  aiValuations: { orderBy: { generatedAt: 'desc' as const }, take: 1 },
} satisfies Prisma.PropertyInclude

// ── Query ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all listings owned by `userId`, newest first.
 * Wrapped in React cache() to deduplicate within the same request cycle.
 * Falls back to MOCK_SELLER_LISTINGS on DB error (dev without Postgres).
 */
export const getOwnerListings = cache(async (userId: string): Promise<SellerListing[]> => {
  try {
    const rows = await prisma.property.findMany({
      where:   { ownerId: userId },
      include: OWNER_LISTING_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    })
    return rows.map(propertyToSellerListing)
  } catch (err) {
    logger.warn('[owner-query] DB unavailable, using mock data', { error: (err as Error).message })
    return MOCK_SELLER_LISTINGS
  }
})

// ── OwnerUser builder ─────────────────────────────────────────────────────────

// Maps Prisma KycStatus → the three-state union OwnerDashboardClient expects.
function mapKycStatus(
  status: string,
): OwnerUser['kycStatus'] {
  if (status === 'VERIFIED') return 'VERIFIED'
  if (status === 'PENDING' || status === 'SUBMITTED') return 'PENDING'
  return 'UNVERIFIED'
}

function mapOwnerRole(role: string): OwnerUser['role'] {
  return role === 'OWNER' || role === 'BOTH' ? 'OWNER' : 'PROFESSIONAL'
}

/**
 * Build the OwnerUser context object from session fields.
 * `hasTokenizedListings` is derived from the fetched listings so the
 * dashboard can conditionally show tokenization insights.
 */
export function buildOwnerUser(
  sessionUser: {
    name?: string | null
    email: string
    role?: string
    kycStatus?: string
  },
  listings: SellerListing[],
  joinedAt: string,
): OwnerUser {
  const name = sessionUser.name ?? sessionUser.email.split('@')[0]
  const firstName = name.split(' ')[0]

  return {
    name,
    firstName,
    role:                  mapOwnerRole(sessionUser.role ?? 'OWNER'),
    kycStatus:             mapKycStatus(sessionUser.kycStatus ?? 'NONE'),
    hasTokenizedListings:  listings.some((l) => l.isTokenized),
    joinedAt,
  }
}

// ── Combined data fetch ───────────────────────────────────────────────────────

export interface OwnerDashboardData {
  listings: SellerListing[]
  ownerUser: OwnerUser
}

/**
 * Single call to get everything the owner dashboard needs:
 * the user's listings AND the OwnerUser context built from session + listings.
 */
export async function getOwnerDashboardData(sessionUser: {
  id: string
  name?: string | null
  email: string
  role?: string
  kycStatus?: string
}): Promise<OwnerDashboardData> {
  // Fetch listings and createdAt in parallel
  const [listings, dbUser] = await Promise.all([
    getOwnerListings(sessionUser.id),
    prisma.user.findUnique({ where: { id: sessionUser.id }, select: { createdAt: true } })
      .catch(() => null),
  ])

  const joinedAt = dbUser?.createdAt.toISOString() ?? new Date().toISOString()
  const ownerUser = buildOwnerUser(sessionUser, listings, joinedAt)
  return { listings, ownerUser }
}
