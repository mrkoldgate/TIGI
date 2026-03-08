import Link from 'next/link'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Logo — TIGI wordmark. Used in nav, sidebar, and footer.
// Collapsed mode shows icon-only (for sidebar).
// ---------------------------------------------------------------------------

interface LogoProps {
  collapsed?: boolean
  href?: string
  className?: string
}

export function Logo({ collapsed = false, href = '/', className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 transition-opacity hover:opacity-90',
        className
      )}
      aria-label="TIGI — Home"
    >
      {/* Icon mark */}
      <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center">
        {/* Outer hexagon-inspired shape */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#7A6018] opacity-20" />
        {/* Border */}
        <div className="absolute inset-0 rounded-lg border border-[#C9A84C]/40" />
        {/* T mark */}
        <span className="relative font-heading text-sm font-700 text-[#C9A84C]">
          T
        </span>
      </div>

      {/* Wordmark — hidden when collapsed */}
      {!collapsed && (
        <span className="font-heading text-lg font-600 tracking-wide text-[#F5F5F7]">
          TIGI
        </span>
      )}
    </Link>
  )
}
