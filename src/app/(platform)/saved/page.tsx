import type { Metadata } from 'next'
import { MOCK_LISTINGS } from '@/lib/marketplace/mock-data'
import { SavedListingsClient } from '@/components/saved/saved-listings-client'

// ---------------------------------------------------------------------------
// /saved — Favorites / saved listings page.
//
// Server shell: passes the full listing catalogue to the client component.
// The client intersects it with the user's saved IDs from SavedListingsContext.
//
// DB integration path:
//   - Replace MOCK_LISTINGS with: prisma.listing.findMany({ where: { status: 'ACTIVE' } })
//   - Or fetch only the saved listings:
//       const savedIds = getSavedIdsFromSession(session)  // from DB / JWT
//       const listings = await prisma.listing.findMany({ where: { id: { in: savedIds } } })
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Saved — TIGI',
  description: 'Your saved properties and land parcels on the TIGI marketplace.',
}

export default function SavedPage() {
  return <SavedListingsClient allListings={MOCK_LISTINGS} />
}
