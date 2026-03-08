import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { onboardingStepSchema } from '@/lib/validations/onboarding'
import { getDbRole } from '@/lib/onboarding/config'

// ---------------------------------------------------------------------------
// PATCH /api/users/me/onboarding
//
// Handles all onboarding step saves. Request body must include `step: 1|2|3|4`.
// Each step writes only the relevant fields. `onboardingStep` ratchets forward
// (never regresses) so users can safely revisit steps.
//
// Step 1: userType + role
// Step 2: name, location, bio
// Step 3: preferences JSON
// Step 4: marks onboarding complete
// ---------------------------------------------------------------------------

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const body = await request.json()

  const parsed = onboardingStepSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const data = parsed.data

  try {
    if (data.step === 1) {
      const dbRole = getDbRole(data.userType)
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            userType: data.userType,
            role: dbRole,
            onboardingStep: { set: 1 },
          },
        })
        await tx.auditLog.create({
          data: {
            userId,
            action: 'onboarding.role.set',
            resourceType: 'User',
            resourceId: userId,
            metadata: { userType: data.userType, role: dbRole },
          },
        })
      })
      return NextResponse.json({ success: true, step: 1, userType: data.userType, role: dbRole })
    }

    if (data.step === 2) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          location: data.location ?? undefined,
          bio: data.bio ?? undefined,
          // Ratchet forward — don't regress if user revisits step 1
          onboardingStep: { set: Math.max(session.user.onboardingComplete ? 4 : 2, 2) },
        },
      })
      return NextResponse.json({ success: true, step: 2 })
    }

    if (data.step === 3) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: data.preferences,
          onboardingStep: { set: Math.max(session.user.onboardingComplete ? 4 : 3, 3) },
        },
      })
      return NextResponse.json({ success: true, step: 3 })
    }

    if (data.step === 4) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { onboardingStep: 4 },
        })
        await tx.auditLog.create({
          data: {
            userId,
            action: 'onboarding.complete',
            resourceType: 'User',
            resourceId: userId,
          },
        })
      })
      return NextResponse.json({ success: true, step: 4 })
    }
  } catch (error) {
    console.error('[onboarding PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save. Please try again.' },
      { status: 500 },
    )
  }
}
