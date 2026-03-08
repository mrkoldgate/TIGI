import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { InterestsForm } from '@/components/onboarding/interests-form'
import type { UserTypeValue } from '@/lib/onboarding/config'

// ---------------------------------------------------------------------------
// Step 3 — Interests & preferences (Server Component shell).
// Reads userType from DB to determine which questions to render.
// Passes to InterestsForm client component.
// ---------------------------------------------------------------------------

export default async function InterestsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  // Fetch userType from DB (not in JWT after role step without refresh)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userType: true, name: true },
  })

  const userType = (user?.userType ?? 'INVESTOR') as UserTypeValue
  const firstName = user?.name?.split(' ')[0] ?? null

  return (
    <div className="w-full max-w-xl">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
          {firstName ? `What are you looking for, ${firstName}?` : 'What are you looking for?'}
        </h1>
        <p className="mt-3 text-sm text-[#6B6B80]">
          This helps TIGI surface the most relevant listings and opportunities.
        </p>
      </div>

      <InterestsForm userType={userType} />
    </div>
  )
}
