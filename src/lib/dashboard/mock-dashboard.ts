// ---------------------------------------------------------------------------
// Dashboard mock data — mirrors the future API / Prisma shape.
//
// Integration path:
//   - MOCK_USER        → session.user from next-auth / Clerk
//   - MOCK_STATS       → prisma aggregates per user
//   - MOCK_INSIGHTS    → AI recommendation service (M6)
//   - MOCK_ACTIVITY    → prisma.activityLog.findMany({ where: { userId } })
//   - MOCK_ALERTS      → prisma.watchlistAlert.findMany({ where: { userId } })
//   - RECOMMENDED_IDS  → ML recommendation engine (M6); today: curated editorial picks
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// User context — replaces session in real app
// ---------------------------------------------------------------------------

export interface DashboardUser {
  name: string
  firstName: string
  role: 'INVESTOR' | 'BUYER' | 'OWNER' | 'PROFESSIONAL'
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED'
  joinedAt: string
}

export const MOCK_USER: DashboardUser = {
  name: 'Alex Rivera',
  firstName: 'Alex',
  role: 'INVESTOR',
  kycStatus: 'VERIFIED',
  joinedAt: '2025-12-01',
}

// ---------------------------------------------------------------------------
// Summary stats — aggregated per-user counts and values
// ---------------------------------------------------------------------------

export interface DashboardStats {
  /** Properties the user has bookmarked */
  savedCount: number
  /** Properties user is actively evaluating / has sent interest on */
  activeInterestsCount: number
  /** Number of distinct tokenized investments held */
  investmentCount: number
  /** Total portfolio USD value — null until wallet connected (M4) */
  portfolioValue: number | null
  /** 24h portfolio change % — null until M4 */
  portfolioChange24h: number | null
  /** Total USD committed across all investments — null until M4 */
  totalInvested: number | null
}

// Counts mirrored from saved-context (savedCount) and mock activity data.
// portfolioValue/totalInvested locked to null until Solana wallet in M4.
export const MOCK_STATS: DashboardStats = {
  savedCount: 7,
  activeInterestsCount: 3,
  investmentCount: 2,
  portfolioValue: null,
  portfolioChange24h: null,
  totalInvested: null,
}

// ---------------------------------------------------------------------------
// AI Insights — actionable signals surfaced for the user
// ---------------------------------------------------------------------------

export type InsightType =
  | 'PRICE_DROP'
  | 'PRICE_RISE'
  | 'NEW_MATCH'
  | 'VALUATION_CHANGE'
  | 'MARKET_TREND'
  | 'TOKEN_ALERT'
  | 'INVESTMENT_UPDATE'

export type InsightPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface InsightItem {
  id: string
  type: InsightType
  priority: InsightPriority
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  /** Asset ID this insight relates to, if any */
  assetId?: string
  timestamp: string
}

export const MOCK_INSIGHTS: InsightItem[] = [
  {
    id: 'ins-001',
    type: 'PRICE_DROP',
    priority: 'HIGH',
    title: 'Price reduced on a saved property',
    description:
      'Highland Park Colonial Estate dropped 6.3% to $895K. AI valuation now rates this as fairly priced — historically favorable entry.',
    actionLabel: 'View property',
    actionHref: '/marketplace/res-004',
    assetId: 'res-004',
    timestamp: '2026-03-08T08:14:00Z',
  },
  {
    id: 'ins-002',
    type: 'NEW_MATCH',
    priority: 'HIGH',
    title: '3 new listings match your criteria',
    description:
      'Tokenized commercial properties in Phoenix and Charlotte match your $50K–$150K range with HIGH-confidence AI valuations.',
    actionLabel: 'Browse matches',
    actionHref: '/marketplace?category=commercial',
    timestamp: '2026-03-08T06:00:00Z',
  },
  {
    id: 'ins-003',
    type: 'MARKET_TREND',
    priority: 'MEDIUM',
    title: 'Austin residential up 4.2% this quarter',
    description:
      'Two of your saved Austin properties benefit from sustained local demand growth. AI confidence upgraded to HIGH.',
    actionLabel: 'See Austin listings',
    actionHref: '/marketplace',
    timestamp: '2026-03-07T12:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Recent activity — per-user event log
// ---------------------------------------------------------------------------

export type ActivityType =
  | 'SAVED'
  | 'UNSAVED'
  | 'VIEWED'
  | 'INVESTED'
  | 'PRICE_CHANGE'
  | 'NEW_INVESTOR'
  | 'VALUATION_UPDATE'
  | 'INTEREST_SENT'

export interface ActivityItem {
  id: string
  type: ActivityType
  /** Human-readable action label */
  label: string
  assetTitle: string
  assetId: string
  /** Supporting detail string, e.g. "$950K → $895K" */
  detail?: string
  timestamp: string
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-001',
    type: 'SAVED',
    label: 'You saved',
    assetTitle: 'Coastal Villa with Ocean Views',
    assetId: 'res-003',
    timestamp: '2026-03-08T09:12:00Z',
  },
  {
    id: 'act-002',
    type: 'PRICE_CHANGE',
    label: 'Price updated',
    assetTitle: 'Highland Park Colonial Estate',
    assetId: 'res-004',
    detail: '$950K → $895K',
    timestamp: '2026-03-08T08:00:00Z',
  },
  {
    id: 'act-003',
    type: 'NEW_INVESTOR',
    label: 'New investor joined',
    assetTitle: 'Westside Craftsman Bungalow',
    assetId: 'res-001',
    detail: '18 → 19 investors',
    timestamp: '2026-03-07T14:22:00Z',
  },
  {
    id: 'act-004',
    type: 'VALUATION_UPDATE',
    label: 'AI valuation refreshed',
    assetTitle: 'Midtown Modern Townhome',
    assetId: 'res-002',
    detail: '$612K → $635K (+3.7%)',
    timestamp: '2026-03-07T06:00:00Z',
  },
  {
    id: 'act-005',
    type: 'VIEWED',
    label: 'You viewed',
    assetTitle: 'Phoenix Business Park',
    assetId: 'com-001',
    timestamp: '2026-03-06T16:45:00Z',
  },
  {
    id: 'act-006',
    type: 'INTEREST_SENT',
    label: 'Interest submitted',
    assetTitle: 'Scottsdale Mixed-Use Development',
    assetId: 'mix-001',
    timestamp: '2026-03-05T11:30:00Z',
  },
]

// ---------------------------------------------------------------------------
// Valuation alerts — price and AI valuation changes on watched assets
// ---------------------------------------------------------------------------

export interface ValuationAlert {
  id: string
  assetId: string
  assetTitle: string
  /** Absolute percentage change */
  changePercent: number
  direction: 'UP' | 'DOWN'
  oldValue: number
  newValue: number
  timestamp: string
}

export const MOCK_VALUATION_ALERTS: ValuationAlert[] = [
  {
    id: 'alert-001',
    assetId: 'res-004',
    assetTitle: 'Highland Park Colonial Estate',
    changePercent: 6.3,
    direction: 'DOWN',
    oldValue: 955000,
    newValue: 895000,
    timestamp: '2026-03-08T08:00:00Z',
  },
  {
    id: 'alert-002',
    assetId: 'res-002',
    assetTitle: 'Midtown Modern Townhome',
    changePercent: 3.7,
    direction: 'UP',
    oldValue: 612000,
    newValue: 635000,
    timestamp: '2026-03-07T06:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Recommended listing IDs — editorial picks for MVP; swap for ML in M6
// Ordered by curated relevance: top tokenized assets across property types
// ---------------------------------------------------------------------------

export const RECOMMENDED_LISTING_IDS: string[] = [
  'res-001', // Westside Craftsman Bungalow — high investor count, tokenized
  'com-001', // Phoenix Business Park — commercial diversification
  'res-002', // Midtown Modern Townhome — high confidence valuation
  'land-001', // if exists — land diversification
]

// ---------------------------------------------------------------------------
// Watchlist listing IDs — mock "saved" state for SSR rendering.
// In production: read from session / DB; override with SavedListingsContext.
// ---------------------------------------------------------------------------

export const MOCK_SAVED_IDS: string[] = [
  'res-001',
  'res-003',
  'res-004',
  'com-001',
  'res-002',
]
