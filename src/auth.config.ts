import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

// ---------------------------------------------------------------------------
// auth.config.ts — Edge-compatible NextAuth configuration.
//
// This file is used by middleware (Edge Runtime) and therefore MUST NOT
// import Prisma, bcrypt, or any Node.js-only modules.
//
// Used by:  middleware.ts  →  NextAuth(authConfig).auth()
// Full:     auth.ts        →  adds Prisma adapter + Credentials provider
// ---------------------------------------------------------------------------

export const authConfig: NextAuthConfig = {
  providers: [
    // Google provider is edge-safe — no DB calls during instantiation
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    // ---------------------------------------------------------------------------
    // authorized — called by middleware on every matched request.
    // Returns true = allow, false = redirect to signIn page.
    // ---------------------------------------------------------------------------
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // ---- Admin routes -------------------------------------------------------
      const isAdminRoute = pathname.startsWith('/admin')
      if (isAdminRoute) {
        if (!isLoggedIn) return false
        const role = (auth?.user as { role?: string })?.role
        return role === 'ADMIN' || role === 'COMPLIANCE_OFFICER'
      }

      // ---- Platform (authenticated) routes ------------------------------------
      const isProtectedRoute =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/saved') ||
        pathname.startsWith('/portfolio') ||
        pathname.startsWith('/transactions') ||
        pathname.startsWith('/listings') ||
        pathname.startsWith('/inheritance') ||
        pathname.startsWith('/leasing') ||
        pathname.startsWith('/management') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/onboarding')

      if (isProtectedRoute) return isLoggedIn

      // ---- Auth pages — redirect authenticated users to marketplace ----------
      const isAuthPage =
        pathname.startsWith('/auth/login') ||
        pathname.startsWith('/auth/register')

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/marketplace', nextUrl))
      }

      // Everything else (marketing, public API, static) — allow through
      return true
    },

    // ---------------------------------------------------------------------------
    // jwt — embed TIGI-specific fields into token at sign-in.
    // The token is the source of truth for session data.
    // ---------------------------------------------------------------------------
    jwt({ token, user }) {
      if (user) {
        // Embed DB fields into token at first sign-in
        token.id = user.id as string
        token.role = (user as { role?: string }).role ?? 'INVESTOR'
        token.userType = (user as { userType?: string | null }).userType ?? null
        token.kycStatus = (user as { kycStatus?: string }).kycStatus ?? 'NONE'
        token.subscriptionTier =
          (user as { subscriptionTier?: string }).subscriptionTier ?? 'free'
        token.walletAddress =
          (user as { walletAddress?: string | null }).walletAddress ?? null
        token.onboardingComplete =
          (user as { onboardingComplete?: boolean }).onboardingComplete ?? false
      }
      return token
    },

    // ---------------------------------------------------------------------------
    // session — expose token fields to client via useSession() / getServerSession()
    // ---------------------------------------------------------------------------
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.userType = token.userType as string | null
        session.user.kycStatus = token.kycStatus as string
        session.user.subscriptionTier = token.subscriptionTier as string
        session.user.walletAddress = token.walletAddress as string | null
        session.user.onboardingComplete = token.onboardingComplete as boolean
      }
      return session
    },
  },
}
