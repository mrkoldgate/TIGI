// ---------------------------------------------------------------------------
// GET  /api/listings/[id]/documents  — list all documents for a listing
// POST /api/listings/[id]/documents  — record a new document after client upload
//
// Flow: client uploads binary to POST /api/upload, receives
//   { key, url, fileName, fileSize, mimeType }, then calls this endpoint to
//   persist the PropertyDocument DB record.
//
// Ownership: only the listing owner (or an admin) may POST documents.
// GET is restricted to owner/admin only (documents may contain sensitive info).
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// ── Validation ────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES = [
  'TITLE_DEED',
  'INSPECTION',
  'APPRAISAL',
  'CONTRACT',
  'OFFERING',
  'OTHER',
] as const

const RecordDocumentSchema = z.object({
  key:      z.string().min(1),
  url:      z.string().url(),
  name:     z.string().min(1).max(255),
  type:     z.enum(DOCUMENT_TYPES),
  fileName: z.string().max(255).optional(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().max(100).optional(),
})

// ── Shared ownership guard ────────────────────────────────────────────────────

async function verifyOwnership(
  propertyId: string,
  userId: string,
  role: string,
): Promise<NextResponse | null> {
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
  const isAdmin = role === 'ADMIN' || role === 'COMPLIANCE_OFFICER'
  if (property.ownerId !== userId && !isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'You do not own this listing' } },
      { status: 403 },
    )
  }
  return null
}

// ── GET — list documents ──────────────────────────────────────────────────────

export async function GET(
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

  const { id: propertyId } = await params
  const denied = await verifyOwnership(propertyId, session.user.id, session.user.role ?? '')
  if (denied) return denied

  try {
    const documents = await prisma.propertyDocument.findMany({
      where:   { propertyId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, data: documents })
  } catch (err) {
    logger.error('[api/listings/documents GET]', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch documents' } },
      { status: 500 },
    )
  }
}

// ── POST — record document metadata ──────────────────────────────────────────

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
  const denied = await verifyOwnership(propertyId, session.user.id, session.user.role ?? '')
  if (denied) return denied

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const parsed = RecordDocumentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 422 },
    )
  }

  const { key, url, name, type, fileName, fileSize, mimeType } = parsed.data

  const document = await prisma.propertyDocument.create({
    data: {
      propertyId,
      name,
      type,
      url,
      storageKey: key,
      fileName,
      fileSize,
      mimeType,
      uploadedBy: session.user.id,
    },
  })

  return NextResponse.json({ success: true, data: document }, { status: 201 })
}
