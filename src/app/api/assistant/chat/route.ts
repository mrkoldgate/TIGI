// ---------------------------------------------------------------------------
// POST /api/assistant/chat
//
// Runs one Aria conversation turn:
//   - Validates auth
//   - Builds AIContext from session (tier + role → personalised system prompt)
//   - Accepts the last N messages from the client
//   - Calls runAssistantPipeline (real AI or mock depending on AI_PROVIDER)
//   - Returns ContentBlock[] JSON
//
// Rate limiting: authenticated users only, no per-minute cap in MVP.
// M7 upgrade: add Redis-backed rate limit (50 msgs/day Free, unlimited Pro+).
//
// Request body:
//   { messages: { role: 'user' | 'assistant', text: string }[] }
//
// Response:
//   { success: true,  blocks: ContentBlock[] }
//   { success: false, error: string }          on validation or pipeline failure
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { runAssistantPipeline, type ChatMessage } from '@/lib/ai/assistant-pipeline'
import type { AIContext } from '@/lib/ai/ai-types'

const MAX_MESSAGES = 20  // Max history depth accepted from client

export async function POST(request: Request) {
  // 1. Auth
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    )
  }

  // 2. Build user context for personalised AI responses
  const context: AIContext = {
    userId:           session.user.id,
    subscriptionTier: (session.user as { subscriptionTier?: string }).subscriptionTier ?? 'free',
    role:             (session.user as { role?: string }).role ?? 'INVESTOR',
  }

  // 3. Parse body
  let messages: ChatMessage[]
  try {
    const body = await request.json() as { messages?: unknown }
    if (!Array.isArray(body.messages)) {
      return NextResponse.json(
        { success: false, error: 'messages must be an array' },
        { status: 400 },
      )
    }
    messages = (body.messages as unknown[])
      .slice(-MAX_MESSAGES)
      .filter((m): m is ChatMessage =>
        typeof m === 'object' &&
        m !== null &&
        'role' in m &&
        'text' in m &&
        ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant'),
      )
      .map((m) => ({
        role: m.role,
        text: String(m.text).slice(0, 2000),  // Cap per-message length
      }))

    if (messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid messages provided' },
        { status: 400 },
      )
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    )
  }

  // 4. Run pipeline with user context
  try {
    const blocks = await runAssistantPipeline(messages, context)
    return NextResponse.json({ success: true, blocks })
  } catch (err) {
    console.error('[api/assistant/chat] Pipeline error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to generate response' },
      { status: 500 },
    )
  }
}
