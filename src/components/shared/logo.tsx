import Link from 'next/link'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Logo — TIGI wordmark in wide-set Archivo with a violet glass mark.
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
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] border border-violet-300/40 bg-[linear-gradient(160deg,rgba(143,130,250,0.35),rgba(90,66,230,0.15))] font-display text-[13px] font-[600] text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_18px_-4px_rgba(139,92,246,0.8)]"
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
