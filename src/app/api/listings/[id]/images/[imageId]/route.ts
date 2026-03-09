// ---------------------------------------------------------------------------
// PATCH /api/listings/[id]/images/[imageId]  — update order or isPrimary
// DELETE /api/listings/[id]/images/[imageId] — remove an image record +
//                                              delete from storage
//
// Ownership: only the listing owner (or an admin) may mutate images.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getStorageProvider } from '@/lib/storage'
import { logger } from '@/lib/logger'

// ── Validation ────────────────────────────────────────────────────────────────

const PatchImageSchema = z.object({
  order:     z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
}).refine((d) => d.order !== undefined || d.isPrimary !== undefined, {
  message: 'At least one of order or isPrimary must be provided',
})

// ── Shared auth + ownership guard ─────────────────────────────────────────────

async function resolveOwnership(
  propertyId: string,
  imageId: string,
  userId: string,
  role: string,
): Promise<
  | { ok: true; image: { id: string; propertyId: string; storageKey: string | null } }
  | { ok: false; response: NextResponse }
> {
  const image = await prisma.propertyImage.findUnique({
    where:  { id: imageId },
    select: { id: true, propertyId: true, storageKey: true },
  })
  if (!image || image.propertyId !== propertyId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Image not found' } },
        { status: 404 },
      ),
    }
  }

  const property = await prisma.property.findUnique({
    where:  { id: propertyId },
    select: { ownerId: true },
  })
  if (!property) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 },
      ),
    }
  }

  const isAdmin = role === 'ADMIN' || role === 'COMPLIANCE_OFFICER'
  if (property.ownerId !== userId && !isAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You do not own this listing' } },
        { status: 403 },
      ),
    }
  }

  return { ok: true, image }
}

// ── PATCH — update order / isPrimary ─────────────────────────────────────────

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id: propertyId, imageId } = await params
  const guard = await resolveOwnership(propertyId, imageId, session.user.id, session.user.role ?? '')
  if (!guard.ok) return guard.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const parsed = PatchImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 422 },
    )
  }

  const { order, isPrimary } = parsed.data

  // If promoting to primary, clear the flag on all other images first
  if (isPrimary) {
    await prisma.propertyImage.updateMany({
      where: { propertyId },
      data:  { isPrimary: false },
    })
  }

  const updated = await prisma.propertyImage.update({
    where: { id: imageId },
    data:  {
      ...(order     !== undefined && { order }),
      ...(isPrimary !== undefined && { isPrimary }),
    },
  })

  return NextResponse.json({ success: true, data: updated })
}

// ── DELETE — remove image record + storage object ────────────────────────────

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id: propertyId, imageId } = await params
  const guard = await resolveOwnership(propertyId, imageId, session.user.id, session.user.role ?? '')
  if (!guard.ok) return guard.response

  // Delete storage object first (ignore errors — record deletion is primary concern)
  if (guard.image.storageKey) {
    try {
      await getStorageProvider().delete(guard.image.storageKey)
    } catch (err) {
      logger.warn('[api/listings/images DELETE] storage delete failed:', err)
    }
  }

  await prisma.propertyImage.delete({ where: { id: imageId } })

  return new NextResponse(null, { status: 204 })
}
