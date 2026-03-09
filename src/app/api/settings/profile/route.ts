// ---------------------------------------------------------------------------
// PATCH /api/settings/profile
//
// Updates editable user profile fields: name, phone, location, bio,
// and notification preferences (stored in User.preferences JSON).
//
// Auth: session required — users may only update their own record.
// Validation: minimal length/type guards; no Zod in this path to keep it lean.
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
} from '@/lib/settings/notification-prefs'

// Re-export so server-only consumers (tests, page) can import from here if
// they prefer — but client components must always import from the shared lib.
export type { NotificationPrefs }
export { DEFAULT_NOTIFICATION_PREFS }

interface ProfilePatchBody {
  name?:               string
  phone?:              string | null
  location?:           string | null
  bio?:                string | null
  avatarUrl?:          string | null
  notificationPrefs?:  Partial<NotificationPrefs>
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const patch = body as ProfilePatchBody

  // Basic validation
  if (patch.name !== undefined) {
    if (typeof patch.name !== 'string' || patch.name.trim().length < 1) {
      return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 422 })
    }
    if (patch.name.trim().length > 80) {
      return NextResponse.json({ error: 'name too long (max 80 chars)' }, { status: 422 })
    }
  }
  if (patch.bio !== undefined && patch.bio !== null && patch.bio.length > 500) {
    return NextResponse.json({ error: 'bio too long (max 500 chars)' }, { status: 422 })
  }

  // Load current preferences to merge notification prefs
  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  })

  const currentPrefs = (current?.preferences as Record<string, unknown>) ?? {}
  const currentNotifPrefs =
    (currentPrefs.notificationPrefs as NotificationPrefs | undefined) ??
    DEFAULT_NOTIFICATION_PREFS

  const updatedNotifPrefs: NotificationPrefs = patch.notificationPrefs
    ? { ...currentNotifPrefs, ...patch.notificationPrefs }
    : currentNotifPrefs

  const updateData: Record<string, unknown> = {
    preferences: { ...currentPrefs, notificationPrefs: updatedNotifPrefs },
  }

  if (patch.name      !== undefined) updateData.name     = patch.name.trim()
  if (patch.phone     !== undefined) updateData.phone    = patch.phone     ?? null
  if (patch.location  !== undefined) updateData.location = patch.location  ?? null
  if (patch.bio       !== undefined) updateData.bio      = patch.bio       ?? null
  if (patch.avatarUrl !== undefined) updateData.avatarUrl = patch.avatarUrl ?? null

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        bio: true,
        avatarUrl: true,
        preferences: true,
      },
    })

    return NextResponse.json({ ok: true, user: updated })
  } catch (err) {
    logger.warn('Failed to update profile', { error: (err as Error).message })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
