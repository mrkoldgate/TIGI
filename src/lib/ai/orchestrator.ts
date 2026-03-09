// ---------------------------------------------------------------------------
// TIGI AI Orchestrator
//
// Single entry point for all AI features in TIGI. Every AI operation routes
// through here — assistant chat, valuation narrative enrichment, and any
// future AI tasks (document summary, portfolio insights, etc.).
//
// Responsibilities:
//   - Provider routing: mock → Anthropic (extensible to OpenAI)
//   - Feature access control: free vs Pro vs Pro+ gating
//   - Centralised error handling + mock fallback on failure
//   - Latency tracking via AIResponse<T> wrapper
//
// Adding a new AI feature:
//   1. Add a method to AIOrchestrator
//   2. Add the system prompt to prompt-templates.ts
//   3. Call getAIOrchestrator().yourMethod() from the API route or server component
//
// Never import this from client components — server-only.
// ---------------------------------------------------------------------------

import { getAiProvider, getAnthropicClient, AI_MODELS } from './provider'
import { buildAriaSystemPrompt, buildValuationNarrativePrompt } from './prompt-templates'
import { getMockResponse } from '@/lib/assistant/mock-assistant-data'
import { logger } from '@/lib/logger'
import type { ContentBlock } from '@/lib/assistant/mock-assistant-data'
import type { AIContext, AIResponse, ChatMessage } from './ai-types'
import type { AiValuation } from '@/lib/valuation/valuation-types'
import type { ValuationInput } from '@/lib/valuation/valuation-service'

// ---------------------------------------------------------------------------
// Feature access helpers — inline to avoid cross-layer circular imports
// ---------------------------------------------------------------------------

function isPro(context: AIContext): boolean {
  const t = context.subscriptionTier
  return t === 'pro' || t === 'pro_plus' || t === 'enterprise'
}

// ---------------------------------------------------------------------------
// Low-level Anthropic callers
// ---------------------------------------------------------------------------

async function anthropicChat(
  messages: ChatMessage[],
  systemPrompt: string,
): Promise<ContentBlock[]> {
  const client = await getAnthropicClient()

  const anthropicMessages = messages.slice(-10).map((m) => ({
    role:    m.role as 'user' | 'assistant',
    content: m.text,
  }))

  const response = await client.messages.create({
    model:      AI_MODELS.assistant,
    max_tokens: 1024,
    system:     systemPrompt,
    messages:   anthropicMessages,
  })

  const rawText = response.content
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { type: 'text'; text: string }) => b.text)
    .join('')
    .trim()
    // Strip optional markdown code fence wrapping
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  const parsed = JSON.parse(rawText) as ContentBlock[]
  if (!Array.isArray(parsed)) throw new Error('Expected ContentBlock[]')
  return parsed
}

async function anthropicText(system: string, user: string): Promise<string> {
  const client = await getAnthropicClient()

  const response = await client.messages.create({
    model:      AI_MODELS.analysis,
    max_tokens: 512,
    system,
    messages:   [{ role: 'user', content: user }],
  })

  return response.content
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { type: 'text'; text: string }) => b.text)
    .join('')
    .trim()
}

// ---------------------------------------------------------------------------
// AIOrchestrator
// ---------------------------------------------------------------------------

class AIOrchestrator {
  // ── Assistant chat ──────────────────────────────────────────────────────

  /**
   * Run one Aria assistant conversation turn.
   *
   * - Any tier: real AI when AI_PROVIDER=anthropic; mock otherwise
   * - context injects tier/role into system prompt for personalised guidance
   * - Falls back to mock on any Anthropic API error
   */
  async chat(
    messages: ChatMessage[],
    context?: AIContext,
  ): Promise<AIResponse<ContentBlock[]>> {
    const provider = getAiProvider()
    const start    = Date.now()
    const system   = buildAriaSystemPrompt(context)

    if (provider === 'anthropic') {
      try {
        const result = await anthropicChat(messages, system)
        return {
          result,
          provider:  'anthropic',
          model:     AI_MODELS.assistant,
          latencyMs: Date.now() - start,
          cached:    false,
        }
      } catch (err) {
        logger.error('[orchestrator.chat] Anthropic failed, using mock fallback', { err: (err as Error).message })
      }
    }

    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    return {
      result:    getMockResponse(lastUser?.text ?? ''),
      provider:  'mock',
      model:     null,
      latencyMs: Date.now() - start,
      cached:    false,
    }
  }

  // ── Valuation narrative enrichment ──────────────────────────────────────

  /**
   * Generate an AI-enriched narrative for a completed valuation.
   *
   * - Free users / mock mode: returns the existing rule-based summary unchanged
   * - Pro+ users with AI_PROVIDER=anthropic: returns an LLM-generated
   *   institutional-quality narrative (2–3 sentences)
   * - Falls back to rule-based summary on any API error
   */
  async enrichValuationNarrative(
    valuation: AiValuation,
    input:     ValuationInput,
    context?:  AIContext,
  ): Promise<AIResponse<string>> {
    const provider = getAiProvider()
    const start    = Date.now()
    const fallback = valuation.summary ?? ''

    const canEnrich = provider === 'anthropic' && context && isPro(context)

    if (canEnrich) {
      try {
        const { system, user } = buildValuationNarrativePrompt(valuation, input)
        const narrative = await anthropicText(system, user)
        return {
          result:    narrative,
          provider:  'anthropic',
          model:     AI_MODELS.analysis,
          latencyMs: Date.now() - start,
          cached:    false,
        }
      } catch (err) {
        logger.error('[orchestrator.enrichValuationNarrative] Anthropic failed, using fallback', { err: (err as Error).message })
      }
    }

    return {
      result:    fallback,
      provider:  'mock',
      model:     null,
      latencyMs: Date.now() - start,
      cached:    false,
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton — one instance per server process
// ---------------------------------------------------------------------------

let _orchestrator: AIOrchestrator | null = null

export function getAIOrchestrator(): AIOrchestrator {
  if (!_orchestrator) _orchestrator = new AIOrchestrator()
  return _orchestrator
}
