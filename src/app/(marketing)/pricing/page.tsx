import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { SectionHead, Wrap } from '@/components/marketing/page-intro'
import { CountUp, CtaBand, GlowTile, PageHero } from '@/components/marketing/cinematic'

export const metadata: Metadata = {
  title: 'Plans',
  description: 'Free to start. Legacy for families at $5 a month. Pro research tools at $29 a month.',
}

// ---------------------------------------------------------------------------
// /pricing — subscription plans (Business Plan v2 §6). Per-use fees (Verify,
// escrow, Shares) live on /fees. Prices mirror src/lib/business/offer.ts.
// ---------------------------------------------------------------------------

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    annual: '',
    tagline: 'Look around, ask questions, order checks.',
    cta: 'Join the waitlist',
    href: '/waitlist',
    features: [
      'Search properties and markets',
      'Basic AI insights on every listing',
      'Aria, the assistant, in English or French',
      'Order Verify checks at the per-check price',
      'Your title reports, saved',
    ],
  },
  {
    name: 'Legacy',
    price: '$5',
    period: '/ month',
    annual: 'or $49 a year',
    tagline: 'For families who want the paperwork settled.',
    cta: 'Join for Legacy',
    href: '/waitlist?interest=legacy',
    highlighted: true,
    features: [
      'Everything in Free',
      'Named heirs for every holding',
      'Document vault for deeds and title reports',
      'Step-by-step executor guide',
      'Islamic inheritance-share calculator',
      'Introductions to partner notaries',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/ month',
    annual: '',
    tagline: 'For agents, developers and active investors.',
    cta: 'Join for Pro',
    href: '/waitlist?interest=list',
    features: [
      'Everything in Legacy',
      'Deeper price estimates with comparables',
      'Market and neighbourhood analytics',
      'Alerts on new listings and price changes',
      'Exportable reports',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="pb-24 md:pb-32">
      <PageHero
        photo="dakarCoast"
        eyebrow="Plans"
        title="Start free. Pay for what you use."
        lede={
          <p>
            Most people only pay when they use Verify or buy shares. Plans are for families who want their records
            settled, and professionals who want deeper research.{' '}
            <Link href="/fees" className="text-violet-200 no-underline hover:text-white">See per-use fees</Link>.
          </p>
        }
      />

      <Wrap className="mt-20 md:mt-28">
        <div id="content" className="scroll-mt-28">
          <SectionHead num="01" label="Plans" title="Three plans. Cancel any time." />
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <div key={t.name} data-reveal="up" data-reveal-delay={String(i * 120)} className={t.highlighted ? 'lg:-mt-4' : ''}>
              <GlowTile
                tilt={5}
                className={t.highlighted ? 'tier-hot' : ''}
                innerClassName={`flex flex-col !p-8 ${t.highlighted ? '!bg-[linear-gradient(180deg,rgba(60,44,140,0.45)_0%,rgba(12,10,22,0.95)_60%)] shadow-[0_40px_120px_-40px_rgba(110,91,243,0.8)] lg:pb-12' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-label">{t.name}</p>
                  {t.highlighted && <span className="pill is-active !py-1 !text-[11px]">For families</span>}
                </div>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="figure text-[clamp(3.2rem,2.6rem+2vw,4.4rem)] leading-none [text-shadow:0_0_36px_rgba(139,92,246,0.55)]">
                    <CountUp to={Number(t.price.replace(/[^0-9.]/g, ''))} prefix="$" duration={1200} />
                  </span>
                  {t.period && <span className="text-sm text-[#A0A0B2]">{t.period}</span>}
                </p>
                <p className="mt-2 h-5 text-xs text-[#A0A0B2]">{t.annual}</p>
                <p className="mt-4 text-[15.5px] text-[#E4E4EC]">{t.tagline}</p>

                <ul className="mt-7 flex-1 space-y-3 border-t border-white/[0.08] pt-6">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14.5px] text-[#C3C3CC]">
                      <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-violet-500/20 ring-1 ring-violet-300/40 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                        <Check className="h-3 w-3 text-violet-100" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={t.href} className={`${t.highlighted ? 'btn-primary' : 'btn-glass'} mt-9 w-full no-underline`}>
                  {t.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </GlowTile>
            </div>
          ))}
        </div>

        <div data-reveal="up" className="mt-5">
          <GlowTile tilt={2} innerClassName="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-label">Developers and owners</p>
              <p className="mt-2 max-w-[60ch] text-[15.5px] text-[#C3C3CC]">
                Structuring and listing a completed project on TIGI Shares is quoted per project, from{' '}
                <span className="text-white">$10,000 to $25,000</span>.
              </p>
            </div>
            <Link href="/waitlist?interest=list" className="btn-glass flex-shrink-0 no-underline">
              Talk to us <ArrowUpRight className="h-4 w-4" />
            </Link>
          </GlowTile>
        </div>
      </Wrap>

      <Wrap className="mt-24 md:mt-32">
        <SectionHead num="02" label="Questions" title="The short answers." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ['Can I cancel anytime?', 'Yes. Your plan runs to the end of the period you paid for. Your documents stay yours, and you can download them.'],
            ['Do plans include Verify checks?', 'No. Checks and escrow are paid per property, so you only pay when you are buying. See the fees page.'],
            ['Is the AI advice?', 'No. Estimates and insights are information, not financial advice and not an appraisal.'],
          ].map(([q, a], i) => (
            <div key={q} data-reveal="up" data-reveal-delay={String(i * 110)}>
              <GlowTile tilt={4}>
                <p className="text-[16px] font-medium text-[#F5F5F7]">{q}</p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#B4B4C0]">{a}</p>
              </GlowTile>
            </div>
          ))}
        </div>
        <p className="mt-10 text-caption">
          Private beta: plans are not yet billed. Prices are in US dollars; local-currency pricing will follow at launch.
        </p>
      </Wrap>

      <div className="mt-24 md:mt-32">
        <CtaBand
          photo="goreeStreet"
          title="Settle the paperwork for the people you love."
          body={<p>Legacy keeps the deed, the documents and your wishes in one place, for $5 a month.</p>}
        >
          <Link href="/waitlist?interest=legacy" className="btn-primary no-underline">
            Join for Legacy <ArrowRight className="h-4 w-4" />
          </Link>
        </CtaBand>
      </div>
    </div>
  )
}
