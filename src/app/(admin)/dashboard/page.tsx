import type { Metadata } from 'next'
import { LayoutDashboard } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'TIGI platform administration and oversight.',
}

// ---------------------------------------------------------------------------
// Admin Dashboard — /admin/dashboard
// M2: Basic stats and user management.
// M12: Full command center with KPIs, charts, and system health.
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-label mb-1">Administration</p>
        <h1 className="text-h1">Dashboard</h1>
        <p className="mt-1 text-[#A0A0B2]">Platform overview and management controls.</p>
      </div>

      {/* Stat placeholders — will be DB queries in M2 */}
      <div className="stagger-children mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_STATS.map((stat) => (
          <div
            key={stat.label}
            className="animate-slide-up rounded-xl border border-[#2A2A3A] bg-[#111118] p-5"
          >
            <p className="text-xs text-[#6B6B80]">{stat.label}</p>
            <p className="mt-1.5 font-heading text-2xl font-600 tabular-nums text-[#F5F5F7]">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-[#6B6B80]">{stat.hint}</p>
          </div>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1A1A24] text-[#6B6B80]">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <h3 className="text-h4 mb-1">Full command center coming in M12</h3>
        <p className="max-w-sm text-sm text-[#6B6B80]">
          User management, listing review queue, token minting, transaction
          oversight, and compliance tools arrive starting in Milestone 2.
        </p>
      </div>
    </div>
  )
}

// Placeholder stat data — replaced by live DB aggregation in M2
const ADMIN_STATS = [
  { label: 'Total Users', value: '—', hint: 'Registered accounts' },
  { label: 'Active Listings', value: '—', hint: 'Properties on marketplace' },
  { label: 'Transactions', value: '—', hint: 'All time' },
  { label: 'Pending Reviews', value: '—', hint: 'KYC + listings' },
]
