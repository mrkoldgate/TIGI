import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import type { UserRole } from '@prisma/client'

// ---------------------------------------------------------------------------
// Server-side session helpers.
// Use in Server Components, API route handlers, and Server Actions.
// ---------------------------------------------------------------------------

/**
 * Returns the current session user, or null if not authenticated.
 * Safe to call in any Server Component.
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

/**
 * Returns the current user, redirecting to /auth/login if not authenticated.
 * Use in protected Server Components or layout files.
 *
 * @param callbackUrl — the URL to redirect back to after login
 */
export async function requireAuth(callbackUrl?: string) {
  const user = await getCurrentUser()
  if (!user) {
    const loginUrl = callbackUrl
      ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/auth/login'
    redirect(loginUrl)
  }
  return user
}

/**
 * Returns the current user, redirecting to /marketplace if not an admin.
 * Use in admin-only Server Components.
 */
export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN' && user.role !== 'COMPLIANCE_OFFICER') {
    redirect('/marketplace')
  }
  return user
}

/**
 * Returns the current user, redirecting to /onboarding if onboarding
 * hasn't been completed yet. Use at the top of key platform pages.
 */
export async function requireOnboarded() {
  const user = await requireAuth()
  if (!user.onboardingComplete) {
    redirect('/onboarding')
  }
  return user
}

/**
 * Returns the post-login redirect URL based on user role.
 * Investor → /portfolio, Owner → /listings, Admin → /admin/dashboard
 */
export function getPostLoginRedirect(
  role: UserRole | string,
  callbackUrl?: string | null,
): string {
  if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('/auth')) {
    return callbackUrl
  }

  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'COMPLIANCE_OFFICER':
      return '/admin/compliance'
    case 'OWNER':
      return '/listings'
    case 'BOTH':
      return '/marketplace'
    case 'INVESTOR':
    default:
      return '/marketplace'
  }
}
