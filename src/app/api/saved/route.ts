// ---------------------------------------------------------------------------
// GET /api/saved  — fetch the current user's saved listing entries
// POST /api/saved — save a listing (idempotent upsert)
//
// Both endpoints require authentication.
// Response envelope: { success: true, data: ... }
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const rows = await prisma.savedListing.findMany({
      where:   { userId: session.user.id },
      orderBy: { savedAt: 'desc' },
      select:  { listingId: true, savedAt: true },
    })
    return NextResponse.json({
      success: true,
      data: {
        entries: rows.map((r) => ({ id: r.listingId, savedAt: r.savedAt.getTime() })),
      },
    })
  } catch (err) {
    logger.error('[api/saved GET]', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch saved listings' } },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const listingId = (body as { id?: unknown })?.id
  if (!listingId || typeof listingId !== 'string') {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'id (string) is required' } },
      { status: 400 },
    )
  }

  try {
    const row = await prisma.savedListing.upsert({
      where:  { userId_listingId: { userId: session.user.id, listingId } },
      create: { userId: session.user.id, listingId },
      update: {}, // already saved — no-op
    })
    return NextResponse.json(
      { success: true, data: { id: row.listingId, savedAt: row.savedAt.getTime() } },
      { status: 201 },
    )
  } catch (err) {
    logger.error('[api/saved POST]', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to save listing' } },
      { status: 500 },
    )
  }
}
