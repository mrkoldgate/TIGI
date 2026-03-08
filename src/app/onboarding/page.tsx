'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  TrendingUp,
  Building2,
  Layers,
  Briefcase,
  Loader2,
  ArrowRight,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Onboarding — Step 1: Role selection.
//
// Maps user-facing roles to DB UserRole enum:
//   Investor      → INVESTOR
//   Property Owner → OWNER
//   Both          → BOTH
//   Professional  → INVESTOR (MVP mapping — TODO: add PROFESSIONAL enum)
//
// After selection, updates user role via API and refreshes session.
// Redirects to role-appropriate dashboard.
// ---------------------------------------------------------------------------

type RoleOption = {
  id: 'INVESTOR' | 'OWNER' | 'BOTH'
  label: string
  tagline: string
  description: string
  icon: React.ElementType
  gradient: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'INVESTOR',
    label: 'Investor',
    tagline: 'Build wealth through property fractions',
    description:
      'Browse tokenized properties, invest in fractional ownership, track your portfolio and yields.',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #0F1A1F 0%, #0D2030 100%)',
  },
  {
    id: 'OWNER',
    label: 'Property Owner',
    tagline: 'List, tokenize and manage your assets',
    description:
      'List your properties on TIGI, tokenize ownership, manage tenants, and receive payments on-chain.',
    icon: Building2,
    gradient: 'linear-gradient(135deg, #1A1210 0%, #2A1A10 100%)',
  },
  {
    id: 'BOTH',
    label: 'Both',
    tagline: 'Invest and list — full platform access',
    description:
      'The complete TIGI experience. Invest in others\' properties while listing and managing your own.',
    icon: Layers,
    gradient: 'linear-gradient(135deg, #0F0F1A 0%, #1A1528 100%)',
  },
]

// Professional mapping — shown as option but stored as INVESTOR for MVP
const PROFESSIONAL_OPTION = {
  id: 'INVESTOR' as const, // MVP: maps to INVESTOR
  label: 'Professional',
  tagline: 'Agent, advisor, or fund manager',
  description:
    'Real estate professionals, advisors, and fund managers accessing the TIGI deal flow.',
  icon: Briefcase,
  gradient: 'linear-gradient(135deg, #101A10 0%, #182710 100%)',
  isMvpNote: true,
}

export default function OnboardingPage() {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [selected, setSelected] = useState<'INVESTOR' | 'OWNER' | 'BOTH' | null>(null)
  const [isProfessional, setIsProfessional] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveRole = isProfessional ? 'INVESTOR' : selected

  async function handleContinue() {
    if (!effectiveRole) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/users/me/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: effectiveRole }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to save role. Please try again.')
        return
      }

      // Refresh session so JWT gets new role
      await updateSession({ role: effectiveRole, onboardingComplete: true })

      // Redirect by role
      switch (effectiveRole) {
        case 'OWNER':
          router.push('/listings')
          break
        case 'BOTH':
          router.push('/marketplace')
          break
        default:
          router.push('/marketplace')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-3 py-1 text-xs font-medium text-[#C9A84C]">
          Step 1 of 2
        </div>
        <h1 className="font-heading text-3xl font-bold text-white">
          How will you use TIGI?
        </h1>
        <p className="mt-3 text-[#6B6B80]">
          This helps us personalize your dashboard. You can change it later.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLE_OPTIONS.map((option) => {
          const isSelected = selected === option.id && !isProfessional
          return (
            <RoleCard
              key={option.id}
              option={option}
              selected={isSelected}
              onClick={() => {
                setSelected(option.id)
                setIsProfessional(false)
              }}
            />
          )
        })}

        {/* Professional card — full width */}
        <div className="sm:col-span-2">
          <RoleCard
            option={PROFESSIONAL_OPTION}
            selected={isProfessional}
            onClick={() => {
              setIsProfessional(true)
              setSelected(null)
            }}
            note="MVP: mapped to Investor role. Full Professional features coming soon."
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}

      {/* Continue CTA */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!effectiveRole || loading}
          className={cn(
            'flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all',
            effectiveRole && !loading
              ? 'bg-[#C9A84C] text-[#0A0A0F] hover:bg-[#D4B86A] active:scale-[0.98]'
              : 'cursor-not-allowed bg-[#1E1E2A] text-[#4A4A60]',
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
      </div>

      {/* Skip — for users who want to explore first */}
      <div className="mt-4 text-center">
        <button
          onClick={() => router.push('/marketplace')}
          className="text-sm text-[#4A4A60] hover:text-[#6B6B80] transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

type RoleCardProps = {
  option: RoleOption | typeof PROFESSIONAL_OPTION
  selected: boolean
  onClick: () => void
  note?: string
}

function RoleCard({ option, selected, onClick, note }: RoleCardProps) {
  const Icon = option.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full rounded-2xl border p-5 text-left transition-all duration-200',
        selected
          ? 'border-[#C9A84C]/50 bg-[#C9A84C]/5 shadow-[0_0_20px_rgba(201,168,76,0.08)]'
          : 'border-[#1E1E2A] hover:border-[#2A2A3A] hover:bg-[#111118]',
      )}
      style={{ background: selected ? undefined : option.gradient }}
    >
      {/* Selected checkmark */}
      {selected && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A84C]">
          <Check className="h-3 w-3 text-[#0A0A0F]" />
        </span>
      )}

      {/* Icon */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/10">
        <Icon className="h-5 w-5 text-[#C9A84C]" />
      </div>

      {/* Text */}
      <p className="font-heading font-semibold text-white">{option.label}</p>
      <p className="mt-0.5 text-xs text-[#C9A84C]">{option.tagline}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#6B6B80]">
        {option.description}
      </p>

      {/* MVP note */}
      {note && (
        <p className="mt-3 text-[10px] text-[#3A3A48] italic">{note}</p>
      )}
    </button>
  )
}
