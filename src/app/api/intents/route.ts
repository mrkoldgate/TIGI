// ---------------------------------------------------------------------------
// /api/intents — Transaction intent collection
//
// GET  — returns the authenticated user's intents (with property summary)
// POST — creates a new TransactionIntent
//
// Intent lifecycle:
//   PENDING → REVIEWING → APPROVED → EXECUTED
//           ↘ CANCELLED (user-cancelled)  EXPIRED (TTL passed)
//
// Guards:
//   - Property must be ACTIVE
//   - User cannot have a duplicate PENDING/REVIEWING intent of the same type
//     for the same listing (prevents accidental double-submission)
//   - PREPARE_INVEST requires isTokenized = true
//   - PREPARE_INVEST / PREPARE_PURCHASE require INVESTOR role + VERIFIED KYC
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications/notification-service'
import { isInvestor, hasKyc } from '@/lib/auth/rbac'
import { logger } from '@/lib/logger'

const CreateIntentSchema = z.object({
  propertyId:  z.string().min(1),
  intentType:  z.enum(['EXPRESS_INTEREST', 'PREPARE_PURCHASE', 'PREPARE_INVEST', 'PREPARE_LEASE']),
  fractionQty: z.number().int().positive().optional(),
  offerAmount: z.number().positive().optional(),
  note:        z.string().max(1000).trim().optional(),
  // Lease-specific structured details (PREPARE_LEASE only)
  leaseDetails: z.object({
    desiredStartDate:     z.string().optional(), // ISO date string
    desiredDurationMonths: z.number().int().positive().optional(),
    intendedUse:          z.string().max(200).trim().optional(),
  }).optional(),
})

// ── POST /api/intents ─────────────────────────────────────────────────────────

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

  const parsed = CreateIntentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 422 },
    )
  }

  const { propertyId, intentType, fractionQty, offerAmount, note, leaseDetails } = parsed.data
  const userId = session.user.id

  // Investment and purchase intents require INVESTOR role + verified KYC.
  // EXPRESS_INTEREST and PREPARE_LEASE are open to all authenticated users.
  const requiresKyc = intentType === 'PREPARE_INVEST' || intentType === 'PREPARE_PURCHASE'
  if (requiresKyc) {
    if (!isInvestor(session.user)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Investor role required to submit investment intents' } },
        { status: 403 },
      )
    }
    if (!hasKyc(session.user)) {
      return NextResponse.json(
        { success: false, error: { code: 'KYC_REQUIRED', message: 'Identity verification required before submitting investment intents' } },
        { status: 403 },
      )
    }
  }

  try {
    // Verify property is ACTIVE
    const property = await prisma.property.findUnique({
      where:  { id: propertyId },
      select: { id: true, status: true, isTokenized: true, title: true, ownerId: true },
    })

    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 },
      )
    }

    if (property.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'LISTING_UNAVAILABLE', message: 'Listing is not currently available' } },
        { status: 409 },
      )
    }

    // PREPARE_INVEST requires tokenized listing
    if (intentType === 'PREPARE_INVEST' && !property.isTokenized) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_TOKENIZED', message: 'This listing does not support fractional investment' } },
        { status: 409 },
      )
    }

    // Prevent duplicate active intents of the same type
    const existing = await prisma.transactionIntent.findFirst({
      where: {
        userId,
        propertyId,
        intentType: intentType as never,
        status: { in: ['PENDING', 'REVIEWING'] as never[] },
      },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_INTENT', message: 'You already have an active intent of this type for this listing' } },
        { status: 409 },
      )
    }

    const intent = await prisma.$transaction(async (tx) => {
      const intentMetadata = leaseDetails
        ? { leaseDetails }
        : undefined

      const created = await tx.transactionIntent.create({
        data: {
          userId,
          propertyId,
          intentType:  intentType as never,
          fractionQty: fractionQty ?? null,
          offerAmount: offerAmount ?? null,
          note:        note ?? null,
          ...(intentMetadata && { metadata: intentMetadata }),
        },
      })

      await tx.auditLog.create({
        data: {
          userId,
          action:       'intent.create',
          resourceType: 'TransactionIntent',
          resourceId:   created.id,
          metadata: {
            intentType,
            propertyId,
            propertyTitle: property.title,
            fractionQty:   fractionQty ?? null,
            offerAmount:   offerAmount ?? null,
            ...(leaseDetails && { leaseDetails }),
          },
        },
      })

      return created
    })

    // Notify the property owner — non-blocking
    // Don't notify if the owner is the same as the intent creator
    if (property.ownerId && property.ownerId !== userId) {
      const isLease = intentType === 'PREPARE_LEASE'
      const intentLabels: Record<string, string> = {
        EXPRESS_INTEREST: 'expressed interest in',
        PREPARE_PURCHASE: 'submitted a purchase intent for',
        PREPARE_INVEST:   'expressed investment interest in',
        PREPARE_LEASE:    'submitted a lease interest for',
      }
      void createNotification({
        userId:    property.ownerId,
        type:      isLease ? 'LEASE_INTEREST_CREATED' : 'INTENT_CREATED',
        title:     isLease ? 'New lease interest received' : 'New interest in your listing',
        body:      `A user has ${intentLabels[intentType] ?? 'submitted an intent for'} "${property.title}".`,
        actionUrl: '/listings',
        metadata:  { intentId: intent.id, propertyId, intentType },
      })
    }

    return NextResponse.json({ success: true, data: intent }, { status: 201 })
  } catch (err) {
    logger.error('[api/intents POST]', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create intent' } },
      { status: 500 },
    )
  }
}

// ── GET /api/intents ──────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const intents = await prisma.transactionIntent.findMany({
      where:   { userId: session.user.id },
      include: {
        property: {
          select: { id: true, title: true, city: true, state: true, type: true, isTokenized: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: intents })
  } catch (err) {
    logger.error('[api/intents GET]', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch intents' } },
      { status: 500 },
    )
  }
}
