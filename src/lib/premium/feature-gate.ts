// ---------------------------------------------------------------------------
// Premium feature gate — server-side named helpers.
//
// Thin wrappers over rbac.ts that document intent at the call site.
// Import and call in server components or API routes before rendering
// gated UI sections.
// ---------------------------------------------------------------------------

import { isPro, isProPlus } from '@/lib/auth/rbac'

type SessionLike = { subscriptionTier?: string; role?: string } | null | undefined

/** Gate: deep AI valuation (range bar, value drivers, comps, methodology) */
export function canAccessDeepValuation(user: SessionLike): boolean {
  return isPro(user)
}

/** Gate: advanced AI insights (priority signals, market trends) */
export function canAccessAdvancedInsights(user: SessionLike): boolean {
  return isPro(user)
}

/** Gate: advanced recommendation signals (value score, role-based boosts) */
export function canAccessAdvancedRecommendations(user: SessionLike): boolean {
  return isProPlus(user)
}
