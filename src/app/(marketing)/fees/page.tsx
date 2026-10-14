import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageIntro, SectionHead, Wrap } from '@/components/marketing/page-intro'
import { FEES } from '@/lib/business/offer'

export const metadata: Metadata = {
  title: 'Fees',
  description: 'Every fee TIGI charges, who pays it and when. No hidden spreads.',
}

// ---------------------------------------------------------------------------
// /fees — the full fee schedule from Business Plan v2 §6, in one table.
// ---------------------------------------------------------------------------

export default function FeesPage() {
  return (
    <div className="pb-24 md:pb-32">
      <PageIntro
        eyebrow="Fees"
        title="Every fee, who pays it, and when."
        lede={
          <p>
            TIGI earns when it does work for you: a check, a protected payment, a property it finds and looks after.
            This is the full list. Each offering also states its fees in its own documents before you buy.
          </p>
        }
      />

      <Wrap className="mt-16">
        <div data-reveal="up" className="panel overflow-hidden">
          <div className="hidden grid-cols-[110px_1.1fr_1.4fr_1fr_1.2fr] gap-6 border-b border-white/[0.06] px-6 py-3 md:grid">
            {['Product', 'What', 'Fee', 'Who pays', 'When'].map((h) => (
              <span key={h} className="text-label !text-[10px]">{h}</span>
            ))}
          </div>
          <ul>
            {FEES.map((f) => (
              <li
                key={`${f.product}-${f.item}`}
                className="data-row grid gap-1.5 border-b border-white/[0.05] px-6 py-4 last:border-0 md:grid-cols-[110px_1.1fr_1.4fr_1fr_1.2fr] md:items-center md:gap-6"
              >
                <span className="text-label !text-[10.5px] !text-violet-200">{f.product}</span>
                <span className="text-[15px] font-medium text-[#F5F5F7]">{f.item}</span>
                <span className="text-[15px] text-[#F5F5F7]">
                  {f.fee}
                  {f.assumption && <span className="ml-2 align-middle font-mono text-[10px] uppercase tracking-[0.1em] text-[#8E8E9C]">Launch price</span>}
                </span>
                <span className="text-[14px] text-[#B4B4C0]">{f.who}</span>
                <span className="text-[14px] text-[#B4B4C0]">{f.when}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-caption">
          Launch prices are being tested in our first 90 days and may change before you order; you always see the
          price first. Shares fees apply only where TIGI Shares is licensed.
        </p>
      </Wrap>

      <Wrap className="mt-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHead num="01" label="Paid to others" title="What TIGI does not keep." />
            <ul className="mt-8 space-y-4 text-[15px] leading-relaxed text-[#C3C3CC]">
              <li data-reveal="up" className="panel p-5">
                <span className="text-[#F5F5F7]">Property management</span>, usually around 8% of rent, goes to the
                independent local manager who runs the building, not to TIGI.
              </li>
              <li data-reveal="up" data-reveal-delay="90" className="panel p-5">
                <span className="text-[#F5F5F7]">Government fees</span> such as registration, stamp duty and consent
                fees are paid to the authority and shown separately.
              </li>
              <li data-reveal="up" data-reveal-delay="180" className="panel p-5">
                <span className="text-[#F5F5F7]">Notary and legal fees</span> for the transfer itself are quoted by
                the partner before you commit.
              </li>
            </ul>
          </div>
          <div>
            <SectionHead num="02" label="How we compare" title="In line with licensed platforms." />
            <p data-reveal="up" className="mt-8 text-[15px] leading-relaxed text-[#C3C3CC]">
              Our Shares fees follow what licensed fractional platforms charge in the US: sourcing fees of up to 3.5%
              and management fees around 1% a year are common. Our 1% resale fee is lower than the 3% some charge
              sellers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-glass no-underline">
                Subscription plans <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/risks" className="btn-glass no-underline">
                Risks <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Wrap>
    </div>
  )
}
