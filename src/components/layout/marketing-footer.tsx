import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

// ---------------------------------------------------------------------------
// MarketingFooter — v4. Only links to pages that exist; legal copy kept plain.
// ---------------------------------------------------------------------------

const COLUMNS: Record<string, Array<{ label: string; href: string }>> = {
  Platform: [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Land & leasing', href: '/leasing' },
    { label: 'Legacy planning', href: '/inheritance' },
    { label: 'Insights', href: '/insights' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Learn: [
    { label: 'How it works', href: '/#how' },
    { label: 'Intelligence', href: '/#intelligence' },
    { label: 'Trust & safety', href: '/#trust' },
    { label: 'Questions', href: '/#faq' },
  ],
  Account: [
    { label: 'Get early access', href: '/auth/register' },
    { label: 'Sign in', href: '/auth/login' },
    { label: 'List a property', href: '/auth/register?role=owner' },
  ],
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[rgba(237,237,243,0.08)] bg-[#171721]">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-[#C3C3CC]">
              Real estate and land, owned by the share. Researched with AI, recorded on Solana.
            </p>
          </div>
          {Object.entries(COLUMNS).map(([group, links]) => (
            <div key={group}>
              <p className="text-label mb-4">{group}</p>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[#C3C3CC] no-underline transition-colors hover:text-[#EDEDF3]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 space-y-3 border-t border-[rgba(237,237,243,0.08)] pt-8 text-xs leading-relaxed text-[#8E8E9C]">
          <p className="max-w-[110ch]">
            TIGI is in private beta. No real money moves and no live offerings are made during the beta. When
            offerings open, shares will represent an economic interest in the entity that holds each property,
            as defined in its offering documents. Investing in real estate involves risk, including loss of
            principal, and shares may be difficult to sell. AI valuations are estimates, not appraisals. Nothing
            on this site is financial, legal or tax advice.
          </p>
          <p>&copy; {new Date().getFullYear()} TIGI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
