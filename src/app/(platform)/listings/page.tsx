import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { getOwnerDashboardData } from '@/lib/listings/owner-query'
import { getOwnerInquiries } from '@/lib/inquiries/inquiry-service'
import { OwnerDashboardClient } from '@/components/listings/owner-dashboard-client'

export const metadata: Metadata = {
  title: 'My Properties — TIGI',
  description: 'Owner dashboard — manage listings, track inquiries, and monitor portfolio performance.',
}

// ---------------------------------------------------------------------------
// /listings — Owner dashboard ("My Properties" in sidebar).
//
// Async server component. requireAuth() provides belt-and-suspenders auth
// enforcement on top of the middleware guard.
//
// getOwnerDashboardData fetches the user's DB listings (with mock fallback)
// and builds the OwnerUser context from session fields.
// ---------------------------------------------------------------------------

export default async function OwnerListingsPage() {
  const sessionUser = await requireAuth('/listings')
  const [{ listings, ownerUser }, inquiries] = await Promise.all([
    getOwnerDashboardData(sessionUser),
    getOwnerInquiries(sessionUser.id).catch(() => undefined),
  ])

  return <OwnerDashboardClient listings={listings} ownerUser={ownerUser} inquiries={inquiries} />
}
