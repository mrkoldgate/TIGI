import type { Metadata } from 'next'
import { ShieldCheck, FileSearch, Landmark, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Compliance — Admin',
  description: 'KYC, AML, and regulatory compliance oversight.',
}

// ---------------------------------------------------------------------------
// /admin/compliance — Compliance and regulatory tools
//
// M2: KYC review queue, AML monitoring, document verification.
// M8: Inheritance submission review.
// M10: Regulatory reporting exports (FINCEN, SEC filings for tokenized assets).
// ---------------------------------------------------------------------------

export default function AdminCompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
          Administration
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">Compliance</h1>
        <p className="mt-1 text-sm text-[#6B6B80]">
          KYC verification, AML monitoring, and regulatory reporting.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: ShieldCheck,
            title: 'KYC Review Queue',
            description: 'Document review and identity verification workflow for pending users.',
            milestone: 'M2',
            count: 43,
            countLabel: 'pending',
            accent: 'text-[#C9A84C]',
            accentBg: 'bg-[#C9A84C]/10',
          },
          {
            icon: FileSearch,
            title: 'AML Monitoring',
            description: 'Automated transaction screening and suspicious activity reports.',
            milestone: 'M5',
            count: null,
            countLabel: null,
            accent: 'text-[#818CF8]',
            accentBg: 'bg-[#818CF8]/10',
          },
          {
            icon: Landmark,
            title: 'Inheritance Submissions',
            description: 'Estate planning and digital asset inheritance review queue.',
            milestone: 'M8',
            count: 2,
            countLabel: 'pending',
            accent: 'text-[#818CF8]',
            accentBg: 'bg-[#818CF8]/10',
          },
          {
            icon: Scale,
            title: 'Regulatory Reporting',
            description: 'FINCEN, SEC-compliant exports for tokenized real estate offerings.',
            milestone: 'M10',
            count: null,
            countLabel: null,
            accent: 'text-[#A0A0B2]',
            accentBg: 'bg-[#A0A0B2]/10',
          },
        ].map(({ icon: Icon, title, description, milestone, count, countLabel, accent, accentBg }) => (
          <div
            key={title}
            className="rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] p-5"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${accentBg}`}>
                <Icon className={`h-4 w-4 ${accent}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#F5F5F7]">{title}</p>
                  <span className="flex items-center gap-1 rounded border border-[#2A2A3A] bg-[#0A0A0F] px-1.5 py-0.5 text-[10px] text-[#6B6B80]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                    {milestone}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6B6B80]">{description}</p>
                {count !== null && (
                  <p className={`mt-2 font-heading text-lg font-semibold tabular-nums ${accent}`}>
                    {count} <span className="text-xs font-normal text-[#6B6B80]">{countLabel}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
