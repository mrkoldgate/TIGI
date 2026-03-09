// ---------------------------------------------------------------------------
// billing-types.ts — Plan definitions and feature access matrix.
//
// Source of truth for all billing-related type information.
// The PLANS map is used by the billing UI, the feature gate, and API routes.
// ---------------------------------------------------------------------------

export type PlanId = 'free' | 'pro' | 'pro_plus' | 'enterprise'

export interface PlanLimits {
  basicValuationsPerMonth: number | 'unlimited'
  deepValuationsPerMonth: number | 'unlimited'
  watchlistsCount: number | 'unlimited'
  aiRecommendations: boolean
  portfolioOptimizer: boolean
  legalDocSummariesPerMonth: number | 'unlimited' | false
  pdfExports: boolean
  prioritySupport: boolean
  apiAccess: boolean
}

export interface PlanFeature {
  label: string
  included: boolean
  note?: string
}

export interface Plan {
  id: PlanId
  name: string
  tagline: string
  priceMonthly: number | null  // null = contact sales
  priceAnnual: number | null
  annualSavingsPercent?: number
  badge?: string               // e.g. "Most popular"
  highlighted?: boolean
  limits: PlanLimits
  features: PlanFeature[]
  // Stripe price IDs — set via env, undefined until Stripe is configured
  stripePriceIdMonthly?: string
  stripePriceIdAnnual?: string
}

// ---------------------------------------------------------------------------
// Canonical plan definitions — authoritative across the platform
// ---------------------------------------------------------------------------

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Browse and explore the platform',
    priceMonthly: 0,
    priceAnnual: 0,
    limits: {
      basicValuationsPerMonth: 10,
      deepValuationsPerMonth: 0,
      watchlistsCount: 1,
      aiRecommendations: false,
      portfolioOptimizer: false,
      legalDocSummariesPerMonth: false,
      pdfExports: false,
      prioritySupport: false,
      apiAccess: false,
    },
    features: [
      { label: 'Marketplace access & search', included: true },
      { label: 'Property watchlist (1)', included: true },
      { label: 'Basic AI valuation (10/month)', included: true },
      { label: 'Investment inquiry submission', included: true },
      { label: 'Portfolio overview', included: true },
      { label: 'Deep valuation report', included: false },
      { label: 'AI investment recommendations', included: false },
      { label: 'Portfolio optimizer', included: false },
      { label: 'PDF valuation exports', included: false },
      { label: 'Legal document AI', included: false },
    ],
  },

  pro: {
    id: 'pro',
    name: 'TIGI Pro',
    tagline: 'Serious investors. Deeper intelligence.',
    priceMonthly: 29,
    priceAnnual: 279,
    annualSavingsPercent: 20,
    badge: 'Most popular',
    highlighted: true,
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripePriceIdAnnual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    limits: {
      basicValuationsPerMonth: 'unlimited',
      deepValuationsPerMonth: 50,
      watchlistsCount: 'unlimited',
      aiRecommendations: true,
      portfolioOptimizer: false,
      legalDocSummariesPerMonth: false,
      pdfExports: true,
      prioritySupport: false,
      apiAccess: false,
    },
    features: [
      { label: 'Everything in Free', included: true },
      { label: 'Deep AI valuation report (50/month)', included: true },
      { label: 'AI investment recommendations', included: true },
      { label: 'Unlimited watchlists', included: true },
      { label: 'PDF valuation exports', included: true },
      { label: 'Value driver breakdowns', included: true },
      { label: 'Comparable sales data', included: true },
      { label: 'Market trend insights', included: true },
      { label: 'Portfolio optimizer', included: false },
      { label: 'Legal document AI', included: false },
    ],
  },

  pro_plus: {
    id: 'pro_plus',
    name: 'TIGI Pro+',
    tagline: 'Full intelligence stack. No limits.',
    priceMonthly: 79,
    priceAnnual: 749,
    annualSavingsPercent: 21,
    stripePriceIdMonthly: process.env.STRIPE_PRO_PLUS_MONTHLY_PRICE_ID,
    stripePriceIdAnnual: process.env.STRIPE_PRO_PLUS_ANNUAL_PRICE_ID,
    limits: {
      basicValuationsPerMonth: 'unlimited',
      deepValuationsPerMonth: 'unlimited',
      watchlistsCount: 'unlimited',
      aiRecommendations: true,
      portfolioOptimizer: true,
      legalDocSummariesPerMonth: 10,
      pdfExports: true,
      prioritySupport: true,
      apiAccess: false,
    },
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Unlimited deep AI valuations', included: true },
      { label: 'Portfolio optimizer & rebalancing', included: true },
      { label: 'Legal document AI (10/month)', included: true },
      { label: 'Title & deed parsing', included: true },
      { label: 'Predictive market forecasts', included: true },
      { label: 'Priority support', included: true },
      { label: 'Inheritance scenario simulation', included: true },
      { label: 'API access', included: false, note: 'Enterprise' },
    ],
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Custom infrastructure for institutional investors.',
    priceMonthly: null,
    priceAnnual: null,
    limits: {
      basicValuationsPerMonth: 'unlimited',
      deepValuationsPerMonth: 'unlimited',
      watchlistsCount: 'unlimited',
      aiRecommendations: true,
      portfolioOptimizer: true,
      legalDocSummariesPerMonth: 'unlimited',
      pdfExports: true,
      prioritySupport: true,
      apiAccess: true,
    },
    features: [
      { label: 'Everything in Pro+', included: true },
      { label: 'API access & bulk valuations', included: true },
      { label: 'Custom scoring model weights', included: true },
      { label: 'White-label configuration', included: true },
      { label: 'Dedicated support & SLA', included: true },
      { label: 'Compliance AI suite', included: true },
      { label: 'Fund-level portfolio analytics', included: true },
      { label: 'Custom contract & billing', included: true },
    ],
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the given plan is upgradeable from the current plan. */
export function isUpgradeFrom(from: PlanId, to: PlanId): boolean {
  const order: PlanId[] = ['free', 'pro', 'pro_plus', 'enterprise']
  return order.indexOf(to) > order.indexOf(from)
}

/** Returns the display price string for a plan. */
export function formatPlanPrice(plan: Plan, annual = false): string {
  const price = annual ? plan.priceAnnual : plan.priceMonthly
  if (price === null) return 'Custom'
  if (price === 0) return 'Free'
  const monthly = annual && plan.priceAnnual ? Math.round(plan.priceAnnual / 12) : price
  return `$${monthly}/mo`
}
