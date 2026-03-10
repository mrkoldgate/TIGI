import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth/session'
import { getListingsUnderReview } from '@/lib/admin/listing-review-query'
import { ReviewQueueClient } from '@/components/admin/review-queue-client'

export const metadata: Metadata = {
  title: 'Review Queue — Admin',
  description: 'Listing compliance review and approval workflow.',
}

// ---------------------------------------------------------------------------
// /admin/reviews — Listing review queue
//
// Server component: fetches all UNDER_REVIEW listings from DB and hands off
// to ReviewQueueClient which owns action state and calls the PATCH API.
//
// Approve         → ACTIVE   (listing goes live, listedAt = now)
// Reject          → DELISTED (removed from marketplace)
// Request Update  → DRAFT    (returned to owner for edits, re-enters review on resubmit)
// Archive         → DELISTED (admin-archived, distinguished in audit log)
// ---------------------------------------------------------------------------

export default async function AdminReviewsPage() {
  await requireAdmin()

  const items = await getListingsUnderReview()

  return <ReviewQueueClient items={items} />
}
