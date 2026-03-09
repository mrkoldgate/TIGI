// ---------------------------------------------------------------------------
// prisma/seed.ts — Idempotent seed for TIGI development / staging.
//
// Run:  npm run db:seed
//       or: npx prisma db seed
//
// Uses upsert throughout so it is safe to re-run without duplicate data.
// Property IDs match MOCK_LISTINGS stable IDs (res-001, com-001, …) so the
// existing mock-data fallback paths resolve to real DB rows once seeded.
// ---------------------------------------------------------------------------

import { PrismaClient, UserRole, UserType, KycStatus, SubscriptionTier, PropertyType, ListingStatus, ListingType, OwnershipModel, TokenStatus, AiConfidence } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Shared password for all demo accounts — NEVER use in production.
const DEMO_PASSWORD = 'TigiDev2026!'
const HASH_ROUNDS = 10

// ---------------------------------------------------------------------------
// AiValuation helpers
// ---------------------------------------------------------------------------

const CONFIDENCE_SCORE: Record<AiConfidence, number> = {
  HIGH:   0.88,
  MEDIUM: 0.62,
  LOW:    0.38,
}

const CONFIDENCE_RANGE_PCT: Record<AiConfidence, number> = {
  HIGH:   0.03,
  MEDIUM: 0.07,
  LOW:    0.15,
}

interface AiValuationInput {
  propertyId: string
  estimatedValue: number
  confidence: AiConfidence
}

async function upsertAiValuation({ propertyId, estimatedValue, confidence }: AiValuationInput) {
  const score = CONFIDENCE_SCORE[confidence]
  const rangePct = CONFIDENCE_RANGE_PCT[confidence]
  const low = Math.round(estimatedValue * (1 - rangePct))
  const high = Math.round(estimatedValue * (1 + rangePct))

  // Delete existing (no stable unique key other than propertyId + time)
  await prisma.aiValuation.deleteMany({ where: { propertyId } })

  await prisma.aiValuation.create({
    data: {
      propertyId,
      estimatedValue,
      valueRangeLow:  low,
      valueRangeHigh: high,
      confidenceScore: score,
      confidence,
      methodology: 'Comparable sales analysis, local market index, structural assessment heuristics.',
      provider: 'mock',
      modelVersion: 'v1.0.0-seed',
    },
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱  Seeding TIGI database…')

  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, HASH_ROUNDS)

  // ── Users ─────────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@tigi.com' },
    update: {},
    create: {
      email:            'admin@tigi.com',
      name:             'TIGI Admin',
      passwordHash,
      role:             UserRole.ADMIN,
      userType:         UserType.PROPERTY_OWNER,
      subscriptionTier: SubscriptionTier.enterprise,
      onboardingStep:   4,
      kycStatus:        KycStatus.VERIFIED,
      location:         'San Francisco, CA',
      bio:              'Platform administrator.',
    },
  })

  const owner = await prisma.user.upsert({
    where:  { email: 'owner@tigi.com' },
    update: {},
    create: {
      email:            'owner@tigi.com',
      name:             'Taylor Realty',
      passwordHash,
      role:             UserRole.OWNER,
      userType:         UserType.PROPERTY_OWNER,
      subscriptionTier: SubscriptionTier.pro,
      onboardingStep:   4,
      kycStatus:        KycStatus.VERIFIED,
      location:         'Austin, TX',
      bio:              'Real estate portfolio owner specialising in tokenized fractional properties.',
    },
  })

  const investor = await prisma.user.upsert({
    where:  { email: 'investor@tigi.com' },
    update: {},
    create: {
      email:            'investor@tigi.com',
      name:             'Jordan Wells',
      passwordHash,
      role:             UserRole.INVESTOR,
      userType:         UserType.INVESTOR,
      subscriptionTier: SubscriptionTier.pro,
      onboardingStep:   4,
      kycStatus:        KycStatus.VERIFIED,
      location:         'New York, NY',
      bio:              'Fractional real estate investor focused on tokenized commercial assets.',
    },
  })

  await prisma.user.upsert({
    where:  { email: 'compliance@tigi.com' },
    update: {},
    create: {
      email:            'compliance@tigi.com',
      name:             'Morgan Clarke',
      passwordHash,
      role:             UserRole.COMPLIANCE_OFFICER,
      userType:         UserType.LEGAL_PROFESSIONAL,
      subscriptionTier: SubscriptionTier.enterprise,
      onboardingStep:   4,
      kycStatus:        KycStatus.VERIFIED,
      location:         'Chicago, IL',
      bio:              'Compliance officer responsible for KYC review and regulatory oversight.',
    },
  })

  console.log('  ✔  4 demo users')

  // ── Properties ────────────────────────────────────────────────────────────
  //
  // All properties are owned by owner@tigi.com.  IDs match MOCK_LISTINGS so
  // existing page routes resolve to real DB rows without any code changes.

  type PropertySeed = {
    id: string
    title: string
    description: string
    type: PropertyType
    listingType: ListingType
    ownershipModel: OwnershipModel
    price: number | null
    address: string
    city: string
    state: string
    sqft: number | null
    bedrooms: number | null
    bathrooms: number | null
    yearBuilt: number | null
    lotAcres: number | null
    features: string[]
    isTokenized: boolean
    viewCount: number
    listedAt: Date
    // Token
    tokenTotalSupply?: number
    tokenAvailableSupply?: number
    tokenPricePerFraction?: number
    // AI
    aiEstimatedValue?: number
    aiConfidence?: AiConfidence
  }

  const properties: PropertySeed[] = [
    // ── RESIDENTIAL ──────────────────────────────────────────────────────────
    {
      id: 'res-001', title: 'Westside Craftsman Bungalow',
      description: 'Beautifully restored 1920s craftsman with original hardwood floors, updated kitchen, and a landscaped backyard. Walkable to restaurants and parks in South Austin.',
      type: PropertyType.RESIDENTIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 485000, address: '112 Barton Springs Rd', city: 'Austin', state: 'TX',
      sqft: 1840, bedrooms: 3, bathrooms: 2, yearBuilt: 1924, lotAcres: 0.18,
      features: ['Hardwood floors', 'Updated kitchen', 'Covered porch', 'Fenced yard'],
      isTokenized: true, tokenTotalSupply: 500, tokenAvailableSupply: 210, tokenPricePerFraction: 970,
      viewCount: 1247, listedAt: new Date('2026-03-01'),
      aiEstimatedValue: 492000, aiConfidence: AiConfidence.HIGH,
    },
    {
      id: 'res-002', title: 'Midtown Modern Townhome',
      description: "Three-story contemporary townhome in Atlanta's most desirable Midtown neighborhood. Rooftop terrace with skyline views, private garage, chef's kitchen with waterfall island.",
      type: PropertyType.RESIDENTIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 620000, address: '845 Peachtree St NE', city: 'Atlanta', state: 'GA',
      sqft: 2240, bedrooms: 3, bathrooms: 3, yearBuilt: 2019, lotAcres: 0.08,
      features: ['Rooftop terrace', 'Skyline views', 'Private garage', 'Smart home'],
      isTokenized: true, tokenTotalSupply: 1000, tokenAvailableSupply: 280, tokenPricePerFraction: 620,
      viewCount: 2081, listedAt: new Date('2026-02-22'),
      aiEstimatedValue: 635000, aiConfidence: AiConfidence.HIGH,
    },
    {
      id: 'res-003', title: 'Coastal Villa with Ocean Views',
      description: 'Exceptional oceanfront villa with panoramic Atlantic views, private pool, and direct beach access. Five-bedroom retreat in an exclusive Miami Beach enclave.',
      type: PropertyType.RESIDENTIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 1250000, address: '2041 Collins Ave', city: 'Miami Beach', state: 'FL',
      sqft: 3800, bedrooms: 5, bathrooms: 4, yearBuilt: 2015, lotAcres: 0.32,
      features: ['Ocean views', 'Private pool', 'Beach access', 'Guest house'],
      isTokenized: true, tokenTotalSupply: 1000, tokenAvailableSupply: 350, tokenPricePerFraction: 1250,
      viewCount: 4320, listedAt: new Date('2026-02-14'),
      aiEstimatedValue: 1190000, aiConfidence: AiConfidence.MEDIUM,
    },
    {
      id: 'res-004', title: 'Highland Park Colonial Estate',
      description: "Grand colonial on one of Dallas's most prestigious streets. Formal dining, library, updated primary suite, pool and cabana. Premier school district.",
      type: PropertyType.RESIDENTIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FULL,
      price: 895000, address: '4801 Lakeside Dr', city: 'Dallas', state: 'TX',
      sqft: 4200, bedrooms: 5, bathrooms: 4, yearBuilt: 1985, lotAcres: 0.45,
      features: ['Pool & cabana', 'Library', 'Guest suite', 'Wine cellar'],
      isTokenized: false,
      viewCount: 1876, listedAt: new Date('2026-02-08'),
      aiEstimatedValue: 920000, aiConfidence: AiConfidence.HIGH,
    },
    {
      id: 'res-005', title: 'West Loop Loft Penthouse',
      description: "Full-floor penthouse atop a converted warehouse in Chicago's West Loop. Soaring ceilings, exposed brick, private rooftop deck, concierge building with valet.",
      type: PropertyType.RESIDENTIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 750000, address: '1200 W Randolph St', city: 'Chicago', state: 'IL',
      sqft: 2800, bedrooms: 2, bathrooms: 2, yearBuilt: 2005, lotAcres: null,
      features: ['Rooftop deck', 'Exposed brick', 'Concierge', 'Valet parking'],
      isTokenized: true, tokenTotalSupply: 750, tokenAvailableSupply: 412, tokenPricePerFraction: 1000,
      viewCount: 2234, listedAt: new Date('2026-01-30'),
      aiEstimatedValue: 780000, aiConfidence: AiConfidence.MEDIUM,
    },
    {
      id: 'res-006', title: 'Lakefront Family Home',
      description: 'Exceptional lakefront property with private dock, boat lift, and panoramic water views. Open-concept main floor, screened porch, three-car garage on 0.8 acres.',
      type: PropertyType.RESIDENTIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FULL,
      price: 540000, address: '7 Lakeshore Cove', city: 'Nashville', state: 'TN',
      sqft: 3100, bedrooms: 4, bathrooms: 3, yearBuilt: 2001, lotAcres: 0.80,
      features: ['Private dock', 'Boat lift', 'Water views', '3-car garage'],
      isTokenized: false,
      viewCount: 1543, listedAt: new Date('2026-01-18'),
      aiEstimatedValue: 558000, aiConfidence: AiConfidence.HIGH,
    },
    {
      id: 'res-007', title: 'Victorian South End Brownstone',
      description: "Meticulously restored 1890s brownstone. Original plaster medallions, mahogany millwork, chef's kitchen addition, private garden. Steps from Back Bay.",
      type: PropertyType.RESIDENTIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 980000, address: '22 Tremont St', city: 'Boston', state: 'MA',
      sqft: 2650, bedrooms: 4, bathrooms: 3, yearBuilt: 1892, lotAcres: 0.06,
      features: ['Period details', "Chef's kitchen", 'Private garden', 'Parking'],
      isTokenized: true, tokenTotalSupply: 500, tokenAvailableSupply: 80, tokenPricePerFraction: 1960,
      viewCount: 3109, listedAt: new Date('2026-01-05'),
      aiEstimatedValue: 1020000, aiConfidence: AiConfidence.HIGH,
    },
    {
      id: 'res-008', title: 'Desert Modern Estate',
      description: 'Award-winning desert modern architecture on 1.2 acres in Paradise Valley. Infinity pool, mountain views, 6-car garage, home theater, and private casita.',
      type: PropertyType.RESIDENTIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FULL,
      price: 1100000, address: '5520 E Mountain View Rd', city: 'Scottsdale', state: 'AZ',
      sqft: 5200, bedrooms: 5, bathrooms: 5, yearBuilt: 2018, lotAcres: 1.20,
      features: ['Infinity pool', 'Mountain views', '6-car garage', 'Guest casita'],
      isTokenized: false,
      viewCount: 2891, listedAt: new Date('2025-12-20'),
      aiEstimatedValue: 1075000, aiConfidence: AiConfidence.MEDIUM,
    },

    // ── COMMERCIAL ───────────────────────────────────────────────────────────
    {
      id: 'com-001', title: 'Class-A Downtown Office Suite',
      description: "Premier 14,000 sqft office space on the 22nd floor of Denver's most prestigious tower. Floor-to-ceiling windows, custom buildout, parking included.",
      type: PropertyType.COMMERCIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 2100000, address: '1670 Broadway, 22nd Floor', city: 'Denver', state: 'CO',
      sqft: 14000, bedrooms: null, bathrooms: null, yearBuilt: 2010, lotAcres: null,
      features: ['Floor-to-ceiling windows', 'Custom buildout', 'Parking included', 'Concierge lobby'],
      isTokenized: true, tokenTotalSupply: 2100, tokenAvailableSupply: 924, tokenPricePerFraction: 1000,
      viewCount: 3420, listedAt: new Date('2026-02-28'),
      aiEstimatedValue: 2250000, aiConfidence: AiConfidence.MEDIUM,
    },
    {
      id: 'com-002', title: 'Waterfront NNN Retail Center',
      description: 'Eight-unit retail strip fully occupied by national credit tenants. NNN leases with 3% annual escalators. Cap rate: 6.8%. Minimal management required.',
      type: PropertyType.COMMERCIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FULL,
      price: 1850000, address: '4200 N Harbor Blvd', city: 'Portland', state: 'OR',
      sqft: 11200, bedrooms: null, bathrooms: null, yearBuilt: 1998, lotAcres: 1.80,
      features: ['NNN leases', 'National tenants', '6.8% cap rate', 'Renovated 2022'],
      isTokenized: false,
      viewCount: 2150, listedAt: new Date('2026-02-10'),
      aiEstimatedValue: 1920000, aiConfidence: AiConfidence.HIGH,
    },
    {
      id: 'com-003', title: 'Innovation Campus Complex',
      description: "Three-building tech campus totaling 48,000 sqft in Seattle's SLU innovation corridor. Long-term leases with Fortune 500 tenants. Adjacent to Amazon HQ.",
      type: PropertyType.COMMERCIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 4500000, address: '2201 7th Ave', city: 'Seattle', state: 'WA',
      sqft: 48000, bedrooms: null, bathrooms: null, yearBuilt: 2014, lotAcres: 2.40,
      features: ['Fortune 500 tenants', 'Bike storage', 'EV charging', 'Conference center'],
      isTokenized: true, tokenTotalSupply: 4500, tokenAvailableSupply: 1800, tokenPricePerFraction: 1000,
      viewCount: 5810, listedAt: new Date('2026-01-25'),
      aiEstimatedValue: 4750000, aiConfidence: AiConfidence.MEDIUM,
    },
    {
      id: 'com-004', title: 'Medical Office Professional Plaza',
      description: 'Purpose-built medical campus with 22 suites across two buildings. Currently 91% occupied. On-site lab, radiology suite, and pharmacy. Recession-proof tenant base.',
      type: PropertyType.COMMERCIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FULL,
      price: 3200000, address: '8800 Katy Fwy', city: 'Houston', state: 'TX',
      sqft: 24500, bedrooms: null, bathrooms: null, yearBuilt: 2007, lotAcres: 3.20,
      features: ['91% occupied', 'Radiology suite', 'Medical gas lines', 'Ample parking'],
      isTokenized: false,
      viewCount: 2340, listedAt: new Date('2025-12-28'),
      aiEstimatedValue: 3380000, aiConfidence: AiConfidence.HIGH,
    },
    {
      id: 'com-005', title: 'Boutique Hotel Property',
      description: "48-key boutique hotel in San Diego's Gaslamp Quarter. Fully renovated 2023. STR license. Average ADR $285, 78% occupancy. Turn-key operation with experienced staff.",
      type: PropertyType.COMMERCIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 5800000, address: '500 F St', city: 'San Diego', state: 'CA',
      sqft: 32000, bedrooms: null, bathrooms: null, yearBuilt: 1972, lotAcres: 0.60,
      features: ['48 keys', 'Rooftop bar', 'Convention center adjacent', 'Renovated 2023'],
      isTokenized: true, tokenTotalSupply: 2000, tokenAvailableSupply: 1080, tokenPricePerFraction: 2900,
      viewCount: 6720, listedAt: new Date('2025-12-15'),
      aiEstimatedValue: 6100000, aiConfidence: AiConfidence.MEDIUM,
    },

    // ── LAND ─────────────────────────────────────────────────────────────────
    {
      id: 'land-001', title: 'Napa Valley Agricultural Parcel',
      description: 'Prime 22-acre agricultural parcel in the heart of Napa Valley. Established Cabernet Sauvignon vineyard with irrigation system. Long-term agricultural lease opportunity available.',
      type: PropertyType.LAND, listingType: ListingType.BOTH, ownershipModel: OwnershipModel.FULL,
      price: 890000, address: '3100 Silverado Trail', city: 'Napa', state: 'CA',
      sqft: 958320, bedrooms: null, bathrooms: null, yearBuilt: null, lotAcres: 22.0,
      features: ['Established vineyard', 'Water rights', 'Agricultural zoning', 'Irrigation system'],
      isTokenized: false,
      viewCount: 1890, listedAt: new Date('2026-02-18'),
      aiEstimatedValue: 940000, aiConfidence: AiConfidence.MEDIUM,
    },
    {
      id: 'land-002', title: 'East Austin Development Opportunity',
      description: "Shovel-ready 4.2-acre mixed-use site in Austin's fastest-growing corridor. Permits up to 8 stories. Two blocks from planned Red Line station. All utilities at site.",
      type: PropertyType.LAND, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 1450000, address: '1840 E 6th St', city: 'Austin', state: 'TX',
      sqft: 182952, bedrooms: null, bathrooms: null, yearBuilt: null, lotAcres: 4.20,
      features: ['Mixed-use zoning', 'Utilities at site', 'Transit adjacent', 'Graded & ready'],
      isTokenized: true, tokenTotalSupply: 1000, tokenAvailableSupply: 750, tokenPricePerFraction: 1450,
      viewCount: 3108, listedAt: new Date('2026-02-05'),
      aiEstimatedValue: 1580000, aiConfidence: AiConfidence.MEDIUM,
    },
    {
      id: 'land-003', title: 'Beachfront Oceanside Lot',
      description: 'Rare oceanfront buildable lot on the Outer Banks. 120 feet of direct ocean frontage on 0.9 acres. Septic approval in place. Vacation rental zoning.',
      type: PropertyType.LAND, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 750000, address: '1200 N Virginia Dare Trail', city: 'Kill Devil Hills', state: 'NC',
      sqft: 39204, bedrooms: null, bathrooms: null, yearBuilt: null, lotAcres: 0.90,
      features: ['Ocean frontage', 'Septic approved', 'Buildable', 'VR zoning'],
      isTokenized: true, tokenTotalSupply: 500, tokenAvailableSupply: 200, tokenPricePerFraction: 1500,
      viewCount: 2780, listedAt: new Date('2026-01-15'),
      aiEstimatedValue: 720000, aiConfidence: AiConfidence.LOW,
    },
    {
      id: 'land-004', title: 'Montana Ranch Land — For Lease',
      description: '480 acres of productive Montana ranch land. Currently leased for cattle grazing. Spectacular mountain views, hunting rights, trophy elk and mule deer population.',
      type: PropertyType.LAND, listingType: ListingType.LEASE, ownershipModel: OwnershipModel.FULL,
      price: 2300000, address: 'HWY 87 Mile 42', city: 'Billings', state: 'MT',
      sqft: 20908800, bedrooms: null, bathrooms: null, yearBuilt: null, lotAcres: 480.0,
      features: ['Cattle grazing', 'Hunting rights', 'Water rights', 'Road access'],
      isTokenized: false,
      viewCount: 1240, listedAt: new Date('2025-12-10'),
      // No AI valuation for this listing
    },
    {
      id: 'land-005', title: 'Industrial Zoned Development Lot',
      description: "Rare 8-acre industrial-zoned parcel adjacent to DFW's logistics corridor. Heavy industrial permitted. Rail spur available. 5 miles from Dallas Fort Worth International Airport.",
      type: PropertyType.LAND, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FULL,
      price: 620000, address: '4400 Airport Fwy', city: 'Plano', state: 'TX',
      sqft: 348480, bedrooms: null, bathrooms: null, yearBuilt: null, lotAcres: 8.0,
      features: ['Heavy industrial zoning', 'Rail spur available', 'DFW adjacent', 'Utilities at road'],
      isTokenized: false,
      viewCount: 980, listedAt: new Date('2025-12-05'),
      aiEstimatedValue: 650000, aiConfidence: AiConfidence.MEDIUM,
    },

    // ── INDUSTRIAL ───────────────────────────────────────────────────────────
    {
      id: 'ind-001', title: 'Last-Mile Logistics Hub',
      description: "State-of-the-art 68,000 sqft distribution center in Memphis's primary logistics corridor. 32' clear heights, 40 dock doors, ESFR sprinklers. 100% occupied — long-term NNN lease.",
      type: PropertyType.INDUSTRIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 3800000, address: '3500 Lamar Ave', city: 'Memphis', state: 'TN',
      sqft: 68000, bedrooms: null, bathrooms: null, yearBuilt: 2017, lotAcres: 4.50,
      features: ["32' clear height", '40 dock doors', 'ESFR sprinklers', 'Long-term NNN lease'],
      isTokenized: true, tokenTotalSupply: 3800, tokenAvailableSupply: 1748, tokenPricePerFraction: 1000,
      viewCount: 4280, listedAt: new Date('2026-02-24'),
      aiEstimatedValue: 4050000, aiConfidence: AiConfidence.HIGH,
    },
    {
      id: 'ind-002', title: 'Cold Storage Distribution Center',
      description: "Purpose-built cold storage facility with 41,000 sqft of temperature-controlled space. Multi-temp zones. Located in Chicago's O'Hare logistics submarket.",
      type: PropertyType.INDUSTRIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 4100000, address: '2200 Mannheim Rd', city: 'Chicago', state: 'IL',
      sqft: 41000, bedrooms: null, bathrooms: null, yearBuilt: 2020, lotAcres: 3.20,
      features: ['Multi-temp zones', 'Solar panels', 'Dock levelers', 'Fully occupied'],
      isTokenized: true, tokenTotalSupply: 2050, tokenAvailableSupply: 1128, tokenPricePerFraction: 2000,
      viewCount: 3120, listedAt: new Date('2026-01-08'),
      aiEstimatedValue: 4350000, aiConfidence: AiConfidence.HIGH,
    },
    {
      id: 'ind-003', title: 'Light Manufacturing Facility',
      description: 'Versatile 55,000 sqft light manufacturing facility with high-bay production floor, 5,000 sqft of office, loading dock, and heavy 3-phase power (2,000 amp service).',
      type: PropertyType.INDUSTRIAL, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FULL,
      price: 2900000, address: '18500 Mound Rd', city: 'Detroit', state: 'MI',
      sqft: 55000, bedrooms: null, bathrooms: null, yearBuilt: 1995, lotAcres: 6.10,
      features: ['High-bay production', 'Heavy power', 'Loading dock', 'Renovated 2021'],
      isTokenized: false,
      viewCount: 1456, listedAt: new Date('2025-11-15'),
      aiEstimatedValue: 2750000, aiConfidence: AiConfidence.MEDIUM,
    },

    // ── MIXED USE ─────────────────────────────────────────────────────────────
    {
      id: 'mix-001', title: 'Live/Work Arts District Lofts',
      description: "Eight-unit mixed-use building in Brooklyn's Bushwick Arts District. Ground floor: 4,000 sqft commercial. Upper floors: 7 loft residences (avg 1,400 sqft). High demand location.",
      type: PropertyType.MIXED_USE, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 2200000, address: '51 Wilson Ave', city: 'Brooklyn', state: 'NY',
      sqft: 13800, bedrooms: null, bathrooms: null, yearBuilt: 1960, lotAcres: 0.18,
      features: ['Ground floor retail', '7 residential lofts', 'Exposed brick', 'Renovated 2019'],
      isTokenized: true, tokenTotalSupply: 2200, tokenAvailableSupply: 924, tokenPricePerFraction: 1000,
      viewCount: 3890, listedAt: new Date('2026-02-12'),
      aiEstimatedValue: 2380000, aiConfidence: AiConfidence.MEDIUM,
    },
    {
      id: 'mix-002', title: 'Pearl District Mixed-Use Tower',
      description: "Seven-story development in Portland's coveted Pearl District. Ground floor restaurant and retail (7,200 sqft), five stories of premium apartments (24 units), rooftop amenity deck.",
      type: PropertyType.MIXED_USE, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FRACTIONAL,
      price: 3500000, address: '1212 NW Couch St', city: 'Portland', state: 'OR',
      sqft: 31000, bedrooms: null, bathrooms: null, yearBuilt: 2016, lotAcres: 0.22,
      features: ['24 apartments', 'Ground floor retail', 'Rooftop deck', 'EV charging'],
      isTokenized: true, tokenTotalSupply: 3500, tokenAvailableSupply: 2555, tokenPricePerFraction: 1000,
      viewCount: 2760, listedAt: new Date('2025-12-22'),
      aiEstimatedValue: 3650000, aiConfidence: AiConfidence.MEDIUM,
    },
    {
      id: 'mix-003', title: 'Adaptive Reuse Historic Mill',
      description: "Stunning conversion of an 1887 textile mill into 18,000 sqft of premium office and event space. Original exposed granite walls, timber beams. Fully leased to creative agencies.",
      type: PropertyType.MIXED_USE, listingType: ListingType.BUY, ownershipModel: OwnershipModel.FULL,
      price: 1900000, address: '60 Chestnut St', city: 'Providence', state: 'RI',
      sqft: 18000, bedrooms: null, bathrooms: null, yearBuilt: 1887, lotAcres: 0.70,
      features: ['Historic designation', 'Full occupancy', 'Event venue', 'Original millwork'],
      isTokenized: false,
      viewCount: 1920, listedAt: new Date('2025-11-28'),
      aiEstimatedValue: 2050000, aiConfidence: AiConfidence.LOW,
    },
  ]

  for (const p of properties) {
    await prisma.property.upsert({
      where:  { id: p.id },
      update: {},
      create: {
        id:             p.id,
        ownerId:        owner.id,
        title:          p.title,
        description:    p.description,
        type:           p.type,
        status:         ListingStatus.ACTIVE,
        listingType:    p.listingType,
        ownershipModel: p.ownershipModel,
        address:        p.address,
        city:           p.city,
        state:          p.state,
        sqft:           p.sqft,
        bedrooms:       p.bedrooms,
        bathrooms:      p.bathrooms,
        yearBuilt:      p.yearBuilt,
        lotAcres:       p.lotAcres,
        features:       p.features,
        price:          p.price,
        isTokenized:    p.isTokenized,
        viewCount:      p.viewCount,
        listedAt:       p.listedAt,
      },
    })
  }

  console.log(`  ✔  ${properties.length} properties`)

  // ── Tokens ────────────────────────────────────────────────────────────────

  const tokenizedProps = properties.filter((p) => p.isTokenized)
  for (const p of tokenizedProps) {
    const mintAddress = `TIGIDevMint${p.id}`
    await prisma.token.upsert({
      where:  { propertyId: p.id },
      update: {},
      create: {
        propertyId:       p.id,
        mintAddress,
        totalSupply:      p.tokenTotalSupply!,
        availableSupply:  p.tokenAvailableSupply!,
        pricePerFraction: p.tokenPricePerFraction!,
        status:           TokenStatus.ACTIVE,
      },
    })
    // Keep property.tokenMintAddress in sync
    await prisma.property.update({
      where: { id: p.id },
      data:  { tokenMintAddress: mintAddress },
    })
  }

  console.log(`  ✔  ${tokenizedProps.length} tokens`)

  // ── AI Valuations ─────────────────────────────────────────────────────────

  const valuatedProps = properties.filter((p) => p.aiEstimatedValue != null)
  for (const p of valuatedProps) {
    await upsertAiValuation({
      propertyId:     p.id,
      estimatedValue: p.aiEstimatedValue!,
      confidence:     p.aiConfidence!,
    })
  }

  console.log(`  ✔  ${valuatedProps.length} AI valuations`)

  // ── Saved Listings (investor demo) ────────────────────────────────────────

  const savedIds = ['res-001', 'res-002', 'com-001', 'com-003', 'ind-001', 'mix-001']
  for (const listingId of savedIds) {
    await prisma.savedListing.upsert({
      where:  { userId_listingId: { userId: investor.id, listingId } },
      update: {},
      create: { userId: investor.id, listingId },
    })
  }

  console.log(`  ✔  ${savedIds.length} saved listings (investor)`)

  // ── Token Holdings (investor demo — simulate owning fractions) ────────────

  const holdingTargets = [
    { propertyId: 'res-001', qty: 25 },
    { propertyId: 'com-001', qty: 50 },
    { propertyId: 'ind-001', qty: 100 },
  ]

  for (const { propertyId, qty } of holdingTargets) {
    const token = await prisma.token.findUnique({ where: { propertyId } })
    if (!token) continue

    const costBasis = Number(token.pricePerFraction) * qty

    await prisma.tokenHolding.upsert({
      where:  { userId_tokenId: { userId: investor.id, tokenId: token.id } },
      update: {},
      create: {
        userId:    investor.id,
        tokenId:   token.id,
        quantity:  qty,
        costBasis,
      },
    })
  }

  console.log('  ✔  3 token holdings (investor)')

  console.log('\n✅  Seed complete.\n')
  console.log('Demo credentials (password: TigiDev2026!):')
  console.log('  admin@tigi.com        — ADMIN / enterprise')
  console.log('  owner@tigi.com        — OWNER / pro')
  console.log('  investor@tigi.com     — INVESTOR / pro / KYC VERIFIED')
  console.log('  compliance@tigi.com   — COMPLIANCE_OFFICER / enterprise')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
