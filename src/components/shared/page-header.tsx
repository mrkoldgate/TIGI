import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// PageHeader — Consistent page-level heading used across platform pages.
// Renders title, optional description, and optional actions slot.
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
    <div className={cn('flex items-start justify-between gap-4', className)}>
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
  )
}
