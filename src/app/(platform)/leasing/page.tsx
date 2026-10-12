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
// TIGI Hyper-Glass v4 Elite: Pure black (#000000) base, massive atmospheric
// depth field (emerald/teal), Paragon structural containers.
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
    <div className="animate-fade-in relative pt-8 pb-16">
      {/* ── TIGI v4 Elite atmospheric depth field — massive slow-drifting orbs ── */}
      <div
        className="pointer-events-none absolute -left-60 -top-32 h-[720px] w-[720px] rounded-full bg-emerald-500/[0.06] blur-[200px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-48 top-[280px] h-[600px] w-[600px] rounded-full bg-teal-500/[0.05] blur-[180px] animate-float"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 top-[800px] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.03] blur-[160px] animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/4 top-[1300px] h-[400px] w-[400px] rounded-full bg-violet-500/[0.02] blur-[160px] animate-float"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[500px] h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-white/[0.005] blur-[240px]"
        aria-hidden="true"
      />

      <TerraHubClient initialListings={listings} stats={stats} />
    </div>
  )
}
