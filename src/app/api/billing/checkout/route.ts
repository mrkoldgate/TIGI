import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getBillingService } from '@/lib/billing/billing-service'
import { PLANS, isUpgradeFrom } from '@/lib/billing/billing-types'
import type { PlanId } from '@/lib/billing/billing-types'

// ---------------------------------------------------------------------------
// POST /api/billing/checkout
//
// Body: { plan: PlanId, annual: boolean }
//
// Response:
//   { url: string }      — redirect to hosted checkout (Stripe)
//   { success: true }    — plan activated directly (mock)
//   { message: string }  — informational (enterprise contact, etc.)
//
// Mock mode:  updates DB immediately, returns { success: true }
// Stripe mode: creates Checkout Session, returns { url }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { plan?: string; annual?: boolean }
  const plan = body.plan as PlanId | undefined
  const annual = body.annual ?? false

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const currentTier = (session.user.subscriptionTier ?? 'free') as PlanId

  // Prevent re-purchasing the same plan
  if (currentTier === plan) {
    return NextResponse.json(
      { message: `You are already on the ${PLANS[plan].name} plan.` },
      { status: 400 },
    )
  }

  // Prevent downgrading via checkout (cancellation flow handles downgrades)
  if (!isUpgradeFrom(currentTier, plan) && plan !== 'free') {
    return NextResponse.json(
      { message: 'Use the manage subscription portal to change or cancel your plan.' },
      { status: 400 },
    )
  }

  const origin = request.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const returnUrl = `${origin}/settings/billing`

  try {
    const service = getBillingService()
    const result = await service.createCheckoutSession({
      userId: session.user.id,
      plan,
      annual,
      returnUrl,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[billing/checkout]', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 },
    )
  }
}
