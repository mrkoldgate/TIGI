import type { Metadata } from 'next'
import { MOCK_SELLER_LISTINGS } from '@/lib/listings/seller-mock-data'
import { SellerListingsClient } from '@/components/listings/seller-listings-client'

// ---------------------------------------------------------------------------
// /listings — Seller listings dashboard ("My Properties" in sidebar).
//
// DB integration path:
//   const listings = await prisma.listing.findMany({
//     where: { ownerId: session.user.id },
//     orderBy: { updatedAt: 'desc' },
//   })
//   return <SellerListingsClient listings={listings} />
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'My Listings — TIGI',
  description: 'Manage your property and land listings on the TIGI marketplace.',
}

export default function SellerListingsPage() {
  return <SellerListingsClient listings={MOCK_SELLER_LISTINGS} />
}
