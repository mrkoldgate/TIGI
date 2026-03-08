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
    <div className="relative z-10 border-b border-[#111118] bg-[#0A0A0F]/80 px-6 py-4 backdrop-blur-sm">
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
                      'border-[#C9A84C]/40 bg-[#C9A84C]/15 text-[#C9A84C]',
                    isActive &&
                      'border-[#C9A84C] bg-[#C9A84C] text-[#0A0A0F] shadow-[0_0_12px_rgba(201,168,76,0.3)]',
                    isPending && 'border-[#2A2A3A] bg-transparent text-[#3A3A48]',
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
                    isActive && 'text-[#C9A84C]',
                    isCompleted && 'text-[#6B6B80]',
                    isPending && 'text-[#2A2A3A]',
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
                        ? 'bg-[#C9A84C]/30'
                        : 'bg-[#1E1E2A]',
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
