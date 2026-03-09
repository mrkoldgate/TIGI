import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/db'
import { authConfig } from '@/auth.config'
import { loginSchema } from '@/lib/validations/auth'

// ---------------------------------------------------------------------------
// auth.ts — Full NextAuth config (Node.js runtime only).
//
// Extends authConfig with:
//   - PrismaAdapter (persists OAuth accounts, sessions)
//   - Credentials provider (email + bcrypt password)
//
// DO NOT import this in middleware — use authConfig from auth.config.ts instead.
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  adapter: PrismaAdapter(prisma),

  providers: [
    // Spread edge providers from authConfig (Google, etc.)
    ...authConfig.providers,

    // Credentials provider — email/password with bcrypt
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input shape with Zod
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            passwordHash: true,
            role: true,
            userType: true,
            kycStatus: true,
            subscriptionTier: true,
            walletAddress: true,
            onboardingStep: true,
          },
        })

        // No user found or OAuth-only user (no password)
        if (!user || !user.passwordHash) return null

        const passwordValid = await bcrypt.compare(password, user.passwordHash)
        if (!passwordValid) return null

        // Return shape — augmented fields flow through jwt callback
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          userType: user.userType,
          kycStatus: user.kycStatus,
          subscriptionTier: user.subscriptionTier,
          walletAddress: user.walletAddress,
          onboardingComplete: user.onboardingStep >= 4,
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    // Override jwt to also handle OAuth sign-ins and session updates (fetch DB fields)
    async jwt({ token, user, account, trigger }) {
      // First sign-in — user object present
      if (user) {
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

      // Re-fetch from DB on: OAuth sign-ins OR explicit session update() call
      // This ensures subscription tier changes (billing upgrades) reflect immediately
      const shouldRefresh =
        (account?.provider !== 'credentials' && !!token.id) ||
        trigger === 'update'

      if (shouldRefresh && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            userType: true,
            kycStatus: true,
            subscriptionTier: true,
            walletAddress: true,
            onboardingStep: true,
          },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.userType = dbUser.userType
          token.kycStatus = dbUser.kycStatus
          token.subscriptionTier = dbUser.subscriptionTier
          token.walletAddress = dbUser.walletAddress
          token.onboardingComplete = dbUser.onboardingStep >= 4
        }
      }

      return token
    },
  },

  events: {
    // Auto-create custodial wallet stub on first OAuth sign-in
    async createUser({ user }) {
      if (user.id) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'user.register',
            resourceType: 'User',
            resourceId: user.id,
            metadata: { provider: 'oauth' },
          },
        })
      }
    },
  },
})
