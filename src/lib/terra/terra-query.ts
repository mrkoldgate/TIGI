/**
 * terra-query.ts — Server-side queries for the Terra module.
 *
 * M3 (current): wraps TERRA_LISTINGS mock data with React cache().
 *
 * DB migration path:
 *   Replace TERRA_LISTINGS with:
 *     prisma.property.findMany({
 *       where: { type: 'LAND', status: 'ACTIVE' },
 *       include: { leaseTerms: true, devOpportunity: true, images: { where: { isPrimary: true } } },
 *     })
 *   Then map to TerraListing shape.
 */

import { cache } from 'react'
import { TERRA_LISTINGS, getTerraListingById } from './terra-mock-data'
import type { TerraListing } from './terra-types'

// ── Filters ────────────────────────────────────────────────────────────────

export interface TerraListingFilters {
  listingType?:  'ALL' | 'LEASE' | 'BUY' | 'BOTH'
  hasDevOpp?:    boolean     // only parcels with devOpportunity !== null
  minAcres?:     number
  maxAcres?:     number
  maxMonthlyRate?: number
  search?:       string
}

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Returns all active land parcels (LAND type).
 * Wrapped in React cache() for request deduplication on server components.
 */
export const getTerraListings = cache(
  async (filters: TerraListingFilters = {}): Promise<TerraListing[]> => {
    let results = [...TERRA_LISTINGS]

    if (filters.listingType && filters.listingType !== 'ALL') {
      results = results.filter((l) => l.listingType === filters.listingType)
    }

    if (filters.hasDevOpp) {
      results = results.filter((l) => l.devOpportunity !== null)
    }

    if (filters.minAcres !== undefined) {
      results = results.filter((l) => (l.lotAcres ?? 0) >= filters.minAcres!)
    }

    if (filters.maxAcres !== undefined) {
      results = results.filter((l) => (l.lotAcres ?? 0) <= filters.maxAcres!)
    }

    if (filters.maxMonthlyRate !== undefined) {
      results = results.filter(
        (l) => l.leaseRateMonthly === null || l.leaseRateMonthly <= filters.maxMonthlyRate!,
      )
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.features.some((f) => f.toLowerCase().includes(q)),
      )
    }

    return results
  },
)

/**
 * Returns a single TerraListing by property ID.
 */
export const getTerraListing = cache(
  async (id: string): Promise<TerraListing | null> => {
    return getTerraListingById(id) ?? null
  },
)

/**
 * Returns stats for the Terra hub page header.
 */
export const getTerraStats = cache(async () => {
  const all         = TERRA_LISTINGS
  const leaseCount  = all.filter((l) => l.listingType === 'LEASE' || l.listingType === 'BOTH').length
  const devCount    = all.filter((l) => l.devOpportunity !== null).length
  const totalAcres  = all.reduce((s, l) => s + (l.lotAcres ?? 0), 0)

  return {
    totalParcels: all.length,
    leaseCount,
    devCount,
    totalAcres: Math.round(totalAcres),
  }
})
