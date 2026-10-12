import type { Metadata } from 'next'
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
// v5: header, sticky glass controls and cards live in MarketplaceClient.
// ---------------------------------------------------------------------------

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireAuth('/marketplace')
  const listings = await getActiveListings()
  const stats = computeMarketplaceStats(listings)
  const { q } = await searchParams

  return <MarketplaceClient listings={listings} stats={stats} initialQuery={q ?? ''} />
}
