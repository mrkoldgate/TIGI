// ---------------------------------------------------------------------------
// GET /api/admin/kyc — list KYC submissions for compliance review
//
// Access: ADMIN or COMPLIANCE_OFFICER only.
//
// Query params:
//   status  — filter by KycStatus (PENDING | SUBMITTED | VERIFIED | REJECTED)
//   limit   — max results (default 50, max 100)
//   cursor  — pagination cursor (last record id)
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  const isAdminOrCompliance =
    session.user.role === 'ADMIN' || session.user.role === 'COMPLIANCE_OFFICER'
  if (!isAdminOrCompliance) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 },
    )
  }

  const url = new URL(req.url)
  const statusFilter = url.searchParams.get('status')
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100)
  const cursor = url.searchParams.get('cursor')

  try {
    const verifications = await prisma.kycVerification.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter as never } : {}),
      },
      include: {
        user: {
          select: {
            id:       true,
            name:     true,
            email:    true,
            userType: true,
            role:     true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: limit + 1, // over-fetch by 1 to detect hasMore
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = verifications.length > limit
    const items   = hasMore ? verifications.slice(0, limit) : verifications
    const nextCursor = hasMore ? items[items.length - 1].id : null

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          hasMore,
          nextCursor,
          count: items.length,
        },
      },
    })
  } catch (err) {
    console.error('[api/admin/kyc GET]', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch KYC submissions' } },
      { status: 500 },
    )
  }
}
