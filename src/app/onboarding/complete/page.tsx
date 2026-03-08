import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CompleteActions } from '@/components/onboarding/complete-actions'
import { Shield, Zap, TrendingUp } from 'lucide-react'
import { ROLE_CARDS } from '@/lib/onboarding/config'
import type { UserTypeValue } from '@/lib/onboarding/config'

// ---------------------------------------------------------------------------
// Step 4 — Onboarding complete.
// Server Component reads user's role summary + KYC status.
// Marks onboardingStep=4 via Server Action, then lets user proceed.
// ---------------------------------------------------------------------------

export default async function CompletePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      userType: true,
      role: true,
      kycStatus: true,
      onboardingStep: true,
    },
  })

  // Mark complete if not already — idempotent
  if (user && user.onboardingStep < 4) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: { onboardingStep: 4 },
      })
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'onboarding.complete',
          resourceType: 'User',
          resourceId: session.user.id,
        },
      })
    })
  }

  const userType = (user?.userType ?? 'INVESTOR') as UserTypeValue
  const roleCard = ROLE_CARDS.find((c) => c.userType === userType)
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const kycStatus = user?.kycStatus ?? 'NONE'
  const needsKyc = kycStatus === 'NONE' || kycStatus === 'PENDING'
  const role = user?.role ?? 'INVESTOR'

  return (
    <div className="w-full max-w-lg text-center">
      {/* Success mark */}
      <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[#C9A84C]/10" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10">
          <svg
            className="h-7 w-7 text-[#C9A84C]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
        Welcome to TIGI, {firstName}.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#6B6B80]">
        Your account is set up as a{' '}
        <span className="text-[#C9A84C]">{roleCard?.label ?? userType}</span>.
        Here&apos;s what&apos;s ready for you.
      </p>

      {/* Feature highlights */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FeatureChip
          icon={TrendingUp}
          label={role === 'OWNER' || role === 'BOTH' ? 'List properties' : 'Browse properties'}
        />
        <FeatureChip icon={Zap} label="AI valuations" />
        <FeatureChip icon={Shield} label="On-chain title" />
      </div>

      {/* KYC section — informational placeholder */}
      {needsKyc && (
        <div className="mt-6 rounded-2xl border border-[#C9A84C]/15 bg-[#C9A84C]/5 p-5 text-left">
          <div className="mb-3 flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/10">
              <Shield className="h-4 w-4 text-[#C9A84C]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Identity verification required</p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B6B80]">
                To invest in or sell tokenized properties, you&apos;ll need to complete a quick
                KYC check. It takes about 5 minutes and is fully encrypted.
              </p>
            </div>
          </div>

          {/* KYC status pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            <KycStep label="Government ID" done={false} />
            <KycStep label="Selfie verification" done={false} />
            <KycStep label="Address proof" done={false} />
          </div>

          <p className="mt-3 text-[10px] text-[#3A3A48]">
            KYC is powered by a regulated provider. Your data is never sold.
            Full compliance module available in the platform — coming in a future update.
          </p>
        </div>
      )}

      {/* Dashboard CTA — client component (needs session refresh) */}
      <CompleteActions role={role} kycStatus={kycStatus} />
    </div>
  )
}

function FeatureChip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#1E1E2A] bg-[#111118] px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-[#C9A84C]" />
      <span className="text-xs text-[#9999AA]">{label}</span>
    </div>
  )
}

function KycStep({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className={
        done
          ? 'flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] text-emerald-400'
          : 'flex items-center gap-1 rounded-full border border-[#2A2A3A] bg-[#111118] px-3 py-1 text-[10px] text-[#4A4A60]'
      }
    >
      <span className={done ? 'text-emerald-400' : 'text-[#3A3A48]'}>{done ? '✓' : '○'}</span>
      {label}
    </span>
  )
}
