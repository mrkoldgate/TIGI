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
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]',
    'disabled:pointer-events-none disabled:bg-[#22222E] disabled:text-[#6B6B80]',
    'active:scale-[0.98]',
    'select-none',
  ],
  {
    variants: {
      variant: {
        // Primary — gold background. Main CTA: Invest, Submit, Confirm
        primary: [
          'bg-[#C9A84C] text-[#0A0A0F]',
          'hover:bg-[#B8932F]',
          'hover:shadow-[0_0_20px_rgba(201,168,76,0.2),0_0_40px_rgba(201,168,76,0.08)]',
        ],
        // Secondary — transparent with border. Cancel, Back, View Details
        secondary: [
          'border border-[#2A2A3A] bg-transparent text-[#F5F5F7]',
          'hover:border-[#C9A84C] hover:bg-[#1A1A24]',
        ],
        // Ghost — no border or background. Tertiary: Learn more, Show all
        ghost: [
          'bg-transparent text-[#A0A0B2]',
          'hover:bg-[#1A1A24] hover:text-[#F5F5F7]',
        ],
        // Destructive — red background. Delete, Revoke, Terminate
        destructive: [
          'bg-[#EF4444] text-white',
          'hover:bg-[#DC2626]',
        ],
        // Outline — visible border, no fill. Alternative secondary.
        outline: [
          'border border-[#2A2A3A] bg-transparent text-[#A0A0B2]',
          'hover:border-[#3A3A4E] hover:text-[#F5F5F7]',
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
