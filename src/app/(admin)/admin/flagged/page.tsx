import type { Metadata } from 'next'
import { Flag } from 'lucide-react'
import { MOCK_FLAGGED_ITEMS } from '@/lib/admin/mock-admin-data'
import { FlaggedItems } from '@/components/admin/flagged-items'

export const metadata: Metadata = {
  title: 'Flagged Items — Admin',
  description: 'Content moderation and fraud investigation queue.',
}

// ---------------------------------------------------------------------------
// /admin/flagged — Moderation queue
//
// MVP: Displays flagged items list. Resolution actions arrive in M2.
// M2: Dismiss flag, escalate, suspend user, delist listing.
// M6: AI-assisted fraud scoring and automated flag triage.
// ---------------------------------------------------------------------------

export default function AdminFlaggedPage() {
  const criticalCount = MOCK_FLAGGED_ITEMS.filter((f) => f.severity === 'CRITICAL').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
            Administration
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">
            Flagged Items
          </h1>
          <p className="mt-1 text-sm text-[#6B6B80]">
            Active flags across users, listings, and transactions.
          </p>
        </div>

        {criticalCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#EF4444]" />
            <span className="text-sm text-[#EF4444]">
              {criticalCount} critical — immediate action required
            </span>
          </div>
        )}
      </div>

      <div className="max-w-2xl">
        <FlaggedItems items={MOCK_FLAGGED_ITEMS} />
      </div>

      <div className="rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] p-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <Flag className="h-4 w-4 text-[#6B6B80]" />
          <p className="text-sm text-[#6B6B80]">
            Flag resolution workflow (dismiss / escalate / suspend) arrives in{' '}
            <span className="font-medium text-[#A0A0B2]">Milestone 2</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
