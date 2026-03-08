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

// ── Messaging constants ────────────────────────────────────────────────────

export const LEGACY_MESSAGING = {
  /** Module title */
  moduleTitle: 'Legacy Planning',

  /** One-line description */
  shortDescription:
    'A structured tool to record your estate preferences and beneficiary instructions.',

  /** Shown at the top of the Legacy wizard */
  disclaimer:
    'This is a structured planning tool to help you record your preferences and organize ' +
    'your estate instructions. It is not a final legal instrument or a substitute for a ' +
    'formal will or trust. We recommend consulting a qualified estate planning attorney ' +
    'for legally binding documents.',

  /** CTA for starting the wizard */
  startCta: 'Set Up Legacy Plan',

  /** Shown after submission */
  submittedMessage:
    'Your legacy preferences have been submitted for review. ' +
    'Our compliance team will be in touch within 2–3 business days.',

  /** Shown when plan is ACTIVE */
  activeMessage:
    'Your legacy preferences are on file. You can update them at any time.',

  /** Short label for beneficiary allocation */
  allocationLabel: 'Allocation %',

  /** Compliance note shown on review step */
  complianceNote:
    'Not a legal will or binding contract. Your preferences are recorded and stored ' +
    'securely but require formal legal instruments for enforceability.',
} as const

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
