import type { Metadata } from 'next'
import { getActiveListings } from '@/lib/listings/listing-query'
import { SavedListingsClient } from '@/components/saved/saved-listings-client'

// ---------------------------------------------------------------------------
// /saved — Favorites / saved listings page.
//
// Passes the active listing catalogue to SavedListingsClient, which
// intersects it with the user's saved IDs from SavedListingsContext.
// The context is already seeded from DB in the platform layout — no
// redundant DB call needed here for the saved IDs themselves.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Saved — TIGI',
  description: 'Your saved properties and land parcels on the TIGI marketplace.',
}

export default async function SavedPage() {
  const allListings = await getActiveListings()
  return <SavedListingsClient allListings={allListings} />
}
