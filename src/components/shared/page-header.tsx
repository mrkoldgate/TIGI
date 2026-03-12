import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// PageHeader — Consistent page-level heading used across all platform pages.
// Glass panel with top accent line + atmospheric corner glow.
// ---------------------------------------------------------------------------

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  eyebrow?: string
  className?: string
}

export function PageHeader({ title, description, actions, eyebrow, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] sm:p-6',
        className
      )}
    >
      {/* Top accent hairline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"
        aria-hidden="true"
      />
      {/* Corner atmospheric light */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-violet-400/[0.04] blur-[50px]"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          {eyebrow && <p className="text-label mb-1">{eyebrow}</p>}
          <h1 className="text-h1">{title}</h1>
          {description && (
            <p className="mt-1 text-[#A0A0B2]">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  )
}
