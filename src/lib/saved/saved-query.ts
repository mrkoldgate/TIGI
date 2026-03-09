// ---------------------------------------------------------------------------
// saved-query.ts — Server-side saved listings retrieval.
//
// Used by:
//   - Platform layout (seed SavedListingsProvider with initial state)
//   - GET /api/saved (return authoritative list to client)
//
// Wrapped in React cache() so parallel calls within the same render
// (layout + any server component) hit Prisma only once.
//
// Falls back to empty array if DB is unavailable (dev without Postgres).
// ---------------------------------------------------------------------------

import { cache } from 'react'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import type { SavedEntry } from './saved-context'

/**
 * Fetch all saved listing entries for a user, ordered most-recently-saved first.
 * Returns SavedEntry[] (id + savedAt timestamp) — the same shape the client
 * context stores, so it can be passed directly as initialEntries.
 */
export const getSavedEntriesForUser = cache(
  async (userId: string): Promise<SavedEntry[]> => {
    try {
      const rows = await prisma.savedListing.findMany({
        where:   { userId },
        orderBy: { savedAt: 'desc' },
        select:  { listingId: true, savedAt: true },
      })
      return rows.map((r) => ({ id: r.listingId, savedAt: r.savedAt.getTime() }))
    } catch (err) {
      logger.warn('[saved-query] DB unavailable', { error: (err as Error).message })
      return []
    }
  },
)

/**
 * Count how many listings a user has saved.
 * Used for stats panels where the full entry list isn't needed.
 */
export const getSavedCountForUser = cache(async (userId: string): Promise<number> => {
  try {
    return await prisma.savedListing.count({ where: { userId } })
  } catch {
    return 0
  }
})
