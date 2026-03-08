'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_CARDS, type UserTypeValue } from '@/lib/onboarding/config'

// ---------------------------------------------------------------------------
// Step 1 — Role selection.
//
// 8 roles → 2-column grid on md+, 1-column on mobile.
// Professional roles span full width (visual hierarchy grouping).
// On save: PATCH /api/users/me/onboarding step=1 → navigate to step 2.
// ---------------------------------------------------------------------------

const CORE_ROLES = ROLE_CARDS.filter(
  (c) => !['LEGAL_PROFESSIONAL', 'FINANCIAL_PROFESSIONAL'].includes(c.userType),
)
const PROFESSIONAL_ROLES = ROLE_CARDS.filter((c) =>
  ['LEGAL_PROFESSIONAL', 'FINANCIAL_PROFESSIONAL'].includes(c.userType),
)

export default function RolePage() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const [selected, setSelected] = useState<UserTypeValue | null>(
    (session?.user?.userType as UserTypeValue) ?? null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/users/me/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 1, userType: selected }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to save. Please try again.')
        return
      }

      const { role } = await res.json()

      // Refresh JWT with new role + userType
      await updateSession({ role, userType: selected })

      router.push('/onboarding/profile')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
          How will you use TIGI?
        </h1>
        <p className="mt-3 text-sm text-[#6B6B80] md:text-base">
          Choose the role that best describes you. You can always update this later.
        </p>
      </div>

      {/* Core roles grid — 2×3 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {CORE_ROLES.map((card) => (
          <RoleCard
            key={card.userType}
            card={card}
            selected={selected === card.userType}
            onClick={() => setSelected(card.userType)}
          />
        ))}
      </div>

      {/* Professional roles — visually separated */}
      <div className="mt-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#1E1E2A]" />
          <span className="text-xs text-[#3A3A48]">Professional access</span>
          <div className="h-px flex-1 bg-[#1E1E2A]" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PROFESSIONAL_ROLES.map((card) => (
            <RoleCard
              key={card.userType}
              card={card}
              selected={selected === card.userType}
              onClick={() => setSelected(card.userType)}
              compact
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className={cn(
            'flex min-w-[200px] items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all',
            selected && !loading
              ? 'bg-[#C9A84C] text-[#0A0A0F] hover:bg-[#D4B86A] active:scale-[0.98]'
              : 'cursor-not-allowed bg-[#1A1A24] text-[#3A3A48]',
          )}
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
          onClick={() => router.push('/marketplace')}
          className="text-xs text-[#3A3A48] transition-colors hover:text-[#6B6B80]"
        >
          Skip setup — explore first
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RoleCard
// ---------------------------------------------------------------------------

interface RoleCardProps {
  card: (typeof ROLE_CARDS)[number]
  selected: boolean
  onClick: () => void
  compact?: boolean
}

function RoleCard({ card, selected, onClick, compact = false }: RoleCardProps) {
  const Icon = card.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-2xl border text-left transition-all duration-200',
        compact ? 'p-4' : 'p-5',
        selected
          ? 'border-[#C9A84C]/60 shadow-[0_0_24px_rgba(201,168,76,0.1)]'
          : 'border-[#1C1C28] hover:border-[#2A2A3A]',
      )}
      style={{ background: selected ? 'rgba(201,168,76,0.04)' : card.gradient }}
      aria-pressed={selected}
    >
      {/* Selected check */}
      <span
        className={cn(
          'absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-all',
          selected
            ? 'bg-[#C9A84C] opacity-100'
            : 'border border-[#2A2A3A] bg-transparent opacity-0 group-hover:opacity-100',
        )}
      >
        <Check className={cn('h-3 w-3', selected ? 'text-[#0A0A0F]' : 'text-[#3A3A48]')} />
      </span>

      {/* Popular badge */}
      {card.badge && !compact && (
        <span className="absolute left-3 top-3 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-2 py-0.5 text-[10px] font-medium text-[#C9A84C]">
          {card.badge}
        </span>
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border border-[#C9A84C]/15 bg-[#C9A84C]/8',
          compact ? 'mb-3 h-8 w-8' : 'mb-4 h-10 w-10',
          card.badge && !compact && 'mt-5',
        )}
      >
        <Icon
          className={cn(
            'text-[#C9A84C]',
            compact ? 'h-4 w-4' : 'h-5 w-5',
          )}
        />
      </div>

      {/* Text */}
      <p className={cn('font-heading font-semibold text-white', compact ? 'text-sm' : 'text-base')}>
        {card.label}
      </p>
      <p className={cn('mt-0.5 text-[#C9A84C]/80', compact ? 'text-[10px]' : 'text-xs')}>
        {card.tagline}
      </p>
      {!compact && (
        <p className="mt-2 text-xs leading-relaxed text-[#5A5A6E]">
          {card.description}
        </p>
      )}
    </button>
  )
}
