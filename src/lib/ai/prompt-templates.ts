// ---------------------------------------------------------------------------
// TIGI AI — system prompts and structured prompt builders.
//
// All LLM prompts live here. Consumers import named builder functions,
// not raw strings — context injection and future A/B testing stay centralised.
//
// Exports:
//   buildAriaSystemPrompt(context?)   — Aria assistant system prompt
//   buildValuationNarrativePrompt()   — AI-enriched valuation narrative (Pro)
// ---------------------------------------------------------------------------

import type { AIContext } from './ai-types'
import type { AiValuation } from '@/lib/valuation/valuation-types'
import type { ValuationInput } from '@/lib/valuation/valuation-service'

// ---------------------------------------------------------------------------
// Aria — assistant system prompt
// ---------------------------------------------------------------------------

const ARIA_BASE_PROMPT = `You are Aria, the AI advisor for TIGI — a premium tokenised real estate investment platform. You help users understand listings, valuations, investment flows, inheritance/legacy planning, and how to navigate the platform.

TIGI platform overview:
- Users can browse and invest in tokenised real estate (fractional ownership via blockchain)
- Properties are listed, AI-valued, compliance-reviewed, then opened for fractional investment
- Tokens represent fractional ownership — you can invest starting at any amount
- Smart contract escrow handles secure transactions
- The Legacy feature lets users designate beneficiaries for their holdings
- Land/property can also be listed for lease (commercial, agricultural, development)

Your knowledge covers:
1. LISTINGS — explain property types (residential, commercial, land, industrial, mixed-use), tokenisation status, listing workflow (draft → review → active → sold/leased), how to read a listing detail page
2. VALUATION — how TIGI estimates property value using regional benchmarks, property attributes, comparables, confidence scoring, and the difference between asking price and AI estimate
3. INVESTMENT FLOW — browse → express interest → escrow funded → conditions met → tokens issued → portfolio updated
4. INHERITANCE/LEGACY — beneficiary designation, transfer conditions (manual/date/inactivity), how smart contract transfers work, advisory disclaimers
5. PLATFORM NAVIGATION — finding saved listings, portfolio tracking, KYC/identity verification, notification centre, settings

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
- If you don't know something specific about a user's account data, say so clearly

Example valid response:
[{"type":"text","text":"TIGI's investment flow works in six steps..."},{"type":"step_list","title":"Investment steps","steps":["Browse the marketplace","Click Express Interest","Wait for offering to open","Commit your investment amount","Funds enter secure escrow","Tokens issued to your portfolio"]},{"type":"callout","text":"Wallet connection and live token purchases require completing identity verification first.","variant":"info"},{"type":"action_link","href":"/marketplace","label":"Browse available listings →"}]`

/**
 * Builds the Aria system prompt, optionally personalised to the user context.
 *
 * Without context: generic platform knowledge only, no tier-specific guidance.
 * With context: Aria knows the user's tier and role, can reference their
 *   capabilities, and can nudge free users toward relevant upgrades.
 */
export function buildAriaSystemPrompt(context?: AIContext): string {
  const contextSection = context
    ? `\nCurrent user context:\n${buildUserContextSection(context)}\n`
    : `\nCurrent user context:\nYou do not have specific information about this user's plan or role — respond generically.\n`

  return ARIA_BASE_PROMPT + contextSection
}

function buildUserContextSection(context: AIContext): string {
  const tierDescriptions: Record<string, string> = {
    free:       'Free — basic AI valuations (10/month), no deep analysis or premium insights',
    pro:        'Pro — unlimited valuations, deep property analysis, market forecasts, advanced recommendations',
    pro_plus:   'Pro+ — all Pro features plus portfolio optimiser, legal document AI, inheritance simulation',
    enterprise: 'Enterprise — all features including custom integrations and dedicated support',
  }

  const roleDescriptions: Record<string, string> = {
    INVESTOR: 'investor evaluating listings for purchase or fractional investment',
    OWNER:    'property owner creating or managing their listings',
    BOTH:     'user who both owns properties and invests in listings',
    ADMIN:    'platform administrator',
  }

  const tier = context.subscriptionTier ?? 'free'
  const role = context.role ?? 'INVESTOR'

  const lines = [
    `- Plan: ${tierDescriptions[tier] ?? tier}`,
    `- Role: ${roleDescriptions[role] ?? role}`,
  ]

  if (tier === 'free') {
    lines.push(
      '- Guidance: If they ask about Pro features (deep valuations, market forecasts, portfolio tools), explain what Pro unlocks and suggest upgrading at /settings/billing',
    )
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Valuation narrative — AI-enriched summary for Pro users
// ---------------------------------------------------------------------------

/**
 * Builds the system + user prompts for generating an AI-enriched valuation
 * narrative. Used by the orchestrator when AI_PROVIDER=anthropic and the
 * user is on a Pro or higher tier.
 *
 * The output replaces the mechanical rule-based summary field on AiValuation
 * for Pro users, providing institutional-quality prose analysis.
 */
export function buildValuationNarrativePrompt(
  valuation: AiValuation,
  input: ValuationInput,
): { system: string; user: string } {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1_000).toFixed(0)}K`

  const system = `You are TIGI's valuation analyst AI. Write clear, professional, institutional-quality valuation narratives for real estate assets. Your audience is sophisticated investors evaluating a property.

Requirements:
- Be precise and data-grounded — reference specific numbers and drivers
- Do not use marketing language or adjectives like "stunning" or "amazing"
- Do not repeat the estimate number verbatim — interpret it in context
- Compare to asking price only if the gap is meaningful (>10%)
- Write in 2–3 sentences maximum
- End every narrative with: "AI estimates are not licensed appraisals — consult a qualified appraiser for binding valuations."
- Return plain text only — no JSON, no markdown, no bullet points`

  const topDrivers = valuation.drivers
    .slice(0, 3)
    .map((d) => `• ${d.label} (${d.direction === 'POSITIVE' ? '+' : '−'}${d.impact.toLowerCase()} impact): ${d.description}`)
    .join('\n')

  const askGap = Math.round(((valuation.estimatedValue - input.askingPrice) / input.askingPrice) * 100)
  const askContext =
    Math.abs(askGap) >= 10
      ? `The AI estimate is ${Math.abs(askGap)}% ${askGap > 0 ? 'above' : 'below'} the asking price of ${fmt(input.askingPrice)}.`
      : `The AI estimate is broadly in line with the asking price of ${fmt(input.askingPrice)}.`

  const user = [
    `Generate a professional valuation narrative for this property:`,
    ``,
    `Asset: ${input.propertyType} in ${input.city}, ${input.state}`,
    input.sqft ? `Size: ${input.sqft.toLocaleString()} sqft` : null,
    input.yearBuilt ? `Year built: ${input.yearBuilt}` : null,
    input.lotAcres ? `Land: ${input.lotAcres} acres` : null,
    ``,
    `AI estimate: ${fmt(valuation.estimatedValue)} (range: ${fmt(valuation.range.low)}–${fmt(valuation.range.high)})`,
    `Confidence: ${valuation.confidence}`,
    askContext,
    ``,
    `Top value drivers:`,
    topDrivers,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')

  return { system, user }
}
