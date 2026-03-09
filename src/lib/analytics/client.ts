'use client'

// ---------------------------------------------------------------------------
// Analytics client — provider-agnostic event tracking.
//
// useAnalytics(): React hook — returns a stable `track` callback.
//                 Use inside React components.
//
// track():        Module-level function — use outside React components
//                 (e.g. in event handlers that run at module scope,
//                  or in setTimeout callbacks).
//
// Events are:
//   1. console.debug'd in development (NODE_ENV=development)
//   2. Sent to POST /api/analytics (fire-and-forget, keepalive)
//      The ingest route handles AuditLog persistence + future provider fan-out.
//
// Failures are silently swallowed — analytics must NEVER crash the app.
// ---------------------------------------------------------------------------

import { useCallback } from 'react'
import type { TIGIEvent } from './events'

const isDev = process.env.NODE_ENV === 'development'

/** Send an event to the analytics ingest endpoint. Fire-and-forget. */
export function track(event: TIGIEvent): void {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug('[TIGI Analytics]', event.name, (event as { properties?: unknown }).properties ?? '')
  }

  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
    // keepalive ensures the request survives page navigation
    keepalive: true,
  }).catch(() => {
    /* non-critical — never crash on analytics failure */
  })
}

/** React hook — returns a stable `track` callback. */
export function useAnalytics() {
  const trackEvent = useCallback((event: TIGIEvent) => {
    track(event)
  }, [])

  return { track: trackEvent }
}
