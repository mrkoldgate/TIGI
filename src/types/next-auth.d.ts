import type { UserRole, KycStatus, SubscriptionTier } from '@prisma/client'
import type { DefaultSession, DefaultJWT } from 'next-auth'

// ---------------------------------------------------------------------------
// Augment next-auth types to include TIGI-specific session fields.
// These fields are embedded by the jwt callback in auth.config.ts.
// ---------------------------------------------------------------------------

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: UserRole
      kycStatus: KycStatus
      subscriptionTier: SubscriptionTier
      walletAddress: string | null
      onboardingComplete: boolean
    }
  }

  interface User {
    role?: UserRole
    kycStatus?: KycStatus
    subscriptionTier?: SubscriptionTier
    walletAddress?: string | null
    onboardingComplete?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    role?: UserRole
    kycStatus?: KycStatus
    subscriptionTier?: SubscriptionTier
    walletAddress?: string | null
    onboardingComplete?: boolean
  }
}
