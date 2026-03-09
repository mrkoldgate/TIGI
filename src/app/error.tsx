'use client'

// ---------------------------------------------------------------------------
// Root error boundary.
// Last-resort catch for errors that escape all nested boundaries
// (marketing pages, auth flows, onboarding, etc.).
// ---------------------------------------------------------------------------

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Root Error]', error.message, error.digest)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7]">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F87171]/10 ring-1 ring-[#F87171]/20">
            <AlertTriangle className="h-7 w-7 text-[#F87171]" />
          </div>

          <div className="max-w-sm space-y-2">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-[#6B6B80]">
              TIGI encountered an unexpected error. Please try again or return home.
            </p>
            {error.digest && (
              <p className="pt-1 font-mono text-[11px] text-[#3A3A4A]">
                {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-[#0A0A0F] transition-opacity hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href="/"
              className="rounded-xl border border-[#2A2A3A] px-5 py-2.5 text-sm font-medium text-[#A0A0B2] transition-colors hover:border-[#3A3A4A] hover:text-[#F5F5F7]"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
