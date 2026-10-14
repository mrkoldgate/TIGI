import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SectionHead, Wrap } from '@/components/marketing/page-intro'
import { CityMarquee, CtaBand, GlowTile, PageHero, ParallaxBand } from '@/components/marketing/cinematic'
import { MARKETS, MARKET_STATUS_LABEL, PRODUCTS } from '@/lib/business/offer'
import { photoUrl, PHOTOS, type PhotoKey } from '@/lib/photography'

export const metadata: Metadata = {
  title: 'About',
  description: 'Why TIGI exists, who is building it, and where it launches first.',
}

// ---------------------------------------------------------------------------
// /about — mission, founder, markets, structure.
// ---------------------------------------------------------------------------

const PRODUCT_PHOTOS: Record<string, PhotoKey> = {
  verify: 'abujaHomes',
  shares: 'nairobiSkyline',
  legacy: 'orangeHouse',
}

const STRUCTURE: Array<[string, string]> = [
  ['TIGI Inc.', 'Delaware parent company, for investors and the US track.'],
  ['Africa holding company', 'Holds TIGI’s African operations, planned in Mauritius.'],
  ['One company per property', 'Each building sits in its own local company, citizen-owned where the law requires it.'],
  ['Licensed partners', 'Banks, escrow agents, notaries, transfer agents and property managers in each market.'],
]

export default function AboutPage() {
  return (
    <div className="pb-24 md:pb-32">
      <PageHero
        photo="lagosSkyline"
        eyebrow="About TIGI"
        title="Property you can trust, from anywhere."
        lede={
          <>
            <p>
              Millions of Africans abroad send money home to buy land and build. Too often the plot was sold twice, the
              seller didn&apos;t own it, or the house is lost to a family dispute a generation later.
            </p>
            <p className="mt-4">
              TIGI makes property in Africa safe to buy, share and pass on. We start with the check every buyer needs,
              add regulated shares where the law allows, and keep families&apos; records for the long run.
            </p>
          </>
        }
      />

      <div id="content" className="scroll-mt-24">
        <CityMarquee items={['Lagos', 'Dakar', 'Abuja', 'Bamako', 'Nairobi', 'New York', 'Paris', 'Montréal']} />
      </div>

      {/* 01 Products */}
      <Wrap className="mt-24 md:mt-32">
        <SectionHead num="01" label="What we build" title="Three products, in this order." />
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <li key={p.id} data-reveal="up" data-reveal-delay={String(i * 120)}>
              <Link href={p.href} className="group block h-full no-underline">
                <GlowTile innerClassName="!p-0 overflow-hidden flex flex-col">
                  <div className="photo-card relative aspect-[4/3] !rounded-none">
                    <Image
                      src={photoUrl(PRODUCT_PHOTOS[p.id], 900, 75)}
                      alt={PHOTOS[PRODUCT_PHOTOS[p.id]].alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                    <span className="story-numeral absolute bottom-3 left-5 !text-[64px] !animate-none">0{i + 1}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h3 className="text-h3 flex items-center gap-2">
                      {p.name}
                      <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-[#C3C3CC]">{p.short}</p>
                    <p className="text-label mt-auto pt-6 !text-[10px] !text-violet-200">{p.status}</p>
                  </div>
                </GlowTile>
              </Link>
            </li>
          ))}
        </ol>
      </Wrap>

      {/* Statement */}
      <div className="mt-24 md:mt-32">
        <ParallaxBand
          photo="dakarMonument"
          kicker="Why TIGI exists"
          statement="Too many family homes are lost to a paper nobody checked."
        />
      </div>

      {/* 02 Founder + 03 Structure */}
      <Wrap className="mt-16 md:mt-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHead num="02" label="Founder" title="Built by a filmmaker who builds." />
            <div data-reveal="up" className="mt-10">
              <GlowTile innerClassName="!p-8">
                <div className="flex items-center gap-5">
                  <span className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8F82FA] to-[#5A42E6] font-display text-[28px] font-semibold text-white shadow-[0_0_50px_rgba(110,91,243,0.7)]">
                    IS
                  </span>
                  <div>
                    <p className="text-h3 !text-[24px]">Issa Sissoko</p>
                    <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-violet-200">Founder · New York</p>
                  </div>
                </div>
                <div className="mt-7 space-y-4 text-[15.5px] leading-relaxed text-[#C3C3CC]">
                  <p>Issa is an AI filmmaker and creative technologist, Malian and French, based in New York.</p>
                  <p>
                    He built TIGI&apos;s working beta himself: the marketplace, portfolio, Legacy and land modules. TIGI is
                    now hiring its first team in technology, compliance, African operations, property partnerships and
                    growth.
                  </p>
                </div>
              </GlowTile>
            </div>
          </div>

          <div>
            <SectionHead num="03" label="Structure" title="Built to hold real ownership." />
            <ol className="relative mt-10 space-y-4 pl-12">
              <span
                className="absolute bottom-8 left-[15px] top-8 w-[2px] rounded-full bg-gradient-to-b from-violet-300 via-violet-500 to-fuchsia-400 shadow-[0_0_14px_rgba(167,139,250,0.9)]"
                aria-hidden="true"
              />
              {STRUCTURE.map(([t, d], i) => (
                <li key={t} data-reveal="left" data-reveal-delay={String(i * 120)} className="relative">
                  <span
                    className="absolute -left-12 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-violet-300/70 bg-[#1a1433] font-mono text-[11px] text-violet-100 shadow-[0_0_0_5px_rgba(110,91,243,0.12),0_0_22px_rgba(139,92,246,0.7)]"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <GlowTile tilt={3} innerClassName="!p-5">
                    <p className="text-[15.5px] font-medium text-[#F5F5F7]">{t}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-[#B4B4C0]">{d}</p>
                  </GlowTile>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-caption">Planned structure, subject to legal advice in each country.</p>
          </div>
        </div>
      </Wrap>

      {/* 04 Launch order */}
      <Wrap className="mt-24 md:mt-32">
        <SectionHead num="04" label="Where we start" title="Launch order." />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETS.map((m, i) => (
            <li key={m.country} data-reveal="up" data-reveal-delay={String((i % 4) * 90)}>
              <GlowTile innerClassName="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#8E8E9C]">{m.flag}</span>
                  <span
                    className={`pill !py-1 !text-[11px] ${
                      m.status === 'first' ? 'text-violet-100' : m.status === 'next' ? 'text-[#C3C3CC]' : 'text-[#9A9AAA]'
                    }`}
                  >
                    {m.status === 'first' && <span className="live-dot" aria-hidden="true" />}
                    {MARKET_STATUS_LABEL[m.status]}
                  </span>
                </div>
                <p className="mt-8 font-display text-[28px] font-[500] leading-none text-[#F5F5F7]" style={{ fontStretch: '110%' }}>
                  {m.country}
                </p>
                <p className="mt-3 text-[14px] text-violet-200">{m.products}</p>
                <p className="mt-4 text-[13.5px] leading-relaxed text-[#9A9AAA]">{m.route}</p>
              </GlowTile>
            </li>
          ))}
        </ul>
      </Wrap>

      {/* Contact */}
      <div className="mt-24 md:mt-32">
        <CtaBand
          photo="abujaHomes"
          title="Get in touch"
          body={
            <p>
              Buyers, developers, notaries, diaspora associations and investors in TIGI itself: leave your details and
              what you&apos;re interested in, and Issa will reply personally.
            </p>
          }
        >
          <Link href="/waitlist" className="btn-primary no-underline">
            Join the waitlist <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/waitlist?interest=investor" className="btn-glass no-underline">
            I’d like to invest in TIGI
          </Link>
        </CtaBand>
      </div>
    </div>
  )
}
