import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { UpdateListingSchema } from '@/lib/validations/listing'
import { createListingService, ListingNotFoundError, ListingForbiddenError, ListingStateError } from '@/lib/services/listing.service'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// GET /api/listings/[id]
//   Returns a single listing. Owner only.
//
// PATCH /api/listings/[id]
//   Partially updates a listing draft or under-review listing.
//   If the listing is UNDER_REVIEW, editing resets status to DRAFT.
//   Body: UpdateListingInput (all fields optional)
// ---------------------------------------------------------------------------

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
  }

  const { id } = await params

  try {
    const service = createListingService()
    const listing = await service.getListing(id)
    if (!listing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } }, { status: 404 })
    }
    if (listing.ownerId !== session.user.id) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, { status: 403 })
    }
    return NextResponse.json({ success: true, data: listing })
  } catch (err) {
    logger.error('[GET /api/listings/[id]]', err)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch listing' } }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } }, { status: 400 })
  }

  const parsed = UpdateListingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_FAILED', message: 'Validation failed', details: parsed.error.flatten().fieldErrors } },
      { status: 422 },
    )
  }

  try {
    const service = createListingService()
    const listing = await service.updateListing(id, parsed.data, session.user.id)
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
    logger.error('[PATCH /api/listings/[id]]', err)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update listing' } }, { status: 500 })
  }
}
