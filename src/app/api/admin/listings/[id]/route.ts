// ---------------------------------------------------------------------------
// PATCH /api/admin/listings/[id]
//
// Admin listing status transition endpoint.
// Access: ADMIN only (listing owners cannot self-approve).
//
// Actions and resulting ListingStatus:
//   approve        → ACTIVE    (listing goes live, listedAt = now)
//   reject         → DELISTED  (listing removed from review)
//   archive        → DELISTED  (admin-initiated archive; audit distinguishes from reject)
//   request_update → DRAFT     (returned to owner for edits; resubmit re-enters review)
//
// Body: { action, note? }
//
// On approve: writes reviewedBy / reviewedAt / reviewNote and sets listedAt.
// All actions write an immutable AuditLog entry with previousStatus.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications/notification-service'

const DecisionSchema = z.object({
  action: z.enum(['approve', 'reject', 'archive', 'request_update']),
  note:   z.string().max(2000).optional(),
})

export async function PATCH(
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

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 },
    )
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const parsed = DecisionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 422 },
    )
  }

  const { action, note } = parsed.data

  try {
    const listing = await prisma.property.findUnique({
      where:  { id },
      select: { id: true, status: true, ownerId: true, title: true },
    })
    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 },
      )
    }

    // Map action → new ListingStatus
    const newStatus =
      action === 'approve'        ? 'ACTIVE'    :
      action === 'reject'         ? 'DELISTED'  :
      action === 'archive'        ? 'DELISTED'  :
      /* request_update */          'DRAFT'

    const now = new Date()

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.property.update({
        where: { id },
        data:  {
          status:     newStatus as never,
          reviewedBy: session.user.id,
          reviewedAt: now,
          reviewNote: note ?? null,
          // Set listedAt when going live for the first time
          ...(action === 'approve' ? { listedAt: now } : {}),
        },
      })

      await tx.auditLog.create({
        data: {
          userId:       session.user.id,
          action:       `listing.${action}`,
          resourceType: 'Property',
          resourceId:   id,
          metadata: {
            title:          listing.title,
            ownerId:        listing.ownerId,
            previousStatus: listing.status,
            newStatus,
            note:           note ?? null,
          },
        },
      })

      return updated
    })

    // Notify the listing owner — non-blocking, never throws
    const notifType =
      action === 'approve'         ? 'LISTING_APPROVED'          :
      action === 'reject'          ? 'LISTING_REJECTED'          :
      action === 'request_update'  ? 'LISTING_UPDATE_REQUESTED'  :
      null  // archive → no dedicated type, skip

    if (notifType) {
      const bodyMap: Record<string, string> = {
        approve:        `"${listing.title}" is now live on the marketplace.`,
        reject:         note
          ? `"${listing.title}" was not approved. ${note}`
          : `"${listing.title}" was not approved. Please contact support for details.`,
        request_update: `Please update "${listing.title}" and resubmit for review.`,
      }
      void createNotification({
        userId:    listing.ownerId,
        type:      notifType as never,
        title:     notifType === 'LISTING_APPROVED' ? 'Listing approved'
                 : notifType === 'LISTING_REJECTED' ? 'Listing rejected'
                 : 'Update requested on your listing',
        body:      bodyMap[action] ?? '',
        actionUrl: '/listings',
        metadata:  { propertyId: id, propertyTitle: listing.title },
      })
    }

    return NextResponse.json({ success: true, data: { id: result.id, status: result.status } })
  } catch (err) {
    console.error('[api/admin/listings PATCH]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process listing decision' } },
      { status: 500 },
    )
  }
}
