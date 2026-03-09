'use client'

// ---------------------------------------------------------------------------
// compare-bar.tsx — Floating compare tray.
//
// Appears at the bottom of the viewport when the user has selected ≥ 1
// property for comparison. Animated slide-up entrance.
//
// Shows: selected count, title chips with individual remove, compare CTA.
// Compare CTA navigates to /compare?ids=a,b,c and is only enabled with ≥ 2
// selections (comparison requires at least two items).
// ---------------------------------------------------------------------------

import Link from 'next/link'
import { GitCompare, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCompare, MAX_COMPARE } from '@/lib/compare/compare-context'

export function CompareBar() {
  const { compareEntries, removeFromCompare, clearCompare } = useCompare()

  if (compareEntries.length === 0) return null

  const compareUrl = `/compare?ids=${compareEntries.map((e) => e.id).join(',')}`
  const canCompare = compareEntries.length >= 2

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4"
      style={{ animation: 'slideUpFade 220ms ease-out both' }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0);    }
        }
      `}</style>

      <div className="flex items-center gap-3 rounded-2xl border border-[#2A2A3A] bg-[#111118]/95 px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-md ring-1 ring-[#C9A84C]/10 sm:gap-4">

        {/* Icon + label */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]/10">
            <GitCompare className="h-3.5 w-3.5 text-[#C9A84C]" />
          </div>
          <span className="hidden text-sm text-[#6B6B80] sm:block">
            <span className="font-semibold text-[#F5F5F7]">{compareEntries.length}</span>
            <span>/{MAX_COMPARE} selected</span>
          </span>
        </div>

        {/* Chips */}
        <div className="flex items-center gap-1.5">
          {compareEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex max-w-[120px] items-center gap-1 truncate rounded-lg border border-[#2A2A3A] bg-[#1A1A24] px-2.5 py-1.5 text-xs sm:max-w-[160px]"
            >
              <span className="truncate text-[#A0A0B2]">{entry.title}</span>
              <button
                type="button"
                onClick={() => removeFromCompare(entry.id)}
                aria-label={`Remove ${entry.title} from comparison`}
                className="ml-0.5 shrink-0 rounded text-[#4A4A60] transition-colors hover:text-[#EF4444]"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {/* Empty slot pills */}
          {Array.from({ length: MAX_COMPARE - compareEntries.length }).map((_, i) => (
            <div
              key={i}
              className="hidden items-center rounded-lg border border-dashed border-[#2A2A3A] px-3 py-1.5 text-[10px] text-[#3A3A48] sm:flex"
            >
              + add
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-6 w-px shrink-0 bg-[#2A2A3A]" />

        {/* Compare CTA */}
        {canCompare ? (
          <Link
            href={compareUrl}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4B55A] active:scale-[0.98]"
          >
            <span className="hidden sm:inline">Compare</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="shrink-0 rounded-xl bg-[#C9A84C]/20 px-4 py-2 text-sm font-semibold text-[#C9A84C]/50 cursor-not-allowed">
            <span className="hidden sm:inline">Need 2+</span>
            <ArrowRight className="inline h-3.5 w-3.5 sm:hidden" />
          </span>
        )}

        {/* Clear all */}
        <button
          type="button"
          onClick={clearCompare}
          aria-label="Clear all comparisons"
          className="shrink-0 text-[#3A3A48] transition-colors hover:text-[#6B6B80]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
