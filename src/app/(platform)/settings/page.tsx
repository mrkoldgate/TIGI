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
    NONE:      'text-[#6B6B80]',
    PENDING:   'text-[#F59E0B]',
    SUBMITTED: 'text-[#F59E0B]',
    VERIFIED:  'text-[#4ADE80]',
    REJECTED:  'text-[#EF4444]',
  }

  const tierColor =
    tier === 'free'       ? 'text-[#6B6B80]'
    : tier === 'pro'      ? 'text-[#C9A84C]'
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
      metaColor:   kycColor[kycStatus] ?? 'text-[#6B6B80]',
    },
    {
      href:        '/settings/wallet',
      icon:        Wallet,
      title:       'Wallet',
      description: 'Manage your platform wallet and external connections.',
      meta:        'Devnet',
      metaColor:   'text-[#6B6B80]',
    },
    {
      href:        '/settings/profile',
      icon:        User,
      title:       'Profile',
      description: 'Edit your name, avatar, and notification preferences.',
      meta:        user?.name ?? 'Set up',
      metaColor:   user?.name ? 'text-[#A0A0B2]' : 'text-[#4A4A5E]',
    },
  ]

  return (
    <div className="animate-fade-in pt-8 pb-16">
      <PageHeader
        title="Settings"
        description="Profile, subscription, wallet, and identity verification."
      />

      <div className="mt-8 max-w-2xl space-y-2">
        {sections.map(({ href, icon: Icon, title, description, meta, metaColor }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl border border-[#1E1E2A] bg-[#111118] px-5 py-4 transition-colors hover:border-[#2A2A3A] hover:bg-[#15151E]"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#2A2A3A] bg-[#1A1A24]">
              <Icon className="h-4.5 w-4.5 text-[#6B6B80]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#F5F5F7]">{title}</p>
              <p className="mt-0.5 text-xs text-[#6B6B80]">{description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${metaColor}`}>{meta}</span>
              <ChevronRight className="h-4 w-4 text-[#3A3A4A]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
