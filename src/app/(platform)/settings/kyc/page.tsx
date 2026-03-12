import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { getKycStatusForUser } from '@/lib/compliance/kyc-query'
import { KYCOnboardingClient } from '@/components/compliance/kyc-onboarding-client'

export const metadata: Metadata = {
  title: 'Identity Verification — TIGI',
  description: 'Complete your KYC verification to unlock full platform access.',
}

// ---------------------------------------------------------------------------
// /settings/kyc — Identity verification flow
//
// Server component: fetches current KYC status then hands off to the
// multi-step KYCOnboardingClient which manages all state client-side.
//
// Auth: requireAuth redirects unauthenticated users to /auth/login.
// Data: getKycStatusForUser is React cache()-wrapped — safe to call from
//   multiple server components in the same request without extra DB hits.
// ---------------------------------------------------------------------------

export default async function KycPage() {
  const user = await requireAuth('/settings/kyc')

  const initialData = await getKycStatusForUser(user.id)

  return (
    <div className="animate-fade-in pt-8 pb-16">
      <KYCOnboardingClient
        initialData={initialData}
        userDisplayName={user.name}
        userRole={user.role ?? undefined}
      />
    </div>
  )
}
