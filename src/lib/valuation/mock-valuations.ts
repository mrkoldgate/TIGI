// ---------------------------------------------------------------------------
// TIGI AI Valuation — Mock structured data.
//
// Provides rich valuation objects for a curated subset of listings.
// Listings without an entry here get a gracefully-degraded panel
// (estimate + confidence only, no drivers / comps / range).
//
// DB integration path:
//   Replace getMockValuation() with:
//     const v = await prisma.valuation.findFirst({
//       where: { listingId, status: 'COMPLETE' },
//       orderBy: { generatedAt: 'desc' },
//     })
//     return v ? deserializeValuation(v) : null
//
// Service integration path (real-time):
//     const v = await valuationService.run({ listing, modelVersion: 'latest' })
// ---------------------------------------------------------------------------

import {
  type AiValuation,
  type ValuationDriver,
  type ValuationComparable,
} from './valuation-types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function range(mid: number, pctLow: number, pctHigh: number) {
  return {
    low:  Math.round(mid * (1 - pctLow  / 100)),
    mid,
    high: Math.round(mid * (1 + pctHigh / 100)),
  }
}

// ---------------------------------------------------------------------------
// Mock valuation records
// ---------------------------------------------------------------------------

const MOCK_VALUATIONS: AiValuation[] = [

  // ── res-001 · Westside Craftsman Bungalow ─────────────────────────────
  {
    listingId: 'res-001',
    assetType: 'property',
    estimatedValue: 492000,
    confidence: 'HIGH',
    range: range(492000, 7, 9),
    methodology: 'Comparable sales (6-month window, ≤0.5 mi), walkability scoring, condition adjustment, renovation premium.',
    modelVersion: 'tigi-val-v0.2-mock',
    generatedAt: '2026-03-07T08:00:00Z',
    drivers: [
      {
        label: 'Location premium',
        description: 'South Austin 78704 carries a 12% premium over city median. High walkability (86/100) and proximity to Barton Springs.',
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Renovation quality',
        description: 'Updated kitchen and bathrooms add an estimated $18K–22K over unrenovated comparables in the same block group.',
        direction: 'POSITIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Age of construction',
        description: '1924 build date applies a modest vintage discount (–3%) relative to post-2000 comps, partially offset by historic character premium.',
        direction: 'NEGATIVE',
        impact: 'LOW',
      },
      {
        label: 'Lot size',
        description: '0.18 acres is slightly below median for South Austin (0.22 ac), contributing a marginal downward adjustment.',
        direction: 'NEGATIVE',
        impact: 'LOW',
      },
    ] satisfies ValuationDriver[],
    comparables: [
      {
        address: '1712 Kenwood Ave, Austin TX',
        soldPrice: 488000,
        soldDate: 'Feb 2026',
        sqft: 1760,
        pricePerSqft: 277,
        similarityScore: 96,
      },
      {
        address: '2304 South 5th St, Austin TX',
        soldPrice: 503000,
        soldDate: 'Jan 2026',
        sqft: 1910,
        pricePerSqft: 263,
        similarityScore: 91,
      },
      {
        address: '3018 Menchaca Rd, Austin TX',
        soldPrice: 471000,
        soldDate: 'Dec 2025',
        sqft: 1680,
        pricePerSqft: 280,
        similarityScore: 88,
      },
    ] satisfies ValuationComparable[],
  },

  // ── res-002 · Midtown Modern Townhome ─────────────────────────────────
  {
    listingId: 'res-002',
    assetType: 'property',
    estimatedValue: 635000,
    confidence: 'HIGH',
    range: range(635000, 6, 8),
    methodology: 'Comparable sales (90-day window), floor-level premium, view adjustment, smart-home premium.',
    modelVersion: 'tigi-val-v0.2-mock',
    generatedAt: '2026-03-06T10:00:00Z',
    drivers: [
      {
        label: 'Midtown Atlanta location',
        description: "Midtown commands a 15% premium over metro median. Walk Score 94/100, 3 blocks from MARTA and Piedmont Park.",
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Build year & condition',
        description: '2019 construction is in the top quartile of comparable inventory, reducing capital expenditure risk and supporting ask.',
        direction: 'POSITIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Rooftop terrace',
        description: 'Private outdoor space adds an estimated $12K–18K for Atlanta townhomes in this price band.',
        direction: 'POSITIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'HOA exposure',
        description: 'Townhome HOA fees in this submarket average $425/mo, which buyers factor into effective cost — modest downward pressure.',
        direction: 'NEGATIVE',
        impact: 'LOW',
      },
    ] satisfies ValuationDriver[],
    comparables: [
      {
        address: '820 Juniper St NE, Atlanta GA',
        soldPrice: 628000,
        soldDate: 'Feb 2026',
        sqft: 2180,
        pricePerSqft: 288,
        similarityScore: 94,
      },
      {
        address: '241 10th St NW, Atlanta GA',
        soldPrice: 649000,
        soldDate: 'Jan 2026',
        sqft: 2300,
        pricePerSqft: 282,
        similarityScore: 90,
      },
    ] satisfies ValuationComparable[],
  },

  // ── res-007 · Victorian South End Brownstone ──────────────────────────
  {
    listingId: 'res-007',
    assetType: 'property',
    estimatedValue: 1020000,
    confidence: 'HIGH',
    range: range(1020000, 8, 10),
    methodology: 'Comparable sales (4-month window), historic district premium, period restoration premium, density adjustment.',
    modelVersion: 'tigi-val-v0.2-mock',
    generatedAt: '2026-03-05T14:00:00Z',
    drivers: [
      {
        label: 'Historic district premium',
        description: 'South End historic district carries a verified 14–18% premium over adjacent non-historic parcels. Irreplaceable character.',
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Period restoration quality',
        description: 'Documented meticulous restoration commands a 7% premium over standard-condition brownstones.',
        direction: 'POSITIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Parking included',
        description: 'Off-street parking is extremely scarce in this submarket — adds $35K–50K of standalone value.',
        direction: 'POSITIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Age of systems',
        description: '1892 structure likely has aged mechanicals despite cosmetic restoration. Buyers typically discount ~$20K for expected capital work.',
        direction: 'NEGATIVE',
        impact: 'MEDIUM',
      },
    ] satisfies ValuationDriver[],
    comparables: [
      {
        address: '44 Rutland Square, Boston MA',
        soldPrice: 1045000,
        soldDate: 'Jan 2026',
        sqft: 2720,
        pricePerSqft: 384,
        similarityScore: 92,
      },
      {
        address: '186 West Brookline St, Boston MA',
        soldPrice: 998000,
        soldDate: 'Dec 2025',
        sqft: 2580,
        pricePerSqft: 387,
        similarityScore: 89,
      },
    ] satisfies ValuationComparable[],
  },

  // ── com-001 · Class-A Downtown Office Suite ───────────────────────────
  {
    listingId: 'com-001',
    assetType: 'property',
    estimatedValue: 2250000,
    confidence: 'MEDIUM',
    range: range(2250000, 10, 12),
    methodology: 'Income capitalization (market cap rate 5.8%), comparable sales (12-month), class-A premium, floor-level adjustment.',
    modelVersion: 'tigi-val-v0.2-mock',
    generatedAt: '2026-03-04T09:00:00Z',
    drivers: [
      {
        label: 'Prime office location',
        description: "Denver's LoDo submarket commands Class-A rents of $42–48 PSF. 22nd floor position and mountain views justify top-of-range rent.",
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Custom tenant buildout',
        description: 'High-quality existing buildout reduces incoming buyer TI costs by an estimated $380K vs. shell delivery.',
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Office sector headwinds',
        description: 'Denver CBD office vacancy at 18.4% (Q4 2025) creates cap rate expansion risk. TIGI model applies a 15-bp vacancy discount.',
        direction: 'NEGATIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Parking ratio',
        description: 'Included parking below market ratio (2.5/1000 vs 3.5/1000 submarkt avg) — minor drag.',
        direction: 'NEGATIVE',
        impact: 'LOW',
      },
    ] satisfies ValuationDriver[],
    comparables: [
      {
        address: '1700 Lincoln St, Denver CO (Fl 18)',
        soldPrice: 2180000,
        soldDate: 'Nov 2025',
        sqft: 13200,
        pricePerSqft: 165,
        similarityScore: 88,
      },
      {
        address: '1401 Lawrence St, Denver CO (Fl 24)',
        soldPrice: 2320000,
        soldDate: 'Oct 2025',
        sqft: 14800,
        pricePerSqft: 157,
        similarityScore: 83,
      },
    ] satisfies ValuationComparable[],
  },

  // ── ind-001 · Last-Mile Logistics Hub ─────────────────────────────────
  {
    listingId: 'ind-001',
    assetType: 'property',
    estimatedValue: 4050000,
    confidence: 'HIGH',
    range: range(4050000, 5, 7),
    methodology: 'Income capitalization (4.8% cap), comparable industrial sales, NNN lease premium, clear-height premium.',
    modelVersion: 'tigi-val-v0.2-mock',
    generatedAt: '2026-03-06T16:00:00Z',
    drivers: [
      {
        label: 'Memphis logistics corridor',
        description: "Top-5 US distribution market. Access to I-40/I-55 interchange commands 8–12% location premium over generic industrial.",
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'NNN lease structure',
        description: 'Long-term NNN lease eliminates landlord expense risk, supporting a sub-5% cap rate vs. multi-tenant industrial benchmark.',
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: "32' clear height",
        description: "Above-market clear height (submarket median 28') adds significant reusability value for future tenants.",
        direction: 'POSITIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Single-tenant concentration',
        description: 'Single-tenant NNN introduces rollover risk. Buyers typically require 20–50 bps spread over multi-tenant for this structure.',
        direction: 'NEGATIVE',
        impact: 'LOW',
      },
    ] satisfies ValuationDriver[],
    comparables: [
      {
        address: '4800 Distriplex Farms Blvd, Memphis TN',
        soldPrice: 3920000,
        soldDate: 'Jan 2026',
        sqft: 65000,
        pricePerSqft: 60,
        similarityScore: 93,
      },
      {
        address: '5600 New Getwell Rd, Memphis TN',
        soldPrice: 4200000,
        soldDate: 'Dec 2025',
        sqft: 71000,
        pricePerSqft: 59,
        similarityScore: 87,
      },
    ] satisfies ValuationComparable[],
  },

  // ── land-001 · Sonoma County Vineyard Parcel ──────────────────────────
  {
    listingId: 'land-001',
    assetType: 'land',
    estimatedValue: 940000,
    confidence: 'MEDIUM',
    range: range(940000, 12, 14),
    methodology: 'Comparable vineyard land sales (18-month window), water rights premium, irrigation discount factor, AVA designation premium.',
    modelVersion: 'tigi-val-v0.2-mock',
    generatedAt: '2026-03-05T12:00:00Z',
    drivers: [
      {
        label: 'AVA designation value',
        description: 'Sonoma County AVA designation commands a 20–30% premium over non-designated agricultural land in the county.',
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Water rights',
        description: 'Appurtenant water rights are extremely valuable in drought-risk California — adds an estimated $120K–180K standalone value.',
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Established vineyard infrastructure',
        description: 'Existing trellis, drip irrigation, and canopy management system reduces buyer development cost by $40K–60K.',
        direction: 'POSITIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Market liquidity',
        description: 'Vineyard parcels trade infrequently (avg. 18-month DOM). Model confidence reduced due to limited recent comparables.',
        direction: 'NEUTRAL',
        impact: 'MEDIUM',
      },
    ] satisfies ValuationDriver[],
    comparables: [
      {
        address: '8200 Dry Creek Rd, Healdsburg CA',
        soldPrice: 960000,
        soldDate: 'Sep 2025',
        acres: 28,
        pricePerAcre: 34285,
        similarityScore: 84,
      },
      {
        address: '14500 Highway 128, Geyserville CA',
        soldPrice: 875000,
        soldDate: 'Jul 2025',
        acres: 22,
        pricePerAcre: 39772,
        similarityScore: 79,
      },
    ] satisfies ValuationComparable[],
  },

  // ── land-002 · East Austin Development Opportunity ────────────────────
  {
    listingId: 'land-002',
    assetType: 'land',
    estimatedValue: 1580000,
    confidence: 'MEDIUM',
    range: range(1580000, 14, 18),
    methodology: 'Residual land value (RLV) model, comparable entitled land sales, transit adjacency premium, entitlement risk discount.',
    modelVersion: 'tigi-val-v0.2-mock',
    generatedAt: '2026-03-06T11:00:00Z',
    drivers: [
      {
        label: 'Transit adjacency',
        description: 'Two blocks from planned Red Line station. TOD sites in Austin command 25–40% premium. Station opening est. 2027.',
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Mixed-use entitlement',
        description: 'Permits up to 8 stories (80 ft height limit). RLV model supports $347K/buildable acre for MU-5 zoned parcels.',
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Shovel-ready condition',
        description: 'Graded lot with all utilities at site reduces holding costs and development timeline by 6–9 months.',
        direction: 'POSITIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Construction cost environment',
        description: 'Austin construction costs up 18% since 2023. Reduces developer margin headroom, creating modest downward pressure on land pricing.',
        direction: 'NEGATIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Transit timeline risk',
        description: 'Red Line station opening is subject to city approvals. Delay risk applied as a 4% discount to transit premium.',
        direction: 'NEGATIVE',
        impact: 'LOW',
      },
    ] satisfies ValuationDriver[],
    comparables: [
      {
        address: '5800 E Cesar Chavez St, Austin TX',
        soldPrice: 1620000,
        soldDate: 'Jan 2026',
        acres: 4.6,
        pricePerAcre: 352174,
        similarityScore: 88,
      },
      {
        address: '3300 Springdale Rd, Austin TX',
        soldPrice: 1480000,
        soldDate: 'Nov 2025',
        acres: 3.9,
        pricePerAcre: 379487,
        similarityScore: 82,
      },
    ] satisfies ValuationComparable[],
  },

  // ── land-005 · Industrial Zoned Development Lot ───────────────────────
  {
    listingId: 'land-005',
    assetType: 'land',
    estimatedValue: 650000,
    confidence: 'MEDIUM',
    range: range(650000, 10, 12),
    methodology: 'Comparable industrial land sales (12-month window), DFW logistics premium, rail spur premium, utility availability adjustment.',
    modelVersion: 'tigi-val-v0.2-mock',
    generatedAt: '2026-03-04T15:00:00Z',
    drivers: [
      {
        label: 'DFW logistics corridor',
        description: 'DFW is the #3 industrial market nationally. Parcels within 5 miles of DFW Airport command a 15–20% location premium.',
        direction: 'POSITIVE',
        impact: 'HIGH',
      },
      {
        label: 'Rail spur availability',
        description: 'Adjacent rail spur access significantly expands the tenant universe and adds $45K–65K to appraised land value.',
        direction: 'POSITIVE',
        impact: 'MEDIUM',
      },
      {
        label: 'Utilities at road (not site)',
        description: 'Utility extension cost est. $28K–40K. Applied as a direct deduction from gross land value.',
        direction: 'NEGATIVE',
        impact: 'LOW',
      },
    ] satisfies ValuationDriver[],
    comparables: [
      {
        address: '1400 109th St, Plano TX',
        soldPrice: 632000,
        soldDate: 'Dec 2025',
        acres: 7.6,
        pricePerAcre: 83158,
        similarityScore: 90,
      },
      {
        address: '2800 Surveyor Blvd, Carrollton TX',
        soldPrice: 680000,
        soldDate: 'Oct 2025',
        acres: 8.4,
        pricePerAcre: 80952,
        similarityScore: 85,
      },
    ] satisfies ValuationComparable[],
  },
]

// ---------------------------------------------------------------------------
// Lookup function — the single integration point for consumers
// ---------------------------------------------------------------------------

const VALUATION_MAP = new Map(MOCK_VALUATIONS.map((v) => [v.listingId, v]))

/**
 * Returns the full structured valuation for a listing, or null if none exists.
 *
 * DB integration path:
 *   Replace this with an async function:
 *     export async function getValuation(listingId: string): Promise<AiValuation | null>
 *   that queries: prisma.valuation.findFirst({ where: { listingId, status: 'COMPLETE' } })
 */
export function getMockValuation(listingId: string): AiValuation | null {
  return VALUATION_MAP.get(listingId) ?? null
}

/** All valuation IDs — useful for preloading / cache warming */
export const VALUATED_LISTING_IDS = new Set(MOCK_VALUATIONS.map((v) => v.listingId))
