'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// ---------------------------------------------------------------------------
// Dashboard error boundary — shown when the server component throws.
// Provides a "try again" action and links to the marketplace as a fallback.
// ---------------------------------------------------------------------------

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service (Sentry, etc.) when available
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F87171]/10 ring-1 ring-[#F87171]/20">
        <AlertTriangle className="h-6 w-6 text-[#F87171]" />
      </div>

      <div className="space-y-2">
        <h1 className="text-lg font-semibold text-[#F5F5F7]">Dashboard unavailable</h1>
        <p className="max-w-sm text-sm text-[#8E8E9C]">
          Something went wrong loading your dashboard. Your data is safe —
          this is a temporary issue.
        </p>
        {error.digest && (
          <p className="text-[11px] text-[#6E6E7E]">
            Reference: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-[#0A0A0F] transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/marketplace"
          className="rounded-xl border border-white/[0.04] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-[#A0A0B2] transition-colors hover:border-white/[0.06] hover:text-[#F5F5F7]"
        >
          Browse marketplace
        </Link>
      </div>
    </div>
  )
}
