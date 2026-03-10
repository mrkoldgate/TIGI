// ---------------------------------------------------------------------------
// POST /api/analytics — analytics event ingest endpoint.
//
// Accepts a TIGIEvent JSON body.
// For authenticated users: persists the event to AuditLog (non-blocking).
// Always returns { ok: true } — this is a non-critical path.
//
// Future providers (PostHog, Segment, Amplitude, etc.) can be wired here
// without changing any call sites in the application.
//
// Rate-limiting: handled at edge / middleware layer (M6+).
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import type { TIGIEvent } from '@/lib/analytics/events'

type EventWithProperties = TIGIEvent & {
  properties?: Record<string, unknown>
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const event = body as EventWithProperties
  if (!event?.name || typeof event.name !== 'string') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  // Persist to AuditLog for authenticated users (non-blocking)
  const session = await auth().catch(() => null)
  if (session?.user?.id) {
    void prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: event.name,
        resourceType: 'Event',
        resourceId: event.properties?.listingId as string ?? 'n/a',
        metadata: (event.properties ?? {}) as import('@prisma/client').Prisma.InputJsonValue,
      },
    }).catch(() => { /* non-critical */ })
  }

  // TODO M6: fan out to PostHog / Segment
  // if (process.env.POSTHOG_API_KEY) { ... }

  return NextResponse.json({ ok: true })
}
