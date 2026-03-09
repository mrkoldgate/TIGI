// ---------------------------------------------------------------------------
// notification-prefs.ts — Shared type and default for notification preferences.
//
// This is the canonical source for NotificationPrefs — used by:
//   - PATCH /api/settings/profile (server: validates and persists)
//   - ProfileClient (client: renders toggles)
//   - /settings/profile page (server: deserialises from User.preferences JSON)
//
// Stored as User.preferences.notificationPrefs (JSON column).
// Do NOT import this from the API route file — keep this file as the
// shared ground truth so client components can safely import from it.
// ---------------------------------------------------------------------------

export interface NotificationPrefs {
  /** Email when someone sends an inquiry about the user's listing */
  emailInquiries: boolean
  /** Email when a listing review status changes */
  emailListingUpdates: boolean
  /** Email when investment intent or token activity occurs */
  emailTokenUpdates: boolean
  /** Occasional product and feature announcement emails */
  emailMarketing: boolean
  /** Show the in-app notification dot and feed */
  inAppAll: boolean
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  emailInquiries:      true,
  emailListingUpdates: true,
  emailTokenUpdates:   true,
  emailMarketing:      false,
  inAppAll:            true,
}
