// ---------------------------------------------------------------------------
// TIGI AI Provider abstraction.
//
// Reads AI_PROVIDER env var to decide which backend to use.
// Consumers only import from here — never import @anthropic-ai/sdk directly.
//
// Supported modes:
//   mock       — no API calls; rule-based logic only (default for dev)
//   anthropic  — Anthropic SDK (claude-haiku-4-5 for Aria, claude-sonnet-4-6 for deep tasks)
//   openai     — OpenAI SDK (future alternative)
//
// Upgrade path (M6):
//   Set AI_PROVIDER=anthropic + ANTHROPIC_API_KEY in .env.local.
//   All AI features activate automatically — no code changes needed.
// ---------------------------------------------------------------------------

export type AiProvider = 'mock' | 'anthropic' | 'openai'

export function getAiProvider(): AiProvider {
  const raw = process.env.AI_PROVIDER ?? 'mock'
  if (raw === 'anthropic') return 'anthropic'
  if (raw === 'openai') return 'openai'
  return 'mock'
}

export function isAiEnabled(): boolean {
  return getAiProvider() !== 'mock'
}

// ---------------------------------------------------------------------------
// Anthropic client singleton — lazy-loaded only when AI_PROVIDER=anthropic.
// Avoids bundling the SDK in mock mode.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _anthropic: any | null = null

export async function getAnthropicClient() {
  if (_anthropic) return _anthropic
  const { Anthropic } = await import('@anthropic-ai/sdk')
  _anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  })
  return _anthropic
}

// ---------------------------------------------------------------------------
// Model selection — cost-tiered by task
// ---------------------------------------------------------------------------

export const AI_MODELS = {
  /** Assistant chat — fast, low cost, conversational */
  assistant:   'claude-haiku-4-5-20251001',
  /** Deep analysis — reasoning tasks (valuation narrative, document summary) */
  analysis:    'claude-sonnet-4-6',
  /** Structured extraction — JSON output tasks */
  structured:  'claude-haiku-4-5-20251001',
} as const
