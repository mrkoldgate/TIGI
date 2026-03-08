// ---------------------------------------------------------------------------
// TIGI Platform Constants
// App-wide values. Import from here, never hard-code in components.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export const APP_NAME = 'TIGI'
export const APP_FULL_NAME = 'TIGI — Tokenized Intelligent Global Infrastructure'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Platform fees
// ---------------------------------------------------------------------------

export const PLATFORM_FEE_PERCENT = 2 // 2% on transactions
export const PLATFORM_FEE_MULTIPLIER = PLATFORM_FEE_PERCENT / 100

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const DEFAULT_PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 100

// ---------------------------------------------------------------------------
// Solana
// ---------------------------------------------------------------------------

export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet'
export const SOLANA_EXPLORER_BASE =
  SOLANA_NETWORK === 'mainnet-beta'
    ? 'https://explorer.solana.com'
    : 'https://explorer.solana.com?cluster=devnet'

export function solanaTxUrl(signature: string): string {
  return `${SOLANA_EXPLORER_BASE}/tx/${signature}`
}

export function solanaAddressUrl(address: string): string {
  return `${SOLANA_EXPLORER_BASE}/address/${address}`
}

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------

export const AI_CACHE_TTL_SECONDS = 86_400 // 24 hours
export const AI_RATE_LIMIT_FREE = 10 // basic valuations per month (free tier)
export const AI_RATE_LIMIT_PRO = 50 // deep valuations per month (Pro tier)

// ---------------------------------------------------------------------------
// Subscription tiers
// ---------------------------------------------------------------------------

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    aiCallsPerMonth: AI_RATE_LIMIT_FREE,
    features: ['Core marketplace access', '10 basic AI valuations/month', '1 watchlist'],
  },
  pro: {
    name: 'TIGI Pro',
    priceMonthly: 29,
    priceAnnual: 279,
    aiCallsPerMonth: AI_RATE_LIMIT_PRO,
    features: [
      'Everything in Free',
      '50 deep valuations/month',
      'Unlimited watchlists',
      'PDF exports',
      'Investment recommendations',
      'Priority support',
    ],
  },
  proPlus: {
    name: 'TIGI Pro+',
    priceMonthly: 79,
    priceAnnual: 749,
    aiCallsPerMonth: -1, // unlimited
    features: [
      'Everything in Pro',
      'Unlimited AI calls',
      'Legal document AI (10/month)',
      'Portfolio optimizer',
      'Predictive forecasts',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    aiCallsPerMonth: -1,
    features: [
      'Everything in Pro+',
      'API access',
      'Bulk operations',
      'SLA',
      'Dedicated support',
    ],
  },
} as const

// ---------------------------------------------------------------------------
// User roles — matches Prisma enum
// ---------------------------------------------------------------------------

export const USER_ROLES = ['INVESTOR', 'OWNER', 'BOTH', 'ADMIN', 'COMPLIANCE_OFFICER'] as const
export type UserRole = (typeof USER_ROLES)[number]

// ---------------------------------------------------------------------------
// Property types — matches Prisma enum
// ---------------------------------------------------------------------------

export const PROPERTY_TYPES = [
  'RESIDENTIAL',
  'COMMERCIAL',
  'LAND',
  'INDUSTRIAL',
  'MIXED_USE',
] as const
export type PropertyType = (typeof PROPERTY_TYPES)[number]

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  LAND: 'Land',
  INDUSTRIAL: 'Industrial',
  MIXED_USE: 'Mixed Use',
}

// ---------------------------------------------------------------------------
// Property listing statuses
// ---------------------------------------------------------------------------

export const LISTING_STATUSES = [
  'DRAFT',
  'UNDER_REVIEW',
  'ACTIVE',
  'SOLD',
  'LEASED',
  'DELISTED',
] as const
export type ListingStatus = (typeof LISTING_STATUSES)[number]

// ---------------------------------------------------------------------------
// Transaction statuses
// ---------------------------------------------------------------------------

export const TRANSACTION_STATUSES = [
  'INITIATED',
  'OFFER_PENDING',
  'ESCROW_CREATED',
  'ESCROW_FUNDED',
  'CONDITIONS_MET',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'DISPUTED',
] as const
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]

// ---------------------------------------------------------------------------
// KYC statuses
// ---------------------------------------------------------------------------

export const KYC_STATUSES = ['NONE', 'PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as const
export type KycStatus = (typeof KYC_STATUSES)[number]

// ---------------------------------------------------------------------------
// Landing page stats — updated when real data is available
// ---------------------------------------------------------------------------

export const PLATFORM_STATS = [
  { value: '$2.4B+', label: 'Properties tokenized' },
  { value: '12,000+', label: 'Active investors' },
  { value: '340+', label: 'Properties listed' },
  { value: '< 1s', label: 'Settlement time' },
] as const

// ---------------------------------------------------------------------------
// File upload limits
// ---------------------------------------------------------------------------

export const MAX_PROPERTY_IMAGES = 20
export const MAX_IMAGE_SIZE_MB = 10
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
export const MAX_DOCUMENT_SIZE_MB = 25
