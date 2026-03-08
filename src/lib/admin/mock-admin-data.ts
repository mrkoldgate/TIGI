// ---------------------------------------------------------------------------
// Admin dashboard mock data — mirrors future Prisma admin aggregation queries.
//
// Integration path (M2+):
//   - ADMIN_PLATFORM_STATS  → prisma aggregates (counts, sums)
//   - MOCK_REVIEW_QUEUE     → prisma.listing.findMany({ where: { status: 'PENDING_REVIEW' } })
//   - MOCK_FLAGGED_ITEMS    → prisma.flag.findMany({ where: { resolvedAt: null } })
//   - MOCK_RECENT_USERS     → prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10 })
//   - MOCK_DEFERRED_COUNTS  → individual prisma counts per queue type
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Platform-wide KPI stats
// ---------------------------------------------------------------------------

export interface AdminPlatformStats {
  // Users
  totalUsers: number
  verifiedUsers: number
  pendingKycUsers: number
  newUsersLast7d: number
  suspendedUsers: number
  // Listings
  activeListings: number
  pendingReviewListings: number
  pausedListings: number
  // Flags
  openFlags: number
  criticalFlags: number
  // Transactions — locked until M5
  totalTransactions: number | null
  // Revenue — locked until M12
  platformRevenue: number | null
}

export const ADMIN_PLATFORM_STATS: AdminPlatformStats = {
  totalUsers: 847,
  verifiedUsers: 612,
  pendingKycUsers: 43,
  newUsersLast7d: 28,
  suspendedUsers: 3,
  activeListings: 64,
  pendingReviewListings: 7,
  pausedListings: 12,
  openFlags: 4,
  criticalFlags: 1,
  totalTransactions: null,  // M5
  platformRevenue: null,    // M12
}

// ---------------------------------------------------------------------------
// Pending listing review queue
// ---------------------------------------------------------------------------

export type ReviewAssetType = 'PROPERTY' | 'LAND'
export type ReviewUrgency = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'NEW'

export interface ReviewQueueItem {
  id: string
  listingId: string
  title: string
  assetType: ReviewAssetType
  subtype: string
  city: string
  state: string
  ownerName: string
  /** ISO timestamp of submission */
  submittedAt: string
  /** Days in queue (derived) */
  daysInQueue: number
  isTokenized: boolean
  price: number | null
  urgency: ReviewUrgency
}

export const MOCK_REVIEW_QUEUE: ReviewQueueItem[] = [
  {
    id: 'rq-001',
    listingId: 'sl-004',
    title: 'Shovel-Ready Dev Parcel — East Mesa',
    assetType: 'LAND',
    subtype: 'Commercial Dev',
    city: 'Phoenix',
    state: 'AZ',
    ownerName: 'Jordan Wells',
    submittedAt: '2026-03-01T14:30:00Z',
    daysInQueue: 7,
    isTokenized: true,
    price: 3400000,
    urgency: 'CRITICAL',
  },
  {
    id: 'rq-002',
    listingId: 'sl-005',
    title: 'Lakeview Contemporary — 3BR/2BA',
    assetType: 'PROPERTY',
    subtype: 'Residential',
    city: 'Seattle',
    state: 'WA',
    ownerName: 'Jordan Wells',
    submittedAt: '2026-03-05T09:15:00Z',
    daysInQueue: 3,
    isTokenized: false,
    price: 895000,
    urgency: 'HIGH',
  },
  {
    id: 'rq-003',
    listingId: 'prop-rq3',
    title: 'Urban Loft — District One',
    assetType: 'PROPERTY',
    subtype: 'Mixed-Use',
    city: 'Denver',
    state: 'CO',
    ownerName: 'Sandra Vail',
    submittedAt: '2026-03-06T16:00:00Z',
    daysInQueue: 2,
    isTokenized: true,
    price: 575000,
    urgency: 'HIGH',
  },
  {
    id: 'rq-004',
    listingId: 'land-rq4',
    title: 'Riverside Meadow Ranch',
    assetType: 'LAND',
    subtype: 'Agricultural',
    city: 'Bozeman',
    state: 'MT',
    ownerName: 'Thomas Eaton',
    submittedAt: '2026-03-07T10:30:00Z',
    daysInQueue: 1,
    isTokenized: false,
    price: 2100000,
    urgency: 'NORMAL',
  },
  {
    id: 'rq-005',
    listingId: 'prop-rq5',
    title: 'Beachfront Villa Suite 4A',
    assetType: 'PROPERTY',
    subtype: 'Residential',
    city: 'Malibu',
    state: 'CA',
    ownerName: 'Priya Anand',
    submittedAt: '2026-03-08T07:45:00Z',
    daysInQueue: 0,
    isTokenized: true,
    price: 4800000,
    urgency: 'NEW',
  },
  {
    id: 'rq-006',
    listingId: 'land-rq6',
    title: 'Pine Ridge Agricultural Parcel',
    assetType: 'LAND',
    subtype: 'Agricultural',
    city: 'Fresno',
    state: 'CA',
    ownerName: 'Delta Farms LLC',
    submittedAt: '2026-03-08T08:20:00Z',
    daysInQueue: 0,
    isTokenized: false,
    price: 980000,
    urgency: 'NEW',
  },
  {
    id: 'rq-007',
    listingId: 'prop-rq7',
    title: 'Canyon View Condos — Unit 12',
    assetType: 'PROPERTY',
    subtype: 'Residential',
    city: 'Sedona',
    state: 'AZ',
    ownerName: 'Kwame Osei',
    submittedAt: '2026-03-08T09:00:00Z',
    daysInQueue: 0,
    isTokenized: false,
    price: 345000,
    urgency: 'NEW',
  },
]

// ---------------------------------------------------------------------------
// Flagged items — content moderation queue
// ---------------------------------------------------------------------------

export type FlaggedItemType = 'LISTING' | 'USER' | 'TRANSACTION'
export type FlagSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM'

export interface FlaggedItem {
  id: string
  /** The flagged entity's display identifier */
  subjectId: string
  subjectLabel: string
  type: FlaggedItemType
  severity: FlagSeverity
  reason: string
  /** Who raised the flag: 'AI', 'SYSTEM', or a user ID */
  flaggedBy: string
  flaggedAt: string
  /** Admin route to view the subject */
  reviewHref: string
}

export const MOCK_FLAGGED_ITEMS: FlaggedItem[] = [
  {
    id: 'fl-001',
    subjectId: 'user-x92b',
    subjectLabel: 'user_x92b (anon)',
    type: 'USER',
    severity: 'CRITICAL',
    reason: 'Multiple accounts detected — suspected identity fraud',
    flaggedBy: 'SYSTEM',
    flaggedAt: '2026-03-08T06:12:00Z',
    reviewHref: '/admin/users',
  },
  {
    id: 'fl-002',
    subjectId: 'prop-fl2',
    subjectLabel: 'Ocean View Estate — Naples, FL',
    type: 'LISTING',
    severity: 'HIGH',
    reason: 'AI valuation discrepancy >40% above market comps',
    flaggedBy: 'AI',
    flaggedAt: '2026-03-07T14:30:00Z',
    reviewHref: '/admin/listings',
  },
  {
    id: 'fl-003',
    subjectId: 'txn-8821',
    subjectLabel: 'Transaction #8821',
    type: 'TRANSACTION',
    severity: 'HIGH',
    reason: 'Unusual payment velocity — 3 transactions in 4 minutes',
    flaggedBy: 'SYSTEM',
    flaggedAt: '2026-03-07T09:44:00Z',
    reviewHref: '/admin/transactions',
  },
  {
    id: 'fl-004',
    subjectId: 'land-fl4',
    subjectLabel: 'Desert Land Parcel — Tucson, AZ',
    type: 'LISTING',
    severity: 'MEDIUM',
    reason: 'Zoning classification dispute — user-reported inaccuracy',
    flaggedBy: 'user-4412',
    flaggedAt: '2026-03-06T11:20:00Z',
    reviewHref: '/admin/listings',
  },
]

// ---------------------------------------------------------------------------
// Recent user registrations
// ---------------------------------------------------------------------------

export type UserKycStatus = 'VERIFIED' | 'PENDING' | 'UNVERIFIED'
export type UserRole = 'INVESTOR' | 'BUYER' | 'OWNER' | 'PROFESSIONAL' | 'ADMIN'

export interface RecentUser {
  id: string
  name: string
  initials: string
  role: UserRole
  kycStatus: UserKycStatus
  joinedAt: string
  country: string
}

export const MOCK_RECENT_USERS: RecentUser[] = [
  {
    id: 'u-001',
    name: 'Priya Sharma',
    initials: 'PS',
    role: 'INVESTOR',
    kycStatus: 'VERIFIED',
    joinedAt: '2026-03-08T08:12:00Z',
    country: 'IN',
  },
  {
    id: 'u-002',
    name: 'Marcus Webb',
    initials: 'MW',
    role: 'OWNER',
    kycStatus: 'PENDING',
    joinedAt: '2026-03-08T06:45:00Z',
    country: 'US',
  },
  {
    id: 'u-003',
    name: 'Ingrid Vasquez',
    initials: 'IV',
    role: 'BUYER',
    kycStatus: 'UNVERIFIED',
    joinedAt: '2026-03-08T04:20:00Z',
    country: 'MX',
  },
  {
    id: 'u-004',
    name: 'Kwame Osei-Bonsu',
    initials: 'KO',
    role: 'PROFESSIONAL',
    kycStatus: 'VERIFIED',
    joinedAt: '2026-03-07T15:30:00Z',
    country: 'GH',
  },
  {
    id: 'u-005',
    name: 'Li Wei',
    initials: 'LW',
    role: 'INVESTOR',
    kycStatus: 'VERIFIED',
    joinedAt: '2026-03-07T10:10:00Z',
    country: 'SG',
  },
]

// ---------------------------------------------------------------------------
// Deferred queue counts
// ---------------------------------------------------------------------------

export interface DeferredQueueCounts {
  inheritanceSubmissions: number
  inheritancePendingReview: number
  compliancePending: number
  complianceEscalated: number
  supportTicketsOpen: number
  supportTicketsUrgent: number
  supportOldestHours: number
}

export const MOCK_DEFERRED_COUNTS: DeferredQueueCounts = {
  inheritanceSubmissions: 2,
  inheritancePendingReview: 2,
  compliancePending: 8,
  complianceEscalated: 1,
  supportTicketsOpen: 12,
  supportTicketsUrgent: 3,
  supportOldestHours: 26,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatAdminDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatAdminRelative(iso: string): string {
  const now = new Date('2026-03-08T10:00:00Z')
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  const diffD = Math.floor(diffH / 24)

  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  if (diffD === 1) return '1d ago'
  return `${diffD}d ago`
}

export function formatAdminPrice(price: number | null): string {
  if (price === null) return '—'
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`
  return `$${price}`
}
