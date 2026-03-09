// ---------------------------------------------------------------------------
// POST /api/inquiries — submit a new inquiry from a listing detail page
// GET  /api/inquiries — list inquiries for the authenticated user
//
// GET query params:
//   ?role=sender  → inquiries the user has sent (default)
//   ?role=owner   → inquiries received on the user's listings
//
// Auth: session required for both methods.
// Rate-limiting: handled at edge / middleware layer (future).
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createInquiry, getUserInquiries, getOwnerInquiries } from '@/lib/inquiries/inquiry-service'
import type { SubmitInquiryPayload, InquiryType } from '@/lib/inquiries/inquiry-types'
import { logger } from '@/lib/logger'

const VALID_INQUIRY_TYPES: InquiryType[] = [
  'GENERAL',
  'INTERESTED_BUYING',
  'INTERESTED_INVESTING',
  'INTERESTED_LEASING',
]

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { propertyId, inquiryType, message } = body as Partial<SubmitInquiryPayload>

  if (!propertyId || typeof propertyId !== 'string') {
    return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
  }
  if (!inquiryType || !VALID_INQUIRY_TYPES.includes(inquiryType as InquiryType)) {
    return NextResponse.json({ error: 'inquiryType is invalid' }, { status: 400 })
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return NextResponse.json({ error: 'message must be at least 10 characters' }, { status: 400 })
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'message must be under 2000 characters' }, { status: 400 })
  }

  try {
    const inquiry = await createInquiry(session.user.id, {
      propertyId,
      inquiryType: inquiryType as InquiryType,
      message:     message.trim(),
    })
    return NextResponse.json({ success: true, inquiry }, { status: 201 })
  } catch (err) {
    const msg = (err as Error).message
    if (msg.includes('own listing')) {
      return NextResponse.json({ error: msg }, { status: 403 })
    }
    logger.error('[inquiries] POST failed:', err)
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') ?? 'sender'

  try {
    const inquiries =
      role === 'owner'
        ? await getOwnerInquiries(session.user.id)
        : await getUserInquiries(session.user.id)

    return NextResponse.json({ success: true, inquiries })
  } catch (err) {
    logger.error('[inquiries] GET failed:', err)
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}
