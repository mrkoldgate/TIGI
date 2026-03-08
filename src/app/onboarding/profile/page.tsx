import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/onboarding/profile-form'

// ---------------------------------------------------------------------------
// Step 2 — Profile basics (Server Component shell).
// Pre-fills name from session. Passes data to ProfileForm client component.
// ---------------------------------------------------------------------------

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
          Set up your profile
        </h1>
        <p className="mt-3 text-sm text-[#6B6B80]">
          This helps buyers, sellers, and developers know who they&apos;re working with.
        </p>
      </div>

      <ProfileForm
        defaultName={session.user.name ?? ''}
        defaultEmail={session.user.email ?? ''}
      />
    </div>
  )
}
