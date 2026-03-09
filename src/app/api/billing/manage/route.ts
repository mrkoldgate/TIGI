import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getBillingService } from '@/lib/billing/billing-service'

// ---------------------------------------------------------------------------
// POST /api/billing/manage
//
// Opens the billing management portal for the current user.
//
// Response:
//   { url: string }     — redirect to Stripe customer portal
//   { message: string } — informational (mock mode, no portal available)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const origin = request.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const returnUrl = `${origin}/settings/billing`

  try {
    const service = getBillingService()
    const result = await service.createPortalSession({
      userId: session.user.id,
      returnUrl,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[billing/manage]', err)
    return NextResponse.json(
      { error: 'Failed to open billing portal. Please try again.' },
      { status: 500 },
    )
  }
}
