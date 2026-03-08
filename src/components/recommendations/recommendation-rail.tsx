'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MiniListingRow } from '@/components/dashboard/mini-listing-row'
import type { ScoredListing, ReasonType } from '@/lib/recommendations/recommendation-types'

// ---------------------------------------------------------------------------
// RecommendationRail — Premium personalized listing list.
//
// Wraps MiniListingRow with per-item reason chips that communicate WHY each
// listing was recommended. Designed for the dashboard "Recommended for You"
// section and any future personalized feed.
//
// Visual anatomy (per item):
//   [thumbnail | title + location | price]   ← MiniListingRow
//   [reason chip] [reason chip]              ← personalization signals
// ---------------------------------------------------------------------------

// ── Reason chip styling ─────────────────────────────────────────────────────

const REASON_CHIP: Record<ReasonType, { className: string; dot: string }> = {
  CATEGORY_MATCH:   { className: 'border-[#3A3A4A] text-[#A0A0B2]',                         dot: 'bg-[#6B6B80]' },
  LOCATION_MATCH:   { className: 'border-[#3B5BDB]/35 bg-[#3B5BDB]/6 text-[#91A7FF]',        dot: 'bg-[#748FFC]' },
  PRICE_MATCH:      { className: 'border-[#22C55E]/30 bg-[#22C55E]/6 text-[#86EFAC]',         dot: 'bg-[#4ADE80]' },
  SIMILAR_TO_SAVED: { className: 'border-[#C9A84C]/30 bg-[#C9A84C]/6 text-[#C9A84C]',         dot: 'bg-[#C9A84C]' },
  TOKENIZED_MATCH:  { className: 'border-[#C9A84C]/30 bg-[#C9A84C]/6 text-[#C9A84C]',         dot: 'bg-[#C9A84C]' },
  HIGH_CONFIDENCE:  { className: 'border-[#22C55E]/30 bg-[#22C55E]/6 text-[#86EFAC]',         dot: 'bg-[#4ADE80]' },
  TRENDING:         { className: 'border-[#F97316]/30 bg-[#F97316]/6 text-[#FCA876]',          dot: 'bg-[#F97316]' },
  LAND_PREFERENCE:  { className: 'border-[#22C55E]/30 bg-[#22C55E]/6 text-[#86EFAC]',         dot: 'bg-[#4ADE80]' },
  OWNERSHIP_MATCH:  { className: 'border-[#C9A84C]/30 bg-[#C9A84C]/6 text-[#C9A84C]',         dot: 'bg-[#C9A84C]' },
}

// ── ReasonChip ──────────────────────────────────────────────────────────────

function ReasonChip({
  reason,
}: {
  reason: ScoredListing['reasons'][number]
}) {
  const style = REASON_CHIP[reason.type]
  return (
    <span
      className={cn(
        'group/chip relative inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none transition-colors cursor-default',
        style.className,
      )}
      title={reason.detail}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', style.dot)} />
      {reason.label}
    </span>
  )
}

// ── RecommendationItem ──────────────────────────────────────────────────────

function RecommendationItem({
  item,
  index,
}: {
  item: ScoredListing
  index: number
}) {
  return (
    <div className="px-2 py-1">
      <MiniListingRow listing={item.listing} index={index} />
      {item.reasons.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1 pl-[4.25rem]">
          {item.reasons.map((reason) => (
            <ReasonChip key={reason.type} reason={reason} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyRecommendations() {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A24]">
        <Sparkles className="h-4 w-4 text-[#6B6B80]" />
      </div>
      <p className="text-sm text-[#A0A0B2]">No recommendations yet.</p>
      <p className="max-w-[200px] text-xs text-[#6B6B80]">
        Browse and save listings to personalise your feed.
      </p>
    </div>
  )
}

// ── RecommendationRail (exported) ───────────────────────────────────────────

interface RecommendationRailProps {
  items: ScoredListing[]
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
}

export function RecommendationRail({
  items,
  viewAllHref = '/marketplace',
  viewAllLabel = 'View all listings',
  className,
}: RecommendationRailProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#111118]', className)}>
      {/* AI attribution strip */}
      <div className="flex items-center gap-1.5 border-b border-[#1F1F2E] px-4 py-2.5">
        <Sparkles className="h-3 w-3 text-[#C9A84C]" />
        <span className="text-[10px] font-medium tracking-wide text-[#6B6B80] uppercase">
          Aria-powered · updates with your activity
        </span>
      </div>

      {/* Items */}
      {items.length > 0 ? (
        <div className="divide-y divide-[#1F1F2E]">
          {items.map((item, i) => (
            <RecommendationItem key={item.listing.id} item={item} index={i} />
          ))}
        </div>
      ) : (
        <EmptyRecommendations />
      )}

      {/* Footer link */}
      {viewAllHref && (
        <div className="border-t border-[#1F1F2E] px-4 py-3">
          <Link
            href={viewAllHref}
            className="flex items-center gap-1.5 text-xs text-[#6B6B80] transition-colors hover:text-[#C9A84C]"
          >
            {viewAllLabel}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SimilarListingsGrid — compact card grid variant for detail page "Similar" tab
// Shows top reasons as a summary header above the grid
// ---------------------------------------------------------------------------

interface SimilarListingsGridProps {
  items: ScoredListing[]
  renderCard: (listing: ScoredListing['listing'], index: number) => ReactNode
  emptyMessage?: string
}

export function SimilarListingsGrid({
  items,
  renderCard,
  emptyMessage = 'No similar listings available right now.',
}: SimilarListingsGridProps) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-[#6B6B80]">{emptyMessage}</p>
  }

  // Collect unique reasons from top item for the context header
  const topReasons = items[0]?.reasons.slice(0, 3) ?? []

  return (
    <div className="space-y-4">
      {/* Match context header */}
      {topReasons.length > 0 && (
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 flex-shrink-0 text-[#C9A84C]" />
          <span className="text-xs text-[#6B6B80]">Matched by:</span>
          <div className="flex flex-wrap gap-1">
            {topReasons.map((reason) => (
              <ReasonChip key={reason.type} reason={reason} />
            ))}
          </div>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => renderCard(item.listing, i))}
      </div>
    </div>
  )
}
