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
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[6px] border border-[#C9A84C]/70 font-display text-[13px] font-[560] text-[#C9A84C]"
        style={{ fontStretch: '112%' }}
        aria-hidden="true"
      >
        T
      </span>
      {!collapsed && (
        <span className="font-display text-[17px] font-[560] tracking-[0.12em] text-[#EDEDF3]" style={{ fontStretch: '118%' }}>
          TIGI
        </span>
      )}
    </Link>
  )
}
