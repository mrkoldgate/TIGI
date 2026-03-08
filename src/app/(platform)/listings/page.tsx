import type { Metadata } from 'next'
import { MOCK_SELLER_LISTINGS } from '@/lib/listings/seller-mock-data'
import { OwnerDashboardClient } from '@/components/listings/owner-dashboard-client'

export const metadata: Metadata = {
  title: 'My Properties — TIGI',
  description: 'Owner dashboard — manage listings, track inquiries, and monitor portfolio performance.',
}

// ---------------------------------------------------------------------------
// /listings — Owner dashboard ("My Properties" in sidebar).
//
// Server Component shell. Passes the owner's listings to OwnerDashboardClient
// which orchestrates the full dashboard: stats, quick actions, inquiries,
// performance panel, and the embedded SellerListingsClient table.
//
// DB integration path:
//   const session = await getServerSession()
//   const listings = await prisma.listing.findMany({
//     where:   { ownerId: session.user.id },
//     orderBy: { updatedAt: 'desc' },
//   })
//   return <OwnerDashboardClient listings={listings} />
// ---------------------------------------------------------------------------

export default function OwnerListingsPage() {
  return <OwnerDashboardClient listings={MOCK_SELLER_LISTINGS} />
}
