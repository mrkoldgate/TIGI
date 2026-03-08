'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INTERESTS_CONFIG, type UserTypeValue } from '@/lib/onboarding/config'
import type { InterestQuestion } from '@/lib/onboarding/config'

// ---------------------------------------------------------------------------
// InterestsForm — dynamic question set based on the user's selected role.
// Answers are stored as a flat key→value record in `preferences` JSON column.
// ---------------------------------------------------------------------------

interface InterestsFormProps {
  userType: UserTypeValue
}

export function InterestsForm({ userType }: InterestsFormProps) {
  const router = useRouter()
  const questions = INTERESTS_CONFIG[userType] ?? INTERESTS_CONFIG.INVESTOR

  // State: map of questionId → selected option value
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSelect(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  async function handleContinue() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/users/me/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 3, preferences: answers }),
    })

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? 'Failed to save. Please try again.')
      setLoading(false)
      return
    }

    router.push('/onboarding/complete')
  }

  return (
    <div className="space-y-7">
      {questions.map((question) => (
        <QuestionBlock
          key={question.id}
          question={question}
          selected={answers[question.id] ?? null}
          onSelect={(val) => handleSelect(question.id, val)}
        />
      ))}

      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}

      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="flex min-w-[200px] items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-8 py-3.5 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#D4B86A] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/onboarding/complete')}
          className="text-xs text-[#3A3A48] transition-colors hover:text-[#6B6B80]"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// QuestionBlock — pill-style option row for a single question
// ---------------------------------------------------------------------------

interface QuestionBlockProps {
  question: InterestQuestion
  selected: string | null
  onSelect: (value: string) => void
}

function QuestionBlock({ question, selected, onSelect }: QuestionBlockProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-[#CCCCDD]">{question.label}</p>
      {question.hint && (
        <p className="mb-2 text-xs text-[#4A4A60]">{question.hint}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const isSelected = selected === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium transition-all duration-150',
                isSelected
                  ? 'border-[#C9A84C]/60 bg-[#C9A84C]/10 text-[#C9A84C] shadow-[0_0_8px_rgba(201,168,76,0.15)]'
                  : 'border-[#2A2A3A] bg-transparent text-[#6B6B80] hover:border-[#3A3A4A] hover:text-[#9999AA]',
              )}
              aria-pressed={isSelected}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
