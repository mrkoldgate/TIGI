import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { PageIntro, Wrap } from '@/components/marketing/page-intro'

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
      <PageIntro
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

      <Wrap className="mt-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <div
              key={t.name}
              data-reveal="up"
              data-reveal-delay={String(i * 100)}
              className={`panel panel-hover flex flex-col p-7 ${t.highlighted ? '!border-violet-400/30 shadow-[0_0_60px_-20px_rgba(139,92,246,0.6)]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-label">{t.name}</p>
                {t.highlighted && <span className="pill is-active !py-1 !text-[11px]">For families</span>}
              </div>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="figure text-[44px] leading-none">{t.price}</span>
                {t.period && <span className="text-sm text-[#8E8E9C]">{t.period}</span>}
              </p>
              <p className="mt-1 h-5 text-xs text-[#8E8E9C]">{t.annual}</p>
              <p className="mt-3 text-[15px] text-[#D4D4DE]">{t.tagline}</p>

              <ul className="mt-7 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14.5px] text-[#C3C3CC]">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-300" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={t.href} className={`${t.highlighted ? 'btn-primary' : 'btn-glass'} mt-8 w-full no-underline`}>
                {t.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div data-reveal="up" className="panel mt-5 flex flex-col gap-4 p-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-label">Developers and owners</p>
            <p className="mt-2 max-w-[60ch] text-[15px] text-[#C3C3CC]">
              Structuring and listing a completed project on TIGI Shares is quoted per project, from $10,000 to $25,000.
            </p>
          </div>
          <Link href="/waitlist?interest=list" className="btn-glass flex-shrink-0 no-underline">
            Talk to us <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            ['Can I cancel anytime?', 'Yes. Your plan runs to the end of the period you paid for. Your documents stay yours, and you can download them.'],
            ['Do plans include Verify checks?', 'No. Checks and escrow are paid per property, so you only pay when you are buying. See the fees page.'],
            ['Is the AI advice?', 'No. Estimates and insights are information, not financial advice and not an appraisal.'],
          ].map(([q, a]) => (
            <div key={q} data-reveal="up" className="panel p-6">
              <p className="text-[15px] font-medium text-[#F5F5F7]">{q}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#B4B4C0]">{a}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-caption">
          Private beta: plans are not yet billed. Prices are in US dollars; local-currency pricing will follow at launch.
        </p>
      </Wrap>
    </div>
  )
}
