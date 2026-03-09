// ---------------------------------------------------------------------------
// DELETE /api/listings/[id]/documents/[docId]
//
// Removes the PropertyDocument record and the corresponding storage object.
// Ownership: only the listing owner (or an admin) may delete documents.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getStorageProvider } from '@/lib/storage'
import { logger } from '@/lib/logger'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const { id: propertyId, docId } = await params

  // Resolve doc + verify it belongs to this listing
  const doc = await prisma.propertyDocument.findUnique({
    where:  { id: docId },
    select: { id: true, propertyId: true, storageKey: true },
  })
  if (!doc || doc.propertyId !== propertyId) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } },
      { status: 404 },
    )
  }

  // Verify ownership
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
  const isAdmin = (session.user.role === 'ADMIN' || session.user.role === 'COMPLIANCE_OFFICER')
  if (property.ownerId !== session.user.id && !isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'You do not own this listing' } },
      { status: 403 },
    )
  }

  // Remove storage object first (ignore errors — DB deletion is primary concern)
  if (doc.storageKey) {
    try {
      await getStorageProvider().delete(doc.storageKey)
    } catch (err) {
      logger.warn('[api/listings/documents DELETE] storage delete failed:', err)
    }
  }

  await prisma.propertyDocument.delete({ where: { id: docId } })

  return new NextResponse(null, { status: 204 })
}
