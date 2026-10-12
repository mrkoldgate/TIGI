import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react'
import { MarketTable } from '@/components/marketing/market-table'
import { photoUrl, PHOTOS, type PhotoKey } from '@/lib/photography'
import { PLANS } from '@/lib/billing/billing-types'

// ---------------------------------------------------------------------------
// TIGI Homepage — v4 "Private Ledger"
// Mercury-led banking calm + photography as content + market patterns from
// Coinbase / Robinhood. Every number on this page is either a product rule
// (minimum, plan price) or explicitly labelled sample data.
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <Hero />
      <Collections />
      <Market />
      <HowItWorks />
      <LandChapter />
      <LegacyChapter />
      <Intelligence />
      <Trust />
      <Faq />
      <Closing />
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
  title: React.ReactNode
  lede?: React.ReactNode
  id?: string
}) {
  return (
    <header id={id} className="scroll-mt-28">
      <div className="mb-8 flex items-center gap-4 border-t border-[rgba(237,237,243,0.09)] pt-5">
        <span className="section-num">{num}</span>
        <span className="text-label">{label}</span>
      </div>
      <h2 className="text-display max-w-[18ch]">{title}</h2>
      {lede && <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-[#C3C3CC]">{lede}</p>}
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
    <figure>
      <div className={`plate ${className}`}>
        <Image src={photoUrl(photo, 2000)} alt={PHOTOS[photo].alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
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
// Hero — full-bleed photograph first, product second (Mercury)
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative isolate -mt-[72px] flex min-h-[100svh] flex-col overflow-hidden">
      <Image
        src={photoUrl('heroHouse', 2400, 82)}
        alt={PHOTOS.heroHouse.alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[50%_60%]"
      />
      {/* Legibility scrim only — keeps the photograph intact above the fold line */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(23,23,33,0.55) 0%, rgba(23,23,33,0.10) 28%, rgba(23,23,33,0.25) 55%, rgba(23,23,33,0.92) 88%, #171721 100%)',
        }}
        aria-hidden="true"
      />

      <Wrap className="flex flex-1 flex-col pb-10 pt-[120px]">
        <div className="flex items-center justify-between text-label text-[#C3C3CC]">
          <span>Fractional real estate · Land · Legacy</span>
          <span className="hidden sm:inline">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#C9A84C] align-middle animate-pulse-glow" />
            Private beta
          </span>
        </div>

        <div className="flex-1" />

        <div className="animate-slide-up">
          <h1 className="text-hero max-w-[14ch]">Own real estate by the share.</h1>
          <p className="mt-6 max-w-[52ch] text-[18px] leading-relaxed text-[#DADAE2]">
            TIGI turns homes, apartments and land into digital shares. Start from $100, collect your
            portion of the rent, lease out land, and decide who inherits it, with AI research on
            every listing.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/auth/register" className="btn-gold no-underline">
              Get early access <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#how" className="btn-ghost no-underline">
              How it works
            </Link>
          </div>
        </div>

        {/* Facts strip — product rules, not marketing stats */}
        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-[rgba(237,237,243,0.08)] md:grid-cols-4">
          {[
            ['Minimum', 'From $100'],
            ['Assets', 'Homes, apartments, land'],
            ['Records', 'Settled on Solana'],
            ['Wallet', 'Optional'],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#171721]/85 px-5 py-4 backdrop-blur-sm">
              <dt className="text-label">{k}</dt>
              <dd className="mt-1.5 text-[15px] text-[#EDEDF3]">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-caption">Plate 01 · Residential · Sample photography</p>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Collections — a browsable shelf of photography (Netflix / Prime Video /
// Apple TV rail pattern): landscape cards, horizontal scroll-snap, title
// beneath, no overlays on the image.
// ---------------------------------------------------------------------------

const COLLECTIONS: Array<{ title: string; meta: string; photo: PhotoKey }> = [
  { title: 'Desert modern', meta: 'Homes · Arizona, Nevada', photo: 'desertCabin' },
  { title: 'Working farmland', meta: 'Land · Midwest', photo: 'farmlandAerial' },
  { title: 'City apartments', meta: 'Multifamily · NY, Montréal', photo: 'apartmentsBlueHour' },
  { title: 'Coastal land', meta: 'Land · Pacific coast', photo: 'coastAerial' },
  { title: 'Evening homes', meta: 'Homes · Sun Belt', photo: 'houseDusk' },
  { title: 'Lived-in interiors', meta: 'Apartments · Furnished rentals', photo: 'interior' },
  { title: 'Soft-light residences', meta: 'Apartments · Europe', photo: 'apartmentsPink' },
]

function Collections() {
  return (
    <section aria-labelledby="collections-title" className="pt-16 md:pt-20">
      <Wrap>
        <div className="flex items-end justify-between gap-6">
          <h2 id="collections-title" className="text-h2">Browse by collection</h2>
          <span className="text-label hidden sm:inline">Scroll →</span>
        </div>
      </Wrap>
      <div className="mt-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="mx-auto flex w-max snap-x snap-mandatory gap-4 px-5 sm:px-8 xl:px-[max(2rem,calc((100vw-1200px)/2+2rem))]">
          {COLLECTIONS.map((c) => (
            <li key={c.title} className="w-[78vw] max-w-[420px] snap-start sm:w-[360px]">
              <Link href="/marketplace" className="group block no-underline">
                <div className="plate aspect-[16/10] rounded-lg">
                  <Image
                    src={photoUrl(c.photo, 900, 75)}
                    alt={PHOTOS[c.photo].alt}
                    fill
                    sizes="420px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-3 text-[15px] font-medium text-[#EDEDF3]">{c.title}</p>
                <p className="text-caption mt-0.5">{c.meta}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 01 Market — asset-table pattern (Coinbase / Robinhood)
// ---------------------------------------------------------------------------

function Market() {
  return (
    <section id="market" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <Chapter
          num="01"
          label="Market"
          title="A market for property, priced like one."
          lede="Every listing shows its share price, how its value has moved, the income it is expected to pay and how much of it is already owned. Compare a loft in Montréal with farmland in Iowa on the same terms."
        />

        <div className="mt-14">
          <MarketTable />
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption">
              Sample listings for illustration. Not live offerings. Figures are hypothetical and not a forecast.
            </p>
            <Link href="/marketplace" className="btn-ghost self-start no-underline sm:self-auto">
              Open the marketplace <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 02 How it works — business model steps + Robinhood-style order ticket
// ---------------------------------------------------------------------------

const STEPS = [
  {
    t: 'An owner lists a property',
    d: 'Homes, apartments, commercial space or land. TIGI checks the title and documents before anything goes live.',
  },
  {
    t: 'It moves into its own company',
    d: 'Each property is held by a dedicated legal entity (typically an LLC) through a conventional deed, so ownership is real and on paper.',
  },
  {
    t: 'Ownership becomes digital shares',
    d: 'Shares in that entity are issued and recorded on Solana. You can pay by card or bank, or with crypto if you prefer.',
  },
  {
    t: 'You own, earn and pass it on',
    d: 'Collect your share of rental income, sell to other members when you choose, and name who inherits your holdings.',
  },
]

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <Chapter
          num="02"
          label="How it works"
          title="From a deed to your portfolio in four steps."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-20">
          <ol className="grid gap-px overflow-hidden rounded-xl bg-[rgba(237,237,243,0.07)] sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s.t} className="bg-[#171721] p-7">
                <span className="font-mono text-xs text-[#C9A84C]">0{i + 1}</span>
                <h3 className="text-h3 mt-6">{s.t}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#C3C3CC]">{s.d}</p>
              </li>
            ))}
          </ol>

          {/* Order ticket illustration */}
          <figure aria-label="Illustration of buying shares" className="self-start">
            <div className="rounded-xl bg-[#1E1E2A] p-6">
              <div className="flex items-center gap-4">
                <div className="plate h-14 w-14 flex-shrink-0 rounded-md">
                  <Image src={photoUrl('heroHouse', 200, 70)} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-[#EDEDF3]">Reflecting Pool House</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8E8E9C]">TG-001 · $485 / share</p>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-[#171721] px-5 py-5">
                <p className="text-label">Amount</p>
                <p className="mt-2 font-display text-[40px] font-[480] leading-none tracking-[0.01em] text-[#EDEDF3]" style={{ fontStretch: '112%' }}>
                  $970
                </p>
                <div className="mt-4 flex gap-2">
                  {['$100', '$485', '$970', '$2,425'].map((a) => (
                    <span
                      key={a}
                      className={`rounded-full px-3 py-1.5 font-mono text-xs ${a === '$970' ? 'bg-[#EDEDF3] text-[#171721]' : 'bg-[#272735] text-[#C3C3CC]'}`}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ['You receive', '2 shares'],
                  ['Est. annual income', '$56'],
                  ['Platform fee', '$9.70'],
                  ['Settlement', 'Instant, on Solana'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-[#8E8E9C]">{k}</dt>
                    <dd className="font-mono tabular-nums text-[#EDEDF3]">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex w-full items-center justify-center rounded-full bg-[#EDEDF3] py-3 text-sm font-medium text-[#171721]">
                Review order
              </div>
            </div>
            <figcaption className="mt-3 text-caption">Illustration · Fees and income shown are examples</figcaption>
          </figure>
        </div>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 03 Land — full-bleed aerial photography (INVERSA / MANNA borrow)
// ---------------------------------------------------------------------------

function LandChapter() {
  return (
    <section id="land" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <Chapter
          num="03"
          label="Land"
          title="Own the ground, or lease it out."
          lede="Buy into farmland and development sites, or list your own land for lease. Growers, builders and solar developers rent it, and ground-lease income is paid to every shareholder."
        />
      </Wrap>

      <div className="mt-14 px-0 sm:px-8">
        <div className="mx-auto max-w-[1440px]">
          <Plate photo="fieldsAerial" className="aspect-[16/9] sm:aspect-[21/9]" caption="Plate 02 · Agricultural land · Sample photography" />
        </div>
      </div>

      <Wrap className="mt-14">
        <div className="grid gap-px overflow-hidden rounded-xl bg-[rgba(237,237,243,0.07)] md:grid-cols-3">
          {[
            ['Ground leases', 'Lease parcels for farming, storage or solar, with terms and rent recorded alongside the title.'],
            ['Development rights', 'Back a project from the ground up and hold a share of the land a builder develops.'],
            ['Land as a holding', 'Land rarely needs upkeep. Hold it as a long-term position next to your income properties.'],
          ].map(([t, d]) => (
            <div key={t} className="bg-[#171721] p-7">
              <h3 className="text-h3">{t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#C3C3CC]">{d}</p>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 04 Legacy
// ---------------------------------------------------------------------------

function LegacyChapter() {
  return (
    <section id="legacy" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <Plate photo="foggyHomestead" className="aspect-[4/5]" sizes="(min-width: 1024px) 50vw, 100vw" caption="Plate 03 · Homestead · Sample photography" />

          <div className="lg:pt-10">
            <Chapter
              num="04"
              label="Legacy"
              title="Decide who inherits it, while you can."
              lede="Name beneficiaries for every holding, set the conditions for a transfer, and keep the documents with the asset. When the time comes, ownership moves the way you planned, without a scramble for paperwork."
            />
            <ul className="mt-10 divide-y divide-[rgba(237,237,243,0.08)] border-y border-[rgba(237,237,243,0.08)]">
              {[
                'Beneficiaries per property or across your whole portfolio',
                'Conditional transfers, such as at an age or a date',
                'Scenario previews that show who receives what',
                'Documents and instructions stored with each asset',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 py-4 text-[15px] text-[#DADAE2]">
                  <Plus className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-[#8E8E9C]" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-caption">
              Estate tools are planning aids, not legal advice. Use a qualified professional for complex estates.
            </p>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 05 Intelligence — AI integrations + subscription tiers
// ---------------------------------------------------------------------------

function Intelligence() {
  const tiers = [PLANS.free, PLANS.pro, PLANS.pro_plus]
  return (
    <section id="intelligence" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <Chapter
          num="05"
          label="Intelligence"
          title="Research on every listing, before you commit."
          lede="TIGI's AI reads the market so you don't start from zero. Every property gets a valuation with its comparables shown, and paid plans go deeper."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[400px_1fr] lg:gap-20">
          {/* Valuation card */}
          <figure className="self-start">
            <div className="rounded-xl bg-[#1E1E2A] p-6">
              <div className="flex items-center justify-between">
                <span className="text-label">AI valuation · TG-001</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#8E8E9C]">Not an appraisal</span>
              </div>
              <p className="mt-5 font-display text-[44px] font-[480] leading-none tracking-[0.01em] text-[#EDEDF3]" style={{ fontStretch: '112%' }}>
                $485,000
              </p>
              <p className="mt-2 font-mono text-xs text-[#C3C3CC]">Range $462k – $509k · Confidence 0.82</p>

              {/* range bar */}
              <div className="relative mt-6 h-1 rounded-full bg-[#2E2E3D]">
                <span className="absolute inset-y-0 left-[22%] right-[26%] rounded-full bg-[#C3C3CC]" />
                <span className="absolute -top-1 left-[48%] h-3 w-px bg-[#EDEDF3]" />
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  ['Comparable sales', '3 within 1.2 mi'],
                  ['Rent estimate', '$2,350 / mo'],
                  ['Value drivers', 'Lot size, pool, schools'],
                ].map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-4">
                    <span className="text-[#8E8E9C]">{k}</span>
                    <span className="text-[#EDEDF3]">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <figcaption className="mt-3 text-caption">Illustration · Sample valuation</figcaption>
          </figure>

          <div>
            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {[
                ['Valuations and forecasts', 'A price estimate with its range and comparables, plus where the area is heading.'],
                ['Recommendations', 'Listings matched to your goals, budget and what you already own.'],
                ['An assistant that explains', 'Ask about a listing, a lease or the tokenization steps in plain language.'],
                ['Document reading', 'Titles, deeds and leases summarised, with the clauses that matter flagged.'],
                ['Portfolio balance', 'See your exposure by city, asset type and income, and get suggestions to rebalance.'],
                ['Risk and fraud checks', 'Unusual listings and transactions are flagged for review before they reach you.'],
              ].map(([t, d]) => (
                <li key={t}>
                  <h3 className="text-h4">{t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#C3C3CC]">{d}</p>
                </li>
              ))}
            </ul>

            {/* Tiers */}
            <div className="mt-14 grid gap-px overflow-hidden rounded-xl bg-[rgba(237,237,243,0.07)] sm:grid-cols-3">
              {tiers.map((p) => (
                <div key={p.id} className="bg-[#171721] p-6">
                  <p className="text-label">{p.name}</p>
                  <p className="mt-3 font-display text-[28px] font-[480] text-[#EDEDF3]" style={{ fontStretch: '112%' }}>
                    {p.priceMonthly === 0 ? 'Free' : `$${p.priceMonthly}`}
                    {p.priceMonthly ? <span className="ml-1 font-body text-sm text-[#8E8E9C]">/ mo</span> : null}
                  </p>
                  <p className="mt-2 text-sm text-[#C3C3CC]">{p.tagline}</p>
                </div>
              ))}
            </div>
            <Link href="/pricing" className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#C3C3CC] no-underline hover:text-[#EDEDF3]">
              Compare plans <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 06 Trust
// ---------------------------------------------------------------------------

function Trust() {
  return (
    <section id="trust" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <Chapter
          num="06"
          label="Trust"
          title="Built to hold real ownership."
          lede="Property is the largest thing most people will ever own. TIGI is designed around that, with verified members, legal structure and records you can check."
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl bg-[rgba(237,237,243,0.07)] sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Verified members', 'Everyone completes identity checks before buying, selling or listing. Browsing stays open to all.'],
            ['A legal owner for every asset', 'Each property sits in its own entity. Your shares are an economic interest defined in its offering documents.'],
            ['Records you can check', 'Every issue and transfer of shares is written to Solana, so the ownership history is public and permanent.'],
            ['No wallet required', 'Use TIGI with a normal account, or connect Phantom or Solflare if you want to hold shares yourself.'],
            ['Fees before you confirm', 'The price, fee and what you receive are shown on the order before anything is final.'],
            ['Risk, stated plainly', 'Property values can fall and shares may take time to sell. We say so on every offering.'],
          ].map(([t, d]) => (
            <div key={t} className="bg-[#171721] p-7">
              <h3 className="text-h4">{t}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[#C3C3CC]">{d}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-[80ch] rounded-lg bg-[#1E1E2A] px-5 py-4 text-sm leading-relaxed text-[#C3C3CC]">
          <span className="text-label mr-2 text-[#C9A84C]">Private beta</span>
          No real money moves during the beta. Payments run in test mode and shares are issued on Solana&apos;s test network.
        </p>
      </Wrap>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

const FAQ = [
  ['What do I actually own?', 'Shares in the legal entity that holds the property. Your rights to income and sale proceeds are set out in that property’s offering documents.'],
  ['How do I earn money?', 'Through your share of net rental or lease income, and through any change in the property’s value when you or the entity sells.'],
  ['Can I sell my shares?', 'Yes, to other verified members through the TIGI marketplace. There is no guarantee of a buyer at a given price, so plan to hold for a while.'],
  ['Do I need crypto or a wallet?', 'No. You can pay by card or bank and TIGI holds your shares for you. A Solana wallet is optional.'],
  ['What does the AI do, and can I trust it?', 'It estimates value, summarises documents and suggests listings. It is a research aid, not an appraisal or financial advice, and it always shows its comparables.'],
  ['Who can join the beta?', 'We are opening access in small groups. Request access and we will email you when your place is ready.'],
]

function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 py-16 md:py-24">
      <Wrap>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <Chapter num="07" label="Questions" title="Before you ask." />
          <div className="divide-y divide-[rgba(237,237,243,0.09)] border-y border-[rgba(237,237,243,0.09)]">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] text-[#EDEDF3] [&::-webkit-details-marker]:hidden">
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
// Closing — investor and owner paths
// ---------------------------------------------------------------------------

function Closing() {
  return (
    <section className="pb-24 pt-8 md:pb-32">
      <Wrap>
        <div className="relative isolate overflow-hidden rounded-xl">
          <Image src={photoUrl('goldenLand', 2000)} alt={PHOTOS.goldenLand.alt} fill sizes="(min-width: 1200px) 1200px, 100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(23,23,33,0.92)_0%,rgba(23,23,33,0.6)_55%,rgba(23,23,33,0.2)_100%)]" aria-hidden="true" />
          <div className="px-7 py-16 sm:px-12 md:py-24">
            <h2 className="text-display max-w-[16ch]">Be one of the first owners.</h2>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-[#DADAE2]">
              We are opening TIGI to a small group of investors and property owners. Request a place and
              we will be in touch.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/auth/register" className="btn-gold no-underline">
                Get early access <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/register?role=owner" className="btn-ghost no-underline">
                List a property
              </Link>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  )
}
