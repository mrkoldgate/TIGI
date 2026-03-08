'use client'

import { useState, useCallback } from 'react'
import { ClipboardList, AlertTriangle } from 'lucide-react'
import { type ReviewQueueItem } from '@/lib/admin/mock-admin-data'
import { ReviewQueue, type ListingAction } from './review-queue'

// ---------------------------------------------------------------------------
// ReviewQueueClient — Stateful wrapper for the /admin/reviews page.
//
// Owns:
//   items state — initialised from server-fetched list; action decisions
//     remove the item from the queue (it's no longer UNDER_REVIEW)
//   actioningId — the listingId currently being processed (debounce)
//   actionError — shown in an inline toast; dismissible
//
// handleListingAction:
//   PATCH /api/admin/listings/[id] → { action, note? }
//   On success: removes item from local state (queue shrinks instantly)
//   On failure: shows dismissible error toast; item stays in queue
// ---------------------------------------------------------------------------

interface ReviewQueueClientProps {
  items: ReviewQueueItem[]
}

export function ReviewQueueClient({ items: initialItems }: ReviewQueueClientProps) {
  const [items,       setItems]       = useState<ReviewQueueItem[]>(initialItems)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleListingAction = useCallback(
    async (listingId: string, action: ListingAction, note?: string) => {
      setActioningId(listingId)
      setActionError(null)
      try {
        const res = await fetch(`/api/admin/listings/${listingId}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ action, note }),
        })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json?.error?.message ?? `Request failed (${res.status})`)
        }
        // Remove from queue — the listing is no longer UNDER_REVIEW
        setItems((prev) => prev.filter((i) => i.listingId !== listingId))
      } catch (err) {
        setActionError((err as Error).message)
      } finally {
        setActioningId(null)
      }
    },
    [],
  )

  const criticalCount = items.filter((r) => r.urgency === 'CRITICAL').length

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4A5E]">
            Administration
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-[#F5F5F7]">Review Queue</h1>
          <p className="mt-1 text-sm text-[#6B6B80]">
            Listings awaiting compliance review before going live.
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-semibold text-[#EF4444]">
              <AlertTriangle className="h-3.5 w-3.5" />
              {criticalCount} overdue
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#2A2A3A] px-3 py-1.5 text-xs text-[#6B6B80]">
            <ClipboardList className="h-3 w-3" />
            {items.length} pending
          </div>
        </div>
      </div>

      {/* ── Queue table ─────────────────────────────────────────────────── */}
      <ReviewQueue
        items={items}
        onAction={handleListingAction}
        actioningId={actioningId}
      />

      {/* ── Action error toast ───────────────────────────────────────────── */}
      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-sm text-[#EF4444]">
          <span className="font-medium">Action failed:</span> {actionError}
          <button
            onClick={() => setActionError(null)}
            className="ml-auto text-[#EF4444]/60 hover:text-[#EF4444]"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-4 py-3">
        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22C55E]" />
        <p className="text-xs text-[#6B6B80]">
          <span className="font-medium text-[#A0A0B2]">Approve / Reject / Request Update / Archive</span>{' '}
          actions are live. Approved listings transition to{' '}
          <span className="font-medium text-[#A0A0B2]">Active</span> immediately.
          Document viewer and full audit trail in{' '}
          <span className="font-medium text-[#C9A84C]">M3</span>.
        </p>
      </div>
    </div>
  )
}
