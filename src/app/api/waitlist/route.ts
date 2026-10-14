// POST /api/waitlist — public, qualified waitlist sign-up (no account needed).
//
// Stores the entry in the database and, when WAITLIST_WEBHOOK_URL is set,
// forwards it as JSON (e.g. to a Google Sheets Apps Script, Zapier, Make or
// Slack workflow) so sign-ups survive the demo database being rebuilt on each
// deploy. Succeeds if either destination accepts the entry.

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import {
  WAITLIST_AMOUNTS,
  WAITLIST_HOMES,
  WAITLIST_INTEREST_IDS,
  WAITLIST_MARKETS,
} from '@/lib/waitlist/waitlist-options'

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().max(120).optional().or(z.literal('')),
  livesIn: z.enum(WAITLIST_HOMES),
  market: z.enum(WAITLIST_MARKETS),
  interests: z.array(z.enum(WAITLIST_INTEREST_IDS as [string, ...string[]])).min(1).max(5),
  amountRange: z.enum(WAITLIST_AMOUNTS).optional(),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
  source: z.string().trim().max(120).optional(),
  // Honeypot — real people never see or fill this field.
  company: z.string().max(0).optional().or(z.literal('')),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the highlighted fields.', issues: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const { company, ...entry } = parsed.data
  // Bots fill the honeypot: pretend success, store nothing.
  if (company) return NextResponse.json({ ok: true })

  const record = {
    email: entry.email,
    name: entry.name || null,
    livesIn: entry.livesIn,
    market: entry.market,
    interests: entry.interests.join(','),
    amountRange: entry.amountRange ?? null,
    message: entry.message || null,
    source: entry.source ?? null,
  }

  let stored = false
  try {
    await prisma.waitlistEntry.create({ data: record })
    stored = true
  } catch (err) {
    console.error('[waitlist] database write failed', err instanceof Error ? err.message : err)
  }

  let forwarded = false
  const hook = process.env.WAITLIST_WEBHOOK_URL
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...record, createdAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      })
      forwarded = res.ok
      if (!res.ok) console.error('[waitlist] webhook responded', res.status)
    } catch (err) {
      console.error('[waitlist] webhook failed', err instanceof Error ? err.message : err)
    }
  }

  if (!stored && !forwarded) {
    return NextResponse.json({ error: 'We couldn’t save your place just now. Please try again in a minute.' }, { status: 503 })
  }

  // Log only non-personal fields, for demand counts per market.
  console.info('[waitlist] new entry', { market: record.market, livesIn: record.livesIn, interests: record.interests, stored, forwarded })
  return NextResponse.json({ ok: true })
}
