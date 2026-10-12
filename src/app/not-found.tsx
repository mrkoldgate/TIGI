import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// ---------------------------------------------------------------------------
// 404 Not Found — Consistent with TIGI dark premium aesthetic.
// No dead ends — every state has a clear next action.
// ---------------------------------------------------------------------------

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0F] px-6">
      <div className="text-center">
        {/* Large 404 */}
        <p className="font-heading text-[128px] font-700 leading-none text-[#1A1A24]">
          404
        </p>

        {/* Thin gold line separator */}
        <div className="mx-auto my-6 h-px w-24 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent" />

        <h1 className="text-h2 mb-3">Page not found</h1>
        <p className="mb-8 max-w-sm text-[#A0A0B2]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.04] bg-[#050505] px-6 py-2.5 text-sm font-medium text-[#F5F5F7] transition-all hover:border-[#6366F1] hover:bg-white/[0.04]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            href="/marketplace"
            className="gold-glow inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-6 py-2.5 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#4F46E5]"
          >
            Browse marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}
