import Link from 'next/link'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Logo — TIGI wordmark in wide-set Archivo with a gold hairline mark.
// Collapsed mode shows the mark only (sidebar).
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
      className={cn('inline-flex items-center gap-2.5 no-underline transition-opacity hover:opacity-90', className)}
      aria-label="TIGI — Home"
    >
      <span
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[6px] border border-[#6366F1]/70 font-display text-[13px] font-[560] text-[#6366F1]"
        style={{ fontStretch: '112%' }}
        aria-hidden="true"
      >
        T
      </span>
      {!collapsed && (
        <span className="font-display text-[17px] font-[560] tracking-[0.12em] text-[#F5F5F7]" style={{ fontStretch: '118%' }}>
          TIGI
        </span>
      )}
    </Link>
  )
}
