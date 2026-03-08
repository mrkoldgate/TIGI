// ---------------------------------------------------------------------------
// listing-query.ts — Server-side listing retrieval and DTO adaptation.
//
// These functions are the single source of truth for fetching listings from
// the database. They return MockListing-shaped data so all existing UI
// components (cards, detail pages, recommendation engine) work without change.
//
// Fallback strategy: if the DB is unreachable (e.g. local dev without a
// running Postgres instance), functions fall back to MOCK_LISTINGS so the
// app renders during initial development. Remove the fallback once a DB is
// consistently available in dev.
//
// Request deduplication: Both exported query functions are wrapped in React
// cache() so parallel calls within the same server render (e.g. generateMetadata
// + page component) hit Prisma only once.
//
// Upgrade path:
//   - Add full-text search: replace in-memory filter with Prisma `contains` or
//     a dedicated search provider (Typesense/Meilisearch).
//   - Add cursor-based pagination: accept `cursor` + `limit` params.
//   - Add `tokenInvestorCount` once a `TokenHolding` count query is efficient.
// ---------------------------------------------------------------------------

import { cache } from 'react'
import type { Property, Token, AiValuation as PrismaAiValuation, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import {
  MOCK_LISTINGS,
  type MockListing,
  type ImagePropertyType,
} from '@/lib/marketplace/mock-data'

// ── Type alias for a fully-included Property row ────────────────────────────

type PropertyWithIncludes = Property & {
  token: Token | null
  aiValuations: PrismaAiValuation[]
}

// ── Image slot derivation ────────────────────────────────────────────────────
// DB listings don't have imageSlot / imagePropertyType. We derive a reasonable
// placeholder based on property type until real S3 images are stored.
// TODO: once PropertyImage rows exist, use the first image's URL instead.

const TYPE_TO_IMAGE_SLOT: Record<string, string> = {
  RESIDENTIAL: 'residential-1',
  COMMERCIAL:  'commercial-1',
  INDUSTRIAL:  'industrial-1',
  MIXED_USE:   'mixed-1',
  LAND:        'land-1',
}

const TYPE_TO_IMAGE_PROP_TYPE: Record<string, ImagePropertyType> = {
  RESIDENTIAL: 'residential',
  COMMERCIAL:  'commercial',
  INDUSTRIAL:  'industrial',
  MIXED_USE:   'mixed',
  LAND:        'land',
}

// ── DTO adapter ──────────────────────────────────────────────────────────────

export function propertyToMockListing(p: PropertyWithIncludes): MockListing {
  const latestValuation = p.aiValuations[0] ?? null

  // features is stored as JSON; cast to string[] (empty array fallback)
  const features = Array.isArray(p.features) ? (p.features as string[]) : []

  // Map Prisma ListingStatus values to the subset MockListing expects
  const statusMap: Record<string, MockListing['status']> = {
    ACTIVE:       'ACTIVE',
    SOLD:         'SOLD',
    LEASED:       'LEASED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    DRAFT:        'UNDER_REVIEW', // draft listings don't appear in marketplace
    DELISTED:     'SOLD',
  }

  return {
    id:          p.id,
    title:       p.title,
    description: p.description,
    propertyType: p.type as MockListing['propertyType'],
    listingType:  (p.listingType as MockListing['listingType']) ?? 'BUY',
    status:       statusMap[p.status] ?? 'UNDER_REVIEW',

    // Price: null maps to 0 (lease-only listings). TODO: propagate null to UI.
    price:     p.price != null ? Number(p.price) : 0,

    city:      p.city,
    state:     p.state,
    sqft:      p.sqft ?? 0,
    bedrooms:  p.bedrooms ?? null,
    bathrooms: p.bathrooms ?? null,
    yearBuilt: p.yearBuilt ?? null,
    lotAcres:  p.lotAcres ?? null,
    features,

    // Tokenization — from the linked Token row, or null if not tokenized
    isTokenized:           p.isTokenized,
    tokenTotalSupply:      p.token?.totalSupply ?? null,
    tokenAvailableSupply:  p.token?.availableSupply ?? null,
    tokenPricePerFraction: p.token ? Number(p.token.pricePerFraction) : null,
    tokenInvestorCount:    null, // TODO: COUNT(TokenHolding) join

    // Images — placeholder-derived until real S3 images are attached
    imageSlot:         TYPE_TO_IMAGE_SLOT[p.type]  ?? 'residential-1',
    imagePropertyType: TYPE_TO_IMAGE_PROP_TYPE[p.type] ?? 'residential',

    createdAt: p.createdAt.toISOString(),
    viewCount: p.viewCount,

    // AI valuation — most-recent cached result (null if not yet generated)
    aiEstimatedValue: latestValuation ? Number(latestValuation.estimatedValue) : null,
    aiConfidence:     latestValuation?.confidence ?? null,
  }
}

// ── Prisma include shape ─────────────────────────────────────────────────────

const LISTING_INCLUDE = {
  token: true,
  aiValuations: { orderBy: { generatedAt: 'desc' as const }, take: 1 },
} satisfies Prisma.PropertyInclude

// ── Query functions ──────────────────────────────────────────────────────────

/**
 * Fetch all ACTIVE listings from the database, converted to MockListing shape.
 * Wrapped in React cache() so parallel server-component calls are deduplicated
 * within a single request.
 *
 * Falls back to MOCK_LISTINGS if the database is unavailable (dev without DB).
 */
export const getActiveListings = cache(async (): Promise<MockListing[]> => {
  try {
    const rows = await prisma.property.findMany({
      where:   { status: 'ACTIVE' },
      include: LISTING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(propertyToMockListing)
  } catch (err) {
    console.warn('[listing-query] DB unavailable, using mock data:', (err as Error).message)
    return MOCK_LISTINGS.filter((l) => l.status === 'ACTIVE')
  }
})

/**
 * Fetch a single listing by ID (any status — owners/admins can view drafts).
 * Falls back to MOCK_LISTINGS if the database is unavailable.
 */
export const getListingById = cache(async (id: string): Promise<MockListing | null> => {
  try {
    const row = await prisma.property.findUnique({
      where:   { id },
      include: LISTING_INCLUDE,
    })
    if (!row) return null
    return propertyToMockListing(row)
  } catch (err) {
    console.warn('[listing-query] DB unavailable, using mock data:', (err as Error).message)
    return MOCK_LISTINGS.find((l) => l.id === id) ?? null
  }
})

// ── Stats ────────────────────────────────────────────────────────────────────

export interface MarketplaceStats {
  totalActive:    number
  tokenizedCount: number
  landCount:      number
  totalValue:     number
}

/**
 * Compute marketplace stats from an already-fetched listings array.
 * Avoids a second DB round-trip when the page already has listings.
 */
export function computeMarketplaceStats(listings: MockListing[]): MarketplaceStats {
  const active = listings.filter((l) => l.status === 'ACTIVE')
  return {
    totalActive:    active.length,
    tokenizedCount: active.filter((l) => l.isTokenized).length,
    landCount:      active.filter((l) => l.propertyType === 'LAND').length,
    totalValue:     active.reduce((sum, l) => sum + l.price, 0),
  }
}
