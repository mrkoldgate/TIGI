import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X, Sparkles, Building2, ArrowRight } from 'lucide-react'
import { PLANS } from '@/lib/billing/billing-types'

export const metadata: Metadata = {
  title: 'Pricing — TIGI',
  description: 'Choose the plan that fits your real estate investment strategy.',
}

// ---------------------------------------------------------------------------
// /pricing — Public pricing page.
// Static server component — no auth required.
// ---------------------------------------------------------------------------

export default function PricingPage() {
  const displayPlans = ['free', 'pro', 'pro_plus', 'enterprise'] as const

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C]">Pricing</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-[#F5F5F7]">
          Intelligence that scales with you
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[#6B6B80]">
          Start free. Unlock deeper AI analysis and premium signals as your portfolio grows.
        </p>
      </div>

      {/* Plan grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {displayPlans.map((planId) => {
          const plan = PLANS[planId]
          const isHighlighted = plan.highlighted
          const isEnterprise = planId === 'enterprise'

          return (
            <div
              key={planId}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                isHighlighted
                  ? 'border-[#C9A84C]/40 bg-[#111118] shadow-[0_0_40px_rgba(201,168,76,0.08)]'
                  : 'border-[#2A2A3A] bg-[#0D0D14]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#C9A84C] px-3 py-0.5 text-[11px] font-semibold text-[#0A0A0F]">
                    <Sparkles className="h-2.5 w-2.5" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-heading text-base font-semibold text-[#F5F5F7]">{plan.name}</h3>
                <p className="mt-0.5 text-xs text-[#6B6B80]">{plan.tagline}</p>
              </div>

              <div className="mb-6">
                {isEnterprise ? (
                  <p className="text-3xl font-bold text-[#F5F5F7]">Custom</p>
                ) : (
                  <div>
                    <p className="text-3xl font-bold tabular-nums text-[#F5F5F7]">
                      {plan.priceMonthly === 0 ? 'Free' : `$${plan.priceMonthly}/mo`}
                    </p>
                    {plan.priceAnnual && plan.priceMonthly !== 0 && (
                      <p className="mt-1 text-xs text-[#6B6B80]">
                        or ${plan.priceAnnual}/yr — save {plan.annualSavingsPercent}%
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6">
                {isEnterprise ? (
                  <a
                    href="mailto:enterprise@tigi.com"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] py-2.5 text-sm font-semibold text-[#A0A0B2] transition-colors hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"
                  >
                    <Building2 className="h-4 w-4" />
                    Contact sales
                  </a>
                ) : (
                  <Link
                    href={plan.priceMonthly === 0 ? '/auth/register' : '/auth/register'}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      isHighlighted
                        ? 'bg-[#C9A84C] text-[#0A0A0F] hover:opacity-90'
                        : 'border border-[#2A2A3A] bg-[#1A1A24] text-[#A0A0B2] hover:border-[#C9A84C]/40 hover:text-[#F5F5F7]'
                    }`}
                  >
                    {isHighlighted && <Sparkles className="h-3.5 w-3.5" />}
                    {plan.priceMonthly === 0 ? 'Get started free' : `Start ${plan.name}`}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              <ul className="space-y-2.5">
                {plan.features.map((feat) => (
                  <li key={feat.label} className="flex items-start gap-2.5">
                    {feat.included ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#4ADE80]" />
                    ) : (
                      <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#3A3A4A]" />
                    )}
                    <span className={`text-xs leading-relaxed ${feat.included ? 'text-[#A0A0B2]' : 'text-[#4A4A5E]'}`}>
                      {feat.label}
                      {feat.note && (
                        <span className="ml-1 text-[10px] text-[#4A4A5E]">({feat.note})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* FAQ row */}
      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            q: 'Can I cancel anytime?',
            a: 'Yes. Cancel from your billing settings at any time. Your access continues until the end of the current billing period.',
          },
          {
            q: 'Is there a free trial?',
            a: 'The Free plan includes 10 AI valuations per month — no credit card required. Upgrade when you need more.',
          },
          {
            q: 'What payment methods are accepted?',
            a: 'All major credit and debit cards via Stripe. More options available on Enterprise plans.',
          },
        ].map(({ q, a }) => (
          <div key={q} className="rounded-xl border border-[#1F1F2E] bg-[#0D0D14] p-5">
            <p className="text-sm font-semibold text-[#F5F5F7]">{q}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#6B6B80]">{a}</p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-12 text-center text-xs text-[#4A4A5E]">
        AI estimates are not licensed appraisals. Past performance does not guarantee future results.
        TIGI is not a registered investment advisor.
      </p>
    </div>
  )
}
