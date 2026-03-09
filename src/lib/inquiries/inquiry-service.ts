// ---------------------------------------------------------------------------
// TIGI Inquiry Service
//
// Three entry points:
//   createInquiry()       — submit a new inquiry from a listing detail page
//   getUserInquiries()    — inquiries the calling user has sent
//   getOwnerInquiries()   — inquiries received on the owner's listings
//   markInquiryRead()     — owner marks an inquiry as READ
//
// Side effects on createInquiry:
//   1. Increments property.inquiryCount (fire-and-forget)
//   2. Creates an IN_APP Notification for the property owner
//
// Graceful fallback: all read functions return [] on DB error so the UI
// degrades silently rather than crashing the page.
// ---------------------------------------------------------------------------

import { cache } from 'react'
import { prisma } from '@/lib/db'
import type { InquiryDTO, InquiryType, InquiryStatus, SubmitInquiryPayload } from './inquiry-types'

// ---------------------------------------------------------------------------
// Adapter — Prisma row → InquiryDTO
// ---------------------------------------------------------------------------

function buildInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toInquiryDTO(row: any): InquiryDTO {
  return {
    id:            row.id,
    propertyId:    row.propertyId,
    propertyTitle: row.property?.title ?? '',
    propertyCity:  row.property?.city  ?? '',
    propertyState: row.property?.state ?? '',
    propertyType:  row.property?.type  ?? '',
    ownerId:       row.ownerId,
    fromUserId:    row.fromUserId,
    fromUserName:  row.fromUser?.name ?? null,
    fromInitials:  buildInitials(row.fromUser?.name ?? null),
    inquiryType:   row.inquiryType  as InquiryType,
    message:       row.message,
    status:        row.status       as InquiryStatus,
    createdAt:     row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : String(row.createdAt),
  }
}

// ---------------------------------------------------------------------------
// Include shape — reused across queries
// ---------------------------------------------------------------------------

const INQUIRY_INCLUDE = {
  fromUser: { select: { name: true } },
  property: { select: { title: true, city: true, state: true, type: true } },
} as const

// ---------------------------------------------------------------------------
// createInquiry
// ---------------------------------------------------------------------------

export async function createInquiry(
  fromUserId: string,
  payload: SubmitInquiryPayload,
): Promise<InquiryDTO> {
  // 1. Fetch property to get ownerId and title
  const property = await prisma.property.findUniqueOrThrow({
    where:  { id: payload.propertyId },
    select: { id: true, ownerId: true, title: true, city: true, state: true, type: true },
  })

  // 2. Prevent owners from inquiring on their own listing
  if (property.ownerId === fromUserId) {
    throw new Error('Cannot submit an inquiry on your own listing.')
  }

  // 3. Create inquiry
  const inquiry = await prisma.inquiry.create({
    data: {
      fromUserId:  fromUserId,
      propertyId:  payload.propertyId,
      ownerId:     property.ownerId,
      inquiryType: payload.inquiryType,
      message:     payload.message,
      status:      'NEW',
    },
    include: INQUIRY_INCLUDE,
  })

  // 4. Side effects (fire-and-forget — non-blocking)
  void Promise.all([
    // Increment inquiry counter on listing
    prisma.property.update({
      where: { id: payload.propertyId },
      data:  { inquiryCount: { increment: 1 } },
    }).catch(() => { /* non-critical */ }),

    // Create in-app notification for the owner
    prisma.notification.create({
      data: {
        userId:    property.ownerId,
        type:      'INQUIRY_RECEIVED',
        title:     'New inquiry received',
        body:      `Someone sent an inquiry about "${property.title}".`,
        actionUrl: '/listings',
        metadata:  { inquiryId: inquiry.id, propertyId: property.id },
      },
    }).catch(() => { /* non-critical */ }),
  ])

  return toInquiryDTO(inquiry)
}

// ---------------------------------------------------------------------------
// getUserInquiries — inquiries the user has sent
// ---------------------------------------------------------------------------

export const getUserInquiries = cache(async (userId: string): Promise<InquiryDTO[]> => {
  try {
    const rows = await prisma.inquiry.findMany({
      where:   { fromUserId: userId },
      include: INQUIRY_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take:    20,
    })
    return rows.map(toInquiryDTO)
  } catch {
    return []
  }
})

// ---------------------------------------------------------------------------
// getOwnerInquiries — inquiries received on listings owned by this user
// ---------------------------------------------------------------------------

export const getOwnerInquiries = cache(async (ownerId: string): Promise<InquiryDTO[]> => {
  try {
    const rows = await prisma.inquiry.findMany({
      where:   { ownerId },
      include: INQUIRY_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take:    50,
    })
    return rows.map(toInquiryDTO)
  } catch {
    return []
  }
})

// ---------------------------------------------------------------------------
// markInquiryRead — owner transitions NEW → READ
// ---------------------------------------------------------------------------

export async function markInquiryRead(inquiryId: string, ownerId: string): Promise<void> {
  await prisma.inquiry.updateMany({
    where: { id: inquiryId, ownerId, status: 'NEW' },
    data:  { status: 'READ' },
  })
}
