import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowLeftRight, Building2, Cpu, FileWarning, Gavel, Hourglass, ShieldCheck, Sprout, TrendingDown } from 'lucide-react'
import { SectionHead, Wrap } from '@/components/marketing/page-intro'
import { CtaBand, GlowTile, PageHero, ParallaxBand } from '@/components/marketing/cinematic'

export const metadata: Metadata = {
  title: 'Risks',
  description: 'The risks of buying and owning property through TIGI, in plain language, and what we do about each one.',
}

// ---------------------------------------------------------------------------
// /risks — plain-language risk statement (Business Plan v2 §11).
// Not a substitute for an offering's own risk factors.
// ---------------------------------------------------------------------------

const RISKS: Array<{ title: string; what: string; how: string }> = [
  {
    title: 'You can lose money',
    what: 'Property values and rents can fall. A building can sit empty. You could get back less than you put in, or nothing.',
    how: 'Completed, rented buildings only at launch; independent valuations; repair reserves funded before any share is sold.',
  },
  {
    title: 'Shares can be hard to sell',
    what: 'There may be no buyer when you want to sell, or only at a lower price. Plan to hold for several years.',
    how: 'We never promise liquidity. Resale happens only on a licensed venue, and each offering states its expected hold period.',
  },
  {
    title: 'A title can still be wrong',
    what: 'Registries contain errors, and family or community claims may not appear on them.',
    how: 'Registry searches done in person by partner notaries, local enquiries, escrow until the deed transfers, and professional liability cover.',
  },
  {
    title: 'Currencies move',
    what: 'If the naira, CFA franc or shilling falls against your currency, your rent and value in dollars or euros fall too.',
    how: 'Values and income reported in local currency and in USD. Dollar-linked leases where the law allows.',
  },
  {
    title: 'Rules can change',
    what: 'A regulator may change what is allowed, which could pause an offering or a market.',
    how: 'We sell only with a licence or exemption in place, work with counsel in each country, and keep the share register with a licensed party.',
  },
  {
    title: 'Buildings need running',
    what: 'Taxes go unpaid or repairs are skipped, and the property loses value. Others in this market have failed this way.',
    how: 'Independent licensed managers, TIGI audit rights, funded reserves, and reporting to shareholders.',
  },
  {
    title: 'Technology can fail',
    what: 'Software bugs, outages or data breaches can happen.',
    how: 'Audited contracts, permissioned tokens, the legal register held off-chain by a licensed party, and encrypted identity data.',
  },
  {
    title: 'TIGI is a young company',
    what: 'TIGI is a start-up with one founder today. If TIGI failed, you would depend on the arrangements left in place.',
    how: 'Each property sits in its own company with its own manager and register, separate from TIGI, so it does not fall with TIGI.',
  },
]

const ICONS = [TrendingDown, Hourglass, FileWarning, ArrowLeftRight, Gavel, Building2, Cpu, Sprout]

export default function RisksPage() {
  return (
    <div className="pb-24 md:pb-32">
      <PageHero
        photo="abujaHaze"
        eyebrow="Risks"
        title="What could go wrong, said plainly."
        lede={
          <p>
            Property is the largest thing most families will ever buy. Before you use TIGI, read what can go wrong
            and what we do about it. Every offering also comes with its own risk factors; read those too.
          </p>
        }
      />

      <Wrap className="mt-20 md:mt-28">
        <div id="content" className="scroll-mt-28">
          <SectionHead num="01" label="Eight risks" title="And what we do about each one." />
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {RISKS.map((r, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <li key={r.title} data-reveal="up" data-reveal-delay={String((i % 2) * 110)}>
                <GlowTile tilt={4} innerClassName="!p-8">
                  <div className="flex items-start justify-between gap-6">
                    <span className="tile-icon">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[12px] text-[#6E6E7E]">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h2 className="text-h3 mt-6 !text-[22px]">{r.title}</h2>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-[#D4D4DE]">{r.what}</p>
                  <div className="mt-6 rounded-xl border border-violet-300/15 bg-violet-500/[0.06] p-5">
                    <p className="text-label flex items-center gap-2 !text-[10.5px] !text-violet-200">
                      <ShieldCheck className="h-3.5 w-3.5" /> What we do
                    </p>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-[#C3C3CC]">{r.how}</p>
                  </div>
                </GlowTile>
              </li>
            )
          })}
        </ul>
      </Wrap>

      <div className="mt-24 md:mt-32">
        <ParallaxBand photo="goreeStreet" kicker="Before you buy" statement="Read the risks before the returns.">
          <p className="max-w-[52ch] text-[17px] leading-relaxed text-[#D4D4DE]">
            No offering is open during the beta. When one opens, its own documents set out its risks in full.
          </p>
        </ParallaxBand>
      </div>

      <Wrap className="mt-16 md:mt-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHead num="02" label="The fine print" title="Not advice, and not an offer." />
          <div data-reveal="up" className="panel space-y-4 p-8 text-[15px] leading-relaxed text-[#B4B4C0]">
            <p>
              TIGI is in private beta. No real money moves and no offering is open. When offerings open, they will be
              made only where TIGI holds the licence or exemption required, and only through the offering documents for
              each property.
            </p>
            <p>
              Nothing on this site is financial, legal or tax advice. AI estimates are information, not appraisals.
              Speak to a qualified adviser about your own situation.
            </p>
            <p>
              Questions? <Link href="/about" className="text-violet-200 no-underline hover:text-white">Contact us</Link>.
            </p>
          </div>
        </div>
      </Wrap>

      <div className="mt-24 md:mt-32">
        <CtaBand
          photo="lagosSkyline"
          title="Lower the risk before you pay."
          body={<p>Verify checks the title at the registry and keeps your money in escrow until the deed is yours.</p>}
        >
          <Link href="/verify" className="btn-primary no-underline">
            How Verify works <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/fees" className="btn-glass no-underline">
            Fees
          </Link>
        </CtaBand>
      </div>
    </div>
  )
}
