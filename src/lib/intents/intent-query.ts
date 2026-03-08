// ---------------------------------------------------------------------------
// intent-query.ts — Server-side transaction intent data fetching.
//
// Used by:
//   - /transactions page (user intent list)
//   - dashboard (activeInterestsCount KPI)
//
// All functions wrapped in React cache() for request deduplication.
// ---------------------------------------------------------------------------

import { cache } from 'react'
import { prisma } from '@/lib/db'

// ── Types ──────────────────────────────────────────────────────────────────

export interface IntentPropertySummary {
  id:          string
  title:       string
  city:        string
  state:       string
  type:        string
  isTokenized: boolean
  price:       number | null
}

export interface UserIntent {
  id:          string
  intentType:  string
  status:      string
  fractionQty: number | null
  offerAmount: number | null
  note:        string | null
  createdAt:   string
  updatedAt:   string
  expiresAt:   string | null
  property:    IntentPropertySummary
}

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Returns all intents for a user, newest-first, with property summary.
 */
export const getIntentsForUser = cache(async (userId: string): Promise<UserIntent[]> => {
  try {
    const rows = await prisma.transactionIntent.findMany({
      where:   { userId },
      include: {
        property: {
          select: { id: true, title: true, city: true, state: true, type: true, isTokenized: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return rows.map((r) => ({
      id:          r.id,
      intentType:  r.intentType,
      status:      r.status,
      fractionQty: r.fractionQty,
      offerAmount: r.offerAmount ? Number(r.offerAmount) : null,
      note:        r.note,
      createdAt:   r.createdAt.toISOString(),
      updatedAt:   r.updatedAt.toISOString(),
      expiresAt:   r.expiresAt?.toISOString() ?? null,
      property: {
        id:          r.property.id,
        title:       r.property.title,
        city:        r.property.city,
        state:       r.property.state,
        type:        r.property.type,
        isTokenized: r.property.isTokenized,
        price:       r.property.price ? Number(r.property.price) : null,
      },
    }))
  } catch (err) {
    console.warn('[intent-query] DB unavailable:', (err as Error).message)
    return []
  }
})

/**
 * Returns count of PENDING + REVIEWING intents for the user.
 * Used by the dashboard activeInterestsCount KPI.
 */
export const getActiveIntentCount = cache(async (userId: string): Promise<number> => {
  try {
    return await prisma.transactionIntent.count({
      where: {
        userId,
        status: { in: ['PENDING', 'REVIEWING'] as never[] },
      },
    })
  } catch {
    return 0
  }
})
