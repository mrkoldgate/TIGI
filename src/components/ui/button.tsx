import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Button — TIGI design system button.
// Matches design-principles.md §5.4 button system.
// ---------------------------------------------------------------------------

const buttonVariants = cva(
  // Base styles — all buttons share these
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium text-sm',
    'transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'disabled:pointer-events-none disabled:bg-white/[0.02] disabled:text-[#8E8E9C]',
    'active:scale-[0.98]',
    'select-none',
  ],
  {
    variants: {
      variant: {
        // Primary — indigo gradient. Main CTA: Invest, Submit, Confirm
        primary: [
          'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.4)]',
          'hover:from-indigo-400 hover:to-indigo-500',
          'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_0_20px_rgba(99,102,241,0.25),0_0_40px_rgba(99,102,241,0.1)]',
        ],
        // Secondary — glass with border. Cancel, Back, View Details
        secondary: [
          'border border-white/[0.04] bg-white/[0.025] text-[#F5F5F7] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
          'hover:border-white/[0.15] hover:bg-white/[0.06]',
        ],
        // Ghost — no border or background. Tertiary: Learn more, Show all
        ghost: [
          'bg-transparent text-[#A0A0B2]',
          'hover:bg-white/[0.03] hover:text-[#F5F5F7]',
        ],
        // Destructive — red background. Delete, Revoke, Terminate
        destructive: [
          'bg-[#EF4444] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
          'hover:bg-[#DC2626]',
        ],
        // Outline — visible border, no fill. Alternative secondary.
        outline: [
          'border border-white/[0.04] bg-transparent text-[#A0A0B2] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
          'hover:border-white/[0.12] hover:text-[#F5F5F7]',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base font-semibold',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading ? (
          <LoadingDots />
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

// Loading indicator — 3-dot pulse, same width as text
function LoadingDots() {
  return (
    <span className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  )
}

export { Button, buttonVariants }
