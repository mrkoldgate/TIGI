// ---------------------------------------------------------------------------
// legacy-query.ts — Admin-side queries for LegacyPlan compliance review.
//
// Used by:
//   - /admin/compliance page (real INHERITANCE queue items)
//
// Returns SUBMITTED and UNDER_REVIEW plans so admin can take action.
// ---------------------------------------------------------------------------

import { cache } from 'react'
import { prisma } from '@/lib/db'

export interface AdminLegacyItem {
  id:              string
  userId:          string
  status:          string
  submittedAt:     Date
  reviewNote:      string | null
  onboardingStep:  number
  beneficiaryCount: number
  user: {
    id:       string
    name:     string | null
    email:    string
    userType: string | null
    role:     string
  }
}

export const getLegacyPlansForAdmin = cache(async (): Promise<AdminLegacyItem[]> => {
  const plans = await prisma.legacyPlan.findMany({
    where: {
      status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
    },
    orderBy: { submittedAt: 'asc' },
    select: {
      id:             true,
      userId:         true,
      status:         true,
      submittedAt:    true,
      reviewNote:     true,
      onboardingStep: true,
      _count: {
        select: { beneficiaries: true },
      },
      user: {
        select: {
          id:       true,
          name:     true,
          email:    true,
          userType: true,
          role:     true,
        },
      },
    },
  })

  return plans.map((p) => ({
    id:               p.id,
    userId:           p.userId,
    status:           p.status,
    submittedAt:      p.submittedAt!,
    reviewNote:       p.reviewNote,
    onboardingStep:   p.onboardingStep,
    beneficiaryCount: p._count.beneficiaries,
    user: {
      id:       p.user.id,
      name:     p.user.name,
      email:    p.user.email,
      userType: p.user.userType,
      role:     p.user.role,
    },
  }))
})
