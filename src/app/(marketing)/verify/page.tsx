import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Minus } from 'lucide-react'
import { PageIntro, SectionHead, Wrap } from '@/components/marketing/page-intro'
import { FEES } from '@/lib/business/offer'

export const metadata: Metadata = {
  title: 'TIGI Verify — title checks and escrow',
  description:
    'Before you pay for land or a home in Nigeria, Senegal or Mali, TIGI checks the title at the official registry and holds your money in licensed escrow until the deed is yours.',
}

// ---------------------------------------------------------------------------
// /verify — TIGI Verify, the launch product (Business Plan v2 §2).
// ---------------------------------------------------------------------------

const STEPS = [
  {
    t: 'Tell us about the property',
    d: 'Who is selling, the title, survey or plot number, and where it is. Upload what the seller gave you. It takes about five minutes.',
  },
  {
    t: 'We search the registry',
    d: 'A partner notary or lawyer searches the official land registry in person, checks the seller’s identity and looks for court cases, charges and government acquisitions.',
  },
  {
    t: 'You get a written report',
    d: 'A plain-language title report: clear, clear with conditions, or do not proceed, with the evidence behind each finding.',
  },
  {
    t: 'Pay into escrow',
    d: 'If you go ahead, you pay into an account held by a licensed bank or escrow partner. Not to the seller, and not to TIGI.',
  },
  {
    t: 'Deed first, then money',
    d: 'The partner releases the money only once the transfer is registered in your name. The deed and report are saved to your Legacy vault.',
  },
]

const REPORT = [
  'Registered owner matches the seller',
  'Title document is genuine and registered (C of O, titre foncier or equivalent)',
  'Mortgages, liens and other charges',
  'Court cases and caveats on the land',
  'Government acquisition or planning restrictions',
  'Survey plan matches the plot on the ground',
  'Seller or developer identity and track record',
  'Local enquiries for family or community claims',
]

const NOT = [
  'Verify is a check and a protected payment, not legal advice. Partner lawyers can advise you separately.',
  'The official registry remains the legal record. TIGI reports what it shows, and what local enquiries find.',
  'A clear report lowers risk; it cannot remove it. TIGI carries professional liability cover for its checks.',
]

export default function VerifyPage() {
  const verifyFees = FEES.filter((f) => f.product === 'Verify')

  return (
    <div className="pb-24 md:pb-32">
      <PageIntro
        eyebrow="TIGI Verify · Launching in Nigeria, Senegal and Mali"
        title="Know it’s real before you pay."
        photo="brickHome"
        lede={
          <p>
            Buying land or a home at home from abroad usually means wiring money to someone you have never met for a
            paper you can&apos;t check. Verify checks the title at the official registry and keeps your money in licensed
            escrow until the deed is registered in your name.
          </p>
        }
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/waitlist?interest=verify" className="btn-primary no-underline">
            Get Verify when it opens <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/fees" className="btn-glass no-underline">See the fees</Link>
        </div>
      </PageIntro>

      {/* How it works */}
      <Wrap className="mt-24">
        <SectionHead num="01" label="How it works" title="Five steps from a plot number to a deed in your name." />
        <ol className="tray mt-12 grid gap-1.5 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.t} data-reveal="up" data-reveal-delay={String(i * 90)} className="cell p-6">
              <span className="font-mono text-xs text-violet-300">0{i + 1}</span>
              <h3 className="text-h4 mt-5">{s.t}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#B4B4C0]">{s.d}</p>
            </li>
          ))}
        </ol>
      </Wrap>

      {/* What the report covers */}
      <Wrap className="mt-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHead num="02" label="The title report" title="What we check." />
            <ul className="mt-10 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {REPORT.map((t, i) => (
                <li key={t} data-reveal="left" data-reveal-delay={String(i * 60)} className="flex items-start gap-3 py-3.5 text-[15px] text-[#E4E4EC]">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-300" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead num="03" label="Limits" title="What Verify is not." />
            <ul className="mt-10 space-y-4">
              {NOT.map((t, i) => (
                <li key={t} data-reveal="up" data-reveal-delay={String(i * 90)} className="panel flex items-start gap-3 p-5 text-[15px] leading-relaxed text-[#C3C3CC]">
                  <Minus className="mt-1 h-4 w-4 flex-shrink-0 text-[#8E8E9C]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Wrap>

      {/* Price */}
      <Wrap className="mt-24">
        <SectionHead num="04" label="Price" title="Simple, and paid only for what you use." />
        <div className="tray mt-12 grid gap-1.5 md:grid-cols-2">
          {verifyFees.map((f) => (
            <div key={f.item} data-reveal="up" className="cell p-7">
              <p className="text-label">{f.item}</p>
              <p className="figure mt-4 text-[clamp(1.8rem,1.4rem+1.4vw,2.5rem)]">{f.fee}</p>
              <p className="mt-3 text-[15px] text-[#C3C3CC]">{f.when}.</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-caption">
          Launch prices we are testing in our first 90 days. The price you pay is always shown before you order.
        </p>
      </Wrap>

      {/* CTA */}
      <Wrap className="mt-24">
        <div data-reveal="scale" className="panel px-7 py-12 sm:px-12">
          <h2 className="text-h2 max-w-[22ch]">Buying in Lagos, Abuja, Dakar or Bamako soon?</h2>
          <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-[#C3C3CC]">
            Join the waitlist with the city and rough budget. We open Verify to the waitlist first, city by city.
          </p>
          <Link href="/waitlist?interest=verify" className="btn-primary mt-8 no-underline">
            Join the waitlist <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Wrap>
    </div>
  )
}
