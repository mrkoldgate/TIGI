// ---------------------------------------------------------------------------
// analytics-query.ts — Platform analytics aggregates for admin dashboard.
//
// All queries use Prisma groupBy / count / aggregate rather than raw SQL
// to stay type-safe and portable.
//
// Integration path: these queries replace the mock constants in
// ADMIN_PLATFORM_STATS and feed the /admin/analytics page. They are
// React cache()-wrapped so multiple server components on the same request
// share a single DB round-trip per query.
// ---------------------------------------------------------------------------

import { cache } from 'react'
import { prisma } from '@/lib/db'

// ── Types ──────────────────────────────────────────────────────────────────

export interface UserAnalytics {
  totalUsers:    number
  // KYC breakdown
  kycVerified:   number
  kycPending:    number   // PENDING + SUBMITTED
  kycNone:       number
  kycRejected:   number
  // Subscription breakdown
  tierFree:      number
  tierPro:       number
  tierProPlus:   number
  tierEnterprise: number
  // Activity
  newLast7d:     number
  newLast30d:    number
  // Role
  roleInvestor:  number
  roleOwner:     number
  roleBoth:      number
  roleAdmin:     number
}

export interface ListingAnalytics {
  totalListings:    number
  activeListing:    number
  draftListings:    number
  underReview:      number
  sold:             number
  delisted:         number
  tokenizedCount:   number
  byType: {
    RESIDENTIAL: number
    COMMERCIAL:  number
    LAND:        number
    INDUSTRIAL:  number
    MIXED_USE:   number
  }
}

export interface IntentAnalytics {
  totalIntents:        number
  byType: {
    EXPRESS_INTEREST:  number
    PREPARE_PURCHASE:  number
    PREPARE_INVEST:    number
    PREPARE_LEASE:     number
  }
  byStatus: {
    PENDING:           number
    REVIEWING:         number
    APPROVED:          number
    EXECUTED:          number
    CANCELLED:         number
    EXPIRED:           number
  }
  // Conversion funnel numerics
  funnel: {
    created:           number   // all intents
    reviewing:         number   // REVIEWING + APPROVED + READY_TO_SIGN
    executed:          number   // EXECUTED
  }
  newLast7d:           number
  newLast30d:          number
}

export interface InquiryAnalytics {
  total:     number
  unread:    number
  replied:   number
  newLast7d: number
}

export interface PlatformAnalytics {
  users:    UserAnalytics
  listings: ListingAnalytics
  intents:  IntentAnalytics
  inquiries: InquiryAnalytics
  /** ISO timestamp of when this snapshot was generated */
  generatedAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// ── Queries ────────────────────────────────────────────────────────────────

export const getUserAnalytics = cache(async (): Promise<UserAnalytics> => {
  const [
    totalUsers,
    kycGroups,
    tierGroups,
    roleGroups,
    newLast7d,
    newLast30d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['kycStatus'], _count: { _all: true } }),
    prisma.user.groupBy({ by: ['subscriptionTier'], _count: { _all: true } }),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.user.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.user.count({ where: { createdAt: { gte: daysAgo(30) } } }),
  ])

  function kycCount(status: string) {
    return kycGroups.find((g) => g.kycStatus === status)?._count._all ?? 0
  }
  function tierCount(tier: string) {
    return tierGroups.find((g) => g.subscriptionTier === tier)?._count._all ?? 0
  }
  function roleCount(role: string) {
    return roleGroups.find((g) => g.role === role)?._count._all ?? 0
  }

  return {
    totalUsers,
    kycVerified:   kycCount('VERIFIED'),
    kycPending:    kycCount('PENDING') + kycCount('SUBMITTED'),
    kycNone:       kycCount('NONE'),
    kycRejected:   kycCount('REJECTED'),
    tierFree:      tierCount('free'),
    tierPro:       tierCount('pro'),
    tierProPlus:   tierCount('pro_plus'),
    tierEnterprise: tierCount('enterprise'),
    newLast7d,
    newLast30d,
    roleInvestor:  roleCount('INVESTOR'),
    roleOwner:     roleCount('OWNER'),
    roleBoth:      roleCount('BOTH'),
    roleAdmin:     roleCount('ADMIN') + roleCount('COMPLIANCE_OFFICER'),
  }
})

export const getListingAnalytics = cache(async (): Promise<ListingAnalytics> => {
  const [
    totalListings,
    statusGroups,
    typeGroups,
    tokenizedCount,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.property.groupBy({ by: ['propertyType'], _count: { _all: true } }),
    prisma.property.count({ where: { isTokenized: true } }),
  ])

  function statusCount(s: string) {
    return statusGroups.find((g) => g.status === s)?._count._all ?? 0
  }
  function typeCount(t: string) {
    return typeGroups.find((g) => g.propertyType === t)?._count._all ?? 0
  }

  return {
    totalListings,
    activeListing: statusCount('ACTIVE'),
    draftListings: statusCount('DRAFT'),
    underReview:   statusCount('UNDER_REVIEW'),
    sold:          statusCount('SOLD'),
    delisted:      statusCount('DELISTED'),
    tokenizedCount,
    byType: {
      RESIDENTIAL: typeCount('RESIDENTIAL'),
      COMMERCIAL:  typeCount('COMMERCIAL'),
      LAND:        typeCount('LAND'),
      INDUSTRIAL:  typeCount('INDUSTRIAL'),
      MIXED_USE:   typeCount('MIXED_USE'),
    },
  }
})

export const getIntentAnalytics = cache(async (): Promise<IntentAnalytics> => {
  const [
    totalIntents,
    typeGroups,
    statusGroups,
    newLast7d,
    newLast30d,
  ] = await Promise.all([
    prisma.transactionIntent.count(),
    prisma.transactionIntent.groupBy({ by: ['intentType'], _count: { _all: true } }),
    prisma.transactionIntent.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.transactionIntent.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.transactionIntent.count({ where: { createdAt: { gte: daysAgo(30) } } }),
  ])

  function typeCount(t: string) {
    return typeGroups.find((g) => g.intentType === t)?._count._all ?? 0
  }
  function statusCount(s: string) {
    return statusGroups.find((g) => g.status === s)?._count._all ?? 0
  }

  const reviewing = statusCount('REVIEWING') + statusCount('APPROVED') + statusCount('READY_TO_SIGN')
  const executed  = statusCount('EXECUTED')

  return {
    totalIntents,
    byType: {
      EXPRESS_INTEREST: typeCount('EXPRESS_INTEREST'),
      PREPARE_PURCHASE: typeCount('PREPARE_PURCHASE'),
      PREPARE_INVEST:   typeCount('PREPARE_INVEST'),
      PREPARE_LEASE:    typeCount('PREPARE_LEASE'),
    },
    byStatus: {
      PENDING:   statusCount('PENDING'),
      REVIEWING: reviewing,
      APPROVED:  statusCount('APPROVED'),
      EXECUTED:  executed,
      CANCELLED: statusCount('CANCELLED'),
      EXPIRED:   statusCount('EXPIRED'),
    },
    funnel: {
      created:   totalIntents,
      reviewing,
      executed,
    },
    newLast7d,
    newLast30d,
  }
})

export const getInquiryAnalytics = cache(async (): Promise<InquiryAnalytics> => {
  const [total, unread, replied, newLast7d] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'NEW' } }),
    prisma.inquiry.count({ where: { status: 'REPLIED' } }),
    prisma.inquiry.count({ where: { createdAt: { gte: daysAgo(7) } } }),
  ])

  return { total, unread, replied, newLast7d }
})

/**
 * Fetches all four analytics aggregates in a single parallel batch.
 * Use this from the /admin/analytics page server component.
 */
export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  const [users, listings, intents, inquiries] = await Promise.all([
    getUserAnalytics(),
    getListingAnalytics(),
    getIntentAnalytics(),
    getInquiryAnalytics(),
  ])

  return {
    users,
    listings,
    intents,
    inquiries,
    generatedAt: new Date().toISOString(),
  }
}
