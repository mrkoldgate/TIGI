import type { Metadata } from 'next'
import Link from 'next/link'
import { Wallet, ShieldCheck, CreditCard, User, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { PLANS } from '@/lib/billing/billing-types'
import type { PlanId } from '@/lib/billing/billing-types'

export const metadata: Metadata = {
  title: 'Settings — TIGI',
  description: 'Manage your profile, wallet, subscription, and account preferences.',
}

// ---------------------------------------------------------------------------
// Settings index — /settings
// Navigation hub for wallet, billing, KYC, and profile sub-pages.
// ---------------------------------------------------------------------------

export default async function SettingsPage() {
  const sessionUser = await requireAuth('/settings')

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { subscriptionTier: true, kycStatus: true, name: true },
  })

  const tier = (user?.subscriptionTier ?? 'free') as PlanId
  const plan = PLANS[tier]
  const kycStatus = user?.kycStatus ?? 'NONE'

  const kycLabel: Record<string, string> = {
    NONE:      'Not submitted',
    PENDING:   'Pending',
    SUBMITTED: 'In review',
    VERIFIED:  'Verified',
    REJECTED:  'Rejected',
  }

  const kycColor: Record<string, string> = {
    NONE:      'text-[#8E8E9C]',
    PENDING:   'text-[#F59E0B]',
    SUBMITTED: 'text-[#F59E0B]',
    VERIFIED:  'text-[#4ADE80]',
    REJECTED:  'text-[#EF4444]',
  }

  const tierColor =
    tier === 'free'       ? 'text-[#8E8E9C]'
    : tier === 'pro'      ? 'text-[#6366F1]'
    : tier === 'pro_plus' ? 'text-[#818CF8]'
    : 'text-[#22C55E]'

  const sections = [
    {
      href:        '/settings/billing',
      icon:        CreditCard,
      title:       'Plan & Billing',
      description: 'Manage your subscription and billing details.',
      meta:        plan.name,
      metaColor:   tierColor,
    },
    {
      href:        '/settings/kyc',
      icon:        ShieldCheck,
      title:       'Identity Verification',
      description: 'Complete KYC to unlock investment transactions.',
      meta:        kycLabel[kycStatus] ?? 'Unknown',
      metaColor:   kycColor[kycStatus] ?? 'text-[#8E8E9C]',
    },
    {
      href:        '/settings/wallet',
      icon:        Wallet,
      title:       'Wallet',
      description: 'Manage your platform wallet and external connections.',
      meta:        'Devnet',
      metaColor:   'text-[#8E8E9C]',
    },
    {
      href:        '/settings/profile',
      icon:        User,
      title:       'Profile',
      description: 'Edit your name, avatar, and notification preferences.',
      meta:        user?.name ?? 'Set up',
      metaColor:   user?.name ? 'text-[#A0A0B2]' : 'text-[#7A7A8A]',
    },
  ]

  return (
    <div className="relative">
      <PageHeader
        title="Settings"
        description="Profile, subscription, wallet, and identity verification."
      />

      <div className="mt-8 max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ href, icon: Icon, title, description, meta, metaColor }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] px-6 py-5 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.08] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),_0_0_20px_-4px_rgba(99,102,241,0.15)]"
          >
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_12px_-2px_rgba(99,102,241,0.08)] group-hover:shadow-[0_0_16px_-2px_rgba(99,102,241,0.15)]">
              <Icon className="h-4.5 w-4.5 text-[#8E8E9C] transition-colors group-hover:text-[#6366F1]/70" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">{title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${metaColor}`}>{meta}</span>
              <ChevronRight className="h-4 w-4 text-[#6E6E7E] transition-colors group-hover:text-[#8E8E9C]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
