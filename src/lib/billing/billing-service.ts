// ---------------------------------------------------------------------------
// billing-service.ts — Provider-agnostic billing abstraction.
//
// Architecture: same pattern as AI services (see ai-features.md §15.2).
// - IBillingService  — interface contract, never changes
// - MockBillingService — updates DB directly; no payment required
// - StripeBillingService — redirects through Stripe Checkout + Portal
//
// Factory selects implementation via BILLING_PROVIDER env var:
//   BILLING_PROVIDER=mock   (default, dev/demo)
//   BILLING_PROVIDER=stripe (production)
//
// Transitioning from mock → Stripe is a config change, not a rewrite.
// ---------------------------------------------------------------------------

import type { PlanId } from './billing-types'

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface CheckoutResult {
  /** Present when billing provider returns a hosted page (e.g. Stripe). */
  url?: string
  /** Present when billing was applied directly (mock / admin override). */
  success?: boolean
  /** Human-readable message for the UI. */
  message?: string
}

export interface PortalResult {
  /** Redirect URL for the billing management portal. */
  url?: string
  /** Fallback message when no portal URL exists (mock mode). */
  message?: string
}

export interface IBillingService {
  /**
   * Start an upgrade checkout for the given plan.
   * Returns either a redirect URL (Stripe) or a success signal (mock).
   */
  createCheckoutSession(opts: {
    userId: string
    plan: PlanId
    annual: boolean
    returnUrl: string
  }): Promise<CheckoutResult>

  /**
   * Open the billing management portal (cancel, change plan, update payment).
   * Returns either a portal URL (Stripe) or a fallback message (mock).
   */
  createPortalSession(opts: {
    userId: string
    returnUrl: string
  }): Promise<PortalResult>

  /**
   * Immediately downgrade a user to free (used by webhook or admin action).
   */
  cancelSubscription(userId: string): Promise<void>
}

// ---------------------------------------------------------------------------
// Factory — resolves at module load time
// ---------------------------------------------------------------------------

let _service: IBillingService | null = null

export function getBillingService(): IBillingService {
  if (_service) return _service

  const provider = process.env.BILLING_PROVIDER ?? 'mock'

  if (provider === 'stripe') {
    // Deferred import so Stripe SDK is only loaded when configured.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { StripeBillingService } = require('./stripe-billing') as {
      StripeBillingService: new () => IBillingService
    }
    _service = new StripeBillingService()
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MockBillingService } = require('./mock-billing') as {
      MockBillingService: new () => IBillingService
    }
    _service = new MockBillingService()
  }

  return _service
}

/** Clear the cached service instance (useful in tests). */
export function resetBillingService(): void {
  _service = null
}
