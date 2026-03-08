import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Input — Form input with TIGI dark styling.
// Visual: bg-muted on bg-surface provides clear contrast step.
// Focus: gold border + gold ring offset.
// ---------------------------------------------------------------------------

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B80]">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              // Base
              'w-full rounded-lg border bg-[#22222E] text-sm text-[#F5F5F7]',
              'placeholder:text-[#6B6B80]',
              'py-2.5',
              // Sizing based on icons
              leftIcon ? 'pl-9 pr-4' : 'px-4',
              rightIcon ? 'pr-9' : '',
              // Default border
              'border-[#2A2A3A]',
              // Focus
              'outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20',
              // Error state
              error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20',
              // Disabled
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Transition
              'transition-colors duration-150',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B80]">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#EF4444]">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[#6B6B80]">{hint}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
