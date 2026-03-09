// ---------------------------------------------------------------------------
// TIGI AI — shared types across all AI features.
//
// ai-types.ts is the canonical source for cross-cutting AI primitives.
// Every other AI module imports from here — never the other way around.
//
// ChatMessage   — message shape for assistant conversation turns
// AIContext     — user context injected into every AI operation
// AIResponse<T> — standardised wrapper for all AI outputs
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Conversation
// ---------------------------------------------------------------------------

/** Single message in an Aria conversation turn. */
export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

// ---------------------------------------------------------------------------
// User context
// ---------------------------------------------------------------------------

/**
 * User context passed into every AI operation.
 * Enables personalisation, access control, and usage attribution.
 * All fields are optional — omit entirely for unauthenticated requests.
 */
export interface AIContext {
  userId: string
  /** 'free' | 'pro' | 'pro_plus' | 'enterprise' */
  subscriptionTier: string
  /** 'INVESTOR' | 'OWNER' | 'BOTH' | 'ADMIN' | 'COMPLIANCE_OFFICER' */
  role: string
}

// ---------------------------------------------------------------------------
// Response wrapper
// ---------------------------------------------------------------------------

/**
 * Standardised wrapper for every AI response.
 * Carries the typed result plus observability metadata.
 *
 * - provider:  which backend generated the response
 * - model:     exact model ID or null for mock responses
 * - latencyMs: wall-clock ms from request to parsed result
 * - cached:    true when the result was served from a local cache (future)
 */
export interface AIResponse<T> {
  result: T
  provider: 'mock' | 'anthropic' | 'openai'
  model: string | null
  latencyMs: number
  cached: boolean
}
