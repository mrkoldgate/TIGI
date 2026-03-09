import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// POST /api/billing/webhook
//
// Stripe webhook endpoint. Only active when BILLING_PROVIDER=stripe.
//
// Setup:
//   1. Add this URL in the Stripe dashboard → Webhooks
//   2. Set STRIPE_WEBHOOK_SECRET in your env
//   3. Listen for: checkout.session.completed, customer.subscription.updated,
//      customer.subscription.deleted, invoice.payment_failed
//
// In mock mode: returns 200 immediately (no-op).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const provider = process.env.BILLING_PROVIDER ?? 'mock'

  if (provider !== 'stripe') {
    return NextResponse.json({ received: true })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  try {
    const { handleStripeWebhook } = await import('@/lib/billing/stripe-billing')
    await handleStripeWebhook(body, signature)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[billing/webhook]', err)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 },
    )
  }
}
