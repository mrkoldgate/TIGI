// ---------------------------------------------------------------------------
// dashboard-query.ts — Build DashboardUser + DashboardStats from session + DB.
//
// Called by the dashboard server page. Avoids importing Prisma into the
// client component and keeps the aggregation logic close to the data layer.
//
// All DB calls are wrapped in try/catch so the page degrades gracefully
// if Postgres is unavailable during development.
// ---------------------------------------------------------------------------

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { getActiveIntentCount } from '@/lib/intents/intent-query'
import type { DashboardUser, DashboardStats } from './mock-dashboard'

// ── KYC + Role mapping ────────────────────────────────────────────────────────
// Prisma enums have more states than the dashboard UI expects — map down.

function mapKycStatus(status: string): DashboardUser['kycStatus'] {
  if (status === 'VERIFIED') return 'VERIFIED'
  if (status === 'PENDING' || status === 'SUBMITTED') return 'PENDING'
  return 'UNVERIFIED'
}

function mapDashboardRole(role: string): DashboardUser['role'] {
  switch (role) {
    case 'OWNER':  return 'OWNER'
    case 'BOTH':   return 'INVESTOR' // buyer dashboard = investor perspective
    default:       return 'INVESTOR'
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface DashboardAllocation {
  propertyId: string
  title:      string
  city:       string
  type:       string
  value:      number
  invested:   number
}

export interface DashboardData {
  user:       DashboardUser
  stats:      DashboardStats
  /** Per-holding value, largest first — drives the allocation bar. */
  allocation: DashboardAllocation[]
}

/**
 * Build the full DashboardData payload for the given session user.
 *
 * - user:  built from session fields + one DB call for createdAt
 * - stats.investmentCount: from TokenHolding count (1 query)
 * - stats.savedCount:      0 here — overridden client-side by SavedListingsContext
 *                          (the context is already seeded from DB via platform layout)
 * - stats.activeInterestsCount: live from TransactionIntent table
 * - portfolio fields: holdings × current token price (sample prices on devnet)
 */
export async function getDashboardData(sessionUser: {
  id: string
  name?: string | null
  email: string
  role?: string
  kycStatus?: string
}): Promise<DashboardData> {
  const name      = sessionUser.name ?? sessionUser.email.split('@')[0]
  const firstName = name.split(' ')[0]

  // Fetch createdAt from DB — not available in the JWT
  let joinedAt = new Date().toISOString()
  try {
    const dbUser = await prisma.user.findUnique({
      where:  { id: sessionUser.id },
      select: { createdAt: true },
    })
    if (dbUser) joinedAt = dbUser.createdAt.toISOString()
  } catch {
    // non-critical; keep fallback value
  }

  const user: DashboardUser = {
    name,
    firstName,
    role:      mapDashboardRole(sessionUser.role ?? 'INVESTOR'),
    kycStatus: mapKycStatus(sessionUser.kycStatus ?? 'NONE'),
    joinedAt,
  }

  // Holdings — count plus value at the current token price (sample prices on devnet)
  let investmentCount = 0
  let allocation: DashboardAllocation[] = []
  try {
    const holdings = await prisma.tokenHolding.findMany({
      where:   { userId: sessionUser.id },
      include: { token: { include: { property: true } } },
    })
    investmentCount = holdings.length
    allocation = holdings
      .map((h) => ({
        propertyId: h.token.property.id,
        title:      h.token.property.title,
        city:       h.token.property.city,
        type:       String(h.token.property.type),
        value:      h.quantity * Number(h.token.pricePerFraction),
        invested:   Number(h.costBasis),
      }))
      .sort((a, b) => b.value - a.value)
  } catch (err) {
    logger.warn('[dashboard-query] Failed to fetch holdings', { error: (err as Error).message })
  }

  const portfolioValue = allocation.length ? allocation.reduce((s, a) => s + a.value, 0) : null
  const totalInvested  = allocation.length ? allocation.reduce((s, a) => s + a.invested, 0) : null

  const activeInterestsCount = await getActiveIntentCount(sessionUser.id)

  const stats: DashboardStats = {
    savedCount:           0,    // overridden by SavedListingsContext.savedCount client-side
    activeInterestsCount,
    investmentCount,
    portfolioValue,
    portfolioChange24h:   null,
    totalInvested,
  }

  return { user, stats, allocation }
}
