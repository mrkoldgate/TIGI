// ---------------------------------------------------------------------------
// GET  /api/users/me/kyc  — fetch the current user's latest KYC verification
// POST /api/users/me/kyc  — create or update a KYC verification record
//
// Status lifecycle (user-driven):
//   NONE → PENDING (when user starts filling the form)
//   PENDING → SUBMITTED (when user submits the completed form)
//
// Admin-driven transitions are handled by PATCH /api/admin/kyc/[id]:
//   SUBMITTED → VERIFIED | REJECTED
//
// Vendor integration path:
//   Replace the mock provider stub below with an adapter implementing
//   src/lib/compliance/providers/kyc-provider.ts (Persona, Jumio, Onfido).
//   The adapter should return a providerRef for webhook reconciliation.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// ── Validation ────────────────────────────────────────────────────────────────

const StartKycSchema = z.object({
  action: z.enum(['start', 'submit']),
  // Personal info — stored in User.preferences.kycPersonalInfo
  personalInfo: z
    .object({
      legalName:   z.string().min(2).max(200),
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
      addressLine1: z.string().min(3).max(300),
      city:        z.string().min(1).max(100),
      state:       z.string().min(1).max(100),
      country:     z.string().min(2).max(100),
    })
    .optional(),
  // Document keys — populated after uploading via POST /api/upload
  idFrontKey: z.string().optional(),
  idFrontUrl: z.string().url().optional(),
  idBackKey:  z.string().optional(),
  idBackUrl:  z.string().url().optional(),
  selfieKey:  z.string().optional(),
  selfieUrl:  z.string().url().optional(),
})

// ── GET — fetch current verification status ──────────────────────────────────

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const [user, latest] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: session.user.id },
        select: { kycStatus: true, preferences: true },
      }),
      prisma.kycVerification.findFirst({
        where:   { userId: session.user.id },
        orderBy: { submittedAt: 'desc' },
        select: {
          id:          true,
          status:      true,
          provider:    true,
          providerRef: true,
          idFrontUrl:  true,
          idBackUrl:   true,
          selfieUrl:   true,
          reviewedBy:  true,
          reviewNote:  true,
          reviewedAt:  true,
          submittedAt: true,
          updatedAt:   true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        kycStatus:   user?.kycStatus ?? 'NONE',
        verification: latest,
      },
    })
  } catch (err) {
    logger.error('[api/users/me/kyc GET]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch KYC status' } },
      { status: 500 },
    )
  }
}

// ── POST — create or advance verification ────────────────────────────────────

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const userId = session.user.id

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const parsed = StartKycSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 422 },
    )
  }

  const { action, personalInfo, idFrontUrl, idBackUrl, selfieUrl } = parsed.data

  try {
    // ── action: start — create PENDING verification + update user status ──────
    if (action === 'start') {
      // Idempotent: if already verified, do not regress
      const currentUser = await prisma.user.findUnique({
        where:  { id: userId },
        select: { kycStatus: true },
      })
      if (currentUser?.kycStatus === 'VERIFIED') {
        return NextResponse.json(
          { success: false, error: { code: 'CONFLICT', message: 'KYC is already verified' } },
          { status: 409 },
        )
      }

      const verification = await prisma.$transaction(async (tx) => {
        // Upsert: re-use existing PENDING record so users can pick up where they left off
        const existing = await tx.kycVerification.findFirst({
          where:  { userId, status: 'PENDING' },
          select: { id: true },
        })

        if (existing) return existing

        const created = await tx.kycVerification.create({
          data: { userId, status: 'PENDING', provider: 'manual' },
        })
        await tx.user.update({
          where: { id: userId },
          data:  { kycStatus: 'PENDING' },
        })
        await tx.auditLog.create({
          data: {
            userId,
            action:       'kyc.start',
            resourceType: 'KycVerification',
            resourceId:   created.id,
          },
        })
        return created
      })

      return NextResponse.json({ success: true, data: { verificationId: verification.id } }, { status: 201 })
    }

    // ── action: submit — finalize + change status to SUBMITTED ───────────────
    if (action === 'submit') {
      // Require at least a front ID document
      if (!idFrontUrl) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID document (front) is required' } },
          { status: 422 },
        )
      }

      const result = await prisma.$transaction(async (tx) => {
        // Find the active PENDING record for this user
        const verification = await tx.kycVerification.findFirst({
          where:  { userId, status: 'PENDING' },
          select: { id: true },
        })

        const verificationId = verification?.id

        // Persist personal info into User.preferences (doesn't require a migration)
        const prefsUpdate = personalInfo
          ? { preferences: { kycPersonalInfo: personalInfo } as Record<string, unknown> }
          : {}

        // Upsert the verification record
        const updated = verificationId
          ? await tx.kycVerification.update({
              where: { id: verificationId },
              data:  {
                status:     'SUBMITTED',
                idFrontUrl: idFrontUrl ?? undefined,
                idBackUrl:  idBackUrl  ?? undefined,
                selfieUrl:  selfieUrl  ?? undefined,
              },
            })
          : await tx.kycVerification.create({
              data: {
                userId,
                status:     'SUBMITTED',
                provider:   'manual',
                idFrontUrl: idFrontUrl ?? undefined,
                idBackUrl:  idBackUrl  ?? undefined,
                selfieUrl:  selfieUrl  ?? undefined,
              },
            })

        await tx.user.update({
          where: { id: userId },
          data:  { kycStatus: 'SUBMITTED', ...prefsUpdate },
        })

        await tx.auditLog.create({
          data: {
            userId,
            action:       'kyc.submit',
            resourceType: 'KycVerification',
            resourceId:   updated.id,
            metadata: {
              hasIdFront:  !!idFrontUrl,
              hasIdBack:   !!idBackUrl,
              hasSelfie:   !!selfieUrl,
            },
          },
        })

        return updated
      })

      return NextResponse.json({ success: true, data: result })
    }
  } catch (err) {
    logger.error('[api/users/me/kyc POST]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'KYC operation failed' } },
      { status: 500 },
    )
  }
}
