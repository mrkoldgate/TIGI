// ---------------------------------------------------------------------------
// stripe-billing.ts — Stripe Checkout + Billing Portal implementation.
//
// Activated when BILLING_PROVIDER=stripe.
//
// Prerequisites:
//   1. Install: npm install stripe
//   2. Set env vars:
//      STRIPE_SECRET_KEY=sk_live_...
//      STRIPE_WEBHOOK_SECRET=whsec_...
//      STRIPE_PRO_MONTHLY_PRICE_ID=price_...
//      STRIPE_PRO_ANNUAL_PRICE_ID=price_...
//      STRIPE_PRO_PLUS_MONTHLY_PRICE_ID=price_...
//      STRIPE_PRO_PLUS_ANNUAL_PRICE_ID=price_...
//   3. Set up webhook endpoint at /api/billing/webhook in Stripe dashboard
//      Events to listen for:
//        - checkout.session.completed
//        - customer.subscription.updated
//        - customer.subscription.deleted
//        - invoice.payment_failed
//
// This file is only loaded when BILLING_PROVIDER=stripe.
// ---------------------------------------------------------------------------

import { prisma } from '@/lib/db'
import { PLANS } from './billing-types'
import type { IBillingService, CheckoutResult, PortalResult } from './billing-service'
import type { PlanId } from './billing-types'

// Lazy-loaded Stripe SDK — not required until BILLING_PROVIDER=stripe
function getStripe() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe')
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' })
}

export class StripeBillingService implements IBillingService {
  async createCheckoutSession({
    userId,
    plan,
    annual,
    returnUrl,
  }: {
    userId: string
    plan: PlanId
    annual: boolean
    returnUrl: string
  }): Promise<CheckoutResult> {
    if (plan === 'enterprise' || plan === 'free') {
      return { message: plan === 'enterprise'
        ? 'Contact sales at enterprise@tigi.com to discuss a custom Enterprise plan.'
        : 'Downgrade handled via subscription cancellation.' }
    }

    const planConfig = PLANS[plan]
    const priceId = annual ? planConfig.stripePriceIdAnnual : planConfig.stripePriceIdMonthly

    if (!priceId) {
      throw new Error(`Stripe price ID not configured for plan "${plan}" (${annual ? 'annual' : 'monthly'})`)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    })

    if (!user) throw new Error('User not found')

    const stripe = getStripe()

    // Reuse existing Stripe customer or create a new one
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { tigiUserId: userId },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrl}?upgraded=1`,
      cancel_url: returnUrl,
      metadata: { tigiUserId: userId, plan },
      subscription_data: {
        metadata: { tigiUserId: userId, plan },
      },
    })

    return { url: session.url! }
  }

  async createPortalSession({
    userId,
    returnUrl,
  }: {
    userId: string
    returnUrl: string
  }): Promise<PortalResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      return { message: 'No active Stripe subscription found.' }
    }

    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  }

  async cancelSubscription(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'free',
        subscriptionEndsAt: null,
        stripeSubscriptionId: null,
      },
    })
  }
}

// ---------------------------------------------------------------------------
// Webhook handler helper — call from /api/billing/webhook
// ---------------------------------------------------------------------------

export async function handleStripeWebhook(body: string, signature: string): Promise<void> {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set')

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const tigiUserId = session.metadata?.tigiUserId
      const plan = session.metadata?.plan as PlanId | undefined
      const subscriptionId = session.subscription as string | null

      if (tigiUserId && plan && subscriptionId) {
        // Retrieve subscription to get period end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const periodEnd = new Date(subscription.current_period_end * 1000)

        await prisma.user.update({
          where: { id: tigiUserId },
          data: {
            subscriptionTier: plan as import('@prisma/client').SubscriptionTier,
            subscriptionEndsAt: periodEnd,
            stripeSubscriptionId: subscriptionId,
            stripeCurrentPeriodEnd: periodEnd,
          },
        })

        await prisma.auditLog.create({
          data: {
            userId: tigiUserId,
            action: 'billing.subscription.activated',
            resourceType: 'User',
            resourceId: tigiUserId,
            metadata: { plan, subscriptionId, provider: 'stripe' },
          },
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const tigiUserId = sub.metadata?.tigiUserId
      if (tigiUserId) {
        const periodEnd = new Date(sub.current_period_end * 1000)
        await prisma.user.update({
          where: { id: tigiUserId },
          data: {
            subscriptionEndsAt: periodEnd,
            stripeCurrentPeriodEnd: periodEnd,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const tigiUserId = sub.metadata?.tigiUserId
      if (tigiUserId) {
        await prisma.user.update({
          where: { id: tigiUserId },
          data: {
            subscriptionTier: 'free',
            subscriptionEndsAt: null,
            stripeSubscriptionId: null,
            stripeCurrentPeriodEnd: null,
          },
        })
        await prisma.auditLog.create({
          data: {
            userId: tigiUserId,
            action: 'billing.subscription.cancelled',
            resourceType: 'User',
            resourceId: tigiUserId,
            metadata: { provider: 'stripe', reason: 'subscription_deleted' },
          },
        })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer as string
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true },
      })
      if (user) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'billing.payment.failed',
            resourceType: 'User',
            resourceId: user.id,
            metadata: { provider: 'stripe', invoiceId: invoice.id },
          },
        })
        // TODO M7: send payment failure notification to user
      }
      break
    }
  }
}
