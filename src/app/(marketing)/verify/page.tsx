import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Landmark, Scale, ShieldCheck } from 'lucide-react'
import { SectionHead, Wrap } from '@/components/marketing/page-intro'
import {
  CityMarquee,
  CountUp,
  CtaBand,
  GlowTile,
  PageHero,
  ParallaxBand,
  ReportCard,
  StepStory,
  type Story,
} from '@/components/marketing/cinematic'
import { FEES } from '@/lib/business/offer'

export const metadata: Metadata = {
  title: 'TIGI Verify — title checks and escrow',
  description:
    'Before you pay for land or a home in Nigeria, Senegal or Mali, TIGI checks the title at the official registry and holds your money in licensed escrow until the deed is yours.',
}

// ---------------------------------------------------------------------------
// /verify — TIGI Verify, the launch product (Business Plan v2 §2).
// Cinematic hero → city ribbon → scroll-story of the five steps → animated
// title report → parallax statement → limits → prices → closing band.
// ---------------------------------------------------------------------------

const STEPS: Story[] = [
  {
    t: 'Tell us about the property',
    d: 'Who is selling, the title, survey or plot number, and where it is. Upload what the seller gave you.',
    meta: 'About five minutes',
    photo: 'lagosAerial',
  },
  {
    t: 'We search the registry',
    d: 'A partner notary or lawyer searches the official land registry in person, checks the seller’s identity and looks for court cases, charges and government acquisitions.',
    meta: 'In person · at the official registry',
    photo: 'dakarCity',
  },
  {
    t: 'You get a written report',
    d: 'A plain-language title report: clear, clear with conditions, or do not proceed, with the evidence behind each finding.',
    meta: 'Clear · Conditions · Do not proceed',
    photo: 'goreeStreet',
  },
  {
    t: 'Pay into escrow',
    d: 'If you go ahead, you pay into an account held by a licensed bank or escrow partner. Not to the seller, and not to TIGI.',
    meta: 'Licensed bank or escrow partner',
    photo: 'lagosSkyline',
  },
  {
    t: 'Deed first, then money',
    d: 'The partner releases the money only once the transfer is registered in your name. The deed and report are saved to your Legacy vault.',
    meta: 'Saved to your Legacy vault',
    photo: 'dakarCoast',
  },
]

const REPORT_ROWS: Array<[string, string]> = [
  ['Registered owner', 'Matches the seller'],
  ['Title document', 'Genuine, registered'],
  ['Mortgages and charges', 'None found'],
  ['Court cases and caveats', 'None open'],
  ['Government acquisition', 'Not affected'],
  ['Survey plan', 'Matches the plot'],
  ['Seller identity', 'Verified'],
  ['Family or community claims', 'None raised locally'],
]

const LIMITS = [
  {
    icon: Scale,
    t: 'Not legal advice',
    d: 'Verify is a check and a protected payment. Partner lawyers can advise you separately.',
  },
  {
    icon: Landmark,
    t: 'The registry is the record',
    d: 'The official registry remains the legal record. TIGI reports what it shows, and what local enquiries find.',
  },
  {
    icon: ShieldCheck,
    t: 'Lower risk, not zero',
    d: 'A clear report lowers risk; it cannot remove it. TIGI carries professional liability cover for its checks.',
  },
]

export default function VerifyPage() {
  const check = FEES.find((f) => f.item === 'Title check')
  const escrow = FEES.find((f) => f.item === 'Escrow')

  return (
    <div className="pb-24 md:pb-32">
      <PageHero
        live
        photo="lagosNight"
        eyebrow="TIGI Verify · Launching in Nigeria, Senegal and Mali"
        title="Know it’s real before you pay."
        lede={
          <p>
            Buying land or a home back home from abroad usually means wiring money to someone you have never met for a
            paper you can&apos;t check. Verify checks the title at the official registry and keeps your money in licensed
            escrow until the deed is registered in your name.
          </p>
        }
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/waitlist?interest=verify" className="btn-primary no-underline">
            Get Verify when it opens <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/fees" className="btn-glass no-underline">
            See the fees
          </Link>
        </div>
      </PageHero>

      <div id="content" className="scroll-mt-24">
        <CityMarquee items={['Lagos', 'Dakar', 'Abuja', 'Bamako', 'Port Harcourt', 'Thiès', 'Ibadan', 'Ségou']} />
      </div>

      {/* 01 How it works — scroll story */}
      <Wrap className="mt-24 md:mt-32">
        <SectionHead num="01" label="How it works" title="Five steps from a plot number to a deed in your name." />
        <div className="mt-6 lg:mt-10">
          <StepStory steps={STEPS} />
        </div>
      </Wrap>

      {/* 02 What we check — animated title report */}
      <Wrap className="mt-20 md:mt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_440px] lg:gap-20">
          <div>
            <SectionHead num="02" label="The title report" title="Eight checks before a single naira or franc moves." />
            <p data-reveal="up" className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-[#C3C3CC]">
              Every report covers the same ground, in plain language, with the evidence behind each line: the registry
              extract, the survey, the court search and what neighbours and family say on the ground.
            </p>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-white/[0.08] pt-8">
              {[
                { n: 8, s: '', l: 'checks on every title' },
                { n: 1, s: '', l: 'registry search, in person' },
                { n: 0, s: '', l: 'money released before the deed' },
              ].map((x, i) => (
                <div key={x.l} data-reveal="up" data-reveal-delay={String(i * 120)}>
                  <dt className="figure text-[clamp(2.6rem,2rem+2vw,3.8rem)] leading-none text-violet-100 [text-shadow:0_0_30px_rgba(139,92,246,0.6)]">
                    <CountUp to={x.n} suffix={x.s} />
                  </dt>
                  <dd className="mt-3 text-[14px] leading-snug text-[#A0A0B2]">{x.l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div data-reveal="right">
            <ReportCard
              kicker="Title report · Sample"
              title="Plot 14, Lekki Phase 1"
              place="Lagos State · 648 m²"
              rows={REPORT_ROWS}
              footer={
                <div className="rounded-xl bg-black/70 px-5 py-4 ring-1 ring-white/[0.06]">
                  <p className="text-label">Escrow</p>
                  <p className="mt-1.5 text-[14px] text-[#E4E4EC]">Held by licensed partner · released on registration</p>
                </div>
              }
            />
            <p className="text-caption mt-3">Illustration · Not a real property or report</p>
          </div>
        </div>
      </Wrap>

      {/* Statement */}
      <div className="mt-24 md:mt-32">
        <ParallaxBand photo="dakarMonument" kicker="The one rule Verify never breaks" statement="Deed first. Then the money.">
          <p className="max-w-[52ch] text-[17px] leading-relaxed text-[#D4D4DE]">
            Your payment waits with a licensed partner. It moves to the seller only when the registry shows the property
            in your name.
          </p>
        </ParallaxBand>
      </div>

      {/* 03 Limits */}
      <Wrap className="mt-16 md:mt-24">
        <SectionHead num="03" label="Limits" title="What Verify is not." />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {LIMITS.map(({ icon: Icon, t, d }, i) => (
            <li key={t} data-reveal="up" data-reveal-delay={String(i * 110)}>
              <GlowTile>
                <span className="tile-icon">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-h3 mt-6">{t}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#B4B4C0]">{d}</p>
              </GlowTile>
            </li>
          ))}
        </ul>
      </Wrap>

      {/* 04 Price */}
      <Wrap className="mt-24 md:mt-32">
        <SectionHead num="04" label="Price" title="Simple, and paid only for what you use." />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div data-reveal="up">
            <GlowTile innerClassName="!p-9">
              <p className="text-label">{check?.item}</p>
              <p className="figure mt-6 text-[clamp(3.4rem,2.4rem+3.6vw,5.6rem)] leading-none [text-shadow:0_0_40px_rgba(139,92,246,0.45)]">
                <CountUp to={150} prefix="$" />
              </p>
              <p className="mt-3 text-[16px] text-[#E4E4EC]">per property</p>
              <p className="mt-6 border-t border-white/[0.08] pt-5 text-[15px] text-[#A0A0B2]">{check?.when}.</p>
            </GlowTile>
          </div>
          <div data-reveal="up" data-reveal-delay="120">
            <GlowTile innerClassName="!p-9">
              <p className="text-label">{escrow?.item}</p>
              <p className="figure mt-6 text-[clamp(3.4rem,2.4rem+3.6vw,5.6rem)] leading-none [text-shadow:0_0_40px_rgba(139,92,246,0.45)]">
                <CountUp to={1} suffix="%" />
              </p>
              <p className="mt-3 text-[16px] text-[#E4E4EC]">of the price, minimum $250</p>
              <p className="mt-6 border-t border-white/[0.08] pt-5 text-[15px] text-[#A0A0B2]">{escrow?.when}.</p>
            </GlowTile>
          </div>
        </div>
        <p className="mt-4 text-caption">
          Launch prices we are testing in our first 90 days. The price you pay is always shown before you order.
        </p>
      </Wrap>

      {/* Close */}
      <div className="mt-24 md:mt-32">
        <CtaBand
          photo="nigeriaNight"
          title="Buying in Lagos, Abuja, Dakar or Bamako soon?"
          body={<p>Join the waitlist with the city and rough budget. We open Verify to the waitlist first, city by city.</p>}
        >
          <Link href="/waitlist?interest=verify" className="btn-primary no-underline">
            Join the waitlist <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/fees" className="btn-glass no-underline">
            All fees
          </Link>
        </CtaBand>
      </div>
    </div>
  )
}
