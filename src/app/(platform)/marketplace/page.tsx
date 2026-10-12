import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { MarketplaceClient } from '@/components/marketplace/marketplace-client'
import { getActiveListings, computeMarketplaceStats } from '@/lib/listings/listing-query'
import { requireAuth } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse tokenized real estate properties and invest fractionally.',
}

// ---------------------------------------------------------------------------
// Marketplace — /marketplace
//
// TIGI Hyper-Glass v4 Elite: Pure black (#000000) base, massive atmospheric
// orbs with blur-[160px]+, Dimension structural trays, Paragon cards.
// ---------------------------------------------------------------------------

export default async function MarketplacePage() {
  await requireAuth('/marketplace')
  const listings = await getActiveListings()
  const stats = computeMarketplaceStats(listings)

  return (
    <div className="animate-fade-in relative pt-8 pb-16">

      {/* ── v4 Elite atmospheric depth field — massive slow-drifting orbs ── */}
      {/* Primary indigo — top-left, viewport-scale */}
      <div
        className="pointer-events-none absolute -left-60 -top-32 h-[720px] w-[720px] rounded-full bg-indigo-500/[0.06] blur-[200px] animate-float-slow"
        aria-hidden="true"
      />
      {/* Secondary violet — mid-right */}
      <div
        className="pointer-events-none absolute -right-48 top-[280px] h-[600px] w-[600px] rounded-full bg-violet-500/[0.045] blur-[180px] animate-float"
        aria-hidden="true"
      />
      {/* Tertiary cyan — bottom-left */}
      <div
        className="pointer-events-none absolute -left-32 top-[800px] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.03] blur-[160px] animate-float-slow"
        aria-hidden="true"
      />
      {/* Deep rose undertone — far bottom-right */}
      <div
        className="pointer-events-none absolute right-1/4 top-[1300px] h-[400px] w-[400px] rounded-full bg-rose-500/[0.02] blur-[160px] animate-float"
        aria-hidden="true"
      />
      {/* Center bloom — unifying field */}
      <div
        className="pointer-events-none absolute left-1/2 top-[500px] h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-white/[0.005] blur-[240px]"
        aria-hidden="true"
      />

      <PageHeader
        title="Marketplace"
        description="Browse and invest in tokenized real estate, globally."
        eyebrow="Discover"
      />

      <div className="mt-10">
        <MarketplaceClient listings={listings} stats={stats} />
      </div>
    </div>
  )
}
