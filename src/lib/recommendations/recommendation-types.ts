// ---------------------------------------------------------------------------
// TIGI Recommendation Engine — Type definitions.
//
// These types represent the stable contract between the recommendation engine
// and all consumers (dashboard, detail pages, saved flows).
//
// MVP: rule-based scoring over in-memory listing data.
// M6 upgrade: swap the engine in recommendation-service.ts; type contract stays.
// ---------------------------------------------------------------------------

import type { MockListing, PropertyType } from '@/lib/marketplace/mock-data'

// ---------------------------------------------------------------------------
// Reason types — why a listing was recommended
// ---------------------------------------------------------------------------

export type ReasonType =
  | 'CATEGORY_MATCH'    // Same asset category as preferences / anchor
  | 'LOCATION_MATCH'    // Same state or city
  | 'PRICE_MATCH'       // Price within target range
  | 'SIMILAR_TO_SAVED'  // Similar to a listing the user has saved
  | 'TOKENIZED_MATCH'   // Tokenized; matches investor ownership preference
  | 'HIGH_CONFIDENCE'   // AI valuation confidence is HIGH or VERY_HIGH
  | 'TRENDING'          // High view count relative to cohort
  | 'LAND_PREFERENCE'   // Matches land parcel preference
  | 'OWNERSHIP_MATCH'   // Matches full vs. fractional ownership preference
  | 'NEW_LISTING'        // Listed within the last 30 days
  | 'VALUE_SCORE'        // AI estimate meaningfully above asking price (potential upside)

export interface RecommendationReason {
  type: ReasonType
  label: string
  /** Supporting detail shown on hover or in expanded view */
  detail?: string
}

// ---------------------------------------------------------------------------
// Scored result
// ---------------------------------------------------------------------------

export interface ScoredListing {
  listing: MockListing
  /** 0–100 relevance score */
  score: number
  /** Top reasons, ordered by contribution to score */
  reasons: RecommendationReason[]
}

// ---------------------------------------------------------------------------
// Contexts — what triggered this recommendation run
// ---------------------------------------------------------------------------

export type RecommendationContext =
  | { kind: 'LISTING_SIMILAR'; anchor: MockListing }
  | { kind: 'DASHBOARD';        prefs: UserPreferences }
  | { kind: 'SAVED_COMPLEMENT'; savedListings: MockListing[] }

// ---------------------------------------------------------------------------
// Result envelope
// ---------------------------------------------------------------------------

export interface RecommendationResult {
  items: ScoredListing[]
  context: RecommendationContext
  generatedAt: string
}

// ---------------------------------------------------------------------------
// User preference profile — MVP subset; fully populated from session in M3+
// ---------------------------------------------------------------------------

export interface UserPreferences {
  /** User's primary platform role */
  role?: 'INVESTOR' | 'BUYER' | 'OWNER' | 'PROFESSIONAL'
  /** Asset categories the user has expressed interest in */
  preferredTypes?: PropertyType[]
  /** US states the user is interested in */
  preferredStates?: string[]
  /** Minimum budget in USD */
  minBudget?: number
  /** Maximum budget in USD */
  maxBudget?: number
  /** Whether the user prefers land over built properties */
  preferLand?: boolean
  /** Whether the user prefers tokenized / fractional assets */
  preferTokenized?: boolean
  /** IDs the user has saved — used for "similar to saved" scoring */
  savedListingIds?: string[]
  /** IDs the user has recently viewed — used for recency weighting */
  viewedListingIds?: string[]
}
