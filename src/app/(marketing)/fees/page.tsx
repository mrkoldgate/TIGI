import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Building2, FileSignature, Landmark } from 'lucide-react'
import { SectionHead, Wrap } from '@/components/marketing/page-intro'
import { CompareBars, CtaBand, GlowTile, PageHero, ParallaxBand } from '@/components/marketing/cinematic'
import { FEES } from '@/lib/business/offer'

export const metadata: Metadata = {
  title: 'Fees',
  description: 'Every fee TIGI charges, who pays it and when. No hidden spreads.',
}

// ---------------------------------------------------------------------------
// /fees — the full fee schedule from Business Plan v2 §6 (src/lib/business/
// offer.ts), as glowing fee cards grouped by product.
// ---------------------------------------------------------------------------

const PAID_TO_OTHERS = [
  {
    icon: Building2,
    t: 'Property management',
    d: 'Usually around 8% of rent, paid to the independent local manager who runs the building, not to TIGI.',
  },
  {
    icon: Landmark,
    t: 'Government fees',
    d: 'Registration, stamp duty and consent fees are paid to the authority and shown separately.',
  },
  {
    icon: FileSignature,
    t: 'Notary and legal fees',
    d: 'The transfer itself is quoted by the partner notary or lawyer before you commit.',
  },
]

/** Split "$150 per property" into a headline figure and the words after it. */
function splitFee(fee: string): [string, string] {
  const m = fee.match(/^([$€]?[\d.,–-]+(?:\s?%)?)\s*(.*)$/)
  return m ? [m[1], m[2]] : [fee, '']
}

export default function FeesPage() {
  return (
    <div className="pb-24 md:pb-32">
      <PageHero
        photo="lagosNight"
        eyebrow="Fees"
        title="Every fee, who pays it, and when."
        lede={
          <p>
            TIGI earns when it does work for you: a check, a protected payment, a property it finds and looks after.
            This is the full list. Each offering also states its fees in its own documents before you buy.
          </p>
        }
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/verify" className="btn-primary no-underline">
            How Verify works <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/pricing" className="btn-glass no-underline">
            Plans
          </Link>
        </div>
      </PageHero>

      {/* Fee cards */}
      <Wrap className="mt-20 md:mt-28">
        <div id="content" className="scroll-mt-28">
          <SectionHead num="01" label="The schedule" title="Eight fees. Nothing hidden in a spread." />
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEES.map((f, i) => {
            const [figure, rest] = splitFee(f.fee)
            return (
              <li key={`${f.product}-${f.item}`} data-reveal="up" data-reveal-delay={String((i % 4) * 90)}>
                <GlowTile innerClassName="flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="pill !py-1 !text-[11px] text-violet-100">{f.product}</span>
                    {f.assumption && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8E8E9C]">Launch price</span>
                    )}
                  </div>
                  <p className="mt-6 text-[15px] font-medium text-[#E4E4EC]">{f.item}</p>
                  <p className="figure mt-3 text-[clamp(2.2rem,1.8rem+1.2vw,2.9rem)] leading-none [text-shadow:0_0_30px_rgba(139,92,246,0.5)]">
                    {figure}
                  </p>
                  <p className="mt-2 min-h-[2.6em] text-[14px] leading-snug text-[#C3C3CC]">{rest}</p>
                  <dl className="mt-auto space-y-2 border-t border-white/[0.08] pt-4 text-[13px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#8E8E9C]">Who pays</dt>
                      <dd className="text-right text-[#E4E4EC]">{f.who}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#8E8E9C]">When</dt>
                      <dd className="text-right text-[#E4E4EC]">{f.when}</dd>
                    </div>
                  </dl>
                </GlowTile>
              </li>
            )
          })}
        </ul>
        <p className="mt-5 text-caption">
          Launch prices are being tested in our first 90 days and may change before you order; you always see the price
          first. Shares fees apply only where TIGI Shares is licensed.
        </p>
      </Wrap>

      {/* Statement */}
      <div className="mt-24 md:mt-32">
        <ParallaxBand photo="abujaHaze" kicker="Where your money sits" statement="TIGI never holds your money.">
          <p className="max-w-[54ch] text-[17px] leading-relaxed text-[#D4D4DE]">
            Purchase money sits with a licensed bank, trustee, broker-dealer or escrow agent, never in TIGI&apos;s accounts.
            Our fees are charged separately and shown before you pay.
          </p>
        </ParallaxBand>
      </div>

      {/* Paid to others + comparison */}
      <Wrap className="mt-16 md:mt-24">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <SectionHead num="02" label="Paid to others" title="What TIGI does not keep." />
            <ul className="mt-10 space-y-4">
              {PAID_TO_OTHERS.map(({ icon: Icon, t, d }, i) => (
                <li key={t} data-reveal="left" data-reveal-delay={String(i * 110)}>
                  <GlowTile tilt={4} innerClassName="flex items-start gap-5 !p-6">
                    <span className="tile-icon flex-shrink-0">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-[16px] font-medium text-[#F5F5F7]">{t}</span>
                      <span className="mt-1.5 block text-[14.5px] leading-relaxed text-[#B4B4C0]">{d}</span>
                    </span>
                  </GlowTile>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead num="03" label="How we compare" title="In line with licensed platforms." />
            <p data-reveal="up" className="mt-6 text-[15.5px] leading-relaxed text-[#C3C3CC]">
              Our Shares fees follow what licensed fractional platforms charge in the US. Our resale fee is lower than
              what some charge sellers.
            </p>
            <div data-reveal="up" data-reveal-delay="120" className="panel mt-8 p-7">
              <CompareBars
                max={3.5}
                rows={[
                  { label: 'Sourcing fee', tigi: 3, market: 3.5, marketLabel: 'Up to' },
                  { label: 'Management, per year', tigi: 1, market: 1, marketLabel: 'Common' },
                  { label: 'Resale, paid by seller', tigi: 1, market: 3, marketLabel: 'Some charge' },
                ]}
              />
              <p className="text-caption mt-6">US fractional platforms, public fee schedules. Shares fees apply only where licensed.</p>
            </div>
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

      <div className="mt-24 md:mt-32">
        <CtaBand
          photo="dakarCity"
          title="See the price before you order. Always."
          body={<p>Join the waitlist and we&apos;ll tell you when Verify opens in your city, with launch pricing.</p>}
        >
          <Link href="/waitlist" className="btn-primary no-underline">
            Join the waitlist <ArrowRight className="h-4 w-4" />
          </Link>
        </CtaBand>
      </div>
    </div>
  )
}
