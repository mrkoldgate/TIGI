import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createListingService, ListingNotFoundError, ListingForbiddenError, ListingStateError } from '@/lib/services/listing.service'
import { isOwner } from '@/lib/auth/rbac'

// ---------------------------------------------------------------------------
// POST /api/listings/[id]/submit
//   Transitions a DRAFT listing to UNDER_REVIEW.
//   Requires authenticated owner. No request body.
//
// After submission:
//   - Compliance queue picks it up at /admin/compliance
//   - Owner sees "Under Review" badge on their listings page
//   - Owner can still edit (which resets status to DRAFT)
// ---------------------------------------------------------------------------

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
  }

  if (!isOwner(session.user)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Only property owners may submit listings for review' } },
      { status: 403 },
    )
  }

  const { id } = await params

  try {
    const service = createListingService()
    const listing = await service.submitForReview(id, session.user.id)
    return NextResponse.json({ success: true, data: listing })
  } catch (err) {
    if (err instanceof ListingNotFoundError) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: err.message } }, { status: 404 })
    }
    if (err instanceof ListingForbiddenError) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: err.message } }, { status: 403 })
    }
    if (err instanceof ListingStateError) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_STATE', message: err.message } }, { status: 409 })
    }
    console.error('[POST /api/listings/[id]/submit]', err)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit listing' } }, { status: 500 })
  }
}
