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

export interface DashboardData {
  user:  DashboardUser
  stats: DashboardStats
}

/**
 * Build the full DashboardData payload for the given session user.
 *
 * - user:  built from session fields + one DB call for createdAt
 * - stats.investmentCount: from TokenHolding count (1 query)
 * - stats.savedCount:      0 here — overridden client-side by SavedListingsContext
 *                          (the context is already seeded from DB via platform layout)
 * - stats.activeInterestsCount: live from TransactionIntent table
 * - portfolio fields: null until wallet integration (M5)
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

  // Investment count — number of distinct tokenized assets held
  let investmentCount = 0
  try {
    investmentCount = await prisma.tokenHolding.count({
      where: { userId: sessionUser.id },
    })
  } catch (err) {
    console.warn('[dashboard-query] Failed to fetch investment count:', (err as Error).message)
  }

  const activeInterestsCount = await getActiveIntentCount(sessionUser.id)

  const stats: DashboardStats = {
    savedCount:           0,    // overridden by SavedListingsContext.savedCount client-side
    activeInterestsCount,
    investmentCount,
    portfolioValue:       null, // TODO M4: aggregate token holdings × current price
    portfolioChange24h:   null,
    totalInvested:        null,
  }

  return { user, stats }
}
