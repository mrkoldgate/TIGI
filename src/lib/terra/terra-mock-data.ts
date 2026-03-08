/**
 * terra-mock-data.ts — Extended land listings with structured Terra data.
 *
 * These are TerraListing objects: the base MockListing fields re-used from
 * mock-data.ts, extended with leaseTerms + devOpportunity.
 *
 * Replacing this with real DB queries = swap TERRA_LISTINGS for:
 *   prisma.property.findMany({ where: { type: 'LAND' }, include: { leaseTerms: true, devOpportunity: true } })
 */

import { MOCK_LISTINGS } from '@/lib/marketplace/mock-data'
import type { TerraListing, LeaseTerms, DevOpportunity } from './terra-types'

// ── Lease term templates ───────────────────────────────────────────────────

const AGRICULTURAL_LEASE: LeaseTerms = {
  durationType:        'FLEXIBLE',
  minimumMonths:       12,
  maximumMonths:       60,
  rateMonthly:         3800,
  rateAnnual:          45600,
  ratePerAcre:         2073,
  securityDeposit:     11400,
  escalationType:      'CPI',
  escalationRate:      null,
  hasRenewalOption:    true,
  renewalTermMonths:   36,
  hasPurchaseOption:   true,
  purchaseOptionPrice: 890000,
  allowedUses:    ['Vineyard operations', 'Dry farming', 'Organic cultivation', 'Agri-tourism (permitted)'],
  prohibitedUses: ['Residential construction', 'Grading without consent', 'Pesticides not on approved list'],
  additionalTerms:
    'Tenant responsible for irrigation maintenance. Water rights assignment requires written consent. ' +
    'Annual crop yield report required by March 1. Harvest schedule to be coordinated with owner.',
}

const RANCH_LEASE: LeaseTerms = {
  durationType:        'FIXED',
  minimumMonths:       12,
  maximumMonths:       12,
  rateMonthly:         7500,
  rateAnnual:          90000,
  ratePerAcre:         188,
  securityDeposit:     22500,
  escalationType:      'PERCENT_PER_YEAR',
  escalationRate:      3,
  hasRenewalOption:    true,
  renewalTermMonths:   12,
  hasPurchaseOption:   false,
  purchaseOptionPrice: null,
  allowedUses:    ['Cattle grazing', 'Hunting (licensed)', 'Equestrian', 'Camping (seasonal)'],
  prohibitedUses: ['Permanent structures', 'Mining or extraction', 'Sub-leasing without consent'],
  additionalTerms:
    'Stocking rate not to exceed 1 AU per 20 acres. Tenant to maintain perimeter fencing. ' +
    'Owner retains mineral rights. Hunting access coordinated with 30-day advance notice.',
}

const INDUSTRIAL_SHORT_LEASE: LeaseTerms = {
  durationType:        'FLEXIBLE',
  minimumMonths:       24,
  maximumMonths:       120,
  rateMonthly:         6200,
  rateAnnual:          74400,
  ratePerAcre:         9300,
  securityDeposit:     18600,
  escalationType:      'PERCENT_PER_YEAR',
  escalationRate:      2.5,
  hasRenewalOption:    true,
  renewalTermMonths:   60,
  hasPurchaseOption:   true,
  purchaseOptionPrice: 680000,
  allowedUses:    ['Manufacturing', 'Warehousing', 'Distribution', 'Outdoor storage (screened)', 'Rail operations'],
  prohibitedUses: ['Hazardous waste', 'Residential use', 'Retail (primary use)'],
  additionalTerms:
    'Rail spur access shared with adjacent tenant — coordination required. ' +
    'Environmental baseline survey required before occupancy. Impervious cover not to exceed 70%.',
}

const COMMERCIAL_GROUND_LEASE: LeaseTerms = {
  durationType:        'FIXED',
  minimumMonths:       120,
  maximumMonths:       360,
  rateMonthly:         12500,
  rateAnnual:          150000,
  ratePerAcre:         35714,
  securityDeposit:     37500,
  escalationType:      'PERCENT_PER_YEAR',
  escalationRate:      2,
  hasRenewalOption:    true,
  renewalTermMonths:   120,
  hasPurchaseOption:   false,
  purchaseOptionPrice: null,
  allowedUses:    ['Mixed-use development', 'Retail', 'Office', 'Residential (upper floors)', 'Food & beverage'],
  prohibitedUses: ['Industrial use', 'Vehicle sales', 'Drive-through (ground floor primary)'],
  additionalTerms:
    'Ground lease structure — tenant constructs and owns improvements. ' +
    'Minimum development commitment: $8M within 36 months of lease commencement. ' +
    'Architecture subject to design review committee approval. LEED certification encouraged.',
}

// ── Dev opportunity templates ──────────────────────────────────────────────

const VINEYARD_DEV: DevOpportunity = {
  stage: 'RAW',
  zoningDescription:  'Agricultural — Williamson Act contract. No residential development without contract cancellation (2-year process). Agri-tourism overlay available.',
  maxBuildableUnits:  null,
  maxFloorAreaRatio:  null,
  heightLimitFt:      null,
  utilitiesAvailable: ['Electric', 'Well water'],
  roadAccess:         true,
  roadType:           'Paved (private)',
  entitlementStatus:  'Unentitled (agricultural)',
  permitsAvailable:   ['Agricultural use', 'Farm stand (minor use permit)'],
  environmentalStatus:'Phase I complete — no issues identified',
  topography:         'Gently sloping',
  floodZone:          'Zone X',
  highlights: [
    'Williamson Act land conservation contract (lower property taxes)',
    'Established Cabernet Sauvignon rootstock — 15+ years',
    'Water rights: 6 acre-feet annual surface diversion',
    'Irrigation drip system installed — 2019',
    'Farm stand minor use permit approved',
  ],
  financingNotes:
    'Agricultural lending available through Farm Credit West. USDA FSA programs may apply. ' +
    'Opportunity Zone adjacent — consult tax advisor.',
}

const AUSTIN_MIXED_DEV: DevOpportunity = {
  stage: 'SHOVEL_READY',
  zoningDescription:  'CS-MU-NP: Commercial Services Mixed Use Neighborhood Plan. Up to 8 stories by right. Ground floor retail encouraged.',
  maxBuildableUnits:  180,
  maxFloorAreaRatio:  8.0,
  heightLimitFt:      120,
  utilitiesAvailable: ['Electric', 'Water', 'Sewer', 'Natural Gas', 'Fiber'],
  roadAccess:         true,
  roadType:           'Paved (public)',
  entitlementStatus:  'Entitled',
  permitsAvailable:   ['Building permit — ready to submit', 'Traffic impact approved', 'Fire marshal pre-approved'],
  environmentalStatus:'Clean — Phase II completed 2024',
  topography:         'Flat',
  floodZone:          'Zone X',
  highlights: [
    'All utilities at site — no extension costs',
    'Two blocks from planned Red Line transit station',
    'Entitled for 8 stories by right — no variance needed',
    'Graded and ready — $0 site prep cost',
    'AISD school impact fee: pre-calculated and payable at permit',
    'Travis County tax abatement eligible (economic development zone)',
  ],
  financingNotes:
    'Opportunity Zone qualified — significant federal tax benefit for long-term holds. ' +
    'Construction lender pre-qualified: closing in 45 days if needed. ' +
    'Crowdfunding structure compatible — minimum $250K tranche available.',
}

const OCEANSIDE_DEV: DevOpportunity = {
  stage: 'ENTITLED',
  zoningDescription:  'R-2: Medium Density Residential with Vacation Rental overlay. Single-family or duplex. ADU permitted by right.',
  maxBuildableUnits:  2,
  maxFloorAreaRatio:  0.5,
  heightLimitFt:      35,
  utilitiesAvailable: ['Electric', 'Water (municipal)'],
  roadAccess:         true,
  roadType:           'Paved (public)',
  entitlementStatus:  'Entitled',
  permitsAvailable:   ['Septic permit issued', 'CAMA permit approved'],
  environmentalStatus:'Coastal environmental review complete',
  topography:         'Flat (oceanfront)',
  floodZone:          'Zone VE (coastal high hazard)',
  highlights: [
    '120 feet direct ocean frontage',
    'Septic permit already approved',
    'CAMA coastal construction permit in hand',
    'Vacation rental short-term license eligible',
    'Flood insurance required — coastal construction standards apply',
  ],
  financingNotes:
    'Jumbo construction loan program available. Flood zone elevation certificate required for insurance.',
}

const MONTANA_RANCH_DEV: DevOpportunity = {
  stage: 'RAW',
  zoningDescription:  'AG-20: Agricultural 20-acre minimum. Conservation easement on eastern 200 acres. Western 280 acres unrestricted.',
  maxBuildableUnits:  14,
  maxFloorAreaRatio:  null,
  heightLimitFt:      null,
  utilitiesAvailable: ['Electric (co-op)', 'Well water'],
  roadAccess:         true,
  roadType:           'Gravel (county maintained)',
  entitlementStatus:  'Partially entitled (conservation easement on 200ac)',
  permitsAvailable:   ['Agricultural use', 'Guest ranch (conditional use — not applied)'],
  environmentalStatus:'No known issues',
  topography:         'Rolling to mountainous',
  floodZone:          'Zone X',
  highlights: [
    '280 acres freely developable — no conservation restrictions',
    'Trophy elk, mule deer, and pronghorn — hunting lease premium potential',
    'Year-round Stillwater Creek tributary runs through NE corner',
    'Views of Beartooth Range — premium eco-tourism opportunity',
    'Conservation easement on eastern 200ac = tax deduction potential',
  ],
  financingNotes:
    'Qualified Conservation Contributions may provide income tax deduction on eastern parcel. ' +
    'Ag lending through AgriBank. 1031 exchange compatible.',
}

const INDUSTRIAL_DFW_DEV: DevOpportunity = {
  stage: 'IMPROVED',
  zoningDescription:  'I-2 Heavy Industrial. Rail spur easement recorded. No residential within 500 ft.',
  maxBuildableUnits:  null,
  maxFloorAreaRatio:  1.5,
  heightLimitFt:      60,
  utilitiesAvailable: ['Electric (3-phase)', 'Water', 'Sewer', 'Natural Gas'],
  roadAccess:         true,
  roadType:           'Paved (city)',
  entitlementStatus:  'Entitled',
  permitsAvailable:   ['Heavy industrial use', 'Rail spur access easement', 'TxDOT driveway permit'],
  environmentalStatus:'Phase I complete — historical industrial use noted. Phase II recommended.',
  topography:         'Flat',
  floodZone:          'Zone X',
  highlights: [
    'Rail spur access — BNSF intermodal connection',
    '5 miles from DFW International Airport',
    '3-phase electric service at boundary',
    'Paved city street frontage on two sides',
    'FTZ (Foreign Trade Zone) eligible — consult customs broker',
  ],
  financingNotes:
    'SBA 504 loan program potentially eligible. Texas Enterprise Zone incentives may apply. ' +
    'TIRZ (Tax Increment Reinvestment Zone) adjacent — developer incentive package available.',
}

// ── TERRA_LISTINGS — extended MockListings ─────────────────────────────────

const BASE_LISTINGS = MOCK_LISTINGS.filter((l) => l.propertyType === 'LAND')

const TERRA_EXTENSIONS: Record<string, { leaseTerms: LeaseTerms | null; devOpportunity: DevOpportunity | null; leaseRateMonthly: number | null }> = {
  'land-001': { leaseTerms: AGRICULTURAL_LEASE,      devOpportunity: VINEYARD_DEV,      leaseRateMonthly: 3800 },
  'land-002': { leaseTerms: COMMERCIAL_GROUND_LEASE, devOpportunity: AUSTIN_MIXED_DEV,  leaseRateMonthly: null },
  'land-003': { leaseTerms: null,                    devOpportunity: OCEANSIDE_DEV,     leaseRateMonthly: null },
  'land-004': { leaseTerms: RANCH_LEASE,             devOpportunity: MONTANA_RANCH_DEV, leaseRateMonthly: 7500 },
  'land-005': { leaseTerms: INDUSTRIAL_SHORT_LEASE,  devOpportunity: INDUSTRIAL_DFW_DEV,leaseRateMonthly: 6200 },
}

export const TERRA_LISTINGS: TerraListing[] = BASE_LISTINGS.map((listing) => {
  const ext = TERRA_EXTENSIONS[listing.id] ?? { leaseTerms: null, devOpportunity: null, leaseRateMonthly: null }
  return {
    ...listing,
    leaseTerms:       ext.leaseTerms,
    devOpportunity:   ext.devOpportunity,
    leaseRateMonthly: ext.leaseRateMonthly,
  }
})

// ── Helpers ────────────────────────────────────────────────────────────────

export function getTerraListingById(id: string): TerraListing | undefined {
  return TERRA_LISTINGS.find((l) => l.id === id)
}

export function getLeaseListings(): TerraListing[] {
  return TERRA_LISTINGS.filter((l) => l.listingType === 'LEASE' || l.listingType === 'BOTH')
}

export function getDevListings(): TerraListing[] {
  return TERRA_LISTINGS.filter((l) => l.devOpportunity !== null)
}

/**
 * Format a monthly lease rate for display.
 * e.g. 3800 → "$3,800/mo"
 */
export function formatLeaseRate(monthly: number): string {
  return `$${monthly.toLocaleString()}/mo`
}

/**
 * Format a rate-per-acre-per-year for display.
 * e.g. 2073 → "$2,073/ac/yr"
 */
export function formatRatePerAcre(ratePerAcre: number): string {
  return `$${Math.round(ratePerAcre).toLocaleString()}/ac/yr`
}

/**
 * Format a lease duration for display.
 * e.g. { durationType: FLEXIBLE, minimumMonths: 12, maximumMonths: 60 } → "1–5 years"
 */
export function formatLeaseDuration(terms: LeaseTerms): string {
  if (terms.durationType === 'NEGOTIABLE') return 'Negotiable'
  if (terms.durationType === 'MONTH_TO_MONTH') return 'Month-to-month'

  const minYr = terms.minimumMonths ? Math.round((terms.minimumMonths / 12) * 10) / 10 : null
  const maxYr = terms.maximumMonths ? Math.round((terms.maximumMonths / 12) * 10) / 10 : null

  const fmtYr = (y: number) => y === Math.floor(y) ? `${y} yr` : `${y} yr`

  if (minYr !== null && maxYr !== null) {
    if (minYr === maxYr) return fmtYr(minYr)
    return `${fmtYr(minYr)} – ${fmtYr(maxYr)}`
  }
  if (minYr !== null) return `${fmtYr(minYr)}+`
  if (maxYr !== null) return `Up to ${fmtYr(maxYr)}`
  return 'See terms'
}
