// ---------------------------------------------------------------------------
// DELETE /api/saved/[id] — unsave a listing.
//
// Uses deleteMany (not delete) so it's idempotent — no error if already removed.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id: listingId } = await params

  try {
    await prisma.savedListing.deleteMany({
      where: { userId: session.user.id, listingId },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('[api/saved DELETE]', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to unsave listing' } },
      { status: 500 },
    )
  }
}
