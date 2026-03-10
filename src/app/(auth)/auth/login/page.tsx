'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'

// ---------------------------------------------------------------------------
// Sign in page — email/password + Google OAuth
// ---------------------------------------------------------------------------

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/marketplace'
  const urlError = searchParams.get('error')

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(
    urlError === 'CredentialsSignin' ? 'Incorrect email or password.' : null,
  )
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError('Incorrect email or password.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl" style={{ boxShadow: '0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 32px 64px rgba(0,0,0,0.5)' }}>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[#6B6B80]">
          Sign in to your TIGI account
        </p>
      </div>

      {/* Server / OAuth error */}
      {serverError && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || googleLoading}
        className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A2A3A] bg-[#16161F] px-4 py-3 text-sm font-medium text-white transition-all hover:border-[#3A3A50] hover:bg-[#1C1C28] disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative mb-6 flex items-center">
        <div className="flex-1 border-t border-[#1E1E2A]" />
        <span className="mx-4 text-xs text-[#3A3A48]">or sign in with email</span>
        <div className="flex-1 border-t border-[#1E1E2A]" />
      </div>

      {/* Credentials form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-[#9999AA]">
            Email address
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              'w-full rounded-xl border bg-[#0E0E16] px-4 py-3 text-sm text-white placeholder-[#3A3A4A] outline-none transition-all',
              'focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/20',
              errors.email ? 'border-red-500/50' : 'border-[#2A2A3A]',
            )}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm text-[#9999AA]">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(
                'w-full rounded-xl border bg-[#0E0E16] px-4 py-3 pr-11 text-sm text-white placeholder-[#3A3A4A] outline-none transition-all',
                'focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/20',
                errors.password ? 'border-red-500/50' : 'border-[#2A2A3A]',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4A60] hover:text-[#9999AA] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || googleLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:from-[#2563EB] hover:to-[#1D4ED8] hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-[#6B6B80]">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="font-medium text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" /></div>}>
      <LoginContent />
    </Suspense>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
