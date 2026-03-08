// ---------------------------------------------------------------------------
// listing-review-query.ts — Server-side listing review data fetching.
//
// Used by:
//   - /admin/reviews page (review queue)
//   - /admin/dashboard page (KPI count)
//
// All functions are wrapped in React cache() for request deduplication.
// ---------------------------------------------------------------------------

import { cache } from 'react'
import { prisma } from '@/lib/db'
import type { ReviewQueueItem, ReviewUrgency } from './mock-admin-data'

// ── Review queue ───────────────────────────────────────────────────────────

/**
 * Fetches all UNDER_REVIEW listings for the admin review queue.
 * Maps Property rows to the ReviewQueueItem shape consumed by ReviewQueue.
 */
export const getListingsUnderReview = cache(async (): Promise<ReviewQueueItem[]> => {
  try {
    const rows = await prisma.property.findMany({
      where:   { status: 'UNDER_REVIEW' },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { updatedAt: 'asc' }, // oldest-first → urgent items rise to top
      take:    100,
    })

    return rows.map((p): ReviewQueueItem => {
      const submittedAt = p.updatedAt.toISOString()
      const daysInQueue = Math.max(
        0,
        Math.floor((Date.now() - p.updatedAt.getTime()) / 86_400_000),
      )
      const urgency: ReviewUrgency =
        daysInQueue > 5 ? 'CRITICAL' :
        daysInQueue > 2 ? 'HIGH'     :
        daysInQueue > 0 ? 'NORMAL'   :
                          'NEW'

      return {
        id:          p.id,
        listingId:   p.id,
        title:       p.title,
        assetType:   p.type === 'LAND' ? 'LAND' : 'PROPERTY',
        subtype:     formatSubtype(p.type),
        city:        p.city,
        state:       p.state,
        ownerName:   p.owner.name ?? p.owner.email,
        submittedAt,
        daysInQueue,
        isTokenized: p.isTokenized,
        price:       p.price ? Number(p.price) : null,
        urgency,
      }
    })
  } catch (err) {
    console.warn('[listing-review-query] DB unavailable:', (err as Error).message)
    return []
  }
})

/**
 * Returns just the count of UNDER_REVIEW listings.
 * Used by the admin dashboard KPI tile.
 */
export const getPendingReviewCount = cache(async (): Promise<number> => {
  try {
    return await prisma.property.count({ where: { status: 'UNDER_REVIEW' } })
  } catch {
    return 0
  }
})

// ── Helpers ────────────────────────────────────────────────────────────────

function formatSubtype(type: string): string {
  switch (type) {
    case 'RESIDENTIAL': return 'Residential'
    case 'COMMERCIAL':  return 'Commercial'
    case 'LAND':        return 'Land'
    case 'INDUSTRIAL':  return 'Industrial'
    case 'MIXED_USE':   return 'Mixed-Use'
    default:            return type
  }
}
