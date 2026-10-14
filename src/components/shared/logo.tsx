import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Logo — the TIGI lockup: the violet glass "T" tile with its light flare and
// the bold TIGI wordmark, cut from the master logo artwork with its glow kept
// (public/brand). Collapsed mode shows the tile only (sidebar).
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
      className={cn('inline-flex items-center no-underline transition-opacity hover:opacity-90', className)}
      aria-label="TIGI — Home"
    >
      {collapsed ? (
        <Image src="/brand/tigi-mark.png" alt="" width={40} height={40} priority className="h-10 w-10" />
      ) : (
        <Image src="/brand/tigi-lockup.png" alt="TIGI" width={95} height={44} priority className="h-11 w-auto" />
      )}
    </Link>
  )
}
