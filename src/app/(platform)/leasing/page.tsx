import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { getTerraListings, getTerraStats } from '@/lib/terra/terra-query'
import { TerraHubClient } from '@/components/terra/terra-hub-client'

export const metadata: Metadata = {
  title: 'Terra — Land Leasing & Development',
  description: 'Agricultural leases, development sites, and investment parcels. Find and transact on land opportunities across the country.',
}

// ---------------------------------------------------------------------------
// /leasing — Terra module hub page
//
// Server component: fetches all active land parcels (with lease terms and
// development opportunity data) and Terra stats, passes to TerraHubClient
// for client-side filtering and display.
//
// Owner listing management (add/edit land parcels) → M4
// On-chain lease execution, crowdfunding → M6
// ---------------------------------------------------------------------------

export default async function LeasingPage() {
  await requireAuth('/leasing')

  const [listings, stats] = await Promise.all([
    getTerraListings(),
    getTerraStats(),
  ])

  return (
    <div className="animate-fade-in">
      <TerraHubClient initialListings={listings} stats={stats} />
    </div>
  )
}
