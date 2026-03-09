'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// PremiumGate — wraps Pro-only content with a blur-and-lock overlay.
//
// Accepts `isPro` as a boolean so it works in both server and client render
// trees without calling useSession (avoids client boundary issues).
//
// Usage:
//   <PremiumGate isPro={isProUser} feature="deep valuation analysis">
//     <DriversSection ... />
//   </PremiumGate>
// ---------------------------------------------------------------------------

interface PremiumGateProps {
  isPro: boolean
  children: React.ReactNode
  feature?: string
  className?: string
  /** Minimum height of the blurred preview area. Default: 160px */
  minHeight?: number
}

export function PremiumGate({
  isPro,
  children,
  feature = 'this feature',
  className,
  minHeight = 160,
}: PremiumGateProps) {
  if (isPro) return <>{children}</>

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {/* Blurred preview — screen-reader hidden */}
      <div
        className="pointer-events-none select-none blur-[3px] opacity-40"
        aria-hidden="true"
        style={{ minHeight }}
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 rounded-xl bg-[#0A0A0F]/70 p-4 text-center backdrop-blur-[1px]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A84C]/15 ring-1 ring-[#C9A84C]/30">
          <Lock className="h-4 w-4 text-[#C9A84C]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#F5F5F7]">Pro feature</p>
          <p className="mt-0.5 max-w-[200px] text-[11px] leading-relaxed text-[#6B6B80]">
            Upgrade to access {feature}.
          </p>
        </div>
        <Link
          href="/settings/billing"
          className="mt-0.5 rounded-lg bg-[#C9A84C] px-3 py-1.5 text-[11px] font-semibold text-[#0A0A0F] transition-opacity hover:opacity-90"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  )
}
