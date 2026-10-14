import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageIntro, SectionHead, Wrap } from '@/components/marketing/page-intro'
import { MARKETS, MARKET_STATUS_LABEL, PRODUCTS } from '@/lib/business/offer'

export const metadata: Metadata = {
  title: 'About',
  description: 'Why TIGI exists, who is building it, and where it launches first.',
}

// ---------------------------------------------------------------------------
// /about — mission, founder, markets, structure.
// ---------------------------------------------------------------------------

export default function AboutPage() {
  return (
    <div className="pb-24 md:pb-32">
      <PageIntro
        eyebrow="About TIGI"
        title="Property you can trust, from anywhere."
        photo="lagosWaterfront"
        lede={
          <>
            <p>
              Millions of Africans abroad send money home to buy land and build. Too often the plot was sold twice,
              the seller didn&apos;t own it, or the house is lost to a family dispute a generation later.
            </p>
            <p className="mt-4">
              TIGI makes property in Africa safe to buy, share and pass on. We start with the check every buyer needs,
              add regulated shares where the law allows, and keep families&apos; records for the long run.
            </p>
          </>
        }
      />

      <Wrap className="mt-24">
        <SectionHead num="01" label="What we build" title="Three products, in this order." />
        <ol className="tray mt-12 grid gap-1.5 md:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <li key={p.id} data-reveal="up" data-reveal-delay={String(i * 100)} className="cell p-7">
              <span className="font-mono text-xs text-violet-300">0{i + 1}</span>
              <h3 className="text-h3 mt-5">{p.name}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[#C3C3CC]">{p.short}</p>
              <p className="text-label mt-6 !text-[10px]">{p.status}</p>
            </li>
          ))}
        </ol>
      </Wrap>

      <Wrap className="mt-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <SectionHead num="02" label="Founder" title="Issa Sissoko" />
            <div data-reveal="up" className="mt-8 space-y-4 text-[15.5px] leading-relaxed text-[#C3C3CC]">
              <p>
                Issa is an AI filmmaker and creative technologist, Malian and French, based between New York and
                Montréal. He has watched families in the diaspora lose savings to land they never got to own.
              </p>
              <p>
                He built TIGI&apos;s working beta himself: the marketplace, portfolio, Legacy and land modules. TIGI is
                now hiring its first team in technology, compliance, African operations, property partnerships and
                growth.
              </p>
            </div>
          </div>
          <div>
            <SectionHead num="03" label="Structure" title="Built to hold real ownership." />
            <ul className="mt-8 space-y-3">
              {[
                ['TIGI Inc.', 'Delaware parent company, for investors and the US track.'],
                ['Africa holding company', 'Holds TIGI’s African operations, planned in Mauritius.'],
                ['One company per property', 'Each building sits in its own local company, citizen-owned where the law requires it.'],
                ['Licensed partners', 'Banks, escrow agents, notaries, transfer agents and property managers in each market.'],
              ].map(([t, d], i) => (
                <li key={t} data-reveal="up" data-reveal-delay={String(i * 80)} className="panel p-5">
                  <p className="text-[15px] font-medium text-[#F5F5F7]">{t}</p>
                  <p className="mt-1 text-[14.5px] text-[#B4B4C0]">{d}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-caption">Planned structure, subject to legal advice in each country.</p>
          </div>
        </div>
      </Wrap>

      <Wrap className="mt-24">
        <SectionHead num="04" label="Where we start" title="Launch order." />
        <ul className="tray mt-12 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETS.map((m, i) => (
            <li key={m.country} data-reveal="up" data-reveal-delay={String((i % 4) * 80)} className="cell p-6">
              <p className="text-label !text-[10px]">{MARKET_STATUS_LABEL[m.status]}</p>
              <p className="mt-3 text-[17px] font-medium text-[#F5F5F7]">{m.country}</p>
              <p className="mt-1 text-[14px] text-violet-200">{m.products}</p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[#9A9AAA]">{m.route}</p>
            </li>
          ))}
        </ul>
      </Wrap>

      <Wrap className="mt-24">
        <div data-reveal="scale" className="panel grid gap-8 px-7 py-12 sm:px-12 md:grid-cols-2 md:items-end">
          <div>
            <h2 className="text-h2">Get in touch</h2>
            <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-[#C3C3CC]">
              Buyers, developers, notaries, diaspora associations and investors in TIGI itself: leave your details and
              what you&apos;re interested in, and Issa will reply personally.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/waitlist" className="btn-primary no-underline">
              Join the waitlist <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/waitlist?interest=investor" className="btn-glass no-underline">
              I’d like to invest in TIGI
            </Link>
          </div>
        </div>
      </Wrap>
    </div>
  )
}
