'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, MapPin, User, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { profileStepSchema, type ProfileStepInput } from '@/lib/validations/onboarding'

// ---------------------------------------------------------------------------
// ProfileForm — client component for onboarding step 2.
// Saves name, location, and bio. Email shown read-only (cannot be changed here).
// ---------------------------------------------------------------------------

interface ProfileFormProps {
  defaultName: string
  defaultEmail: string
}

export function ProfileForm({ defaultName, defaultEmail }: ProfileFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)

  const MAX_BIO = 300

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Omit<ProfileStepInput, 'step'>>({
    resolver: zodResolver(profileStepSchema.omit({ step: true })),
    defaultValues: { name: defaultName },
  })

  const bio = watch('bio', '')

  async function onSubmit(data: Omit<ProfileStepInput, 'step'>) {
    setServerError(null)

    const res = await fetch('/api/users/me/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 2, ...data }),
    })

    if (!res.ok) {
      const json = await res.json()
      setServerError(json.error ?? 'Failed to save. Please try again.')
      return
    }

    router.push('/onboarding/interests')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 flex items-center gap-1.5 text-sm text-[#9999AA]">
          <User className="h-3.5 w-3.5" />
          Full name
        </label>
        <input
          {...register('name')}
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Alex Johnson"
          className={cn(
            'w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-[#6E6E7E] outline-none transition-all',
            'focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20',
            errors.name ? 'border-red-500/50' : 'border-white/[0.08]',
          )}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Email — read-only */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm text-[#9999AA]">
          <Mail className="h-3.5 w-3.5" />
          Email address
          <span className="ml-auto text-[10px] text-[#6E6E7E]">Verified</span>
        </label>
        <div className="flex w-full items-center rounded-xl border border-white/[0.06] bg-black/80 px-4 py-3 text-sm text-[#7A7A8A]">
          {defaultEmail}
        </div>
        <p className="mt-1 text-[10px] text-[#6E6E7E]">
          Email can be changed in Settings after setup.
        </p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="mb-1.5 flex items-center gap-1.5 text-sm text-[#9999AA]">
          <MapPin className="h-3.5 w-3.5" />
          Location
          <span className="ml-auto text-[10px] text-[#6E6E7E]">Optional</span>
        </label>
        <input
          {...register('location')}
          id="location"
          type="text"
          autoComplete="address-level2"
          placeholder="Austin, TX"
          className={cn(
            'w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-[#6E6E7E] outline-none transition-all',
            'focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20',
            'border-white/[0.08]',
          )}
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="mb-1.5 flex items-center gap-1.5 text-sm text-[#9999AA]">
          Bio
          <span className="ml-auto text-[10px] text-[#6E6E7E]">Optional</span>
        </label>
        <textarea
          {...register('bio', {
            onChange: (e) => setCharCount(e.target.value.length),
          })}
          id="bio"
          rows={3}
          placeholder="Brief intro — what are you building, buying, or investing in?"
          className={cn(
            'w-full resize-none rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-[#6E6E7E] outline-none transition-all',
            'focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20',
            errors.bio ? 'border-red-500/50' : 'border-white/[0.08]',
          )}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.bio ? (
            <p className="text-xs text-red-400">{errors.bio.message}</p>
          ) : (
            <span />
          )}
          <span
            className={cn(
              'text-[10px] tabular-nums',
              charCount > MAX_BIO * 0.9 ? 'text-amber-400' : 'text-[#6E6E7E]',
            )}
          >
            {charCount}/{MAX_BIO}
          </span>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <p className="text-center text-sm text-red-400">{serverError}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-w-[200px] items-center justify-center gap-2 rounded-xl bg-indigo-500 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? (
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
          onClick={() => router.push('/onboarding/interests')}
          className="text-xs text-[#6E6E7E] transition-colors hover:text-[#8E8E9C]"
        >
          Skip for now
        </button>
      </div>
    </form>
  )
}
