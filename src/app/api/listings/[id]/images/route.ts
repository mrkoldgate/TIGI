// ---------------------------------------------------------------------------
// GET  /api/listings/[id]/images  — list all images for a listing
// POST /api/listings/[id]/images  — record a new image after client upload
//
// The POST endpoint is called by the client AFTER it has uploaded the binary
// to /api/upload and received back { key, url, fileName, fileSize, mimeType }.
// This endpoint persists the PropertyImage DB record.
//
// Ownership: only the listing owner (or an admin) may POST images.
// GET is public (images are visible on the marketplace).
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// ── Validation ────────────────────────────────────────────────────────────────

const RecordImageSchema = z.object({
  key:      z.string().min(1),
  url:      z.string().url(),
  fileName: z.string().max(255).optional(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().max(100).optional(),
  order:    z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
})

// ── GET — list images ─────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: propertyId } = await params

  try {
    const images = await prisma.propertyImage.findMany({
      where:   { propertyId },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ success: true, data: images })
  } catch (err) {
    logger.error('[api/listings/images GET]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch images' } },
      { status: 500 },
    )
  }
}

// ── POST — record image metadata ──────────────────────────────────────────────

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id: propertyId } = await params

  // Verify ownership (or admin)
  const property = await prisma.property.findUnique({
    where:  { id: propertyId },
    select: { ownerId: true },
  })
  if (!property) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
      { status: 404 },
    )
  }
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMPLIANCE_OFFICER'
  if (property.ownerId !== session.user.id && !isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'You do not own this listing' } },
      { status: 403 },
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

  const parsed = RecordImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 422 },
    )
  }

  const { key, url, fileName, fileSize, mimeType, order, isPrimary } = parsed.data

  // If this is marked primary, clear primary flag on other images first
  if (isPrimary) {
    await prisma.propertyImage.updateMany({
      where: { propertyId },
      data:  { isPrimary: false },
    })
  }

  const image = await prisma.propertyImage.create({
    data: { propertyId, url, storageKey: key, fileName, fileSize, mimeType, order, isPrimary },
  })

  return NextResponse.json({ success: true, data: image }, { status: 201 })
}
