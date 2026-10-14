import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

// ---------------------------------------------------------------------------
// MarketingFooter — v6. Only links to pages that exist; legal copy kept plain.
// ---------------------------------------------------------------------------

const COLUMNS: Record<string, Array<{ label: string; href: string }>> = {
  Products: [
    { label: 'TIGI Verify', href: '/verify' },
    { label: 'TIGI Shares', href: '/#how' },
    { label: 'TIGI Legacy', href: '/#legacy' },
    { label: 'Markets', href: '/#markets' },
    { label: 'Beta marketplace', href: '/marketplace' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Plans', href: '/pricing' },
    { label: 'Fees', href: '/fees' },
    { label: 'Risks', href: '/risks' },
    { label: 'Questions', href: '/#faq' },
  ],
  Account: [
    { label: 'Join the waitlist', href: '/waitlist' },
    { label: 'Sign in to the beta', href: '/auth/login' },
    { label: 'List a property', href: '/waitlist?interest=list' },
    { label: 'Invest in TIGI', href: '/waitlist?interest=investor' },
  ],
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.08)]">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-[#C3C3CC]">
              Property in Africa you can trust: titles checked at the registry, money held in escrow, and heirs on record.
            </p>
          </div>
          {Object.entries(COLUMNS).map(([group, links]) => (
            <div key={group}>
              <p className="text-label mb-4">{group}</p>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[#C3C3CC] no-underline transition-colors hover:text-[#F5F5F7]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 space-y-3 border-t border-[rgba(255,255,255,0.08)] pt-8 text-xs leading-relaxed text-[#8E8E9C]">
          <p className="max-w-[110ch]">
            TIGI is in private beta. No real money moves and no offering is open. TIGI Shares will be offered only in
            countries where TIGI holds the required licence or exemption, and only through each property&apos;s
            offering documents; shares will represent an interest in the company that holds the property. Investing in
            real estate involves risk, including loss of your money, and shares may be hard to sell. TIGI Verify is a
            title check and escrow service, not legal advice. AI estimates are information, not appraisals. Nothing on
            this site is financial, legal or tax advice.
          </p>
          <p>&copy; {new Date().getFullYear()} TIGI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
