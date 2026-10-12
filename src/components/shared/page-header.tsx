import { cn } from '@/lib/utils'
import { WaveChars } from '@/components/motion/wave-text'

// ---------------------------------------------------------------------------
// PageHeader — v5 inner pages.
//
// Same voice as the homepage chapters: mono eyebrow with a violet dot, a wide
// Archivo title that waves in (indigo → violet → lilac → white), a calm
// description, and actions on the right. No box around it: the page itself
// is the surface, a hairline closes the header (Mercury / Coinbase app).
// ---------------------------------------------------------------------------

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  eyebrow?: string
  /** Optional row under the description (chips, stats, filters). */
  meta?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, eyebrow, meta, className }: PageHeaderProps) {
  return (
    <header className={cn('relative border-b border-white/[0.06] pb-8 pt-2', className)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-label mb-4 flex items-center gap-2" data-reveal="fade">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          <h1 className="page-title" data-reveal="wave">
            <WaveChars text={title} step={30} />
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#A0A0B2]" data-reveal="fade">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5" data-reveal="fade">
            {actions}
          </div>
        )}
      </div>
      {meta && <div className="mt-6">{meta}</div>}
    </header>
  )
}

// ---------------------------------------------------------------------------
// SectionTitle — numbered section heading used inside inner pages.
// ---------------------------------------------------------------------------

export function SectionTitle({
  title,
  description,
  index,
  action,
  className,
}: {
  title: string
  description?: string
  index?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {index && <p className="text-label mb-2 text-violet-300/80">{index}</p>}
        <h2 className="section-title">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-[#8E8E9C]">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
