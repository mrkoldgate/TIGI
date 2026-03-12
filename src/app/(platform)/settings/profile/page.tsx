import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/shared/page-header'
import { ProfileClient } from '@/components/settings/profile-client'
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
} from '@/lib/settings/notification-prefs'

export const metadata: Metadata = {
  title: 'Profile — Settings',
  description: 'Edit your name, contact details, bio, and notification preferences.',
}

// ---------------------------------------------------------------------------
// /settings/profile — Profile & notification preferences
//
// Fetches the current user's full profile fields from DB, then delegates to
// ProfileClient for in-place editing. Saves via PATCH /api/settings/profile.
//
// Fields surfaced: name, email, phone, location, bio, avatarUrl,
//   kycStatus, subscriptionTier, walletAddress, notificationPrefs (JSON).
// ---------------------------------------------------------------------------

export default async function ProfileSettingsPage() {
  const sessionUser = await requireAuth('/settings/profile')

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id:               true,
      name:             true,
      email:            true,
      phone:            true,
      location:         true,
      bio:              true,
      avatarUrl:        true,
      kycStatus:        true,
      subscriptionTier: true,
      walletAddress:    true,
      preferences:      true,
    },
  })

  // Preferences are a JSON blob; extract notification prefs sub-key
  const prefsJson = (user?.preferences as Record<string, unknown>) ?? {}
  const notificationPrefs: NotificationPrefs = {
    ...DEFAULT_NOTIFICATION_PREFS,
    ...((prefsJson.notificationPrefs as Partial<NotificationPrefs>) ?? {}),
  }

  const profileUser = {
    id:               user?.id ?? sessionUser.id,
    name:             user?.name ?? null,
    email:            user?.email ?? sessionUser.email ?? '',
    phone:            user?.phone ?? null,
    location:         user?.location ?? null,
    bio:              user?.bio ?? null,
    avatarUrl:        user?.avatarUrl ?? null,
    kycStatus:        user?.kycStatus ?? 'NONE',
    subscriptionTier: user?.subscriptionTier ?? 'free',
    walletAddress:    user?.walletAddress ?? null,
    notificationPrefs,
  }

  return (
    <div className="animate-fade-in pt-8 pb-16">
      <PageHeader
        title="Profile"
        description="Manage your personal information and notification preferences."
      />
      <div className="mt-8 max-w-2xl">
        <ProfileClient user={profileUser} />
      </div>
    </div>
  )
}
