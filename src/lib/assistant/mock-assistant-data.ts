// ---------------------------------------------------------------------------
// TIGI AI Assistant (Aria) — mock data, types, and response library.
//
// Integration path (M2+):
//   sendMessage()     → POST /api/assistant/chat (streaming SSE / Vercel AI SDK)
//   ContentBlock[]    → stream-reconstructed from LLM response + function_calling
//   getMockResponse() → replaced by server-side intent + tool call orchestration
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Message content model — rich structured content beyond plain text.
// Each ContentBlock is a typed unit the UI renders with a dedicated component.
// ---------------------------------------------------------------------------

export type ContentBlock =
  | { type: 'text';         text: string }
  | { type: 'step_list';    title?: string; steps: string[] }
  | { type: 'listing_ref';  title: string; location: string; price: number | null; isTokenized: boolean; href: string }
  | { type: 'callout';      text: string; variant: 'info' | 'warn' | 'milestone' }
  | { type: 'action_link';  href: string; label: string }

export type MessageRole = 'user' | 'assistant'

export interface AssistantMessage {
  id: string
  role: MessageRole
  content: ContentBlock[]
  timestamp: string
}

// ---------------------------------------------------------------------------
// Suggestion chips — shown in the empty / initial state
// ---------------------------------------------------------------------------

export interface SuggestionChip {
  id: string
  text: string
  useCase: 'listing' | 'valuation' | 'navigation' | 'investment' | 'inheritance'
}

export const ARIA_SUGGESTIONS: SuggestionChip[] = [
  { id: 's1', text: 'Explain a listing to me',              useCase: 'listing'     },
  { id: 's2', text: 'How is property value calculated?',    useCase: 'valuation'   },
  { id: 's3', text: 'How do I start investing on TIGI?',   useCase: 'navigation'  },
  { id: 's4', text: 'Walk me through the investment flow',  useCase: 'investment'  },
  { id: 's5', text: 'How does the Legacy feature work?',   useCase: 'inheritance' },
]

// ---------------------------------------------------------------------------
// Mock response library — one response set per use case.
// Responses use the full ContentBlock type system, proving out rich rendering.
// In M2: replace getMockResponse() with a streaming LLM call that returns
// structured content via function_calling or JSON mode.
// ---------------------------------------------------------------------------

const RESPONSES: Record<SuggestionChip['useCase'], ContentBlock[]> = {

  listing: [
    {
      type: 'text',
      text: "Here's a breakdown of Beachfront Villa Suite 4A in Malibu — one of our featured tokenized listings:",
    },
    {
      type: 'listing_ref',
      title: 'Beachfront Villa Suite 4A',
      location: 'Malibu, CA',
      price: 4800000,
      isTokenized: true,
      href: '/marketplace',
    },
    {
      type: 'text',
      text: "This $4.8M residential property is tokenized under Regulation D, meaning accredited investors can hold fractional ownership via Solana-based tokens. It has passed AI valuation screening and is currently awaiting final compliance sign-off before the token offering opens.",
    },
    {
      type: 'callout',
      text: 'Full listing detail pages — with AI valuation comparables, title verification status, and the live token investment flow — are available now.',
      variant: 'info',
    },
    {
      type: 'action_link',
      href: '/marketplace',
      label: 'Browse all listings →',
    },
  ],

  valuation: [
    {
      type: 'text',
      text: "TIGI's AI valuation model combines multiple real-time signals to estimate fair market value independently of the listing price:",
    },
    {
      type: 'step_list',
      title: 'Valuation factors',
      steps: [
        'Recent sale comps within a 1-mile radius, weighted by recency and structural similarity',
        'Automated condition score derived from listing photos, disclosures, and inspection records',
        'Neighborhood trend index — price momentum tracked over 6 and 24 months',
        'Zoning and development potential for land parcels, factoring permitted use changes',
        'Tokenization liquidity adjustment — a premium or discount based on the token structure and market depth',
      ],
    },
    {
      type: 'text',
      text: "If a listing price deviates more than 30% from the AI estimate in either direction, it's automatically flagged for compliance review before offers or token sales can open. This protects buyers and investors from valuation fraud.",
    },
    {
      type: 'callout',
      text: 'Detailed valuation reports with confidence intervals, comparable property charts, and AI reasoning summaries are coming in M6.',
      variant: 'milestone',
    },
  ],

  navigation: [
    {
      type: 'text',
      text: "Welcome to TIGI. Here's the fastest path from registration to your first investment:",
    },
    {
      type: 'step_list',
      title: 'Getting started',
      steps: [
        'Complete identity verification (KYC) in Settings — required before any investment activity',
        'Browse tokenized listings in Explore — filter by asset type, location, price range, and yield',
        'Save listings you\'re evaluating to your Saved list for easy side-by-side comparison',
        'On any tokenized listing, tap "Express Interest" to join the investment queue',
        'Connect your Solana wallet in M4 to commit funds and receive tokens',
      ],
    },
    {
      type: 'callout',
      text: 'KYC verification and interest expression are live now. Wallet connection and live token purchases arrive in M4.',
      variant: 'info',
    },
    {
      type: 'action_link',
      href: '/marketplace',
      label: 'Browse tokenized listings →',
    },
  ],

  investment: [
    {
      type: 'text',
      text: "Once you find a tokenized property and express interest, here's exactly what happens:",
    },
    {
      type: 'step_list',
      title: 'Investment flow',
      steps: [
        'Your interest is logged and the property owner sees demand building in real-time',
        'When the offering opens, you commit your investment amount in USDC or SOL',
        'Funds are locked in a Solana smart contract escrow — neither party can access them until conditions are met',
        'Legal and compliance steps complete: title transfer, Reg D filing, token minting',
        'Tokens representing your fractional ownership are issued to your Solana wallet',
        'Your holdings appear in Portfolio, where you can track value and receive distributions',
      ],
    },
    {
      type: 'callout',
      text: 'Solana wallet connection and live escrow contracts are coming in M4–M5. Interest expression is available now.',
      variant: 'milestone',
    },
    {
      type: 'action_link',
      href: '/portfolio',
      label: 'View your portfolio →',
    },
  ],

  inheritance: [
    {
      type: 'text',
      text: "TIGI's Legacy feature lets you designate beneficiaries for your real estate holdings and tokenized assets — without requiring probate for the digital components.",
    },
    {
      type: 'step_list',
      title: 'How it works',
      steps: [
        'In the Legacy section, specify beneficiaries by verified TIGI identity or legal name',
        'Set transfer conditions — simple transfer-on-death, or trust-style staged releases',
        'TIGI generates a digital estate plan linked to your on-chain token holdings',
        'On verified death or legal incapacitation, token assets transfer automatically via smart contract',
        'Traditional real estate still requires legal conveyance — TIGI coordinates document preparation',
      ],
    },
    {
      type: 'callout',
      text: 'Legacy and Inheritance launches in M8. You can explore the section now to plan your setup ahead of time.',
      variant: 'milestone',
    },
    {
      type: 'action_link',
      href: '/inheritance',
      label: 'Explore Legacy setup →',
    },
  ],
}

// ---------------------------------------------------------------------------
// Keyword matcher — simple MVP intent detection.
// Replace with: intent classification via LLM function_calling in M2.
// ---------------------------------------------------------------------------

export function getMockResponse(input: string): ContentBlock[] {
  const t = input.toLowerCase()

  if (t.match(/\b(list|property|propert|villa|parcel|estate|malibu|land|building|bedroom|home)\b/)) {
    return RESPONSES.listing
  }
  if (t.match(/\b(valu|price|worth|cost|apprais|estimate|market|compar|how much)\b/)) {
    return RESPONSES.valuation
  }
  if (t.match(/\b(inherit|legacy|beneficiar|death|trust|will|estate plan)\b/)) {
    return RESPONSES.inheritance
  }
  if (t.match(/\b(invest|token|buy|purchas|portfolio|wallet|solana|escrow|fund)\b/)) {
    return RESPONSES.investment
  }
  // Default — navigation / getting started
  return RESPONSES.navigation
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function newMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function nowISO(): string {
  return new Date().toISOString()
}
