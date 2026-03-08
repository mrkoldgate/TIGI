// ---------------------------------------------------------------------------
// Owner dashboard mock data — supplements seller-mock-data.ts.
//
// This file covers the data surfaces that don't belong in the listings
// management table: inquiry inbox, performance analytics, quick-action context.
//
// Integration path:
//   - MOCK_OWNER_INQUIRIES → prisma.inquiry.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' }, take: 10 })
//   - MOCK_OWNER_PERFORMANCE → prisma aggregates, later a dedicated analytics service (M3)
//   - MOCK_OWNER_USER → session.user from next-auth / Clerk
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Owner user context
// ---------------------------------------------------------------------------

export interface OwnerUser {
  name: string
  firstName: string
  /** Role label shown in welcome bar */
  role: 'OWNER' | 'PROFESSIONAL'
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED'
  /** True if at least one listing is tokenized — unlocks tokenization insights */
  hasTokenizedListings: boolean
  joinedAt: string
}

export const MOCK_OWNER_USER: OwnerUser = {
  name: 'Jordan Wells',
  firstName: 'Jordan',
  role: 'OWNER',
  kycStatus: 'VERIFIED',
  hasTokenizedListings: true,
  joinedAt: '2025-09-01',
}

// ---------------------------------------------------------------------------
// Inquiry inbox — messages from potential buyers/tenants/investors
// ---------------------------------------------------------------------------

export type InquiryStatus = 'NEW' | 'READ' | 'REPLIED'
export type InquiryIntent = 'BUY' | 'LEASE' | 'INVEST' | 'INFO'

export interface OwnerInquiry {
  id: string
  /** Links to a SellerListing id */
  assetId: string
  assetTitle: string
  assetType: 'PROPERTY' | 'LAND'
  fromName: string
  /** Two-letter display initials */
  fromInitials: string
  intent: InquiryIntent
  /** First ~120 chars of the message body */
  messagePreview: string
  timestamp: string
  status: InquiryStatus
}

export const MOCK_OWNER_INQUIRIES: OwnerInquiry[] = [
  {
    id: 'inq-001',
    assetId: 'sl-002',
    assetTitle: 'Downtown Mixed-Use Tower Suite 14B',
    assetType: 'PROPERTY',
    fromName: 'Marcus Chen',
    fromInitials: 'MC',
    intent: 'LEASE',
    messagePreview:
      'Interested in the full floor lease. Can we schedule a walkthrough for next week? We need occupancy by May.',
    timestamp: '2026-03-08T09:30:00Z',
    status: 'NEW',
  },
  {
    id: 'inq-002',
    assetId: 'sl-001',
    assetTitle: 'Westside Craftsman Bungalow',
    assetType: 'PROPERTY',
    fromName: 'Sarah Okonkwo',
    fromInitials: 'SO',
    intent: 'INVEST',
    messagePreview:
      "I'd like to purchase 50 fractions at $485 each. Is the token offering still open and what's the minimum hold period?",
    timestamp: '2026-03-07T16:45:00Z',
    status: 'NEW',
  },
  {
    id: 'inq-003',
    assetId: 'sl-003',
    assetTitle: 'Central Valley Agricultural Parcel',
    assetType: 'LAND',
    fromName: 'Harvest Capital LLC',
    fromInitials: 'HC',
    intent: 'LEASE',
    messagePreview:
      "We're evaluating a long-term lease for wine grape cultivation. What's the minimum lease term and water rights situation?",
    timestamp: '2026-03-06T14:20:00Z',
    status: 'READ',
  },
  {
    id: 'inq-004',
    assetId: 'sl-001',
    assetTitle: 'Westside Craftsman Bungalow',
    assetType: 'PROPERTY',
    fromName: 'David Park',
    fromInitials: 'DP',
    intent: 'INFO',
    messagePreview:
      'Love the property. Are there any open house dates coming up? Also, is the renovation history available?',
    timestamp: '2026-03-05T11:10:00Z',
    status: 'REPLIED',
  },
  {
    id: 'inq-005',
    assetId: 'sl-003',
    assetTitle: 'Central Valley Agricultural Parcel',
    assetType: 'LAND',
    fromName: 'AgriVest Partners',
    fromInitials: 'AV',
    intent: 'BUY',
    messagePreview:
      'We have buyer interest at full ask price for the Fresno parcel, subject to a 30-day due diligence period.',
    timestamp: '2026-03-04T08:55:00Z',
    status: 'REPLIED',
  },
]

// ---------------------------------------------------------------------------
// Performance statistics
//
// MVP: computed from engagement stats on SellerListing records.
// M3: real analytics service with time-series charts and funnel data.
// ---------------------------------------------------------------------------

export interface OwnerPerformanceStats {
  /** Total page views across all non-archived listings */
  totalViews: number
  /** Total saves/watchlists across all non-archived listings */
  totalSaves: number
  /** Total inquiry messages received all time */
  totalInquiries: number
  /** Average views → inquiry conversion rate — null until M3 */
  viewToInquiryRate: number | null
  /** Median days from publish to first inquiry — null until M3 */
  medianDaysToFirstInquiry: number | null
  /** Average owner response time in hours — null until M3 */
  avgResponseTimeHours: number | null
  /** Portfolio click-through rate — null until M3 */
  portfolioCtr: number | null
}

// Engagement fields roll up from MOCK_SELLER_LISTINGS:
//   totalViews = 1247 + 3820 + 892 + 5103 + 2180 = 13242
//   totalSaves = 84 + 201 + 47 + 312 + 96     = 740
//   totalInquiries = 12 + 34 + 9 + 51 + 18    = 124
export const MOCK_OWNER_PERFORMANCE: OwnerPerformanceStats = {
  totalViews: 13242,
  totalSaves: 740,
  totalInquiries: 124,
  viewToInquiryRate: null, // M3
  medianDaysToFirstInquiry: null, // M3
  avgResponseTimeHours: null, // M3
  portfolioCtr: null, // M3
}

// ---------------------------------------------------------------------------
// Quick action definitions — used to render the action button strip
// ---------------------------------------------------------------------------

export interface QuickAction {
  id: string
  label: string
  description: string
  href: string
  /** 'primary' = gold CTA, 'land' = green CTA, 'default' = muted */
  variant: 'primary' | 'land' | 'default'
  /** Milestone badge to show when the action is partially gated */
  milestone?: string
  external?: boolean
}

export const OWNER_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'qa-new-property',
    label: 'New Property Listing',
    description: 'List a residential, commercial, or industrial property',
    href: '/listings/new?type=property',
    variant: 'primary',
  },
  {
    id: 'qa-new-land',
    label: 'New Land Listing',
    description: 'List agricultural, development, or recreational land',
    href: '/listings/new?type=land',
    variant: 'land',
  },
  {
    id: 'qa-tokenize',
    label: 'Enable Tokenization',
    description: 'Offer fractional ownership to global investors',
    href: '/listings/new?ownership=fractional',
    variant: 'default',
    milestone: 'M4',
  },
  {
    id: 'qa-marketplace',
    label: 'View Marketplace',
    description: 'See how your listings appear to buyers',
    href: '/marketplace',
    variant: 'default',
  },
]
