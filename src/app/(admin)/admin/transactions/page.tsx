import type { Metadata } from 'next'
import { ArrowLeftRight, DollarSign, Lock, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Transactions — Admin',
  description: 'Platform transaction oversight and settlement monitoring.',
}

// ---------------------------------------------------------------------------
// /admin/transactions — Transaction oversight
//
// M5: Escrow monitoring, settlement workflow, failed transaction review.
// M12: Revenue analytics, fee reporting, payout dashboards.
// ---------------------------------------------------------------------------

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
          Administration
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">Transactions</h1>
        <p className="mt-1 text-sm text-[#6B6B80]">
          Platform-wide transaction monitoring, escrow oversight, and settlement.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] p-8">
        <div className="mx-auto max-w-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1A24] text-[#6B6B80]">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-[#F5F5F7]">
            Transaction oversight arrives in M5
          </h2>
          <p className="mt-1.5 text-sm text-[#6B6B80]">
            Escrow monitoring, failed transaction review, and settlement management after Solana integration.
          </p>

          <ul className="mt-6 space-y-3">
            {[
              { icon: Lock,           label: 'Escrow state monitor — open / funded / settled / disputed', milestone: 'M5'  },
              { icon: ArrowLeftRight, label: 'Failed and suspicious transaction review queue',             milestone: 'M5'  },
              { icon: DollarSign,     label: 'Platform fee income and payout dashboards',                 milestone: 'M12' },
              { icon: BarChart3,      label: 'Revenue analytics and investor return reporting',            milestone: 'M12' },
            ].map(({ icon: Icon, label, milestone }) => (
              <li key={label} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3A3A4A]" />
                <span className="flex-1 text-sm text-[#6B6B80]">{label}</span>
                <span className="flex items-center gap-1 rounded border border-[#2A2A3A] bg-[#0A0A0F] px-1.5 py-0.5 text-[10px] text-[#6B6B80]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                  {milestone}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
