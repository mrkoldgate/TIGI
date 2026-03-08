'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowRight, ShieldCheck } from 'lucide-react'

// ---------------------------------------------------------------------------
// CompleteActions — client component on the onboarding complete page.
// Refreshes the session JWT (so onboardingComplete = true) then shows CTAs.
// ---------------------------------------------------------------------------

interface CompleteActionsProps {
  role: string
  kycStatus: string
}

export function CompleteActions({ role, kycStatus }: CompleteActionsProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()

  // Refresh JWT once so onboardingComplete is set to true
  useEffect(() => {
    updateSession({ onboardingComplete: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleGoToDashboard() {
    switch (role) {
      case 'OWNER':
        router.push('/listings')
        break
      case 'BOTH':
        router.push('/marketplace')
        break
      default:
        router.push('/marketplace')
    }
  }

  const needsKyc = kycStatus === 'NONE' || kycStatus === 'PENDING'

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleGoToDashboard}
        className="flex min-w-[220px] items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-8 py-3.5 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4B86A] active:scale-[0.98]"
      >
        Go to dashboard
        <ArrowRight className="h-4 w-4" />
      </button>

      {/* KYC prompt CTA — secondary */}
      {needsKyc && (
        <button
          type="button"
          onClick={() => router.push('/settings/kyc')}
          className="flex items-center gap-1.5 text-xs text-[#4A4A60] transition-colors hover:text-[#C9A84C]"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Complete identity verification now
        </button>
      )}
    </div>
  )
}
