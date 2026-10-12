import Link from 'next/link'
import { Mail } from 'lucide-react'

// ---------------------------------------------------------------------------
// Email verification pending screen.
// Shown after registration if/when email verification is enabled.
// Currently informational — actual email sending deferred to post-MVP.
// ---------------------------------------------------------------------------

export default function VerifyPage() {
  return (
    <div className="rounded-2xl border border-white/[0.04] bg-[#050505] p-8 text-center shadow-2xl">
      {/* Icon */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#6366F1]/20 bg-[#6366F1]/10">
        <Mail className="h-7 w-7 text-[#6366F1]" />
      </div>

      <h1 className="font-heading text-2xl font-bold text-white">
        Check your inbox
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#6B6B80]">
        We&apos;ve sent a verification link to your email address. Click the link
        to activate your account and complete setup.
      </p>

      {/* Callout */}
      <div className="my-6 rounded-xl border border-white/[0.04] bg-[#0E0E16] px-4 py-3 text-left">
        <p className="text-xs text-[#6B6B80]">
          <span className="text-[#9999AA]">Tip:</span> If you don&apos;t see the
          email, check your spam or junk folder. The link expires in 24 hours.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center rounded-xl bg-[#6366F1] px-4 py-3 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#4F46E5]"
        >
          Back to sign in
        </Link>
        <button
          type="button"
          className="text-sm text-[#4A4A60] hover:text-[#9999AA] transition-colors"
        >
          Resend verification email
        </button>
      </div>
    </div>
  )
}
