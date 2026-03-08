import type { Metadata } from 'next'
import { MOCK_LISTINGS } from '@/lib/marketplace/mock-data'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export const metadata: Metadata = {
  title: 'Dashboard — TIGI',
  description: 'Your personal real estate investment dashboard.',
}

// ---------------------------------------------------------------------------
// Dashboard — /dashboard
//
// Server Component shell. Passes the listing catalogue to DashboardClient
// which resolves recommended + watchlist listings client-side.
//
// DB integration path:
//   - Replace MOCK_LISTINGS with Prisma fetches:
//       const listings = await prisma.listing.findMany({ where: { status: 'ACTIVE' } })
//   - Or fetch only the listings the user needs (saved IDs + recommended IDs)
//       via a combined query keyed to the authenticated session.
//   - Move MOCK_USER to session: const session = await getServerSession()
//   - Move MOCK_STATS to aggregates: prisma.savedListing.count({ where: { userId } })
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return <DashboardClient allListings={MOCK_LISTINGS} />
}
