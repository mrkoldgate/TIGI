import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// PageHeader — v4 Elite: Dimension outer tray, Paragon top-edge light,
// metallic gradient title, atmospheric corner glows.
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
        'group relative overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-[#0A0A0F]/50 p-8 backdrop-blur-3xl shadow-[inset_0_2px_60px_rgba(99,102,241,0.02),0_4px_40px_rgba(0,0,0,0.5)] sm:p-10',
        className
      )}
    >
      {/* Paragon top-edge light — 1px gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500 group-hover:via-white/20"
        aria-hidden="true"
      />
      {/* Corner atmospheric glow — left */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/[0.05] blur-[80px]"
        aria-hidden="true"
      />
      {/* Corner atmospheric glow — right */}
      <div
        className="pointer-events-none absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-violet-500/[0.03] blur-[60px]"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-6">
        <div>
          {eyebrow && (
            <p className="text-[12px] font-medium tracking-wide uppercase text-zinc-600 mb-2">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              {eyebrow}
            </p>
          )}
          <h1 className="text-h1 font-extrabold tracking-[-0.05em] bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">{title}</h1>
          {description && (
            <p className="mt-2 text-zinc-500">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  )
}
