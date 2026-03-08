// ---------------------------------------------------------------------------
// Seller listings mock data — mirrors the future Prisma SellerListing model.
//
// Distinct from MOCK_LISTINGS (marketplace browse data). This represents
// listings owned by the authenticated seller/property owner.
//
// DB integration path:
//   Replace MOCK_SELLER_LISTINGS with:
//     prisma.listing.findMany({ where: { ownerId: session.user.id }, orderBy: { createdAt: 'desc' } })
// ---------------------------------------------------------------------------

export type SellerListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
export type SellerAssetType = 'PROPERTY' | 'LAND'
export type SellerPropertySubtype = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'MIXED_USE'
export type SellerLandSubtype = 'AGRICULTURAL' | 'RESIDENTIAL_DEV' | 'COMMERCIAL_DEV' | 'INDUSTRIAL' | 'RECREATIONAL' | 'WATERFRONT' | 'RURAL' | 'MIXED_USE'
export type SellerListingType = 'BUY' | 'LEASE' | 'BOTH'
export type SellerOwnershipModel = 'FULL' | 'FRACTIONAL' | 'BOTH'

export interface SellerListing {
  id: string
  title: string
  city: string
  state: string
  assetType: SellerAssetType
  subtype: SellerPropertySubtype | SellerLandSubtype
  listingType: SellerListingType
  ownershipModel: SellerOwnershipModel
  status: SellerListingStatus
  price: number | null
  leaseRateMonthly: number | null
  // Property-specific
  sqft: number | null
  bedrooms: number | null
  bathrooms: number | null
  yearBuilt: number | null
  // Land-specific
  lotAcres: number | null
  zoningCode: string | null
  // Tokenization
  isTokenized: boolean
  tokenTotalSupply: number | null
  tokenAvailableSupply: number | null
  tokenPricePerFraction: number | null
  // Image
  imageSlot: string
  imagePropertyType: 'residential' | 'commercial' | 'land' | 'industrial' | 'mixed'
  // Engagement stats
  viewCount: number
  saveCount: number
  inquiryCount: number
  // AI valuation
  aiEstimatedValue: number | null
  // Dates
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  expiresAt: string | null
  // Review feedback (returned by compliance team)
  reviewNote: string | null
}

export const MOCK_SELLER_LISTINGS: SellerListing[] = [
  // ── ACTIVE ──────────────────────────────────────────────────────────────
  {
    id: 'sl-001',
    title: 'Westside Craftsman Bungalow',
    city: 'Austin',
    state: 'TX',
    assetType: 'PROPERTY',
    subtype: 'RESIDENTIAL',
    listingType: 'BUY',
    ownershipModel: 'FRACTIONAL',
    status: 'ACTIVE',
    price: 485000,
    leaseRateMonthly: null,
    sqft: 1840,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 1924,
    lotAcres: 0.18,
    zoningCode: null,
    isTokenized: true,
    tokenTotalSupply: 1000,
    tokenAvailableSupply: 340,
    tokenPricePerFraction: 485,
    imageSlot: 'residential-1',
    imagePropertyType: 'residential',
    viewCount: 1247,
    saveCount: 84,
    inquiryCount: 12,
    aiEstimatedValue: 501000,
    createdAt: '2025-11-14T10:22:00Z',
    updatedAt: '2026-01-08T14:00:00Z',
    publishedAt: '2025-11-18T09:00:00Z',
    expiresAt: '2026-05-18T09:00:00Z',
    reviewNote: null,
  },
  {
    id: 'sl-002',
    title: 'Downtown Mixed-Use Tower Suite 14B',
    city: 'Chicago',
    state: 'IL',
    assetType: 'PROPERTY',
    subtype: 'COMMERCIAL',
    listingType: 'BOTH',
    ownershipModel: 'FULL',
    status: 'ACTIVE',
    price: 2100000,
    leaseRateMonthly: 8500,
    sqft: 4200,
    bedrooms: null,
    bathrooms: 3,
    yearBuilt: 2018,
    lotAcres: null,
    zoningCode: null,
    isTokenized: false,
    tokenTotalSupply: null,
    tokenAvailableSupply: null,
    tokenPricePerFraction: null,
    imageSlot: 'commercial-2',
    imagePropertyType: 'commercial',
    viewCount: 3820,
    saveCount: 201,
    inquiryCount: 34,
    aiEstimatedValue: 1980000,
    createdAt: '2025-09-02T08:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    publishedAt: '2025-09-07T12:00:00Z',
    expiresAt: '2026-09-07T12:00:00Z',
    reviewNote: null,
  },
  {
    id: 'sl-003',
    title: 'Central Valley Agricultural Parcel',
    city: 'Fresno',
    state: 'CA',
    assetType: 'LAND',
    subtype: 'AGRICULTURAL',
    listingType: 'BOTH',
    ownershipModel: 'FULL',
    status: 'ACTIVE',
    price: 1750000,
    leaseRateMonthly: 6200,
    sqft: null,
    bedrooms: null,
    bathrooms: null,
    yearBuilt: null,
    lotAcres: 320,
    zoningCode: 'A-2',
    isTokenized: false,
    tokenTotalSupply: null,
    tokenAvailableSupply: null,
    tokenPricePerFraction: null,
    imageSlot: 'land-1',
    imagePropertyType: 'land',
    viewCount: 892,
    saveCount: 47,
    inquiryCount: 9,
    aiEstimatedValue: 1820000,
    createdAt: '2025-10-20T15:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
    publishedAt: '2025-10-25T09:00:00Z',
    expiresAt: '2026-10-25T09:00:00Z',
    reviewNote: null,
  },
  // ── PENDING REVIEW ───────────────────────────────────────────────────────
  {
    id: 'sl-004',
    title: 'Shovel-Ready Dev Parcel — East Mesa',
    city: 'Phoenix',
    state: 'AZ',
    assetType: 'LAND',
    subtype: 'COMMERCIAL_DEV',
    listingType: 'BUY',
    ownershipModel: 'FRACTIONAL',
    status: 'PENDING_REVIEW',
    price: 3400000,
    leaseRateMonthly: null,
    sqft: null,
    bedrooms: null,
    bathrooms: null,
    yearBuilt: null,
    lotAcres: 18.4,
    zoningCode: 'C-3',
    isTokenized: true,
    tokenTotalSupply: 3400,
    tokenAvailableSupply: 3400,
    tokenPricePerFraction: 1000,
    imageSlot: 'land-2',
    imagePropertyType: 'land',
    viewCount: 0,
    saveCount: 0,
    inquiryCount: 0,
    aiEstimatedValue: null,
    createdAt: '2026-03-01T14:30:00Z',
    updatedAt: '2026-03-01T14:30:00Z',
    publishedAt: null,
    expiresAt: null,
    reviewNote: null,
  },
  {
    id: 'sl-005',
    title: 'Lakeview Contemporary — 3BR/2BA',
    city: 'Seattle',
    state: 'WA',
    assetType: 'PROPERTY',
    subtype: 'RESIDENTIAL',
    listingType: 'BUY',
    ownershipModel: 'FULL',
    status: 'PENDING_REVIEW',
    price: 895000,
    leaseRateMonthly: null,
    sqft: 2340,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2009,
    lotAcres: 0.22,
    zoningCode: null,
    isTokenized: false,
    tokenTotalSupply: null,
    tokenAvailableSupply: null,
    tokenPricePerFraction: null,
    imageSlot: 'residential-4',
    imagePropertyType: 'residential',
    viewCount: 0,
    saveCount: 0,
    inquiryCount: 0,
    aiEstimatedValue: null,
    createdAt: '2026-03-05T09:15:00Z',
    updatedAt: '2026-03-05T09:15:00Z',
    publishedAt: null,
    expiresAt: null,
    reviewNote: null,
  },
  // ── DRAFT ───────────────────────────────────────────────────────────────
  {
    id: 'sl-006',
    title: 'Industrial Flex Space — Port District',
    city: 'Houston',
    state: 'TX',
    assetType: 'PROPERTY',
    subtype: 'INDUSTRIAL',
    listingType: 'LEASE',
    ownershipModel: 'FULL',
    status: 'DRAFT',
    price: null,
    leaseRateMonthly: 14000,
    sqft: 18500,
    bedrooms: null,
    bathrooms: 4,
    yearBuilt: 2003,
    lotAcres: 1.8,
    zoningCode: null,
    isTokenized: false,
    tokenTotalSupply: null,
    tokenAvailableSupply: null,
    tokenPricePerFraction: null,
    imageSlot: 'industrial-1',
    imagePropertyType: 'industrial',
    viewCount: 0,
    saveCount: 0,
    inquiryCount: 0,
    aiEstimatedValue: null,
    createdAt: '2026-02-28T16:40:00Z',
    updatedAt: '2026-03-07T08:20:00Z',
    publishedAt: null,
    expiresAt: null,
    reviewNote: null,
  },
  {
    id: 'sl-007',
    title: 'Montana Hunting Ranch — River Frontage',
    city: 'Billings',
    state: 'MT',
    assetType: 'LAND',
    subtype: 'RECREATIONAL',
    listingType: 'BUY',
    ownershipModel: 'FULL',
    status: 'DRAFT',
    price: 4200000,
    leaseRateMonthly: null,
    sqft: null,
    bedrooms: null,
    bathrooms: null,
    yearBuilt: null,
    lotAcres: 840,
    zoningCode: 'R-1',
    isTokenized: false,
    tokenTotalSupply: null,
    tokenAvailableSupply: null,
    tokenPricePerFraction: null,
    imageSlot: 'land-3',
    imagePropertyType: 'land',
    viewCount: 0,
    saveCount: 0,
    inquiryCount: 0,
    aiEstimatedValue: null,
    createdAt: '2026-03-06T11:00:00Z',
    updatedAt: '2026-03-06T11:00:00Z',
    publishedAt: null,
    expiresAt: null,
    reviewNote: null,
  },
  // ── PAUSED ───────────────────────────────────────────────────────────────
  {
    id: 'sl-008',
    title: 'Midtown Commercial Office Floor',
    city: 'New York',
    state: 'NY',
    assetType: 'PROPERTY',
    subtype: 'COMMERCIAL',
    listingType: 'LEASE',
    ownershipModel: 'FULL',
    status: 'PAUSED',
    price: null,
    leaseRateMonthly: 32000,
    sqft: 8400,
    bedrooms: null,
    bathrooms: 6,
    yearBuilt: 2001,
    lotAcres: null,
    zoningCode: null,
    isTokenized: false,
    tokenTotalSupply: null,
    tokenAvailableSupply: null,
    tokenPricePerFraction: null,
    imageSlot: 'commercial-3',
    imagePropertyType: 'commercial',
    viewCount: 5103,
    saveCount: 312,
    inquiryCount: 51,
    aiEstimatedValue: null,
    createdAt: '2025-07-10T13:00:00Z',
    updatedAt: '2026-01-20T09:00:00Z',
    publishedAt: '2025-07-15T09:00:00Z',
    expiresAt: null,
    reviewNote: null,
  },
  // ── ARCHIVED ─────────────────────────────────────────────────────────────
  {
    id: 'sl-009',
    title: 'South Beach Condo — Unit 8C',
    city: 'Miami',
    state: 'FL',
    assetType: 'PROPERTY',
    subtype: 'RESIDENTIAL',
    listingType: 'BUY',
    ownershipModel: 'FULL',
    status: 'ARCHIVED',
    price: 720000,
    leaseRateMonthly: null,
    sqft: 1240,
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2015,
    lotAcres: null,
    zoningCode: null,
    isTokenized: false,
    tokenTotalSupply: null,
    tokenAvailableSupply: null,
    tokenPricePerFraction: null,
    imageSlot: 'residential-2',
    imagePropertyType: 'residential',
    viewCount: 2180,
    saveCount: 96,
    inquiryCount: 18,
    aiEstimatedValue: 735000,
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-08-30T15:00:00Z',
    publishedAt: '2025-04-05T09:00:00Z',
    expiresAt: '2025-08-30T09:00:00Z',
    reviewNote: null,
  },
]

// ---------------------------------------------------------------------------
// Derived helpers — replace with DB aggregates in production
// ---------------------------------------------------------------------------

export function getSellerStats(listings: SellerListing[]) {
  const active = listings.filter((l) => l.status === 'ACTIVE')
  const pending = listings.filter((l) => l.status === 'PENDING_REVIEW')
  const draft = listings.filter((l) => l.status === 'DRAFT')

  const totalViews = listings.reduce((acc, l) => acc + l.viewCount, 0)
  const totalInquiries = listings.reduce((acc, l) => acc + l.inquiryCount, 0)
  const totalPortfolioValue = active.reduce((acc, l) => acc + (l.price ?? 0), 0)
  const totalListings = listings.filter((l) => l.status !== 'ARCHIVED').length

  return { active: active.length, pending: pending.length, draft: draft.length, totalViews, totalInquiries, totalPortfolioValue, totalListings }
}

export function formatPrice(price: number | null): string {
  if (price === null) return 'N/A'
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`
  return `$${price.toLocaleString()}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
