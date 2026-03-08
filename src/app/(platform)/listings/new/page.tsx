import type { Metadata } from 'next'
import { CreateListingClient } from '@/components/listings/create-listing-client'

// ---------------------------------------------------------------------------
// /listings/new — Listing creation shell.
//
// Server component: sets metadata, renders CreateListingClient.
// All step state lives in the client component.
//
// DB integration path:
//   - Replace the draft-save action stub with prisma.listing.create()
//   - Add auth guard: redirect to /login if no session
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Create Listing — TIGI',
  description: 'List your property or land on the TIGI marketplace.',
}

export default function CreateListingPage() {
  return <CreateListingClient />
}
