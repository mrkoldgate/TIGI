// ---------------------------------------------------------------------------
// feature-gate.ts — Named server-side access gates for premium features.
//
// All gates accept the minimal session shape and return a boolean.
// Import in server components, API routes, and page.tsx files.
//
// Design principle: gate functions document intent at the call site —
// "canAccessDeepValuation(user)" is clearer than "isPro(user)" everywhere.
// ---------------------------------------------------------------------------

import { isPro, isProPlus } from '@/lib/auth/rbac'

type SessionLike = { subscriptionTier?: string; role?: string } | null | undefined

// ---------------------------------------------------------------------------
// Valuation gates
// ---------------------------------------------------------------------------

/** Range bar, value drivers, comparable sales, methodology section */
export function canAccessDeepValuation(user: SessionLike): boolean {
  return isPro(user)
}

/** Land-specific deep valuation (development potential, zoning analysis) */
export function canAccessLandDeepValuation(user: SessionLike): boolean {
  return isPro(user)
}

/** PDF valuation report export */
export function canExportValuationPdf(user: SessionLike): boolean {
  return isPro(user)
}

// ---------------------------------------------------------------------------
// Dashboard & insights gates
// ---------------------------------------------------------------------------

/** Priority AI signals, market trend insights on dashboard */
export function canAccessAdvancedInsights(user: SessionLike): boolean {
  return isPro(user)
}

/** Predictive market forecasts (6/12/24-month projections) */
export function canAccessMarketForecasts(user: SessionLike): boolean {
  return isProPlus(user)
}

// ---------------------------------------------------------------------------
// Recommendation gates
// ---------------------------------------------------------------------------

/** Personalised AI recommendations (value score, role-based boosts) */
export function canAccessAdvancedRecommendations(user: SessionLike): boolean {
  return isProPlus(user)
}

// ---------------------------------------------------------------------------
// Portfolio gates
// ---------------------------------------------------------------------------

/** Portfolio optimizer: diversification scoring + rebalancing suggestions */
export function canAccessPortfolioOptimizer(user: SessionLike): boolean {
  return isProPlus(user)
}

/** Portfolio analytics: breakdown charts, risk assessment, exposure heatmap */
export function canAccessPortfolioAnalytics(user: SessionLike): boolean {
  return isPro(user)
}

// ---------------------------------------------------------------------------
// Legal & document gates
// ---------------------------------------------------------------------------

/** AI legal document summarization (plain-English summary, risk flags) */
export function canAccessLegalDocumentAi(user: SessionLike): boolean {
  return isProPlus(user)
}

/** Title & deed auto-parsing during listing creation */
export function canAccessTitleParsing(user: SessionLike): boolean {
  return isProPlus(user)
}

// ---------------------------------------------------------------------------
// Inheritance gates
// ---------------------------------------------------------------------------

/** AI inheritance scenario simulation */
export function canAccessInheritanceSimulation(user: SessionLike): boolean {
  return isProPlus(user)
}

// ---------------------------------------------------------------------------
// Contextual upgrade messaging
// ---------------------------------------------------------------------------

export type GatedFeature =
  | 'deep_valuation'
  | 'land_deep_valuation'
  | 'valuation_pdf'
  | 'advanced_insights'
  | 'market_forecasts'
  | 'advanced_recommendations'
  | 'portfolio_optimizer'
  | 'portfolio_analytics'
  | 'legal_document_ai'
  | 'title_parsing'
  | 'inheritance_simulation'

const FEATURE_MESSAGES: Record<GatedFeature, { label: string; requiredPlan: 'pro' | 'pro_plus' }> = {
  deep_valuation:           { label: 'the full AI valuation report',        requiredPlan: 'pro'      },
  land_deep_valuation:      { label: 'land development analysis',           requiredPlan: 'pro'      },
  valuation_pdf:            { label: 'PDF valuation exports',               requiredPlan: 'pro'      },
  advanced_insights:        { label: 'advanced AI market insights',         requiredPlan: 'pro'      },
  market_forecasts:         { label: 'predictive market forecasts',         requiredPlan: 'pro_plus' },
  advanced_recommendations: { label: 'personalised AI recommendations',     requiredPlan: 'pro_plus' },
  portfolio_optimizer:      { label: 'portfolio optimiser & rebalancing',   requiredPlan: 'pro_plus' },
  portfolio_analytics:      { label: 'portfolio analytics & risk scoring',  requiredPlan: 'pro'      },
  legal_document_ai:        { label: 'legal document AI summarisation',     requiredPlan: 'pro_plus' },
  title_parsing:            { label: 'title & deed auto-parsing',           requiredPlan: 'pro_plus' },
  inheritance_simulation:   { label: 'inheritance scenario simulation',     requiredPlan: 'pro_plus' },
}

export interface FeatureGateInfo {
  label: string
  requiredPlan: 'pro' | 'pro_plus'
  upgradePath: '/settings/billing'
}

export function getFeatureGateInfo(feature: GatedFeature): FeatureGateInfo {
  return { ...FEATURE_MESSAGES[feature], upgradePath: '/settings/billing' }
}
