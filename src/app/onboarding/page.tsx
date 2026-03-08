import { redirect } from 'next/navigation'
import { auth } from '@/auth'

// ---------------------------------------------------------------------------
// /onboarding — root redirect.
// If user already completed onboarding, send to marketplace.
// Otherwise, start at step 1 (role selection).
// ---------------------------------------------------------------------------

export default async function OnboardingIndexPage() {
  const session = await auth()
  if (session?.user?.onboardingComplete) {
    redirect('/marketplace')
  }
  redirect('/onboarding/role')
}
