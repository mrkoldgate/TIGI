import { z } from 'zod'
import type { UserTypeValue } from '@/lib/onboarding/config'

// ---------------------------------------------------------------------------
// Onboarding step validation schemas.
// Each PATCH to /api/users/me/onboarding includes a `step` discriminator.
// ---------------------------------------------------------------------------

export const USER_TYPES = [
  'BUYER',
  'INVESTOR',
  'SELLER',
  'PROPERTY_OWNER',
  'LAND_OWNER',
  'DEVELOPER',
  'LEGAL_PROFESSIONAL',
  'FINANCIAL_PROFESSIONAL',
] as const satisfies readonly UserTypeValue[]

// Step 1 — role selection
export const roleStepSchema = z.object({
  step: z.literal(1),
  userType: z.enum(USER_TYPES),
  // DB role is derived server-side from userType — not sent by client
})

// Step 2 — profile basics
export const profileStepSchema = z.object({
  step: z.literal(2),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be under 80 characters')
    .trim(),
  location: z
    .string()
    .max(100, 'Location too long')
    .trim()
    .optional(),
  bio: z
    .string()
    .max(300, 'Bio must be under 300 characters')
    .trim()
    .optional(),
})

// Step 3 — interests / preferences
// Preferences is a flexible key→value map; server validates only that it's a
// JSON object (specific keys validated per role in the UI, not hard-enforced here).
export const interestsStepSchema = z.object({
  step: z.literal(3),
  preferences: z.record(z.string()),
})

// Step 4 — completion marker
export const completeStepSchema = z.object({
  step: z.literal(4),
})

// Discriminated union — routes to the right schema by step number
export const onboardingStepSchema = z.discriminatedUnion('step', [
  roleStepSchema,
  profileStepSchema,
  interestsStepSchema,
  completeStepSchema,
])

export type RoleStepInput = z.infer<typeof roleStepSchema>
export type ProfileStepInput = z.infer<typeof profileStepSchema>
export type InterestsStepInput = z.infer<typeof interestsStepSchema>
export type OnboardingStepInput = z.infer<typeof onboardingStepSchema>

// ---------------------------------------------------------------------------
// UserPreferences — typed shape for the `preferences` JSON column.
// Matches the field IDs in INTERESTS_CONFIG.
// ---------------------------------------------------------------------------

export interface UserPreferences {
  // Buyer / Investor
  budgetRange?: string
  investmentHorizon?: string
  geographicFocus?: string
  propertyTypes?: string
  // Owner
  ownerGoal?: string
  propertyCount?: string
  listingTimeline?: string
  // Land owner
  landType?: string
  // Developer
  projectType?: string
  fundingNeed?: string
  // Professional
  specialization?: string
  clientTypes?: string
}
