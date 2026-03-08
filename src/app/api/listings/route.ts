import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CreateListingSchema } from '@/lib/validations/listing'
import { createListingService, ListingStateError } from '@/lib/services/listing.service'

// ---------------------------------------------------------------------------
// POST /api/listings
//   Creates a new listing draft for the authenticated user.
//   Body: CreateListingInput (see listing.ts validators)
//   Returns: { success: true, data: Property }
//
// GET /api/listings
//   Returns all listings owned by the authenticated user.
//   Returns: { success: true, data: Property[] }
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } }, { status: 400 })
  }

  const parsed = CreateListingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_FAILED', message: 'Validation failed', details: parsed.error.flatten().fieldErrors } },
      { status: 422 },
    )
  }

  try {
    const service = createListingService()
    const listing = await service.createDraft(parsed.data, session.user.id)
    return NextResponse.json({ success: true, data: listing }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/listings]', err)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create listing' } }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
  }

  try {
    const service = createListingService()
    const listings = await service.getOwnerListings(session.user.id)
    return NextResponse.json({ success: true, data: listings })
  } catch (err) {
    console.error('[GET /api/listings]', err)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch listings' } }, { status: 500 })
  }
}
