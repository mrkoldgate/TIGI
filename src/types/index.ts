// ---------------------------------------------------------------------------
// TIGI Global TypeScript Types
// Shared across client components, server components, and API routes.
// Prisma-generated types are the source of truth for DB models.
// These types handle UI state, API contracts, and service interfaces.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// API Response envelope — matches system-architecture.md §2.2
// ---------------------------------------------------------------------------

export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: PaginationMeta
}

export type ApiError = {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  cursor?: string
}

// ---------------------------------------------------------------------------
// Auth & Session
// ---------------------------------------------------------------------------

export interface SessionUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: UserRole
  kycStatus: KycStatus
  subscriptionTier: SubscriptionTier
  walletAddress: string | null
}

export type UserRole = 'INVESTOR' | 'OWNER' | 'BOTH' | 'ADMIN' | 'COMPLIANCE_OFFICER'
export type KycStatus = 'NONE' | 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
export type SubscriptionTier = 'free' | 'pro' | 'pro_plus' | 'enterprise'

// ---------------------------------------------------------------------------
// Property
// ---------------------------------------------------------------------------

export type PropertyType = 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' | 'INDUSTRIAL' | 'MIXED_USE'
export type ListingStatus = 'DRAFT' | 'UNDER_REVIEW' | 'ACTIVE' | 'SOLD' | 'LEASED' | 'DELISTED'

export interface PropertySummary {
  id: string
  title: string
  description: string
  type: PropertyType
  status: ListingStatus
  price: number
  location: {
    city: string
    state: string
    country: string
    coordinates?: { lat: number; lng: number }
  }
  specs: {
    sqft?: number
    bedrooms?: number
    bathrooms?: number
    yearBuilt?: number
  }
  heroImageUrl: string | null
  token: TokenSummary | null
  aiValuation: AiValuationSummary | null
  createdAt: string
  updatedAt: string
}

export interface PropertyDetail extends PropertySummary {
  images: Array<{ id: string; url: string; order: number }>
  documents: Array<{ id: string; name: string; type: string; url: string; verified: boolean }>
  ownerId: string
  ownerName: string
  ownerAvatarUrl: string | null
}

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

export interface TokenSummary {
  id: string
  mintAddress: string
  totalSupply: number
  availableSupply: number
  pricePerFraction: number
  soldPercent: number
  holderCount: number
}

// ---------------------------------------------------------------------------
// AI Valuation
// ---------------------------------------------------------------------------

export interface AiValuationSummary {
  estimatedValue: number
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  confidenceScore: number
  generatedAt: string
  isStale: boolean
}

export interface AiValuationDetail extends AiValuationSummary {
  valueRangeLow: number
  valueRangeHigh: number
  comparables: ComparableProperty[]
  positiveFactors: string[]
  riskFactors: string[]
  methodology: string
}

export interface ComparableProperty {
  id: string
  title: string
  salePrice: number
  sqft: number
  distance: number
  saleDateLabel: string
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export type TransactionType = 'FRACTIONAL_INVESTMENT' | 'FULL_PURCHASE' | 'LEASE'
export type TransactionStatus =
  | 'INITIATED'
  | 'OFFER_PENDING'
  | 'ESCROW_CREATED'
  | 'ESCROW_FUNDED'
  | 'CONDITIONS_MET'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'DISPUTED'

export interface TransactionSummary {
  id: string
  type: TransactionType
  status: TransactionStatus
  propertyId: string
  propertyTitle: string
  amount: number
  fee: number
  total: number
  solanaSignature: string | null
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export interface TokenHolding {
  id: string
  propertyId: string
  propertyTitle: string
  propertyType: PropertyType
  propertyImageUrl: string | null
  tokenId: string
  quantity: number
  costBasis: number
  currentValue: number
  roi: number
  roiPercent: number
  purchasedAt: string
}

export interface PortfolioSummary {
  totalValue: number
  totalInvested: number
  totalRoi: number
  roiPercent: number
  holdingCount: number
  holdings: TokenHolding[]
}

// ---------------------------------------------------------------------------
// Inheritance
// ---------------------------------------------------------------------------

export type TransferTrigger = 'MANUAL' | 'DATE' | 'INACTIVITY'

export interface BeneficiaryDesignation {
  id: string
  tokenHoldingId: string
  propertyTitle: string
  beneficiaryEmail: string
  beneficiaryName: string | null
  sharePercent: number
  triggerType: TransferTrigger
  triggerDate?: string
  inactivityDays?: number
  status: 'ACTIVE' | 'REVOKED'
  createdAt: string
}

// ---------------------------------------------------------------------------
// AI Service interfaces — provider-agnostic contracts
// See system-architecture.md §2.5
// ---------------------------------------------------------------------------

export interface AiResult<T> {
  success: boolean
  data?: T
  error?: string
  provider: 'openai' | 'anthropic' | 'mock'
  cachedAt?: string
  processingMs?: number
}

// ---------------------------------------------------------------------------
// File upload
// ---------------------------------------------------------------------------

export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
  uploadedAt: string
}

// ---------------------------------------------------------------------------
// Filter/sort types — for marketplace
// ---------------------------------------------------------------------------

export interface MarketplaceFilters {
  search?: string
  types?: PropertyType[]
  priceMin?: number
  priceMax?: number
  states?: string[]
  status?: ListingStatus[]
  tokenizedOnly?: boolean
}

export type MarketplaceSortKey = 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'yield_desc'
