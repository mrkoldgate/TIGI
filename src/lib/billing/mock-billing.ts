// ---------------------------------------------------------------------------
// mock-billing.ts — Development/demo billing service.
//
// When BILLING_PROVIDER=mock (the default):
//   - Checkout: updates the user's subscriptionTier in the DB immediately.
//     No payment is taken. Works for demos and local development.
//   - Portal: returns a message directing to admin settings.
//   - Cancel: downgrades tier to 'free'.
//
// IMPORTANT: mock billing is disabled in production (BILLING_PROVIDER must
// equal 'mock' explicitly; an unset var defaults to mock only in dev).
// Set BILLING_PROVIDER=stripe to enforce Stripe in production.
// ---------------------------------------------------------------------------

import { prisma } from '@/lib/db'
import type { IBillingService, CheckoutResult, PortalResult } from './billing-service'
import type { PlanId } from './billing-types'
import type { SubscriptionTier } from '@prisma/client'

export class MockBillingService implements IBillingService {
  async createCheckoutSession({
    userId,
    plan,
    annual,
  }: {
    userId: string
    plan: PlanId
    annual: boolean
    returnUrl: string
  }): Promise<CheckoutResult> {
    if (plan === 'enterprise') {
      return {
        message: 'Contact sales at enterprise@tigi.com to discuss a custom Enterprise plan.',
      }
    }

    // Compute subscription end date: 1 year if annual, 1 month if monthly
    const endsAt = new Date()
    if (annual) {
      endsAt.setFullYear(endsAt.getFullYear() + 1)
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1)
    }

    // Update DB directly — no payment required in mock mode
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: plan as SubscriptionTier,
        subscriptionEndsAt: endsAt,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'billing.subscription.activated',
        resourceType: 'User',
        resourceId: userId,
        metadata: { plan, annual, provider: 'mock' },
      },
    })

    return {
      success: true,
      message: `You're now on ${plan}. Demo mode — no payment was taken.`,
    }
  }

  async createPortalSession({ userId }: { userId: string; returnUrl: string }): Promise<PortalResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true, subscriptionEndsAt: true },
    })

    return {
      message: user?.subscriptionEndsAt
        ? `Demo mode — your plan renews ${user.subscriptionEndsAt.toLocaleDateString()}.`
        : 'Demo mode — subscription management is available when Stripe is configured.',
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'free',
        subscriptionEndsAt: null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'billing.subscription.cancelled',
        resourceType: 'User',
        resourceId: userId,
        metadata: { provider: 'mock' },
      },
    })
  }
}
