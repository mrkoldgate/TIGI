/**
 * legacy-query.ts — Server-side queries for LegacyPlan + LegacyBeneficiary.
 *
 * MESSAGING NOTE:
 *   ✅  "Inheritance planning setup", "structured planning tool"
 *   ✅  "Legacy preferences", "estate instructions"
 *   ❌  "Legal instrument", "binding document", "will"
 *   ❌  "Guarantee transfer", "legally enforceable"
 *
 * Use LEGACY_MESSAGING constants for all user-facing copy. Never
 * hardcode estate-planning language directly in UI components.
 */

import { cache } from 'react'
import { prisma } from '@/lib/db'

export { LEGACY_MESSAGING } from './legacy-messaging'

// ── Types ──────────────────────────────────────────────────────────────────

export interface LegacyBeneficiaryRecord {
  id:                string
  name:              string
  email:             string | null
  phone:             string | null
  relationship:      string
  allocationPercent: number
  notes:             string | null
  createdAt:         string
}

export interface LegacyPlanRecord {
  id:                string
  userId:            string
  status:            string
  instructions:      string | null
  specialConditions: string | null
  executorName:      string | null
  executorEmail:     string | null
  executorPhone:     string | null
  onboardingStep:    number
  submittedAt:       string | null
  reviewedAt:        string | null
  reviewNote:        string | null
  beneficiaries:     LegacyBeneficiaryRecord[]
  createdAt:         string
  updatedAt:         string
}

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Returns the LegacyPlan for a user, including beneficiaries.
 * Returns null if no plan exists yet (user hasn't started).
 */
export const getLegacyPlanForUser = cache(
  async (userId: string): Promise<LegacyPlanRecord | null> => {
    const plan = await prisma.legacyPlan.findUnique({
      where:  { userId },
      select: {
        id:                true,
        userId:            true,
        status:            true,
        instructions:      true,
        specialConditions: true,
        executorName:      true,
        executorEmail:     true,
        executorPhone:     true,
        onboardingStep:    true,
        submittedAt:       true,
        reviewedAt:        true,
        reviewNote:        true,
        createdAt:         true,
        updatedAt:         true,
        beneficiaries: {
          orderBy: { createdAt: 'asc' },
          select: {
            id:                true,
            name:              true,
            email:             true,
            phone:             true,
            relationship:      true,
            allocationPercent: true,
            notes:             true,
            createdAt:         true,
          },
        },
      },
    })

    if (!plan) return null

    return {
      ...plan,
      submittedAt: plan.submittedAt?.toISOString() ?? null,
      reviewedAt:  plan.reviewedAt?.toISOString() ?? null,
      createdAt:   plan.createdAt.toISOString(),
      updatedAt:   plan.updatedAt.toISOString(),
      beneficiaries: plan.beneficiaries.map((b) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
      })),
    }
  },
)

/**
 * Returns the total allocation percent for a plan's beneficiaries.
 * Used to validate that allocations sum to 100 before submission.
 */
export function getTotalAllocation(beneficiaries: LegacyBeneficiaryRecord[]): number {
  return beneficiaries.reduce((sum, b) => sum + b.allocationPercent, 0)
}
