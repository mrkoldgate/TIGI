'use client'

import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ONBOARDING_STEPS } from '@/lib/onboarding/config'

// ---------------------------------------------------------------------------
// OnboardingProgress — step indicator bar rendered inside the layout.
// Reads the current URL to determine active step.
// ---------------------------------------------------------------------------

export function OnboardingProgress() {
  const pathname = usePathname()

  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (s) => s.path === pathname || pathname.startsWith(s.path + '/'),
  )

  // Not on an onboarding step path — render nothing (e.g. /onboarding root redirect)
  if (currentStepIndex === -1) return null

  return (
    <div className="relative z-10 border-b border-white/[0.06] bg-black/80 px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
        {ONBOARDING_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex
          const isActive = idx === currentStepIndex
          const isPending = idx > currentStepIndex

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step bubble + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300',
                    isCompleted &&
                      'border-indigo-500/40 bg-indigo-500/15 text-indigo-400',
                    isActive &&
                      'border-indigo-500 bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]',
                    isPending && 'border-white/[0.08] bg-transparent text-[#6E6E7E]',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span>{step.step}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'hidden text-[10px] font-medium sm:block',
                    isActive && 'text-indigo-400',
                    isCompleted && 'text-[#8E8E9C]',
                    isPending && 'text-[#8E8E9C]/50',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line — not after last step */}
              {idx < ONBOARDING_STEPS.length - 1 && (
                <div className="mx-2 flex-1 sm:mx-3">
                  <div
                    className={cn(
                      'h-px transition-all duration-500',
                      isCompleted
                        ? 'bg-indigo-500/30'
                        : 'bg-white/[0.06]',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
