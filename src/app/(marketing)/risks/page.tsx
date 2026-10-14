import type { Metadata } from 'next'
import Link from 'next/link'
import { PageIntro, SectionHead, Wrap } from '@/components/marketing/page-intro'

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

export default function RisksPage() {
  return (
    <div className="pb-24 md:pb-32">
      <PageIntro
        eyebrow="Risks"
        title="What could go wrong, said plainly."
        lede={
          <p>
            Property is the largest thing most families will ever buy. Before you use TIGI, read what can go wrong
            and what we do about it. Every offering also comes with its own risk factors; read those too.
          </p>
        }
      />

      <Wrap className="mt-16">
        <ul className="grid gap-5 md:grid-cols-2">
          {RISKS.map((r, i) => (
            <li key={r.title} data-reveal="up" data-reveal-delay={String((i % 2) * 90)} className="panel p-7">
              <h2 className="text-h3">{r.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#D4D4DE]">{r.what}</p>
              <p className="text-label mt-6 !text-[10px]">What we do</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[#B4B4C0]">{r.how}</p>
            </li>
          ))}
        </ul>
      </Wrap>

      <Wrap className="mt-24">
        <SectionHead label="The fine print" title="Not advice, and not an offer." />
        <div data-reveal="up" className="mt-8 max-w-[80ch] space-y-4 text-[15px] leading-relaxed text-[#B4B4C0]">
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
      </Wrap>
    </div>
  )
}
