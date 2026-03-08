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
// Compliance review queue
// ---------------------------------------------------------------------------
//
// Integration path (M2+):
//   MOCK_COMPLIANCE_QUEUE → prisma.complianceItem.findMany({ where: { resolvedAt: null } })
//   ComplianceItemType    → prisma enum ComplianceType
//   ComplianceItemStatus  → prisma enum ComplianceStatus
// ---------------------------------------------------------------------------

export type ComplianceItemType =
  | 'KYC'
  | 'LISTING_VERIFICATION'
  | 'INHERITANCE'
  | 'FLAGGED_ANOMALY'

export type ComplianceItemStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ESCALATED'

export type CompliancePriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'NEW'

export interface ComplianceQueueItem {
  id: string
  type: ComplianceItemType
  status: ComplianceItemStatus
  priority: CompliancePriority
  subjectId: string
  /** Primary display label — user name, listing title, transaction ref */
  subjectLabel: string
  /** Secondary metadata — role for KYC, asset type for listings */
  subjectMeta?: string
  /** ISO alpha-2 country code — KYC items only */
  subjectCountry?: string
  /** Summary of what triggered the review or what is needed */
  notes: string
  /** Number of attached documents */
  documentCount?: number
  submittedAt: string
  daysInQueue: number
  /** Admin username assigned to this item */
  assignedTo?: string
  /**
   * KycVerification.id — present only for items backed by a real DB record.
   * When set, the Approve / Reject / Escalate buttons call PATCH /api/admin/kyc/[kycSubmissionId].
   * Mock items leave this undefined and the action buttons are disabled.
   */
  kycSubmissionId?: string
  /**
   * LegacyPlan.id — present only for INHERITANCE items backed by a real DB record.
   * When set, the Approve / Reject / Request Update buttons call PATCH /api/admin/legacy/[legacyPlanId].
   * Mock items leave this undefined and the action buttons are disabled.
   */
  legacyPlanId?: string
}

export const MOCK_COMPLIANCE_QUEUE: ComplianceQueueItem[] = [
  // ── KYC ────────────────────────────────────────────────────────────────
  {
    id: 'cr-001',
    type: 'KYC',
    status: 'ESCALATED',
    priority: 'CRITICAL',
    subjectId: 'user-x92b',
    subjectLabel: 'user_x92b (anon)',
    subjectMeta: 'INVESTOR',
    subjectCountry: 'US',
    notes: 'Duplicate documents detected — three SSN matches to different identities',
    documentCount: 4,
    submittedAt: '2026-03-03T09:00:00Z',
    daysInQueue: 5,
  },
  {
    id: 'cr-002',
    type: 'KYC',
    status: 'PENDING',
    priority: 'HIGH',
    subjectId: 'u-002',
    subjectLabel: 'Marcus Webb',
    subjectMeta: 'OWNER',
    subjectCountry: 'US',
    notes: 'Passport and utility bill submitted — address mismatch requires review',
    documentCount: 2,
    submittedAt: '2026-03-06T06:45:00Z',
    daysInQueue: 2,
  },
  {
    id: 'cr-003',
    type: 'KYC',
    status: 'PENDING',
    priority: 'HIGH',
    subjectId: 'ent-001',
    subjectLabel: 'Delta Farms LLC',
    subjectMeta: 'OWNER (Entity)',
    subjectCountry: 'US',
    notes: 'Business entity KYC — EIN, articles of incorporation, and beneficial ownership pending verification',
    documentCount: 3,
    submittedAt: '2026-03-05T14:00:00Z',
    daysInQueue: 3,
  },
  {
    id: 'cr-004',
    type: 'KYC',
    status: 'IN_REVIEW',
    priority: 'NORMAL',
    subjectId: 'u-006',
    subjectLabel: 'Ahmad Karimi',
    subjectMeta: 'INVESTOR',
    subjectCountry: 'AE',
    notes: 'FATF-jurisdiction investor — enhanced due diligence in progress',
    documentCount: 2,
    submittedAt: '2026-03-07T10:30:00Z',
    daysInQueue: 1,
    assignedTo: 'R. Hoffman',
  },
  {
    id: 'cr-005',
    type: 'KYC',
    status: 'PENDING',
    priority: 'NEW',
    subjectId: 'u-003',
    subjectLabel: 'Ingrid Vasquez',
    subjectMeta: 'BUYER',
    subjectCountry: 'MX',
    notes: 'No documents submitted yet — account created 4h ago, waiting for upload',
    documentCount: 0,
    submittedAt: '2026-03-08T04:20:00Z',
    daysInQueue: 0,
  },

  // ── Listing Verification ────────────────────────────────────────────────
  {
    id: 'cr-006',
    type: 'LISTING_VERIFICATION',
    status: 'PENDING',
    priority: 'CRITICAL',
    subjectId: 'sl-004',
    subjectLabel: 'Shovel-Ready Dev Parcel — E. Mesa',
    subjectMeta: 'Land · Commercial Dev · Tokenized',
    notes: 'Securities compliance required before token offering — no Reg D filing on record',
    documentCount: 1,
    submittedAt: '2026-03-01T14:30:00Z',
    daysInQueue: 7,
  },
  {
    id: 'cr-007',
    type: 'LISTING_VERIFICATION',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    subjectId: 'prop-fl2',
    subjectLabel: 'Ocean View Estate — Naples, FL',
    subjectMeta: 'Property · Residential',
    notes: 'AI valuation >40% above comps — independent appraisal and title verification requested',
    documentCount: 2,
    submittedAt: '2026-03-06T14:30:00Z',
    daysInQueue: 2,
    assignedTo: 'M. Torres',
  },
  {
    id: 'cr-008',
    type: 'LISTING_VERIFICATION',
    status: 'PENDING',
    priority: 'HIGH',
    subjectId: 'prop-rq3',
    subjectLabel: 'Urban Loft — District One, Denver',
    subjectMeta: 'Property · Mixed-Use · Tokenized',
    notes: 'Mixed-use zoning classification needs municipal confirmation before token offering',
    documentCount: 1,
    submittedAt: '2026-03-06T16:00:00Z',
    daysInQueue: 2,
  },
  {
    id: 'cr-009',
    type: 'LISTING_VERIFICATION',
    status: 'PENDING',
    priority: 'NEW',
    subjectId: 'prop-rq5',
    subjectLabel: 'Beachfront Villa Suite 4A — Malibu',
    subjectMeta: 'Property · Residential · Tokenized',
    notes: 'Coastal zone permit verification required — CEQA documentation not yet submitted',
    documentCount: 0,
    submittedAt: '2026-03-08T07:45:00Z',
    daysInQueue: 0,
  },

  // ── Inheritance ─────────────────────────────────────────────────────────
  {
    id: 'cr-010',
    type: 'INHERITANCE',
    status: 'PENDING',
    priority: 'HIGH',
    subjectId: 'inh-001',
    subjectLabel: 'Estate of Harold Vance',
    subjectMeta: 'Property + Token holdings',
    notes: 'Probate filing and executor designation submitted — digital asset transfer authorization pending',
    documentCount: 5,
    submittedAt: '2026-03-04T11:00:00Z',
    daysInQueue: 4,
  },
  {
    id: 'cr-011',
    type: 'INHERITANCE',
    status: 'IN_REVIEW',
    priority: 'NORMAL',
    subjectId: 'inh-002',
    subjectLabel: 'Nakamura Family Trust',
    subjectMeta: '2 Property Listings',
    notes: 'Trust amendment and successor trustee documents submitted — legal review in progress',
    documentCount: 3,
    submittedAt: '2026-03-07T09:00:00Z',
    daysInQueue: 1,
    assignedTo: 'Legal Team',
  },

  // ── Flagged Anomaly ─────────────────────────────────────────────────────
  {
    id: 'cr-012',
    type: 'FLAGGED_ANOMALY',
    status: 'PENDING',
    priority: 'CRITICAL',
    subjectId: 'user-x92b',
    subjectLabel: 'user_x92b — Account Activity',
    subjectMeta: 'USER',
    notes: 'Multiple accounts detected — IP and device fingerprint overlap with 2 previously suspended accounts',
    submittedAt: '2026-03-08T06:12:00Z',
    daysInQueue: 0,
  },
  {
    id: 'cr-013',
    type: 'FLAGGED_ANOMALY',
    status: 'PENDING',
    priority: 'HIGH',
    subjectId: 'txn-8821',
    subjectLabel: 'Transaction #8821',
    subjectMeta: 'TRANSACTION',
    notes: 'Unusual payment velocity — 3 escrow interactions within 4 minutes, potential wash trading pattern',
    submittedAt: '2026-03-07T09:44:00Z',
    daysInQueue: 1,
  },
  {
    id: 'cr-014',
    type: 'FLAGGED_ANOMALY',
    status: 'IN_REVIEW',
    priority: 'NORMAL',
    subjectId: 'land-fl4',
    subjectLabel: 'Desert Land Parcel — Tucson, AZ',
    subjectMeta: 'LISTING',
    notes: 'Zoning classification dispute — user-reported inaccuracy on commercial designation',
    submittedAt: '2026-03-06T11:20:00Z',
    daysInQueue: 2,
    assignedTo: 'R. Hoffman',
  },
]

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
