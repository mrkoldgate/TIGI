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
// Server Component: fetches all ACTIVE listings from the database and passes
// them as props to MarketplaceClient. All filtering + sorting stays client-side
// (acceptable for MVP volume). For scale, move filter params to searchParams
// and push the filtering into the DB query.
//
// Falls back to mock data if the database is unavailable (dev without DB).
// ---------------------------------------------------------------------------

export default async function MarketplacePage() {
  await requireAuth('/marketplace')
  const listings = await getActiveListings()
  const stats = computeMarketplaceStats(listings)

  return (
    <div className="animate-fade-in pt-6 pb-16">
      <PageHeader
        title="Marketplace"
        description="Browse and invest in tokenized real estate, globally."
      />

      <div className="mt-6">
        <MarketplaceClient listings={listings} stats={stats} />
      </div>
    </div>
  )
}
