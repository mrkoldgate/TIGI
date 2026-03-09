// ---------------------------------------------------------------------------
// TIGI Valuation Service v1.1
//
// Architecture:
//   IValuationService interface  ← stable contract for all consumers
//   RuleBasedValuationEngine     ← scoring engine: regional rates + MSA city
//                                   premiums + listing type + feature signals
//   createValuationService()     ← factory; swap engine here for M6 AI upgrade
//   getValuation()               ← top-level call: mock-first → engine fallback
//   marketplaceListingToInput()  ← adapter for marketplace listing shape
//   sellerListingToInput()       ← adapter for seller/owner listing shape
//
// Scoring layers (v1.1):
//   1. State base rate ($/sqft or $/acre)
//   2. MSA/city premium multiplier (top US metros)
//   3. Listing type factor (BUY vs LEASE)
//   4. Asset-specific factors (age, property type, room density, land subtype)
//   5. Feature keyword premiums (waterfront, ocean view, pool, penthouse, etc.)
//   6. Tokenization liquidity premium
//   7. 80/20 blend with asking price as sanity anchor
//
// Upgrade path to real AI (M6):
//   1. Implement AiBackedValuationEngine that calls your ML API endpoint
//   2. Change createValuationService() to return new AiBackedValuationEngine()
//   3. Replace getMockValuation() with a real DB query inside getValuation()
//   4. No consumer code changes needed — the IValuationService contract is stable
// ---------------------------------------------------------------------------

import type { AiValuation, AiConfidence, ValuationDriver, ValuationRange } from './valuation-types'
import { getMockValuation } from './mock-valuations'
import type { MockListing } from '@/lib/marketplace/mock-data'
import type { SellerListing } from '@/lib/listings/seller-mock-data'
import type { AIContext } from '@/lib/ai/ai-types'

// ---------------------------------------------------------------------------
// Input contract
// ---------------------------------------------------------------------------

export interface ValuationInput {
  listingId: string
  assetType: 'property' | 'land'
  /** RESIDENTIAL | COMMERCIAL | INDUSTRIAL | MIXED_USE | LAND */
  propertyType: string
  /** BUY | LEASE | LEASE_COMMERCIAL | LEASE_AGRICULTURAL */
  listingType?: string
  /** Seller's asking price — used as a 20% sanity anchor, not the estimate basis */
  askingPrice: number
  city: string
  state: string
  sqft?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  yearBuilt?: number | null
  lotAcres?: number | null
  features?: string[]
  isTokenized?: boolean
}

// ---------------------------------------------------------------------------
// Service interface — stable contract
// ---------------------------------------------------------------------------

export interface IValuationService {
  valuate(input: ValuationInput): AiValuation
}

// ---------------------------------------------------------------------------
// Regional benchmarks
// Source: approximated US market medians by state, Q1 2026.
// Upgrade path: replace with live DB lookups keyed to MSA / zip code.
// ---------------------------------------------------------------------------

const PROPERTY_BASE_RATE_BY_STATE: Record<string, number> = {
  CA: 520, NY: 480, MA: 430, WA: 380, CO: 320, TX: 200, GA: 180,
  FL: 220, NC: 185, TN: 175, OH: 145, IL: 200, AZ: 250, NV: 275,
  OR: 310, VA: 260, MD: 280, NJ: 320, PA: 175, MN: 185,
}
const DEFAULT_PROPERTY_RATE = 210  // $/sqft fallback

const LAND_BASE_RATE_BY_STATE: Record<string, number> = {
  CA: 45000, NY: 38000, MA: 35000, WA: 28000, CO: 18000, TX: 12000,
  GA: 8000,  FL: 15000, NC: 9000,  TN: 8500,  OH: 6500,  IL: 9000,
  AZ: 14000, NV: 10000, OR: 20000, VA: 14000, MD: 18000, NJ: 30000,
  PA: 9000,  MN: 7500,
}
const DEFAULT_LAND_RATE = 10000  // $/acre fallback

// ---------------------------------------------------------------------------
// MSA city premium multipliers
// Source: approximated Q1 2026 MSA premium over state median.
// Upgrade path: replace with live MSA DB keyed to city/zip.
// ---------------------------------------------------------------------------

const CITY_PREMIUM: Record<string, number> = {
  // California
  'san francisco': 1.35, 'san jose': 1.28, 'oakland': 1.18,
  'los angeles': 1.20, 'santa monica': 1.22, 'beverly hills': 1.40,
  'san diego': 1.12, 'irvine': 1.10,
  // New York
  'new york': 1.25, 'manhattan': 1.45, 'brooklyn': 1.18,
  'hoboken': 1.15, 'jersey city': 1.10,
  // Massachusetts
  'boston': 1.22, 'cambridge': 1.28, 'somerville': 1.15,
  // Washington
  'seattle': 1.20, 'bellevue': 1.18, 'redmond': 1.12,
  // Texas
  'austin': 1.15, 'dallas': 1.05, 'houston': 1.02,
  // Colorado
  'denver': 1.10, 'boulder': 1.18,
  // Florida
  'miami': 1.15, 'miami beach': 1.20, 'fort lauderdale': 1.08,
  'orlando': 1.04, 'tampa': 1.05,
  // Georgia
  'atlanta': 1.08,
  // Illinois
  'chicago': 1.08,
  // Arizona
  'scottsdale': 1.10, 'phoenix': 1.02,
  // Nevada
  'las vegas': 1.02,
  // Oregon
  'portland': 1.08,
  // Virginia / DC Metro
  'washington': 1.15, 'arlington': 1.12, 'mclean': 1.18,
  'bethesda': 1.15, 'alexandria': 1.10,
  // Minnesota
  'minneapolis': 1.05,
  // North Carolina
  'charlotte': 1.05, 'raleigh': 1.07,
}

function cityPremiumFactor(city: string, state: string): AppliedFactor {
  const key = city.toLowerCase().trim()
  const premium = CITY_PREMIUM[key]
  if (!premium || premium === 1.0) return { multiplier: 1.0, driver: null }

  const pct = Math.round((premium - 1) * 100)
  const direction = premium >= 1 ? 'POSITIVE' as const : 'NEGATIVE' as const
  const impact = pct >= 25 ? 'HIGH' as const : pct >= 12 ? 'MEDIUM' as const : 'LOW' as const

  return {
    multiplier: premium,
    driver: {
      label: `${city} metro premium`,
      description: `${city} commands a ${pct}% premium over the ${state} state median — driven by sustained demand, supply constraints, and economic strength in this MSA.`,
      direction,
      impact,
    },
  }
}

// ---------------------------------------------------------------------------
// Listing type factor — BUY vs LEASE
// ---------------------------------------------------------------------------

function listingTypeFactor(listingType: string | undefined): AppliedFactor {
  if (!listingType) return { multiplier: 1.0, driver: null }
  const lt = listingType.toUpperCase()

  if (lt === 'LEASE' || lt === 'LEASE_COMMERCIAL') {
    return {
      multiplier: 0.60,
      driver: {
        label: 'Lease pricing basis',
        description: 'Lease listings are priced on annual income yield, not sale value. Estimate reflects capitalized rental income at market cap rates.',
        direction: 'NEGATIVE',
        impact: 'HIGH',
      },
    }
  }
  if (lt === 'LEASE_AGRICULTURAL') {
    return {
      multiplier: 0.55,
      driver: {
        label: 'Agricultural lease basis',
        description: 'Agricultural land leases are priced on per-acre annual rent, not land sale value. Estimate reflects income-based capitalization.',
        direction: 'NEGATIVE',
        impact: 'HIGH',
      },
    }
  }
  return { multiplier: 1.0, driver: null }
}

// ---------------------------------------------------------------------------
// Feature keyword premium signals
// ---------------------------------------------------------------------------

interface FeatureSignal {
  keywords: string[]
  multiplier: number
  label: string
  description: string
}

const FEATURE_SIGNALS: FeatureSignal[] = [
  {
    keywords: ['waterfront', 'beachfront', 'oceanfront', 'lakefront', 'riverfront'],
    multiplier: 1.15,
    label: 'Waterfront premium',
    description: 'Direct water frontage commands a 15% premium — one of the most durable scarcity value drivers in residential and luxury markets.',
  },
  {
    keywords: ['ocean view', 'bay view', 'water view', 'lake view', 'mountain view', 'skyline view', 'city view'],
    multiplier: 1.08,
    label: 'Premium view premium',
    description: 'Significant view corridor adds an 8% premium — buyers consistently pay above-market for protected view lines.',
  },
  {
    keywords: ['penthouse', 'rooftop terrace', 'private terrace'],
    multiplier: 1.10,
    label: 'Penthouse / terrace premium',
    description: 'Penthouse positioning or private roof terrace commands a 10% premium over comparable units in the same building.',
  },
  {
    keywords: ['pool', 'infinity pool', 'heated pool', 'lap pool'],
    multiplier: 1.05,
    label: 'Pool premium',
    description: 'Private pool adds a 5% premium in most markets — higher in warm-climate MSAs where year-round use is typical.',
  },
  {
    keywords: ['smart home', 'home automation', 'smart system'],
    multiplier: 1.03,
    label: 'Smart home premium',
    description: 'Integrated smart home systems apply a 3% premium with tech-savvy buyer cohorts and newer luxury construction.',
  },
  {
    keywords: ['new construction', 'brand new', 'never lived', 'just built'],
    multiplier: 1.05,
    label: 'New construction premium',
    description: 'New construction designation adds a 5% premium — buyers value builder warranties, modern systems, and move-in condition.',
  },
  {
    keywords: ['historic', 'landmark', 'registered historic', 'heritage'],
    multiplier: 1.04,
    label: 'Historic designation premium',
    description: 'Registered historic or landmark designation adds a 4% premium — rare assets with character, sometimes eligible for tax benefits.',
  },
  {
    keywords: ['concierge', 'doorman', 'white glove', 'full service building'],
    multiplier: 1.04,
    label: 'Full-service building premium',
    description: 'Concierge and doorman services add a 4% premium in amenity-conscious urban markets.',
  },
]

function featurePremiumFactor(features: string[] | undefined): AppliedFactor {
  if (!features || features.length === 0) return { multiplier: 1.0, driver: null }
  const featureText = features.join(' ').toLowerCase()

  let bestSignal: FeatureSignal | null = null
  let bestMultiplier = 1.0

  for (const sig of FEATURE_SIGNALS) {
    if (sig.keywords.some(k => featureText.includes(k))) {
      if (sig.multiplier > bestMultiplier) {
        bestMultiplier = sig.multiplier
        bestSignal = sig
      }
    }
  }

  if (!bestSignal) return { multiplier: 1.0, driver: null }
  const pct = Math.round((bestMultiplier - 1) * 100)

  return {
    multiplier: bestMultiplier,
    driver: {
      label: bestSignal.label,
      description: bestSignal.description,
      direction: 'POSITIVE',
      impact: pct >= 12 ? 'HIGH' : pct >= 6 ? 'MEDIUM' : 'LOW',
    },
  }
}

// ---------------------------------------------------------------------------
// Factor types
// ---------------------------------------------------------------------------

interface AppliedFactor {
  multiplier: number
  driver: ValuationDriver | null
}

// ---------------------------------------------------------------------------
// Property factors
// ---------------------------------------------------------------------------

function ageFactors(yearBuilt: number | null | undefined): AppliedFactor[] {
  if (!yearBuilt) return []
  const age = 2026 - yearBuilt
  if (age <= 5) return [{
    multiplier: 1.07,
    driver: { label: 'New construction premium', description: `Built ${yearBuilt} — near-new condition, modern systems, and finishes command a 7% premium over comparable older stock.`, direction: 'POSITIVE', impact: 'MEDIUM' },
  }]
  if (age <= 15) return [{
    multiplier: 1.03,
    driver: { label: 'Modern construction', description: `${yearBuilt} build is well within expected major system lifespan, applying a modest 3% recency premium over mid-cycle inventory.`, direction: 'POSITIVE', impact: 'LOW' },
  }]
  if (age >= 30 && age < 70) return [{
    multiplier: 0.97,
    driver: { label: 'Age adjustment', description: `${age}-year-old structure. Model applies a 3% aging discount vs. comparable newer inventory for likely deferred capital needs.`, direction: 'NEGATIVE', impact: 'LOW' },
  }]
  if (age >= 70 && age < 110) return [{
    multiplier: 1.02,
    driver: { label: 'Vintage character premium', description: `${yearBuilt} vintage — period character and architectural detail attract a 2% premium over mid-century comps in comparable condition.`, direction: 'POSITIVE', impact: 'LOW' },
  }]
  if (age >= 110) return [{
    multiplier: 1.05,
    driver: { label: 'Historic character premium', description: `${yearBuilt} construction qualifies for historic classification premium (+5%) where condition and provenance are maintained.`, direction: 'POSITIVE', impact: 'MEDIUM' },
  }]
  return []
}

function propertyTypeFactor(propertyType: string): AppliedFactor {
  switch (propertyType) {
    case 'INDUSTRIAL': return {
      multiplier: 1.05,
      driver: { label: 'Industrial asset premium', description: 'Industrial / logistics assets trade at elevated per-sqft multiples driven by strong NNN lease structures, low vacancy, and e-commerce tailwinds.', direction: 'POSITIVE', impact: 'MEDIUM' },
    }
    case 'COMMERCIAL': return {
      multiplier: 0.94,
      driver: { label: 'Office sector headwinds', description: 'Elevated national office vacancy (18%+) and sustained hybrid work adoption apply a 6% structural discount to commercial assets.', direction: 'NEGATIVE', impact: 'MEDIUM' },
    }
    case 'MIXED_USE': return {
      multiplier: 1.02,
      driver: { label: 'Mixed-use flexibility', description: 'Dual residential/commercial zoning commands a 2% flexibility premium and attracts a broader buyer pool.', direction: 'POSITIVE', impact: 'LOW' },
    }
    default: return { multiplier: 1.0, driver: null }
  }
}

function roomDensityFactor(sqft: number | null | undefined, bedrooms: number | null | undefined): AppliedFactor {
  if (!sqft || !bedrooms || bedrooms === 0) return { multiplier: 1.0, driver: null }
  const density = sqft / bedrooms
  if (density >= 900) return {
    multiplier: 1.03,
    driver: { label: 'Spacious floor plan', description: `${Math.round(density)} sqft/bedroom is well above the 650 sqft/bed median — generous layouts command a 3% premium.`, direction: 'POSITIVE', impact: 'LOW' },
  }
  if (density <= 350) return {
    multiplier: 0.97,
    driver: { label: 'Compact layout density', description: `${Math.round(density)} sqft/bedroom is below typical comfort thresholds — buyers apply a minor layout discount.`, direction: 'NEGATIVE', impact: 'LOW' },
  }
  return { multiplier: 1.0, driver: null }
}

function tokenizationFactor(isTokenized: boolean | undefined): AppliedFactor {
  if (!isTokenized) return { multiplier: 1.0, driver: null }
  return {
    multiplier: 1.02,
    driver: { label: 'Tokenization liquidity premium', description: 'Fractional ownership via blockchain tokens increases market liquidity and broadens the investor base, supporting a 2% liquidity premium.', direction: 'POSITIVE', impact: 'LOW' },
  }
}

// ---------------------------------------------------------------------------
// Land factors
// ---------------------------------------------------------------------------

type LandSubtype =
  | 'VINEYARD' | 'COMMERCIAL' | 'MIXED_USE' | 'DEVELOPMENT'
  | 'RESIDENTIAL' | 'INDUSTRIAL' | 'TIMBER' | 'RECREATION'
  | 'AGRICULTURAL' | 'RANCH'

function inferLandSubtype(features: string[] = [], title = ''): LandSubtype {
  const combined = [...features, title].join(' ').toLowerCase()
  if (combined.includes('vineyard') || combined.includes('wine'))                           return 'VINEYARD'
  if (combined.includes('commercial') || combined.includes('retail'))                       return 'COMMERCIAL'
  if (combined.includes('mixed'))                                                            return 'MIXED_USE'
  if (combined.includes('development') || combined.includes('entitled') || combined.includes('transit')) return 'DEVELOPMENT'
  if (combined.includes('industrial') || combined.includes('logistics') || combined.includes('warehouse')) return 'INDUSTRIAL'
  if (combined.includes('timber') || combined.includes('forest'))                           return 'TIMBER'
  if (combined.includes('recreation') || combined.includes('hunting') || combined.includes('fishing')) return 'RECREATION'
  if (combined.includes('ranch') || combined.includes('cattle'))                            return 'RANCH'
  if (combined.includes('agricultural') || combined.includes('farm') || combined.includes('crop')) return 'AGRICULTURAL'
  return 'RESIDENTIAL'
}

const LAND_SUBTYPE_CONFIG: Record<LandSubtype, { multiplier: number; label: string; description: string; direction: 'POSITIVE' | 'NEGATIVE' }> = {
  VINEYARD:     { multiplier: 1.25, label: 'Vineyard / AVA premium',      description: 'Established vineyard land with AVA access commands a 25% premium over generic agricultural parcels in the same county.', direction: 'POSITIVE' },
  COMMERCIAL:   { multiplier: 1.20, label: 'Commercial use premium',       description: 'Commercial-zoned parcels trade at 20% above residential land on a per-acre basis due to higher-density development potential.', direction: 'POSITIVE' },
  MIXED_USE:    { multiplier: 1.20, label: 'Mixed-use zoning premium',     description: 'Dual-zoned parcels command a 20% premium over single-use land — broader entitlement and flexible development pathways.', direction: 'POSITIVE' },
  DEVELOPMENT:  { multiplier: 1.15, label: 'Development land premium',     description: 'Entitled or shovel-ready development parcels command a 15% premium reflecting the value of approvals and reduced timeline risk.', direction: 'POSITIVE' },
  INDUSTRIAL:   { multiplier: 1.10, label: 'Industrial land premium',      description: 'Industrial-zoned land commands a 10% premium in strong logistics markets driven by last-mile and distribution demand.', direction: 'POSITIVE' },
  RESIDENTIAL:  { multiplier: 1.08, label: 'Residential development land', description: 'Residential-zoned parcel commands an 8% premium over raw agricultural land in the same county — ready for permitting.', direction: 'POSITIVE' },
  TIMBER:       { multiplier: 0.78, label: 'Timber / forest discount',     description: 'Timber and forested land trades at a 22% discount vs. development-ready land — lower return profile and longer hold periods.', direction: 'NEGATIVE' },
  RECREATION:   { multiplier: 0.78, label: 'Recreational land discount',   description: 'Recreation-focused parcels trade at a 22% discount vs. development land — limited income potential and niche buyer pool.', direction: 'NEGATIVE' },
  AGRICULTURAL: { multiplier: 0.85, label: 'Agricultural land rate',       description: 'Agricultural / farmland carries a 15% discount vs. residential land in the same state — reflects lower per-acre income potential.', direction: 'NEGATIVE' },
  RANCH:        { multiplier: 0.85, label: 'Ranch land rate',              description: 'Ranch / livestock land trades at a 15% discount vs. development parcels in the same region.', direction: 'NEGATIVE' },
}

function landSubtypeFactor(features: string[] | undefined, propertyType: string): AppliedFactor {
  const subtype = inferLandSubtype(features, propertyType)
  const cfg = LAND_SUBTYPE_CONFIG[subtype]
  const delta = Math.abs(cfg.multiplier - 1)
  return {
    multiplier: cfg.multiplier,
    driver: {
      label: cfg.label,
      description: cfg.description,
      direction: cfg.direction,
      impact: delta >= 0.15 ? 'HIGH' : delta >= 0.08 ? 'MEDIUM' : 'LOW',
    },
  }
}

function landSizeFactor(lotAcres: number | null | undefined): AppliedFactor {
  if (!lotAcres) return { multiplier: 1.0, driver: null }
  if (lotAcres < 1) return {
    multiplier: 1.08,
    driver: { label: 'Infill / small-lot premium', description: `${lotAcres.toFixed(2)}-acre infill parcel commands an 8% premium — scarcity value in supply-constrained markets.`, direction: 'POSITIVE', impact: 'MEDIUM' },
  }
  if (lotAcres > 500) return {
    multiplier: 0.92,
    driver: { label: 'Large-tract discount', description: `${Math.round(lotAcres)}-acre parcel applies an 8% large-tract discount — per-unit liquidity premium of smaller investable lots is absent.`, direction: 'NEGATIVE', impact: 'LOW' },
  }
  return { multiplier: 1.0, driver: null }
}

// ---------------------------------------------------------------------------
// Confidence scoring — based on data completeness
// ---------------------------------------------------------------------------

function computeConfidence(input: ValuationInput): AiConfidence {
  let score = 0
  if (input.askingPrice > 0)                       score += 4
  if (input.sqft)                                  score += 2
  if (input.yearBuilt)                             score += 1
  if (input.bedrooms != null)                      score += 1
  if (input.lotAcres != null)                      score += 1
  if (input.features && input.features.length > 0) score += 1
  // City-level MSA data available → higher confidence
  const cityKey = input.city.toLowerCase().trim()
  if (CITY_PREMIUM[cityKey])                       score += 1
  if (score >= 9) return 'VERY_HIGH'
  if (score >= 7) return 'HIGH'
  if (score >= 5) return 'MEDIUM'
  return 'LOW'
}

// ---------------------------------------------------------------------------
// Confidence → range spread
// ---------------------------------------------------------------------------

function buildRange(mid: number, confidence: AiConfidence): ValuationRange {
  const SPREAD: Record<AiConfidence, [number, number]> = {
    VERY_HIGH: [5,  7],
    HIGH:      [7,  9],
    MEDIUM:    [12, 14],
    LOW:       [18, 22],
  }
  const [pctLow, pctHigh] = SPREAD[confidence]
  return {
    low:  Math.round(mid * (1 - pctLow  / 100)),
    mid,
    high: Math.round(mid * (1 + pctHigh / 100)),
  }
}

// ---------------------------------------------------------------------------
// Narrative summary
// ---------------------------------------------------------------------------

function buildSummary(
  input: ValuationInput,
  estimatedValue: number,
  confidence: AiConfidence,
  drivers: ValuationDriver[],
): string {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1_000).toFixed(0)}K`

  const topPositive = drivers.find(d => d.direction === 'POSITIVE' && d.impact === 'HIGH')
    ?? drivers.find(d => d.direction === 'POSITIVE')
  const topNegative = drivers.find(d => d.direction === 'NEGATIVE' && d.impact === 'HIGH')
    ?? drivers.find(d => d.direction === 'NEGATIVE')
  const confLabel = { HIGH: 'high', MEDIUM: 'moderate', LOW: 'limited', VERY_HIGH: 'very high' }[confidence]
  const location = `${input.city}, ${input.state}`

  if (input.assetType === 'land') {
    const sizeStr = input.lotAcres ? `${input.lotAcres}-acre ` : ''
    return (
      `Scoring estimate of ${fmt(estimatedValue)} for this ${sizeStr}parcel in ${location}. ` +
      `Confidence is ${confLabel} based on available data. ` +
      (topPositive ? `Top positive factor: ${topPositive.label.toLowerCase()}. ` : '') +
      (topNegative ? `Top headwind: ${topNegative.label.toLowerCase()}. ` : '') +
      `Comparable sales and zoning analysis would sharpen this estimate.`
    )
  }

  const size = input.sqft ? ` (${input.sqft.toLocaleString()} sqft)` : ''
  return (
    `Scoring estimate of ${fmt(estimatedValue)} for this ${input.propertyType.toLowerCase()}${size} in ${location}. ` +
    `Confidence is ${confLabel}. ` +
    (topPositive ? `Strongest positive factor: ${topPositive.label.toLowerCase()}. ` : '') +
    (topNegative ? `Key headwind: ${topNegative.label.toLowerCase()}. ` : '') +
    `A comparable-sales analysis and on-site inspection would further calibrate this estimate.`
  )
}

// ---------------------------------------------------------------------------
// RuleBasedValuationEngine
// ---------------------------------------------------------------------------

class RuleBasedValuationEngine implements IValuationService {
  valuate(input: ValuationInput): AiValuation {
    const confidence = computeConfidence(input)
    const factors: AppliedFactor[] = []
    let mid: number

    if (input.assetType === 'land') {
      const baseRate = LAND_BASE_RATE_BY_STATE[input.state.toUpperCase()] ?? DEFAULT_LAND_RATE
      const acres = input.lotAcres ?? 1
      mid = baseRate * acres
      factors.push(cityPremiumFactor(input.city, input.state))
      factors.push(landSubtypeFactor(input.features, input.propertyType))
      factors.push(landSizeFactor(input.lotAcres))
      factors.push(listingTypeFactor(input.listingType))
      factors.push(tokenizationFactor(input.isTokenized))
    } else {
      const baseRate = PROPERTY_BASE_RATE_BY_STATE[input.state.toUpperCase()] ?? DEFAULT_PROPERTY_RATE
      const effectiveSqft = input.sqft ?? 1500
      mid = baseRate * effectiveSqft
      factors.push(cityPremiumFactor(input.city, input.state))
      factors.push(...ageFactors(input.yearBuilt))
      factors.push(propertyTypeFactor(input.propertyType))
      factors.push(roomDensityFactor(input.sqft, input.bedrooms))
      factors.push(featurePremiumFactor(input.features))
      factors.push(listingTypeFactor(input.listingType))
      factors.push(tokenizationFactor(input.isTokenized))
    }

    for (const f of factors) mid = Math.round(mid * f.multiplier)

    // Blend: 80% model + 20% asking price — sanity anchor prevents extreme divergence
    const estimatedValue = Math.round(mid * 0.8 + input.askingPrice * 0.2)

    const drivers: ValuationDriver[] = factors
      .filter((f): f is AppliedFactor & { driver: ValuationDriver } => f.driver !== null)
      .map(f => f.driver)
      .sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const
        return order[a.impact] - order[b.impact]
      })

    const range   = buildRange(estimatedValue, confidence)
    const summary = buildSummary(input, estimatedValue, confidence, drivers)

    return {
      listingId:     input.listingId,
      assetType:     input.assetType,
      estimatedValue,
      confidence,
      range,
      drivers,
      comparables:   [],  // No comparable lookups in rule-based engine — M6: query comps DB
      modelVersion:  'tigi-val-v1.1-scoring',
      generatedAt:   new Date().toISOString(),
      methodology:   'Multi-layer scoring: state base rate × MSA city premium × listing type factor × asset-specific adjustments (age, type, density, feature premiums, tokenization). Blended 80/20 with asking price as sanity anchor.',
      summary,
    }
  }
}

// ---------------------------------------------------------------------------
// Factory — the single place to swap engines
// ---------------------------------------------------------------------------

export function createValuationService(): IValuationService {
  // M6 upgrade: return new AiBackedValuationEngine(config) — no consumer changes needed
  return new RuleBasedValuationEngine()
}

// ---------------------------------------------------------------------------
// getValuation — top-level call for all consumers
// ---------------------------------------------------------------------------

/**
 * Returns a structured valuation for any listing.
 *
 * Priority 1: pre-baked high-fidelity mock (drivers + comparables).
 * Priority 2: rule-based engine (always produces a value; no comparables).
 *
 * M6 upgrade:
 *   Replace Priority 1 with: await prisma.valuation.findFirst({ where: { listingId, status: 'COMPLETE' } })
 *   Replace Priority 2 engine call with: await aiService.run(input)
 */
export async function getValuation(listingId: string, input: ValuationInput): Promise<AiValuation> {
  const prebaked = getMockValuation(listingId)
  if (prebaked) return prebaked
  return createValuationService().valuate(input)
}

// ---------------------------------------------------------------------------
// getEnrichedValuation — AI-enhanced narrative for Pro users
// ---------------------------------------------------------------------------

/**
 * Returns a valuation with an AI-enriched narrative summary for Pro+ users.
 *
 * For free users or when AI_PROVIDER=mock: identical to getValuation() — the
 * rule-based summary is returned unchanged.
 *
 * For Pro+ users with AI_PROVIDER=anthropic: the summary field is replaced
 * with an LLM-generated institutional-quality prose narrative.
 *
 * Uses dynamic import to avoid bundling orchestrator into mock-only builds.
 */
export async function getEnrichedValuation(
  listingId: string,
  input: ValuationInput,
  context?: AIContext,
): Promise<AiValuation> {
  const base = await getValuation(listingId, input)

  // Dynamic import keeps the orchestrator out of the critical path for
  // free-tier and mock-mode requests.
  const { getAIOrchestrator } = await import('@/lib/ai/orchestrator')
  const narrativeResponse = await getAIOrchestrator().enrichValuationNarrative(base, input, context)

  if (narrativeResponse.provider === 'anthropic') {
    return { ...base, summary: narrativeResponse.result }
  }

  return base
}

// ---------------------------------------------------------------------------
// Input adapters
// ---------------------------------------------------------------------------

export function marketplaceListingToInput(listing: MockListing): ValuationInput {
  return {
    listingId:    listing.id,
    assetType:    listing.propertyType === 'LAND' ? 'land' : 'property',
    propertyType: listing.propertyType,
    askingPrice:  listing.price,
    city:         listing.city,
    state:        listing.state,
    sqft:         listing.sqft,
    bedrooms:     listing.bedrooms,
    bathrooms:    listing.bathrooms,
    yearBuilt:    listing.yearBuilt,
    lotAcres:     listing.lotAcres,
    features:     listing.features,
    isTokenized:  listing.isTokenized,
  }
}

export function sellerListingToInput(listing: SellerListing): ValuationInput {
  return {
    listingId:    listing.id,
    assetType:    listing.assetType === 'LAND' ? 'land' : 'property',
    propertyType: listing.subtype,
    askingPrice:  listing.price ?? 0,
    city:         listing.city,
    state:        listing.state,
    sqft:         listing.sqft ?? undefined,
    bedrooms:     listing.bedrooms ?? undefined,
    bathrooms:    listing.bathrooms ?? undefined,
    yearBuilt:    listing.yearBuilt ?? undefined,
    lotAcres:     listing.lotAcres ?? undefined,
    features:     [],  // SellerListing has no features field — populated by DB in M2
    isTokenized:  listing.isTokenized,
  }
}
