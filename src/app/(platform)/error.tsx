'use client'

// ---------------------------------------------------------------------------
// Platform-level error boundary.
// Catches unhandled errors from any (platform) page that does not have
// its own error.tsx (e.g. /listings, /transactions, /notifications).
// Pages with their own error.tsx (e.g. /dashboard) handle errors locally.
// ---------------------------------------------------------------------------

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react'

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Forward to error reporting service (e.g. Sentry) once integrated
    console.error('[Platform Error]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F87171]/10 ring-1 ring-[#F87171]/20">
        <AlertTriangle className="h-6 w-6 text-[#F87171]" />
      </div>

      <div className="max-w-sm space-y-2">
        <h1 className="text-lg font-semibold text-[#F5F5F7]">Something went wrong</h1>
        <p className="text-sm text-[#6B6B80]">
          An unexpected error occurred. Your data is safe — this is a temporary issue on our end.
        </p>
        {error.digest && (
          <p className="pt-1 text-[11px] text-[#3A3A4A]">
            Reference: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-[#0A0A0F] transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] px-4 py-2.5 text-sm font-medium text-[#A0A0B2] transition-colors hover:border-[#3A3A4A] hover:text-[#F5F5F7]"
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
