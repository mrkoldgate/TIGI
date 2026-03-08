import type { Metadata } from 'next'
import { ClipboardList } from 'lucide-react'
import { MOCK_REVIEW_QUEUE } from '@/lib/admin/mock-admin-data'
import { ReviewQueue } from '@/components/admin/review-queue'

export const metadata: Metadata = {
  title: 'Review Queue — Admin',
  description: 'Listing compliance review and approval workflow.',
}

// ---------------------------------------------------------------------------
// /admin/reviews — Listing review queue
//
// MVP: Shows the full review queue (same mock data as dashboard widget).
//      The queue table is the production shape; approve/reject actions arrive M2.
// M2: Full approve / request-changes / reject workflow with reason codes.
// ---------------------------------------------------------------------------

export default function AdminReviewsPage() {
  const criticalCount = MOCK_REVIEW_QUEUE.filter((r) => r.urgency === 'CRITICAL').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
            Administration
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">
            Review Queue
          </h1>
          <p className="mt-1 text-sm text-[#6B6B80]">
            Listings awaiting compliance review before going live.
          </p>
        </div>

        {criticalCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <span className="text-sm text-[#EF4444]">
              {criticalCount} overdue — action required
            </span>
          </div>
        )}
      </div>

      {/* Queue table */}
      <ReviewQueue items={MOCK_REVIEW_QUEUE} />

      {/* M2 notice */}
      <div className="rounded-xl border border-dashed border-[#2A2A3A] bg-[#111118] p-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <ClipboardList className="h-4 w-4 text-[#6B6B80]" />
          <p className="text-sm text-[#6B6B80]">
            Approve / reject / request-changes workflow arrives in{' '}
            <span className="font-medium text-[#A0A0B2]">Milestone 2</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
