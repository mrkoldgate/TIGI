/**
 * terra-types.ts — Type definitions for the TIGI Terra module.
 *
 * Terra = Land Leasing & Development platform.
 *
 * These types extend the core MockListing with structured lease terms
 * and development opportunity data. The MockListing → TerraListing
 * extension is backwards-compatible — existing consumers see no change.
 *
 * DB migration path:
 *   Mock LeaseTerms  → prisma.leaseTerms  (one-to-one with Property)
 *   Mock DevOpportunity → prisma.developmentOpportunity
 */

import type { MockListing } from '@/lib/marketplace/mock-data'

// ── Lease Terms ────────────────────────────────────────────────────────────

export type LeaseDurationType   = 'FIXED' | 'FLEXIBLE' | 'MONTH_TO_MONTH' | 'NEGOTIABLE'
export type LeaseEscalationType = 'NONE' | 'FIXED' | 'CPI' | 'PERCENT_PER_YEAR'

export interface LeaseTerms {
  // Duration
  durationType:   LeaseDurationType
  minimumMonths:  number | null   // null = no minimum
  maximumMonths:  number | null   // null = open-ended

  // Financials (per year unless noted)
  rateMonthly:    number | null   // $/month
  rateAnnual:     number | null   // $/year
  ratePerAcre:    number | null   // $/acre/year

  securityDeposit: number | null  // one-time deposit

  // Escalation
  escalationType: LeaseEscalationType
  escalationRate: number | null   // percent per year

  // Option clauses
  hasRenewalOption:    boolean
  renewalTermMonths:   number | null
  hasPurchaseOption:   boolean
  purchaseOptionPrice: number | null

  // Use restrictions
  allowedUses:    string[]
  prohibitedUses: string[]

  additionalTerms: string | null
}

// ── Development Opportunity ────────────────────────────────────────────────

export type DevelopmentStage = 'RAW' | 'ENTITLED' | 'IMPROVED' | 'SHOVEL_READY'

export interface DevOpportunity {
  stage: DevelopmentStage

  // Zoning
  zoningDescription:  string | null
  maxBuildableUnits:  number | null
  maxFloorAreaRatio:  number | null
  heightLimitFt:      number | null

  // Infrastructure
  utilitiesAvailable: string[]    // e.g. ["Electric", "Water", "Sewer", "Gas", "Fiber"]
  roadAccess:         boolean
  roadType:           string | null

  // Entitlements
  entitlementStatus:  string | null
  permitsAvailable:   string[]
  environmentalStatus: string | null

  // Topography
  topography:         string | null
  floodZone:          string | null

  // Summary bullets shown in the panel
  highlights:         string[]

  // Future: dev financing notes
  financingNotes:     string | null
}

// ── TerraListing — extends MockListing ────────────────────────────────────

export interface TerraListing extends MockListing {
  /**
   * Structured lease terms. Present when listing has LEASE or BOTH listingType.
   * null = terms available on request / negotiable.
   */
  leaseTerms: LeaseTerms | null

  /**
   * Structured development opportunity. Present when parcel has dev signals.
   * null = no development data attached.
   */
  devOpportunity: DevOpportunity | null

  /**
   * Monthly lease rate (convenience field — mirrors leaseTerms.rateMonthly).
   * Added to TerraListing for grid card display without needing full terms.
   */
  leaseRateMonthly: number | null
}

// ── Filters ────────────────────────────────────────────────────────────────

export type TerraListingTypeFilter = 'ALL' | 'LEASE' | 'BUY' | 'BOTH'
export type TerraLandUseFilter     = 'ALL' | 'AGRICULTURAL' | 'RESIDENTIAL_DEV' | 'COMMERCIAL_DEV' | 'INDUSTRIAL' | 'MIXED_USE' | 'RECREATIONAL' | 'WATERFRONT' | 'RURAL'
export type TerraSortOption        = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'ACREAGE_DESC' | 'RATE_ASC'
export type TerraDevFilter         = 'ALL' | 'DEV_ONLY' | 'LEASE_ONLY'

// ── Stage display config ────────────────────────────────────────────────────

export const DEV_STAGE_CONFIG: Record<DevelopmentStage, {
  label: string
  description: string
  color: string
  bg: string
  border: string
}> = {
  RAW:         { label: 'Raw Land',     description: 'Unimproved, no entitlements.',                  color: 'text-[#6B7280]', bg: 'bg-[#6B7280]/10',     border: 'border-[#6B7280]/20' },
  ENTITLED:    { label: 'Entitled',     description: 'Zoning and permits approved.',                   color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/10',     border: 'border-[#60A5FA]/20' },
  IMPROVED:    { label: 'Improved',     description: 'Infrastructure is in place.',                    color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/10',     border: 'border-[#C9A84C]/20' },
  SHOVEL_READY:{ label: 'Shovel-Ready', description: 'All approvals, grading and utilities complete.', color: 'text-[#4ADE80]', bg: 'bg-[#4ADE80]/10',     border: 'border-[#4ADE80]/20' },
}
