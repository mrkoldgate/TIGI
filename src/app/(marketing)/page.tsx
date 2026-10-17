import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, Plus } from 'lucide-react'
import { photoUrl, PHOTOS, type PhotoKey } from '@/lib/photography'
import { PRODUCTS, LISTING_CHECKS, MARKETS, MARKET_STATUS_LABEL, PRINCIPLES } from '@/lib/business/offer'
import { ParallaxImage } from '@/components/motion/parallax'
import { HeroFilm } from '@/components/marketing/hero-film'
import { MouseTiltCard } from '@/components/ui/interactions'
import { MarketTable } from '@/components/marketing/market-table'
import { OrderTicket } from '@/components/marketing/order-ticket'
import { WaveChars, WaveHeadline } from '@/components/motion/wave-text'
import { ScrollCraftStage } from '@/components/motion/scrollcraft-stage'

// ---------------------------------------------------------------------------
// TIGI Homepage — v6 "Africa first"
// Same v5 look (black glass, violet, wave titles, photography as content),
// repositioned on Business Plan v2: TIGI Verify is the wedge, Shares follow
// where licensed, Legacy keeps families. Products, markets, checks and fees
// come from src/lib/business/offer.ts so the site and the plan stay in step.
// Every number here is a sourced statistic, a product rule, or sample data
// labelled as such.
//
// Scroll score (scrollcraft engine, src/vendor/scrollcraft — see
// docs/scrollcraft-home.md): film hero → flow intro → PIN problem (headline
// assembles, three sourced figures count in one at a time) → REVEAL products
// (photos wipe up in turn) → PIN verify, the peak (the steps advance while the
// sample title report checks itself, row by row) → PAN markets (vertical
// scroll travels the photo rail sideways) → flow shares → IRIS legacy → flow.
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <HeroFilm />
      <ScrollCraftStage>
        <Intro />
        <Problem />
        <Products />
        <VerifyChapter />
        <Markets />
        <SharesChapter />
        <LegacyChapter />
        <Intelligence />
        <Trust />
        <Faq />
        <Closing />
      </ScrollCraftStage>
    </>
  )
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function Wrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>{children}</div>
}

/** Chapter header — running mono label (Amissa manual borrow) + display heading */
function Chapter({
  num,
  label,
  title,
  lede,
  id,
}: {
  num: string
  label: string
  title: string
  lede?: React.ReactNode
  id?: string
}) {
  return (
    <header id={id} className="scroll-mt-28">
      <div data-reveal="fade" className="mb-8 flex items-center gap-4 border-t border-[rgba(255,255,255,0.09)] pt-5">
        <span className="section-num">{num}</span>
        <span className="text-label">{label}</span>
      </div>
      <h2 data-reveal="wave" className="text-display max-w-[18ch]">
        <WaveChars text={title} />
      </h2>
      {lede && (
        <p data-reveal="up" data-reveal-delay="150" className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-[#C3C3CC]">
          {lede}
        </p>
      )}
    </header>
  )
}

/** Photo plate with gutter caption (MANNA borrow) */
function Plate({
  photo,
  caption,
  className = '',
  sizes = '100vw',
  priority = false,
}: {
  photo: PhotoKey
  caption?: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <figure data-reveal="scale">
      <ParallaxImage src={photoUrl(photo, 2000)} alt={PHOTOS[photo].alt} sizes={sizes} priority={priority} className={className} />
      {caption && (
        <figcaption className="mt-3 flex justify-between gap-4 text-caption">
          <span>{caption}</span>
          <span className="hidden sm:inline">Photo · {PHOTOS[photo].credit}</span>
        </figcaption>
      )}
    </figure>
  )
}


// ---------------------------------------------------------------------------
// Header — the brand film (land → buildings → vortex → glass "T" lockup)
// ---------------------------------------------------------------------------
// HeroFilm lives in components/marketing/hero-film.tsx (client: playback,
// sound, replay). Below it, the intro carries the page's h1 and the message.

function Intro() {
  return (
    <section id="intro" className="scroll-mt-24 pb-10 pt-16 md:pt-24">
      <Wrap>
        <div className="flex items-center justify-between text-label text-[#C3C3CC]">
          <span>Property in Africa · Verify · Shares · Legacy</span>
          <span className="hidden sm:inline">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#22D3EE] align-middle shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse-glow" />
            Private beta
          </span>
        </div>

        <div className="mt-12 grid items-end gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <WaveHeadline
              className="text-hero max-w-[15ch] min-h-[2.1em]"
              phrases={[
                'Own property in Africa, safely.',
                'Every title checked at the registry.',
                'Your money held until the deed moves.',
                'Pass it on to who you choose.',
              ]}
            />
            <p data-reveal="up" className="mt-6 max-w-[54ch] text-[18px] leading-relaxed text-[#D4D4DE]">
              Buying a plot or a home back home shouldn&apos;t mean trusting a paper nobody can check. TIGI
              verifies the title at the official registry, holds your money with a licensed escrow partner
              until the deed is yours, and records who inherits it.
            </p>
            <div data-reveal="up" data-reveal-delay="120" className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/waitlist" className="btn-primary no-underline">
                Join the waitlist <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/verify" className="btn-glass no-underline">
                How Verify works
              </Link>
            </div>
          </div>
          <Plate
            photo="lagosSkyline"
            className="aspect-[4/3] lg:aspect-[4/5]"
            sizes="(min-width: 1024px) 40vw, 100vw"
            caption="Lagos, Nigeria"
          />
        </div>

        {/* Facts strip — product rules, not marketing stats */}
        <dl data-reveal="up" className="tray mt-14 grid grid-cols-2 gap-1.5 md:grid-cols-4">
          {[
            ['Title check', 'At the official registry'],
            ['Your money', 'Held by licensed escrow'],
            ['Launching', 'Nigeria · Senegal · Mali'],
            ['Crypto wallet', 'Never required'],
          ].map(([k, v]) => (
            <div key={k} className="cell px-5 py-4">
              <dt className="text-label">{k}</dt>
              <dd className="mt-1.5 text-[15px] text-[#F5F5F7]">{v}</dd>
            </div>
          ))}
        </dl>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 01 The problem — three sourced numbers
// ---------------------------------------------------------------------------

const PROBLEM_STATS: Array<{ figure: string; label: string; source: string }> = [
  { figure: '~10%', label: 'of Africa’s rural land is formally registered.', source: 'World Bank' },
  { figure: '$56bn', label: 'sent home to sub-Saharan Africa in 2024, much of it to buy land and build.', source: 'World Bank' },
  { figure: '~40%', label: 'of ordinary court cases in Mali are land disputes.', source: 'APA News' },
]

// Pinned act (span 3.2): the question holds on the left while the three
// sourced figures arrive one at a time and count up to their real values.
const PROBLEM_COUNTS: Array<{ pre: string; to: string; post: string }> = [
  { pre: '~', to: '10', post: '%' },
  { pre: '$', to: '56', post: 'bn' },
  { pre: '~', to: '40', post: '%' },
]

function Problem() {
  return (
    <section id="problem" data-sc-act="pin" data-sc-span="3.2" className="sc-problem scroll-mt-24 bg-[#060509]">
      <div data-sc-stage className="overflow-hidden">
        <Wrap className="flex h-full flex-col justify-center gap-10 py-20 lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-label" data-sc-cue="0 1 0 0.1">The problem</p>
            <h2 className="text-display mt-6 max-w-[14ch]" data-sc-cue="0 0.97 0 0.08">
              The paper says it’s yours. Is it?
            </h2>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-[#C3C3CC]" data-sc-cue="0 0.97 0 0.08">
              Across much of Africa, buying property means trusting a document nobody can easily check. Plots are sold
              twice, sold by people who don’t own them, or don’t exist.
            </p>
          </div>
          <dl className="relative min-h-[15rem] lg:min-h-[19rem]">
            {PROBLEM_STATS.map((st, i) => {
              const c = PROBLEM_COUNTS[i]
              // one figure at a time: short ramps so two big numbers never sit on top of each other for long
              const from = 0.1 + i * 0.29
              const win = i === PROBLEM_STATS.length - 1 ? `${from} 1 0.12 0.05` : `${from} ${from + 0.31} 0.14 0.12`
              return (
                <div key={st.figure} className="absolute inset-0" data-sc-cue={win}>
                  <dt className="figure text-[clamp(4.5rem,3rem+6vw,8.5rem)] leading-none">
                    {c.pre}
                    <span data-sc-count={`0 ${c.to}`} data-sc-count-at={`${from} ${from + 0.14}`}>{c.to}</span>
                    {c.post}
                  </dt>
                  <dd className="mt-5 max-w-[34ch] text-[19px] leading-snug text-[#E4E4EC]">{st.label}</dd>
                  <dd className="text-label mt-4 !text-[10px]">Source · {st.source}</dd>
                </div>
              )
            })}
          </dl>
        </Wrap>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 02 Products — Verify, Shares, Legacy
// ---------------------------------------------------------------------------

const PRODUCT_PHOTOS: Record<string, PhotoKey> = {
  verify: 'abujaHomes',
  shares: 'nairobiSkyline',
  legacy: 'orangeHouse',
}

function Products() {
  return (
    <section id="products" data-sc-act="flow" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <Chapter
          num="02"
          label="What TIGI does"
          title="Check it. Share it. Pass it on."
          lede="Three products, one account. Verify comes first because every property on TIGI has to pass it."
        />
        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <li key={p.id} data-reveal="up" data-reveal-delay={String(i * 110)}>
              <Link href={p.href} className="panel panel-hover group flex h-full flex-col overflow-hidden no-underline">
                {/* the photo wipes up into its frame, one product after another */}
                <div className="plate relative aspect-[4/3]" data-sc-reveal="up" data-sc-reveal-at={`${0.2 + i * 0.07} ${0.45 + i * 0.07}`}>
                  <Image
                    src={photoUrl(PRODUCT_PHOTOS[p.id], 900, 75)}
                    alt={PHOTOS[PRODUCT_PHOTOS[p.id]].alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="zoom-img object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-label">{p.status}</p>
                  <h3 className="text-h3 mt-3 flex items-center gap-2">
                    {p.name}
                    <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </h3>
                  <p className="mt-2 text-[15px] font-medium text-[#E4E4EC]">{p.short}</p>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-[#B4B4C0]">{p.body}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 03 Verify — steps + sample title report
// ---------------------------------------------------------------------------

const VERIFY_STEPS = [
  { t: 'Send us the property', d: 'The seller’s name, the title or survey number, and where it is. Takes five minutes.' },
  { t: 'We check it at the registry', d: 'TIGI and a partner notary search the official registry, the seller and any open disputes.' },
  { t: 'Your money waits in escrow', d: 'You pay into a licensed escrow account, not to the seller and not to TIGI.' },
  { t: 'The deed moves, then the money', d: 'Funds are released only when the deed is registered in your name.' },
]

// THE PEAK. Pinned act (span 4.2, the longest on the page): the four steps
// advance on the left while the sample title report on the right checks
// itself, row by row, under a scan line, and flips from "Checking" to "Clear"
// as the last step lands. The report is driven from the act's --sc-p in CSS
// (.sc-report in globals.css). On phones the act unpins and reads as a page.
const REPORT_ROWS: Array<[string, string]> = [
  ['Registry search', 'Owner matches seller'],
  ['Certificate of Occupancy', 'Genuine, registered'],
  ['Encumbrances', 'None found'],
  ['Court records', 'No open disputes'],
  ['Government acquisition', 'Not affected'],
]

function VerifyChapter() {
  return (
    <>
      <section id="verify" data-sc-act="pin" data-sc-span="4.2" className="sc-verify sc-unpin-mobile scroll-mt-24 bg-[#07060D]">
        <div data-sc-stage className="overflow-hidden">
          <Wrap className="grid h-full content-center gap-10 py-16 lg:grid-cols-[1fr_400px] lg:gap-20">
            <div>
              <p className="text-label" data-sc-cue="0 1 0 0.06">TIGI Verify</p>
              <h2 className="text-display mt-5 max-w-[16ch]" data-sc-cue="0 1 0 0.06">
                Know before you pay.
              </h2>
              <p className="mt-5 max-w-[52ch] text-[16.5px] leading-relaxed text-[#C3C3CC]" data-sc-cue="0 1 0 0.06">
                For anyone buying land or a home in Nigeria, Senegal or Mali, especially from abroad. You get a written
                title report and your money stays protected until the property is legally yours.
              </p>
              <ol className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {VERIFY_STEPS.map((st, i) => (
                  <li key={st.t} className="sc-step border-t border-white/[0.1] pt-4" data-sc-cue={`${0.08 + i * 0.17} 1 0.25 0.04`}>
                    <h3 className="text-h4">{st.t}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-[#B4B4C0]">{st.d}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sample title report: checks itself as the steps advance */}
            <figure aria-label="Illustration of a TIGI title report" className="self-center" data-sc-cue="0 1 0 0.06">
              <div className="sc-report glass-glossy edge-lit relative overflow-hidden rounded-2xl p-6">
                <span className="sc-report__scan" aria-hidden="true" />
                <div className="flex items-center justify-between">
                  <span className="text-label">Title report · Sample</span>
                  <span className="sc-report__status pill !py-1 !text-[11px]">
                    <span className="sc-report__checking text-[#C3C3CC]">Checking…</span>
                    <span className="sc-report__clear text-emerald-200">
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" aria-hidden="true" />
                      Clear
                    </span>
                  </span>
                </div>
                <p className="mt-5 text-[17px] font-medium text-[#F5F5F7]">Plot 14, Lekki Phase 1</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8E8E9C]">Lagos State · 648 m²</p>

                <ul className="mt-6 space-y-3 text-sm">
                  {REPORT_ROWS.map(([k, v], i) => (
                    <li
                      key={k}
                      className="sc-report__row flex justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                      style={{ '--at': 0.12 + i * 0.13 } as React.CSSProperties}
                    >
                      <span className="text-[#8E8E9C]">{k}</span>
                      <span className="sc-report__val text-right text-[#F5F5F7]">
                        <Check className="sc-report__tick mr-1.5 inline h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                        {v}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-lg bg-black px-5 py-4">
                  <p className="text-label">Escrow</p>
                  <p className="mt-1.5 text-[14px] text-[#E4E4EC]">Held by licensed partner · released on registration</p>
                </div>
              </div>
              <figcaption className="mt-3 text-caption">Illustration · Not a real property or report</figcaption>
            </figure>
          </Wrap>
        </div>
      </section>

      <Wrap className="pb-16 pt-10 md:pb-24">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/verify" className="btn-glass no-underline">
            More about Verify <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/fees" className="text-sm text-[#C3C3CC] no-underline hover:text-white">
            From $150 per check · See all fees
          </Link>
        </div>
      </Wrap>
    </>
  )
}

// ---------------------------------------------------------------------------
// 04 Markets — photo rail + launch order
// ---------------------------------------------------------------------------

const PLACES: Array<{ title: string; meta: string; photo: PhotoKey }> = [
  { title: 'Lagos', meta: 'Nigeria · Verify', photo: 'lagosSkyline' },
  { title: 'Abuja', meta: 'Nigeria · Verify', photo: 'abujaHaze' },
  { title: 'Dakar', meta: 'Senegal · Verify, Legacy', photo: 'dakarCoast' },
  { title: 'Nairobi', meta: 'Kenya · Shares', photo: 'nairobiSkyline' },
  { title: 'Kigali', meta: 'Rwanda · Shares showcase', photo: 'kigaliHomes' },
  { title: 'Lekki, Lagos', meta: 'Nigeria · Verify', photo: 'lagosNight' },
  { title: 'Plots and land', meta: 'Verify first, leasing later', photo: 'greenPlots' },
]

function Markets() {
  return (
    <section id="markets" className="scroll-mt-24 pb-16 md:pb-24">
      {/* Pan act: vertical scroll travels the rail sideways. The heading is the
          rail's first item and a note closes it, so the travel has a start and
          a resolution rather than an end. */}
      <div data-sc-act="pan" data-sc-span="3.4" className="sc-markets">
        <div data-sc-stage className="overflow-hidden">
          <div className="flex h-full items-center">
            <ul className="sc-rail flex w-max items-end gap-5 px-5 sm:px-8 xl:px-[max(2rem,calc((100vw-1200px)/2+2rem))]" data-sc-pan="0.04">
              <li className="w-[min(86vw,520px)] flex-shrink-0 self-center pr-6">
                <p className="text-label">Markets</p>
                <h2 className="text-display mt-5 max-w-[12ch]">Africa first. The diaspora everywhere.</h2>
                <p className="mt-5 max-w-[42ch] text-[16.5px] leading-relaxed text-[#C3C3CC]">
                  We start where title fraud costs families most and where the law already allows each product. North
                  America runs in parallel, because that is where many buyers live.
                </p>
              </li>
              {PLACES.map((c, i) => (
                <li key={c.title} className="sc-rail__item w-[72vw] max-w-[420px] flex-shrink-0 sm:w-[380px]" style={{ '--i': i } as React.CSSProperties}>
                  <div className="photo-card plate aspect-[4/5]">
                    <Image src={photoUrl(c.photo, 900, 75)} alt={PHOTOS[c.photo].alt} fill sizes="420px" className="object-cover" />
                  </div>
                  <p className="mt-3 text-[15px] font-medium text-[#F5F5F7]">{c.title}</p>
                  <p className="text-caption mt-0.5">{c.meta}</p>
                </li>
              ))}
              <li className="w-[min(78vw,360px)] flex-shrink-0 self-center pl-4">
                <p className="text-[19px] leading-snug text-[#E4E4EC]">
                  Nigeria, Senegal and Mali first for Verify. Kenya, then the United States, for Shares.
                </p>
                <p className="text-caption mt-3">The full launch order is below.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Wrap className="mt-12">
        <div data-reveal="up" className="panel overflow-hidden">
          <div className="hidden grid-cols-[1.1fr_1fr_1.6fr_1.1fr] gap-6 border-b border-white/[0.06] px-6 py-3 md:grid">
            {['Country', 'Products', 'Why here', 'Status'].map((h) => (
              <span key={h} className="text-label !text-[10px]">{h}</span>
            ))}
          </div>
          <ul>
            {MARKETS.map((m) => (
              <li key={m.country} className="grid gap-2 border-b border-white/[0.05] px-6 py-4 last:border-0 md:grid-cols-[1.1fr_1fr_1.6fr_1.1fr] md:items-center md:gap-6">
                <span className="flex items-center gap-3 text-[15px] font-medium text-[#F5F5F7]">
                  <span className="font-mono text-[11px] text-[#8E8E9C]">{m.flag}</span>
                  {m.country}
                </span>
                <span className="text-[14px] text-[#E4E4EC]">{m.products}</span>
                <span className="text-[14px] leading-snug text-[#B4B4C0]">{m.why}</span>
                <span>
                  <span
                    className={`pill !py-1 !text-[11.5px] ${
                      m.status === 'first' ? 'text-violet-100' : m.status === 'next' ? 'text-[#C3C3CC]' : 'text-[#9A9AAA]'
                    }`}
                  >
                    {m.status === 'first' && <span className="live-dot" aria-hidden="true" />}
                    {MARKET_STATUS_LABEL[m.status]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-caption">
          Each launch depends on local counsel and the licence or exemption it needs. Order and timing may change.
        </p>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 05 Shares — how ownership works + listing checks + order ticket
// ---------------------------------------------------------------------------

const OWNERSHIP = [
  { t: 'You buy shares', d: 'You pay into a licensed escrow or broker account. TIGI never holds your money.' },
  { t: 'In a property company', d: 'Each building sits in its own local company. You own shares in that company.' },
  { t: 'That owns a checked title', d: 'The company holds the deed, checked at the official registry by TIGI Verify.' },
  { t: 'On a register that names you', d: 'The share register is the legal record. A blockchain copy lets anyone check it, and your heirs are named on it.' },
]

function SharesChapter() {
  return (
    <section id="how" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <Chapter
          num="05"
          label="TIGI Shares"
          title="Own part of a building, from about $100."
          lede="Where the law allows it, TIGI offers shares in completed rental properties. Rent is paid out to shareholders. Kenya comes first through its regulator’s sandbox, then the United States."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-20">
          <div>
            <ol className="tray grid gap-1.5 sm:grid-cols-2">
              {OWNERSHIP.map((s, i) => (
                <li key={s.t} data-reveal="up" data-reveal-delay={String(i * 110)} className="cell group p-7">
                  <span className="font-mono text-xs text-violet-300">0{i + 1}</span>
                  <h3 className="text-h3 mt-6">{s.t}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#C3C3CC]">{s.d}</p>
                </li>
              ))}
            </ol>

            <h3 data-reveal="fade" className="text-label mt-14">Before any property is offered, it must pass all five</h3>
            <ul className="mt-5 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {LISTING_CHECKS.map((c, i) => (
                <li key={c.title} data-reveal="left" data-reveal-delay={String(i * 80)} className="grid gap-1 py-4 sm:grid-cols-[260px_1fr] sm:gap-6">
                  <span className="flex items-start gap-3 text-[15px] font-medium text-[#F5F5F7]">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-300" />
                    {c.title}
                  </span>
                  <span className="text-[14.5px] leading-relaxed text-[#B4B4C0] sm:pl-0 pl-7">{c.body}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Order ticket illustration */}
          <figure aria-label="Illustration of buying shares" className="self-start" data-reveal="right">
            <OrderTicket />
            <figcaption className="mt-3 text-caption">Illustration · Not a live offering · Available only where licensed</figcaption>
          </figure>
        </div>

        {/* Sample market — asset-table pattern */}
        <div className="mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h3 data-reveal="wave" className="text-h2 max-w-[26ch]">
              <WaveChars text="A market for property, priced like one." />
            </h3>
            <p className="text-caption max-w-[40ch]">Sample listings in the markets where Shares is planned. Not live offerings; figures are hypothetical.</p>
          </div>
          <MarketTable />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/marketplace" className="btn-glass no-underline">
            See the beta marketplace <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/risks" className="text-sm text-[#C3C3CC] no-underline hover:text-white">
            Read the risks first
          </Link>
        </div>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 06 Legacy
// ---------------------------------------------------------------------------

function LegacyChapter() {
  return (
    <section id="legacy" data-sc-act="flow" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          {/* the family home opens out of a point: the page's one iris */}
          <div data-sc-reveal="iris" data-sc-reveal-at="0.12 0.48">
            <Plate photo="orangeHouse" className="aspect-[4/5]" sizes="(min-width: 1024px) 50vw, 100vw" caption="Senegal" />
          </div>

          <div className="lg:pt-10">
            <Chapter
              num="06"
              label="TIGI Legacy"
              title="Decide who inherits it, while you can."
              lede="Too many family homes are lost to missing papers and disputes after a death. Legacy keeps the deed, the documents and your wishes in one place, and walks your family through the transfer."
            />
            <ul className="mt-10 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {[
                'Named heirs for every property you own through TIGI',
                'A vault for the deed, the title report and family documents',
                'A step-by-step guide for your executor, with partner notaries',
                'A calculator for Islamic inheritance shares',
              ].map((t, i) => (
                <li key={t} data-reveal="left" data-reveal-delay={String(i * 90)} className="flex items-start gap-3 py-4 text-[15px] text-[#D4D4DE]">
                  <Plus className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-[#8E8E9C]" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] text-[#E4E4EC]">
              $5 a month or $49 a year.{' '}
              <Link href="/pricing" className="text-violet-200 no-underline hover:text-white">See plans</Link>
            </p>
            <p className="mt-3 text-caption">
              Legacy is a planning tool, not legal advice. A will or local notarial act may still be required; partner lawyers can help.
            </p>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 07 Intelligence — AI as research, never advice
// ---------------------------------------------------------------------------

function Intelligence() {
  const tiers = [
    { name: 'Free', price: 'Free', note: 'Search, basic insights and Aria' },
    { name: 'Legacy', price: '$5', note: 'Heirs, vault and executor guide' },
    { name: 'Pro', price: '$29', note: 'Deeper analytics and alerts' },
  ]
  return (
    <section id="intelligence" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <Chapter
          num="07"
          label="Intelligence"
          title="Research on every property, before you commit."
          lede="TIGI’s AI reads documents, compares prices and flags what looks wrong. It is labelled as information on every screen: not advice, and not an appraisal."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[400px_1fr] lg:gap-20">
          {/* Valuation card */}
          <figure className="self-start" data-reveal="left">
            <MouseTiltCard maxTilt={6} spotlightColor="rgba(139, 92, 246, 0.10)" className="rounded-xl">
              <div className="glass-glossy edge-lit rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="text-label">AI estimate · Sample</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#8E8E9C]">Not an appraisal</span>
                </div>
                <p className="mt-5 font-display text-[44px] font-[480] leading-none tracking-[0.01em] text-[#F5F5F7]" style={{ fontStretch: '112%' }}>
                  $212,000
                </p>
                <p className="mt-2 font-mono text-xs text-[#C3C3CC]">Range $196k – $229k · 3-bed, Westlands</p>

                <div className="relative mt-6 h-1 rounded-full bg-[#1C1C25]">
                  <span className="absolute inset-y-0 left-[22%] right-[26%] rounded-full bg-gradient-to-r from-[#6E5BF3] to-[#C4B5FD]" />
                  <span className="absolute -top-1 left-[48%] h-3 w-px bg-[#F5F5F7]" />
                </div>

                <ul className="mt-6 space-y-3 text-sm">
                  {[
                    ['Comparable sales', '3 within 1.5 km'],
                    ['Independent valuation', 'Required before listing'],
                    ['Flags', 'None found'],
                  ].map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-4">
                      <span className="text-[#8E8E9C]">{k}</span>
                      <span className="text-[#F5F5F7]">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </MouseTiltCard>
            <figcaption className="mt-3 text-caption">Illustration · Sample estimate</figcaption>
          </figure>

          <div>
            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {[
                ['Title-document reading', 'Deeds, certificates and surveys summarised, with anything unusual flagged for a human to check.'],
                ['Fraud signals', 'Listings, sellers and payments that look wrong are stopped for review before they reach you.'],
                ['Price estimates', 'A range with its comparables, always shown next to the independent valuation.'],
                ['Aria, the assistant', 'Ask about a title report, a fee or the transfer steps in plain language, in English or French.'],
              ].map(([t, d], i) => (
                <li key={t} data-reveal="up" data-reveal-delay={String((i % 2) * 100 + Math.floor(i / 2) * 80)}>
                  <h3 className="text-h4">{t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#C3C3CC]">{d}</p>
                </li>
              ))}
            </ul>

            <div className="mt-14 tray grid gap-1.5 sm:grid-cols-3">
              {tiers.map((p, i) => (
                <div key={p.name} data-reveal="up" data-reveal-delay={String(i * 100)} className="cell p-6">
                  <p className="text-label">{p.name}</p>
                  <p className="mt-3 font-display text-[28px] font-[480] text-[#F5F5F7]" style={{ fontStretch: '112%' }}>
                    {p.price}
                    {p.price !== 'Free' ? <span className="ml-1 font-body text-sm text-[#8E8E9C]">/ mo</span> : null}
                  </p>
                  <p className="mt-2 text-sm text-[#C3C3CC]">{p.note}</p>
                </div>
              ))}
            </div>
            <Link href="/pricing" className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#C3C3CC] no-underline hover:text-[#F5F5F7]">
              Compare plans <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 08 Trust — the rules TIGI follows from day one
// ---------------------------------------------------------------------------

function Trust() {
  return (
    <section id="trust" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <Chapter
          num="08"
          label="Trust"
          title="Rules we keep from day one."
          lede="Others in this market have sold tokens on homes they didn’t own and let buildings decay. These rules exist so that can’t happen here."
        />

        <div className="mt-16 tray grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} data-reveal="up" data-reveal-delay={String((i % 3) * 100)} className="cell p-7">
              <h3 className="text-h4">{p.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[#C3C3CC]">{p.body}</p>
            </div>
          ))}
        </div>

        <p data-reveal="fade" className="glass edge-lit mt-6 max-w-[80ch] rounded-xl px-5 py-4 text-sm leading-relaxed text-[#C3C3CC]">
          <span className="text-label mr-2 !text-[#22D3EE]">Private beta</span>
          No real money moves during the beta and no offering is open. Listings are sample data on Solana&apos;s test network.{' '}
          <Link href="/risks" className="text-violet-200 no-underline hover:text-white">Read the risks</Link>
        </p>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

const FAQ = [
  ['I live abroad. Can I use Verify?', 'Yes. Verify is built for buyers who can’t be there in person. You order the check online, a partner notary does the registry search locally, and your money waits in escrow until the deed is registered in your name.'],
  ['Who holds my money?', 'A licensed bank, trustee, escrow agent or broker-dealer in each market. TIGI never holds purchase money in its own accounts.'],
  ['When can I buy shares?', 'Only in countries where TIGI holds the licence or exemption it needs: Kenya first through its regulator’s sandbox, then the United States. Join the waitlist and tell us where you are.'],
  ['What do I actually own with Shares?', 'Shares in the local company that holds the property’s title. Your rights to rent and sale proceeds are set out in that property’s offering documents.'],
  ['Can I sell my shares?', 'Only where a licensed resale venue exists, and there is no guarantee of a buyer. Plan to hold for several years.'],
  ['Do I need crypto?', 'No. You pay by bank transfer or card in your currency. The blockchain is a record kept in the background; you never need a wallet.'],
  ['Is the AI giving me advice?', 'No. It summarises documents, estimates prices and flags risks. Every output is labelled as information, not advice and not an appraisal.'],
]

function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <Chapter num="09" label="Questions" title="Before you ask." />
          <div className="divide-y divide-white/[0.09] border-y border-white/[0.09]">
            {FAQ.map(([q, a], i) => (
              <details key={q} data-reveal="up" data-reveal-delay={String(i * 70)} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] text-[#F5F5F7] transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                  {q}
                  <Plus className="h-4 w-4 flex-shrink-0 text-[#8E8E9C] transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-[#C3C3CC]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Closing — waitlist
// ---------------------------------------------------------------------------

function Closing() {
  return (
    <section className="pb-24 pt-8 md:pb-32">
      <Wrap>
        <div data-reveal="scale" className="relative isolate overflow-hidden rounded-xl">
          <ParallaxImage src={photoUrl('kigaliHomes', 2000)} alt={PHOTOS.kigaliHomes.alt} sizes="(min-width: 1200px) 1200px, 100vw" className="!absolute inset-0 -z-10" strength={80} />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.65)_55%,rgba(0,0,0,0.25)_100%)]" aria-hidden="true" />
          <div className="px-7 py-16 sm:px-12 md:py-24">
            <h2 data-reveal="wave" className="text-display max-w-[16ch]">
              <WaveChars text="Buying at home? Start here." />
            </h2>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-[#D4D4DE]">
              Tell us where you want to buy and what you need. We open each market to the waitlist first.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/waitlist" className="btn-primary no-underline">
                Join the waitlist <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/waitlist?interest=list" className="btn-glass no-underline">
                I’m a developer or owner
              </Link>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  )
}
