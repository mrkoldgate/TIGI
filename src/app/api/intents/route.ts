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
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const CreateIntentSchema = z.object({
  propertyId:  z.string().min(1),
  intentType:  z.enum(['EXPRESS_INTEREST', 'PREPARE_PURCHASE', 'PREPARE_INVEST', 'PREPARE_LEASE']),
  fractionQty: z.number().int().positive().optional(),
  offerAmount: z.number().positive().optional(),
  note:        z.string().max(1000).trim().optional(),
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

  const { propertyId, intentType, fractionQty, offerAmount, note } = parsed.data
  const userId = session.user.id

  try {
    // Verify property is ACTIVE
    const property = await prisma.property.findUnique({
      where:  { id: propertyId },
      select: { id: true, status: true, isTokenized: true, title: true },
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
      const created = await tx.transactionIntent.create({
        data: {
          userId,
          propertyId,
          intentType:  intentType as never,
          fractionQty: fractionQty ?? null,
          offerAmount: offerAmount ?? null,
          note:        note ?? null,
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
          },
        },
      })

      return created
    })

    return NextResponse.json({ success: true, data: intent }, { status: 201 })
  } catch (err) {
    console.error('[api/intents POST]', err)
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
    console.error('[api/intents GET]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch intents' } },
      { status: 500 },
    )
  }
}
