import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import { FOOTER_LINKS } from '@/lib/nav-config'

// ---------------------------------------------------------------------------
// MarketingFooter — Public site footer
// Platform views do NOT have a footer.
// Footer links sourced from nav-config.ts for consistency with marketing nav.
// ---------------------------------------------------------------------------

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#1F1F2E] bg-[#0A0A0F]">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-8">
        {/* Top row */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#6B6B80]">
              TIGI makes real estate investment accessible to everyone through
              tokenized fractional ownership. AI-powered. Solana-backed.
            </p>
            {/* Legal disclaimer */}
            <p className="mt-4 text-xs leading-relaxed text-[#6B6B80]">
              Tokens represent economic interest as defined in offering documents.
              Investments carry risk, including potential loss of principal. This
              is not financial advice.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-label mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6B6B80] transition-colors hover:text-[#A0A0B2]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#1F1F2E] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-[#6B6B80]">
            &copy; {new Date().getFullYear()} TIGI — Tokenized Intelligent Global Infrastructure.
            All rights reserved.
          </p>
          <p className="text-xs text-[#6B6B80]">
            Built on Solana. AI-powered. Compliance-first.
          </p>
        </div>
      </div>
    </footer>
  )
}
