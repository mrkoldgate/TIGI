// ---------------------------------------------------------------------------
// PATCH /api/inquiries/[id]/read — mark an inquiry as READ
//
// Only the property owner (ownerId on the Inquiry row) may mark it read.
// If the inquiry is already READ or REPLIED, this is a no-op (idempotent).
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { markInquiryRead } from '@/lib/inquiries/inquiry-service'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await markInquiryRead(id, session.user.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[inquiries/read] PATCH failed:', err)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}
