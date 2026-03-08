// ---------------------------------------------------------------------------
// TIGI Recommendation Engine v1
//
// Architecture:
//   IRecommendationEngine  ← stable contract for all consumers
//   RuleBasedEngine        ← MVP: multi-signal scoring over in-memory data
//   createRecommendationEngine()  ← factory; swap here for M6 ML upgrade
//   getRecommendations()   ← main entry point for any context
//   getSimilarListings()   ← convenience wrapper for listing detail pages
//
// Scoring dimensions:
//   LISTING_SIMILAR  — category, location, price proximity, tokenization,
//                      sqft proximity, bedroom count, listing type
//   DASHBOARD        — user preferences: preferred types/states/budget,
//                      tokenized preference, AI confidence, trending,
//                      similarity to saved listings
//   SAVED_COMPLEMENT — mix of saved-similar and diversification signals
//
// Upgrade path (M6 — real ML):
//   1. Implement EmbeddingRecommendationEngine using a vector similarity API
//   2. Change createRecommendationEngine() to return new EmbeddingEngine(config)
//   3. All consumers using getRecommendations() / getSimilarListings() are unaffected
// ---------------------------------------------------------------------------

import type { MockListing } from '@/lib/marketplace/mock-data'
import type {
  RecommendationContext,
  RecommendationResult,
  RecommendationReason,
  ReasonType,
  ScoredListing,
  UserPreferences,
} from './recommendation-types'

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface IRecommendationEngine {
  score(
    allListings: MockListing[],
    context: RecommendationContext,
    limit: number,
  ): RecommendationResult
}

// ---------------------------------------------------------------------------
// Score contribution helpers
// ---------------------------------------------------------------------------

interface ScoreContribution {
  points: number
  reason: RecommendationReason | null
}

function r(type: ReasonType, label: string, detail: string): RecommendationReason {
  return { type, label, detail }
}

// ── LISTING_SIMILAR signals ──────────────────────────────────────────────────

function stateMatch(c: MockListing, anchor: MockListing): ScoreContribution {
  if (c.state !== anchor.state) return { points: 0, reason: null }
  return { points: 20, reason: r('LOCATION_MATCH', `${anchor.state} market`, `Both in ${anchor.state} — same regional dynamics and comparable market pricing.`) }
}

function cityMatch(c: MockListing, anchor: MockListing): ScoreContribution {
  if (c.city !== anchor.city) return { points: 0, reason: null }
  return { points: 10, reason: r('LOCATION_MATCH', `Same city · ${anchor.city}`, `In ${anchor.city} — near-identical micro-market conditions, commute zones, and local amenities.`) }
}

function typeMatch(c: MockListing, anchor: MockListing): ScoreContribution {
  if (c.propertyType !== anchor.propertyType) return { points: 0, reason: null }
  const labels: Record<string, string> = {
    RESIDENTIAL: 'Residential', COMMERCIAL: 'Commercial',
    LAND: 'Land parcel', INDUSTRIAL: 'Industrial', MIXED_USE: 'Mixed-use',
  }
  const lbl = labels[anchor.propertyType] ?? anchor.propertyType
  return { points: 25, reason: r('CATEGORY_MATCH', `${lbl} asset`, `Same asset category — directly comparable investment thesis and buyer profile.`) }
}

function priceProximity(c: MockListing, anchor: MockListing): ScoreContribution {
  const delta = Math.abs(c.price - anchor.price) / anchor.price
  if (delta <= 0.15) return { points: 20, reason: r('PRICE_MATCH', 'Close price range', `Priced within 15% of this listing — similar capital commitment and return expectations.`) }
  if (delta <= 0.30) return { points: 12, reason: r('PRICE_MATCH', 'Similar price range', `Priced within 30% — comparable investment tier.`) }
  if (delta <= 0.50) return { points:  5, reason: r('PRICE_MATCH', 'Nearby price tier', `Priced within 50% — same general price band.`) }
  return { points: 0, reason: null }
}

function listingTypeMatch(c: MockListing, anchor: MockListing): ScoreContribution {
  if (c.listingType !== anchor.listingType) return { points: 0, reason: null }
  return { points: 5, reason: null }  // Boosts score silently — not surfaced as a reason
}

function tokenizationMatch(c: MockListing, anchor: MockListing): ScoreContribution {
  if (!c.isTokenized || !anchor.isTokenized) return { points: 0, reason: null }
  return { points: 8, reason: r('TOKENIZED_MATCH', 'Tokenized asset', 'Both offer fractional ownership — compatible investment structure and liquidity profile.') }
}

function sqftProximity(c: MockListing, anchor: MockListing): ScoreContribution {
  if (!c.sqft || !anchor.sqft) return { points: 0, reason: null }
  const delta = Math.abs(c.sqft - anchor.sqft) / anchor.sqft
  if (delta <= 0.25) return { points: 8, reason: null }   // Score boost, not surfaced
  return { points: 0, reason: null }
}

function bedroomProximity(c: MockListing, anchor: MockListing): ScoreContribution {
  if (c.bedrooms == null || anchor.bedrooms == null) return { points: 0, reason: null }
  if (Math.abs(c.bedrooms - anchor.bedrooms) <= 1) return { points: 4, reason: null }
  return { points: 0, reason: null }
}

// ── DASHBOARD / preference signals ──────────────────────────────────────────

function preferredTypeMatch(c: MockListing, prefs: UserPreferences): ScoreContribution {
  if (!prefs.preferredTypes || prefs.preferredTypes.length === 0) return { points: 0, reason: null }
  if (!prefs.preferredTypes.includes(c.propertyType)) return { points: 0, reason: null }
  return { points: 25, reason: r('CATEGORY_MATCH', 'Matches your interest', 'Asset category aligns with the investment types you\'ve indicated interest in.') }
}

function preferredStateMatch(c: MockListing, prefs: UserPreferences): ScoreContribution {
  if (!prefs.preferredStates || prefs.preferredStates.length === 0) return { points: 0, reason: null }
  if (!prefs.preferredStates.includes(c.state)) return { points: 0, reason: null }
  return { points: 20, reason: r('LOCATION_MATCH', `Preferred market · ${c.state}`, `Located in ${c.state}, one of your target markets.`) }
}

function budgetMatch(c: MockListing, prefs: UserPreferences): ScoreContribution {
  const { minBudget, maxBudget } = prefs
  if (minBudget == null && maxBudget == null) return { points: 0, reason: null }
  const min = minBudget ?? 0
  const max = maxBudget ?? Infinity
  if (c.price >= min && c.price <= max) {
    return { points: 20, reason: r('PRICE_MATCH', 'Within your budget', `Priced at ${fmtPrice(c.price)} — fits your target investment range.`) }
  }
  return { points: 0, reason: null }
}

function tokenizedPreference(c: MockListing, prefs: UserPreferences): ScoreContribution {
  if (!prefs.preferTokenized || !c.isTokenized) return { points: 0, reason: null }
  return { points: 15, reason: r('TOKENIZED_MATCH', 'Fractional ownership', 'Tokenized for fractional investment — matches your preferred ownership model.') }
}

function highConfidenceSignal(c: MockListing): ScoreContribution {
  if (c.aiConfidence !== 'HIGH') return { points: 0, reason: null }
  return { points: 10, reason: r('HIGH_CONFIDENCE', 'High AI confidence', 'TIGI AI valuation has HIGH confidence on this listing — well-supported by comparable data.') }
}

function trendingSignal(c: MockListing, allListings: MockListing[]): ScoreContribution {
  const views = allListings.map(l => l.viewCount)
  const p75 = [...views].sort((a, b) => a - b)[Math.floor(views.length * 0.75)]
  if (c.viewCount < p75) return { points: 0, reason: null }
  return { points: 5, reason: r('TRENDING', 'Trending now', `${c.viewCount.toLocaleString()} views — among the most-viewed listings on the platform this week.`) }
}

function landPreference(c: MockListing, prefs: UserPreferences): ScoreContribution {
  if (!prefs.preferLand || c.propertyType !== 'LAND') return { points: 0, reason: null }
  return { points: 15, reason: r('LAND_PREFERENCE', 'Land parcel', 'Matches your preference for land and development opportunities.') }
}

function similarToSaved(
  c: MockListing,
  prefs: UserPreferences,
  allListings: MockListing[],
): ScoreContribution {
  if (!prefs.savedListingIds || prefs.savedListingIds.length === 0) return { points: 0, reason: null }
  const savedListings = allListings.filter(l => prefs.savedListingIds!.includes(l.id))
  if (savedListings.length === 0) return { points: 0, reason: null }

  // Score candidate against each saved listing; take the best match
  let bestScore = 0
  for (const saved of savedListings) {
    let s = 0
    s += stateMatch(c, saved).points
    s += cityMatch(c, saved).points
    s += typeMatch(c, saved).points
    s += priceProximity(c, saved).points / 2  // half-weight to avoid over-counting
    if (s > bestScore) bestScore = s
  }

  if (bestScore >= 40) return { points: 20, reason: r('SIMILAR_TO_SAVED', 'Similar to saved', 'Closely matches a listing on your watchlist — category, location, and price band aligned.') }
  if (bestScore >= 20) return { points: 10, reason: r('SIMILAR_TO_SAVED', 'Related to saved', 'Shares attributes with listings you\'ve saved.') }
  return { points: 0, reason: null }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function fmtPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`
  if (price >= 1_000)     return `$${(price / 1_000).toFixed(0)}K`
  return `$${price}`
}

function buildReasons(contributions: ScoreContribution[], maxReasons = 3): RecommendationReason[] {
  return contributions
    .filter((c): c is ScoreContribution & { reason: RecommendationReason } => c.reason !== null)
    .map(c => c.reason)
    .slice(0, maxReasons)
}

// ---------------------------------------------------------------------------
// RuleBasedEngine
// ---------------------------------------------------------------------------

class RuleBasedEngine implements IRecommendationEngine {
  score(
    allListings: MockListing[],
    context: RecommendationContext,
    limit: number,
  ): RecommendationResult {
    const candidates = allListings.filter(l => l.status === 'ACTIVE')

    let scored: ScoredListing[]

    if (context.kind === 'LISTING_SIMILAR') {
      const { anchor } = context
      scored = candidates
        .filter(l => l.id !== anchor.id)
        .map(l => this._scoreSimilar(l, anchor))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } else if (context.kind === 'DASHBOARD') {
      const { prefs } = context
      scored = candidates
        .filter(l => !prefs.savedListingIds?.includes(l.id))  // Don't recommend already-saved
        .map(l => this._scoreDashboard(l, prefs, allListings))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } else {
      // SAVED_COMPLEMENT — diversify relative to what's already saved
      const { savedListings } = context
      const savedIds = new Set(savedListings.map(l => l.id))
      const savedStates = new Set(savedListings.map(l => l.state))
      const savedTypes  = new Set(savedListings.map(l => l.propertyType))
      scored = candidates
        .filter(l => !savedIds.has(l.id))
        .map(l => {
          const contrib: ScoreContribution[] = []
          // Similarity to saved set
          let bestSim = 0
          for (const s of savedListings) {
            const sim =
              stateMatch(l, s).points +
              typeMatch(l, s).points +
              priceProximity(l, s).points / 2
            if (sim > bestSim) bestSim = sim
          }
          if (bestSim >= 40) contrib.push({ points: 25, reason: r('SIMILAR_TO_SAVED', 'Similar to your portfolio', 'Shares category, location, or price range with assets you\'ve already saved.') })
          // Diversification bonus
          if (!savedStates.has(l.state)) contrib.push({ points: 10, reason: r('LOCATION_MATCH', `New market · ${l.state}`, `Expands your footprint — ${l.state} is not yet in your watchlist.`) })
          if (!savedTypes.has(l.propertyType)) contrib.push({ points: 10, reason: r('CATEGORY_MATCH', 'New asset class', `Adds ${l.propertyType.toLowerCase().replace('_', '-')} exposure — diversifies your watchlist.`) })
          contrib.push(highConfidenceSignal(l))
          contrib.push(trendingSignal(l, allListings))
          const total = contrib.reduce((s, c) => s + c.points, 0)
          return { listing: l, score: Math.min(100, total), reasons: buildReasons(contrib) }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    }

    return { items: scored, context, generatedAt: new Date().toISOString() }
  }

  private _scoreSimilar(c: MockListing, anchor: MockListing): ScoredListing {
    const contributions: ScoreContribution[] = [
      stateMatch(c, anchor),
      cityMatch(c, anchor),
      typeMatch(c, anchor),
      priceProximity(c, anchor),
      listingTypeMatch(c, anchor),
      tokenizationMatch(c, anchor),
      sqftProximity(c, anchor),
      bedroomProximity(c, anchor),
    ]
    const total = contributions.reduce((s, c) => s + c.points, 0)
    return {
      listing: c,
      score: Math.min(100, total),
      reasons: buildReasons(contributions),
    }
  }

  private _scoreDashboard(
    c: MockListing,
    prefs: UserPreferences,
    allListings: MockListing[],
  ): ScoredListing {
    const contributions: ScoreContribution[] = [
      preferredTypeMatch(c, prefs),
      preferredStateMatch(c, prefs),
      budgetMatch(c, prefs),
      tokenizedPreference(c, prefs),
      landPreference(c, prefs),
      highConfidenceSignal(c),
      trendingSignal(c, allListings),
      similarToSaved(c, prefs, allListings),
    ]
    const total = contributions.reduce((s, c) => s + c.points, 0)
    return {
      listing: c,
      score: Math.min(100, total),
      reasons: buildReasons(contributions),
    }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createRecommendationEngine(): IRecommendationEngine {
  // M6 upgrade: return new EmbeddingRecommendationEngine(config)
  return new RuleBasedEngine()
}

// ---------------------------------------------------------------------------
// Top-level API
// ---------------------------------------------------------------------------

/**
 * Get scored + ranked recommendations for any context.
 *
 * Synchronous — operates on in-memory listing data.
 * M6 upgrade: make async and call vector similarity API inside each engine.
 */
export function getRecommendations(
  allListings: MockListing[],
  context: RecommendationContext,
  limit = 4,
): RecommendationResult {
  return createRecommendationEngine().score(allListings, context, limit)
}

/**
 * Convenience wrapper for listing detail "Similar" tabs.
 * Returns scored listings ranked by multi-signal similarity to anchor.
 */
export function getSimilarListings(
  allListings: MockListing[],
  anchor: MockListing,
  limit = 4,
): ScoredListing[] {
  return getRecommendations(allListings, { kind: 'LISTING_SIMILAR', anchor }, limit).items
}

// ---------------------------------------------------------------------------
// MVP user preference profile — derived from MOCK_USER + MOCK_SAVED_IDS.
// M3 upgrade: load from session user profile / onboarding answers.
// ---------------------------------------------------------------------------

export const DEMO_USER_PREFERENCES: UserPreferences = {
  role: 'INVESTOR',
  preferTokenized: true,
  // No type/state filter → engine scores all types, personalizes via saved signal
  savedListingIds: ['res-001', 'res-003', 'res-004', 'com-001', 'res-002'],
}
