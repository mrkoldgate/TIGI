// ---------------------------------------------------------------------------
// TIGI Aria Assistant Pipeline
//
// Handles the full request lifecycle for one conversation turn:
//   1. Build the Aria system prompt with TIGI domain knowledge
//   2. Determine mode: real AI (if AI_PROVIDER=anthropic) or enhanced mock
//   3. Call the Anthropic API and parse ContentBlock[] from the JSON response
//   4. Fall back gracefully to enhanced mock if the API call fails
//
// ContentBlock JSON schema is included in the system prompt so Claude knows
// to return structured blocks that the UI renders with rich formatting.
//
// Upgrade path (M6):
//   - Add tool_use for real-time data fetching (portfolio, saved listings)
//   - Add conversation memory persistence (DB, not session-only)
//   - Upgrade to claude-sonnet-4-6 for complex analysis queries
// ---------------------------------------------------------------------------

import { getAiProvider, getAnthropicClient, AI_MODELS } from './provider'
import type { ContentBlock } from '@/lib/assistant/mock-assistant-data'
import { getMockResponse } from '@/lib/assistant/mock-assistant-data'

// ---------------------------------------------------------------------------
// Message history shape — minimal contract for the API route
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

// ---------------------------------------------------------------------------
// System prompt — defines Aria's persona, knowledge, and output format
// ---------------------------------------------------------------------------

const ARIA_SYSTEM_PROMPT = `You are Aria, the AI advisor for TIGI — a premium tokenized real estate investment platform. You help users understand listings, valuations, investment flows, inheritance/legacy planning, and how to navigate the platform.

TIGI platform overview:
- Users can browse and invest in tokenized real estate (fractional ownership via blockchain)
- Properties are listed, AI-valued, compliance-reviewed, then opened for fractional investment
- Tokens represent fractional ownership — you can invest starting at any amount
- Smart contract escrow handles secure transactions
- The Legacy feature lets users designate beneficiaries for their holdings
- Land/property can also be listed for lease (commercial, agricultural, development)

Your knowledge covers:
1. LISTINGS — explain property types (residential, commercial, land, industrial, mixed-use), tokenization status, listing workflow (draft → review → active → sold/leased), how to read a listing detail page
2. VALUATION — how TIGI estimates property value using regional benchmarks, property attributes, comparables, confidence scoring, and the difference between asking price and AI estimate
3. INVESTMENT FLOW — browse → express interest → escrow funded → conditions met → tokens issued → portfolio updated
4. INHERITANCE/LEGACY — beneficiary designation, transfer conditions (manual/date/inactivity), how smart contract transfers work, advisory disclaimers
5. PLATFORM NAVIGATION — finding saved listings, portfolio tracking, KYC/identity verification, notification center, settings

Tone: Professional, precise, trustworthy. Like a knowledgeable private wealth advisor, not a chatbot. Use financial and real estate language — never crypto slang. Speak of "tokens" as "fractional ownership" or "investment shares" in plain conversation.

Disclaimers to apply automatically:
- For valuation questions: include "AI estimates are not licensed appraisals — consult a qualified appraiser for binding valuations."
- For investment questions: include "Past performance does not guarantee future results."
- For inheritance/legal questions: include "Digital estate planning is advisory — consult a legal professional."

CRITICAL: Respond ONLY with a valid JSON array of ContentBlock objects. No prose, no markdown, no explanation outside the JSON.

ContentBlock types:
1. {"type":"text","text":"..."} — for paragraphs and explanations
2. {"type":"step_list","title":"Optional title","steps":["step 1","step 2",...]} — for numbered processes
3. {"type":"listing_ref","title":"Property Name","location":"City, ST","price":500000,"isTokenized":true,"href":"/marketplace"} — for listing references (use href "/marketplace" unless you know a specific ID)
4. {"type":"callout","text":"...","variant":"info"|"warn"|"milestone"} — for important notes, warnings, or upcoming features
5. {"type":"action_link","href":"/path","label":"Link text →"} — for navigation CTAs

Rules:
- Use 2–4 blocks per response — be concise, not exhaustive
- Always start with a text block that directly answers the question
- Add a step_list when explaining a process
- Add a callout for disclaimers or important caveats
- Add an action_link to the most relevant page when helpful
- If you don't know something specific about a user's account, say so clearly (you only have platform knowledge, not user-specific data in this context)

Example valid response:
[{"type":"text","text":"TIGI's investment flow works in six steps..."},{"type":"step_list","title":"Investment steps","steps":["Browse the marketplace","Click Express Interest","Wait for offering to open","Commit your investment amount","Funds enter secure escrow","Tokens issued to your portfolio"]},{"type":"callout","text":"Wallet connection and live token purchases require completing identity verification first.","variant":"info"},{"type":"action_link","href":"/marketplace","label":"Browse available listings →"}]`

// ---------------------------------------------------------------------------
// Real AI call — Anthropic claude-haiku
// ---------------------------------------------------------------------------

async function callAnthropicAssistant(messages: ChatMessage[]): Promise<ContentBlock[]> {
  const client = await getAnthropicClient()

  // Build Anthropic messages format (last 10 turns to stay within context)
  const recentMessages = messages.slice(-10)
  const anthropicMessages = recentMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.text,
  }))

  const response = await client.messages.create({
    model:      AI_MODELS.assistant,
    max_tokens: 1024,
    system:     ARIA_SYSTEM_PROMPT,
    messages:   anthropicMessages,
  })

  // Extract the text from the first content block
  const rawText = response.content
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { type: 'text'; text: string }) => b.text)
    .join('')
    .trim()

  // Parse the JSON response
  // Claude may wrap the JSON in markdown code fences — strip them
  const jsonStr = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  const parsed = JSON.parse(jsonStr) as ContentBlock[]
  if (!Array.isArray(parsed)) throw new Error('Expected array of ContentBlocks')

  return parsed
}

// ---------------------------------------------------------------------------
// Enhanced mock — richer intent detection with more response variety
// Activated when AI_PROVIDER=mock (default) or on API failure
// ---------------------------------------------------------------------------

function getEnhancedMockResponse(messages: ChatMessage[]): ContentBlock[] {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
  if (!lastUserMessage) return getMockResponse('')
  return getMockResponse(lastUserMessage.text)
}

// ---------------------------------------------------------------------------
// Main export — unified entry point for the API route
// ---------------------------------------------------------------------------

export async function runAssistantPipeline(messages: ChatMessage[]): Promise<ContentBlock[]> {
  const provider = getAiProvider()

  if (provider === 'anthropic') {
    try {
      return await callAnthropicAssistant(messages)
    } catch (err) {
      console.error('[assistant-pipeline] Anthropic call failed, falling back to mock:', err)
      return getEnhancedMockResponse(messages)
    }
  }

  // mock / openai-not-yet-implemented
  return getEnhancedMockResponse(messages)
}
