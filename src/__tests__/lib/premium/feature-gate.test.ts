import { describe, it, expect } from 'vitest'
import {
  canAccessDeepValuation,
  canAccessLandDeepValuation,
  canExportValuationPdf,
  canAccessAdvancedInsights,
  canAccessMarketForecasts,
  canAccessAdvancedRecommendations,
  canAccessPortfolioOptimizer,
  canAccessPortfolioAnalytics,
  canAccessLegalDocumentAi,
  canAccessTitleParsing,
  canAccessInheritanceSimulation,
  getFeatureGateInfo,
} from '@/lib/premium/feature-gate'

// ---------------------------------------------------------------------------
// feature-gate — all pure functions, subscription tier boundary conditions
// ---------------------------------------------------------------------------

const FREE     = { subscriptionTier: 'free' }
const PRO      = { subscriptionTier: 'pro' }
const PRO_PLUS = { subscriptionTier: 'pro_plus' }
const ENTERPRISE = { subscriptionTier: 'enterprise' }

describe('Pro-tier gates (pro, pro_plus, enterprise)', () => {
  const proGates = [
    canAccessDeepValuation,
    canAccessLandDeepValuation,
    canExportValuationPdf,
    canAccessAdvancedInsights,
    canAccessPortfolioAnalytics,
  ]

  for (const gate of proGates) {
    it(`${gate.name} grants access to pro, pro_plus, enterprise`, () => {
      expect(gate(PRO)).toBe(true)
      expect(gate(PRO_PLUS)).toBe(true)
      expect(gate(ENTERPRISE)).toBe(true)
    })

    it(`${gate.name} denies access to free users`, () => {
      expect(gate(FREE)).toBe(false)
      expect(gate(null)).toBe(false)
      expect(gate(undefined)).toBe(false)
    })
  }
})

describe('Pro-Plus-tier gates (pro_plus, enterprise only)', () => {
  const proPlus = [
    canAccessMarketForecasts,
    canAccessAdvancedRecommendations,
    canAccessPortfolioOptimizer,
    canAccessLegalDocumentAi,
    canAccessTitleParsing,
    canAccessInheritanceSimulation,
  ]

  for (const gate of proPlus) {
    it(`${gate.name} grants access to pro_plus and enterprise only`, () => {
      expect(gate(PRO_PLUS)).toBe(true)
      expect(gate(ENTERPRISE)).toBe(true)
    })

    it(`${gate.name} denies access to free and pro`, () => {
      expect(gate(FREE)).toBe(false)
      expect(gate(PRO)).toBe(false)
      expect(gate(null)).toBe(false)
    })
  }
})

describe('getFeatureGateInfo', () => {
  it('returns label, requiredPlan, and upgradePath for every feature', () => {
    const features = [
      'deep_valuation',
      'land_deep_valuation',
      'valuation_pdf',
      'advanced_insights',
      'market_forecasts',
      'advanced_recommendations',
      'portfolio_optimizer',
      'portfolio_analytics',
      'legal_document_ai',
      'title_parsing',
      'inheritance_simulation',
    ] as const

    for (const feature of features) {
      const info = getFeatureGateInfo(feature)
      expect(info.label, feature).toBeTruthy()
      expect(info.requiredPlan, feature).toMatch(/^(pro|pro_plus)$/)
      expect(info.upgradePath, feature).toBe('/settings/billing')
    }
  })

  it('portfolio_analytics requires pro (not pro_plus)', () => {
    expect(getFeatureGateInfo('portfolio_analytics').requiredPlan).toBe('pro')
  })

  it('market_forecasts requires pro_plus', () => {
    expect(getFeatureGateInfo('market_forecasts').requiredPlan).toBe('pro_plus')
  })
})
