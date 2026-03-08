# TIGI — Design Principles

> **Version:** 2.0  
> **Status:** Active  
> **Last updated:** March 7, 2026

---

## 1. Brand Feeling

### 1.1 The TIGI Experience in One Sentence

> *TIGI should feel like walking into a private wealth management office that runs on invisible, cutting-edge technology.*

### 1.2 Brand Attributes

| Attribute | What It Means for Design |
|---|---|
| **Premium** | Every pixel communicates quality. No element is unfinished, misaligned, or generic. The interface competes with Bloomberg Terminal and modern private banking apps, not crypto dashboards. |
| **Modern** | Current design language — not trendy. Avoid patterns that will age in 6 months. Favor clean geometry, generous whitespace, and purposeful minimalism. |
| **Elegant** | Restraint is the primary design tool. Fewer colors, fewer weights, fewer borders. Let content breathe. Complexity is hidden behind simplicity. |
| **Futuristic** | Subtle signals of advanced technology — glass surfaces, subtle gradients, fine-line icons, smooth data visualizations. Never holographic, neon, or cyberpunk. |
| **Trustworthy** | The interface handles money, legal documents, and ownership records. Every element must radiate stability. No playful illustrations, no casual language, no ambiguity. |
| **Clear** | Information density is high (financial data, property specs, token metrics) but never overwhelming. Every data point has hierarchy, context, and appropriate formatting. |
| **Mainstream-Friendly** | A user who has never heard of Solana, tokens, or blockchain should feel immediately comfortable. The interface speaks the language of real estate and finance, not crypto. |

### 1.3 Brand Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use restrained, sophisticated animations | Use bouncy, playful, or attention-seeking motion |
| Show data with context and formatting | Show raw numbers without units, labels, or comparison |
| Use precise, professional language | Use slang, crypto jargon, or exclamation marks |
| Let gold accents draw the eye sparingly | Make everything gold — it stops being special |
| Show empty states with guidance | Show blank pages or "No data" text |
| Use real typography hierarchy | Use more than 3 font weights on one page |
| Make CTAs obvious and confident | Use multiple competing CTAs on one screen |

---

## 2. Visual Direction

### 2.1 Color System

#### Foundation

```
Background Layers (darkest → lightest):
  --bg-root:        #0A0A0F     ← Page background, the darkest surface
  --bg-surface:     #111118     ← Card backgrounds, sidebar, panels
  --bg-elevated:    #1A1A24     ← Modals, popovers, hover states
  --bg-muted:       #22222E     ← Input fields, code blocks, subtle separators

Border & Dividers:
  --border-default: #2A2A3A     ← Card borders, section dividers
  --border-subtle:  #1F1F2E     ← Barely-there separators
  --border-focus:   #C9A84C     ← Focus rings, active input borders

Text:
  --text-primary:   #F5F5F7     ← Headings, primary content
  --text-secondary: #A0A0B2     ← Descriptions, secondary labels
  --text-muted:     #6B6B80     ← Timestamps, captions, placeholders
  --text-inverse:   #0A0A0F     ← Text on gold buttons
```

#### Accent: Gold

```
Gold Palette (primary brand color):
  --gold-50:   #FBF7EB      ← Gold tint for subtle backgrounds
  --gold-100:  #F5ECCC
  --gold-200:  #E8D590
  --gold-300:  #DBBD57
  --gold-400:  #C9A84C      ← PRIMARY — CTAs, active states, key indicators
  --gold-500:  #B8932F      ← Hover state for primary buttons
  --gold-600:  #9A7A22      ← Pressed state
  --gold-700:  #7A6018
  --gold-800:  #5C4810
  --gold-900:  #3E3008      ← Subtle gold for backgrounds
```

**Gold usage rules:**
- Primary CTA buttons: gold background (`--gold-400`) with dark text (`--text-inverse`)
- Active navigation: gold text or gold left-border indicator
- Key data points: gold text for ROI percentages, portfolio value, and "verified" badges
- Hover glow: `box-shadow: 0 0 20px rgba(201, 168, 76, 0.15)` on interactive elements
- **Limit:** No more than 3 gold elements visible on any single screen (excluding nav)

#### Semantic Colors

```
Success:   #22C55E / #16A34A   ← Completed states, positive ROI, approved
Warning:   #F59E0B / #D97706   ← Pending review, approaching limits
Error:     #EF4444 / #DC2626   ← Failed transactions, rejected, errors
Info:      #3B82F6 / #2563EB   ← Informational notices, links

Semantic colors used ONLY in context (badges, alerts, status indicators).
Never as decorative elements or backgrounds.
```

#### Gradients

```
Hero gradient:
  background: linear-gradient(135deg, #0A0A0F 0%, #141420 50%, #1A1528 100%)
  ← Subtle purple-tint direction for hero and landing sections

Card hover gradient:
  background: linear-gradient(135deg, #111118 0%, #16161F 100%)
  ← Barely perceptible lift effect on hover

Gold gradient (sparingly — e.g., landing page hero heading):
  background: linear-gradient(135deg, #C9A84C 0%, #E8D590 50%, #C9A84C 100%)
  -webkit-background-clip: text
  ← Text gradient for hero headings only, NEVER for body text
```

### 2.2 Design System Rules

1. **No white backgrounds** — the lightest background is `#22222E`, and it's used rarely
2. **No pure black text** — the darkest text is `#F5F5F7` (slightly warm off-white)
3. **No colored backgrounds** — semantic colors appear only in small badges, borders, and icons
4. **Borders are subtle** — 1px, using `--border-default`. Never 2px+. Borders separate, they don't decorate.
5. **Every surface has depth** — achieved through layered backgrounds, not shadows (minimal `box-shadow` use)

---

## 3. Typography

### 3.1 Font Stack

```
Headings:   'Outfit', sans-serif        ← Geometric, clean, modern. Google Fonts.
Body:       'Inter', sans-serif          ← Highly legible at all sizes. Google Fonts.
Data/Code:  'JetBrains Mono', monospace  ← Wallet addresses, transaction IDs, code. Google Fonts.
```

### 3.2 Type Scale

| Level | Font | Weight | Size | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| **Display** | Outfit | 700 | 48px / 3rem | 1.1 | -0.02em | Landing hero only |
| **H1** | Outfit | 600 | 32px / 2rem | 1.2 | -0.015em | Page titles |
| **H2** | Outfit | 600 | 24px / 1.5rem | 1.3 | -0.01em | Section headings |
| **H3** | Outfit | 500 | 20px / 1.25rem | 1.4 | -0.005em | Card titles, panel headings |
| **H4** | Outfit | 500 | 16px / 1rem | 1.4 | 0 | Sub-section labels |
| **Body** | Inter | 400 | 15px / 0.9375rem | 1.6 | 0 | Paragraphs, descriptions |
| **Body small** | Inter | 400 | 13px / 0.8125rem | 1.5 | 0.005em | Secondary text, metadata |
| **Caption** | Inter | 400 | 11px / 0.6875rem | 1.4 | 0.02em | Timestamps, fine print |
| **Label** | Inter | 500 | 13px / 0.8125rem | 1.2 | 0.03em | Form labels, badge text, uppercase labels |
| **Mono** | JetBrains Mono | 400 | 13px / 0.8125rem | 1.5 | 0 | Addresses, hashes, code |

### 3.3 Typography Rules

1. **Maximum 2 font weights per component** — avoid visual clutter
2. **Headings never in Inter** — Outfit is the heading font, no exceptions
3. **Body never in Outfit** — Inter is the body font, no exceptions
4. **Mono only for technical content** — addresses, transaction IDs, code; never for regular text
5. **No text below 11px** — accessibility minimum
6. **All caps only for labels** — form labels, badge text, table headers; never for headings or body
7. **Numbers in data contexts use tabular figures** — `font-variant-numeric: tabular-nums` for aligned columns

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Based on a 4px grid. Every spacing value is a multiple of 4.

```
--space-1:   4px     ← Icon-to-text gap, inline spacing
--space-2:   8px     ← Compact internal padding, badge padding
--space-3:   12px    ← Standard internal padding
--space-4:   16px    ← Card padding, form field spacing
--space-5:   20px    ← Section spacing within cards
--space-6:   24px    ← Gap between cards in a grid
--space-8:   32px    ← Section spacing
--space-10:  40px    ← Major section separation
--space-12:  48px    ← Page-level vertical spacing
--space-16:  64px    ← Landing page section spacing
--space-20:  80px    ← Hero section spacing
```

### 4.2 Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│  Top Nav (height: 64px, bg: --bg-surface, fixed top)     │
│  [Logo]  [Search]              [Notifications] [Avatar]  │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│ Sidebar  │  Main Content Area                            │
│ 240px    │  max-width: 1280px                            │
│ bg:      │  padding: --space-8                           │
│ --bg-    │                                               │
│ surface  │  Cards/sections flow vertically               │
│          │  Grids use gap: --space-6                     │
│ Collapsed│                                               │
│ at 768px │                                               │
│ (64px    │                                               │
│ icons)   │                                               │
│          │                                               │
├──────────┴───────────────────────────────────────────────┤
│  (No footer in platform views. Footer only on marketing) │
└──────────────────────────────────────────────────────────┘
```

### 4.3 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|---|---|---|
| **Mobile** | < 768px | Sidebar collapses to bottom nav or hamburger; single-column content; cards stack vertically |
| **Tablet** | 768px – 1024px | Sidebar collapses to icon-only (64px); 2-column grids |
| **Desktop** | 1024px – 1440px | Full sidebar (240px); 3-column grids |
| **Wide** | > 1440px | Content area max-width: 1280px, centered; sidebar remains 240px |

### 4.4 Layout Rules

1. **Content max-width is 1280px** — never full-bleed on ultrawide screens
2. **Card padding is consistent** — `--space-4` (16px) on all cards, everywhere, always
3. **Grid gap is consistent** — `--space-6` (24px) between all grid cards
4. **No horizontal scrolling** — ever. At any breakpoint.
5. **Generous vertical space between sections** — `--space-8` minimum
6. **Tables scroll horizontally in a container on mobile** — the page itself does not scroll horizontally

---

## 5. Component Philosophy

### 5.1 Core Principles

**Every component is a design token consumer, not a design token creator.**

Components use the spacing, color, and typography tokens defined above. They never invent their own values. If a component needs a value that doesn't exist in the token system, the token system is extended — the component is not given a one-off value.

### 5.2 Component Hierarchy

| Layer | Examples | Rules |
|---|---|---|
| **Atoms** | Button, Input, Badge, Avatar, Tooltip, Skeleton | Single responsibility. No business logic. Pure UI primitives. |
| **Molecules** | SearchBar, PropertyCard, StatCard, TokenInfoPanel | Composition of atoms. May accept data props but no data fetching. |
| **Organisms** | PropertyGrid, PortfolioHoldings, TransactionTracker | Composed of molecules. May fetch data (RSC) or manage local state. |
| **Templates** | AppShell, MarketingLayout, AdminLayout | Page-level layout containers. Handle sidebar, nav, and content area. |

### 5.3 Component Rules

1. **shadcn/ui as the base** — every atom starts from shadcn/ui, custom-themed with TIGI tokens
2. **No inline styles** — all styling via Tailwind utility classes or CSS custom properties
3. **No magic numbers** — every spacing, size, and color value references a token
4. **Every interactive element has 4 states** — default, hover, active/pressed, disabled
5. **Every interactive element has a focus ring** — `outline: 2px solid var(--border-focus)` with `outline-offset: 2px`
6. **Every component with content has a loading state** — shimmer skeleton matching the component's shape
7. **Every component with conditional content has an empty state** — illustrated with guidance text and CTA

### 5.4 Button System

| Variant | Background | Text | Border | Use Case |
|---|---|---|---|---|
| **Primary** | `--gold-400` | `--text-inverse` | none | Main CTA: "Invest," "Submit," "Confirm" |
| **Secondary** | transparent | `--text-primary` | `--border-default` | Secondary actions: "Cancel," "Back," "View Details" |
| **Ghost** | transparent | `--text-secondary` | none | Tertiary actions: "Learn more," "Show all," sidebar links |
| **Destructive** | `--error` | white | none | Dangerous actions: "Delete," "Revoke," "Terminate" |
| **Disabled** | `--bg-muted` | `--text-muted` | none | Inactive state for any variant |

**Button behavior:**
- Hover: background lightens or darkens by one step; subtle `transform: scale(1.02)` 
- Active/pressed: `transform: scale(0.98)` — satisfying "press" feel
- Primary hover: gold glow — `box-shadow: 0 0 20px rgba(201, 168, 76, 0.2)`
- Loading: replace text with 3-dot animated loader; button remains same width

### 5.5 Card System

```
┌──────────────────────────────────┐
│  bg: --bg-surface                │
│  border: 1px solid --border-default
│  border-radius: 12px            │
│  padding: --space-4 (16px)      │
│  transition: all 200ms ease     │
│                                  │
│  Hover:                         │
│    border-color: --border-focus  │
│    transform: translateY(-2px)  │
│    box-shadow: 0 8px 32px       │
│      rgba(0,0,0,0.3)            │
│                                  │
└──────────────────────────────────┘
```

---

## 6. UX Principles

### 6.1 Core UX Tenets

#### 1. Progressive Disclosure
Show only what's needed at each step. Complex information (token details, legal terms, blockchain data) is available one click deeper but never clutters the primary view.

**Example:** Property detail page shows AI valuation value and confidence on the card. Full report with comps, factors, and confidence intervals is behind "See full report."

#### 2. Contextual Intelligence
Information appears where and when users need it — not in a separate "dashboard."

**Example:** AI valuation is on the property page, not in an "AI" section. Risk scoring appears in the compliance queue, not in an "AI tools" menu.

#### 3. Guided Confidence
Every action that involves money, legal commitments, or irreversible on-chain operations must include:
- Clear summary of what will happen
- Total cost with fee breakdown
- Confirmation step with explicit action ("I confirm" not "OK")
- Success state with receipt-like summary

#### 4. Zero Dead Ends
Every screen has a clear next action. Empty states guide users forward. Error states offer recovery options. "Access denied" explains why and what role is needed.

#### 5. Forgiving by Default
- Forms auto-save drafts
- Multi-step forms allow back navigation without losing data
- Destructive actions require double confirmation
- Deleted items are soft-deleted (recoverable for 30 days)

---

## 7. Abstracting Blockchain Complexity

### 7.1 The Invisible Blockchain Principle

> *If a user who has never heard the word "blockchain" cannot complete every MVP workflow without confusion, the abstraction has failed.*

### 7.2 Terminology Translation

| Blockchain Term | TIGI User-Facing Term | Context |
|---|---|---|
| Token | **Fraction** or **Ownership share** | "You own 25 fractions of this property" |
| Mint | **Create investment opportunity** | Admin sees "Tokenize Property" — never "Mint" |
| Token transfer | **Investment** or **Purchase** | "Your investment is complete" |
| Wallet | **TIGI Account** (custodial) or **Connected Wallet** (external) | "Your TIGI account balance" |
| Public key / address | **Wallet address** (only in Settings → Wallet → Advanced) | Never shown by default |
| Transaction hash | **Confirmation ID** | "Confirmation: TG-2026-03-07-A1B2" (platform ID, not Solana hash) |
| Gas fee | **Processing fee** (if ever needed — currently Solana fees are sub-cent) | "No processing fees" in most contexts |
| Block confirmation | **Processing** | "Your investment is processing..." (spinner, 5–15 seconds) |
| Smart contract | **Secure agreement** or **Automated escrow** | "Funds held in automated escrow until conditions are met" |
| Solana | Hidden entirely | Only appears in: Settings → Wallet → Advanced, and in developer/API docs |
| SPL | Hidden entirely | Never shown to users |
| PDA | Hidden entirely | Never shown to users |
| Devnet / Mainnet | Hidden entirely | Internal/admin only |

### 7.3 Where Blockchain IS Visible

For advanced users who want transparency, blockchain details are available — but always opt-in:

| Location | What's Shown | How |
|---|---|---|
| Transaction detail → "Verify on chain" link | Solana Explorer link | Small text link at bottom |
| Settings → Wallet → Advanced | Wallet address, export key option, connected wallet details | Behind "Advanced" accordion |
| Ownership history tab (property detail) | Timeline with addresses (truncated) | One tab among several, not the default |
| Admin → Token management | Mint address, supply, program ID | Admin-only interface |

### 7.4 Wallet UX Abstraction

```
MAINSTREAM USER (95% of users):
├── Registers with email → custodial wallet created silently
├── Browses marketplace → no wallet concept mentioned
├── Clicks "Invest" → confirms amount → "Investment processing..." → done
├── Views portfolio → sees holdings with $ values
└── Never sees: wallet, address, token, transaction hash, Solana

ADVANCED USER (5% of users who actively seek this):
├── Goes to Settings → Wallet → "Connect External Wallet"
├── Sees truncated address: "7xK...F2g"
├── Sees "Verify on Solana Explorer" links on transactions
└── Can export custodial key (with security warnings)
```

---

## 8. AI Presentation Principles

### 8.1 AI Should Feel Like Expert Counsel, Not a Chat Widget

| ✅ AI Should Feel Like | ❌ AI Should NOT Feel Like |
|---|---|
| A private analyst generating reports | A chatbot in the corner |
| An embedded intelligence within every decision | A separate "AI" section you navigate to |
| Institutional-grade research tools | A magic 8-ball giving random answers |
| A confident advisor with cited sources | An oracle that says "trust me" |

### 8.2 AI Output Design Standards

Every AI-generated output must include:

```
┌──────────────────────────────────────────────┐
│  ✦ AI Estimate — Not a licensed appraisal    │ ← Disclaimer (always)
│                                              │
│  Estimated Value: $485,000                   │ ← Primary insight (bold, prominent)
│  Confidence: ████████░░ High (0.82)          │ ← Confidence indicator (visual)
│                                              │
│  Based on 3 comparable sales within          │ ← Basis explanation (always)
│  0.5 miles, market trends (90 days)          │
│                                              │
│  ▸ How was this calculated?                  │ ← Expandable methodology
│  ▸ View comparable properties                │ ← Supporting evidence
│                                              │
│  Last updated: 2 hours ago                   │ ← Freshness indicator
│  ─────────────────────────────────           │
│  🔶 Full report available with TIGI Pro      │ ← Upgrade prompt (contextual)
└──────────────────────────────────────────────┘
```

### 8.3 AI Rules

1. **Always show confidence** — every AI output has a confidence score or level (Low / Medium / High with visual indicator)
2. **Always cite basis** — "Based on X comparable sales" or "Based on Y data points" — never unsupported claims
3. **Always show freshness** — "Generated 2 hours ago" — AI results are not eternal truths
4. **Always disclaim** — "AI Estimate — not a licensed appraisal" for valuations. "AI-assisted — review recommended" for legal summaries.
5. **Never use "AI" as a feature name in navigation** — it's "Valuation," "Market Intelligence," "Document Analysis" — the AI is invisible infrastructure
6. **Never auto-act on AI outputs** — AI recommends, humans decide. No automated investment based on AI scoring.
7. **Premium AI earns its price** — Pro-tier features must deliver visibly more depth than free tier. Don't gate basic features; gate depth and volume.

### 8.4 Free vs. Pro AI Visual Distinction

```
FREE tier property detail:                PRO tier property detail:
┌─────────────────────┐                   ┌─────────────────────────────────┐
│ Value: $485,000     │                   │ Value: $470,000 — $505,000      │
│ Confidence: High    │                   │ Best Estimate: $485,000         │
│                     │                   │ Confidence: 0.82                │
│ 🔶 See full report  │                   │                                 │
│    Upgrade to Pro   │                   │ ▸ 5 Comparable Properties       │
└─────────────────────┘                   │ ▸ Positive Factors (4)          │
                                          │ ▸ Risk Factors (2)              │
                                          │ ▸ Market Trend (6-month chart)  │
                                          │ ▸ Download PDF Report           │
                                          └─────────────────────────────────┘
```

---

## 9. Dark Mode Direction

### 9.1 TIGI Is Dark-Only

TIGI does not have a light mode. The entire platform is a dark interface. This is a deliberate brand decision:

| Reason | Detail |
|---|---|
| **Trust signal** | Dark interfaces with precise typography convey institutional seriousness (Bloomberg, trading platforms, banking apps) |
| **Visual hierarchy** | Gold accents, data visualizations, and property images pop against dark backgrounds |
| **Reduced distraction** | Users focus on content (property images, data, charts) rather than chrome |
| **Eye comfort** | Long sessions reviewing portfolios, analytics, and documents are easier on dark backgrounds |
| **Design consistency** | One theme to maintain, not two. Every component is designed and tested for dark. |

### 9.2 Dark Mode Implementation

```css
:root {
  color-scheme: dark;
}

/* No light mode media query. No toggle. */
/* If a user's OS is in light mode, TIGI is still dark. */
/* This is a brand choice, not a preference. */
```

### 9.3 Common Dark Mode Pitfalls to Avoid

| Pitfall | Solution |
|---|---|
| Text too dim | Primary text is `#F5F5F7`, not gray. It must pass WCAG AA contrast on `#111118`. |
| Pure black backgrounds | Root is `#0A0A0F` (warm black), not `#000000`. Pure black creates harsh edges with content. |
| White text on colored backgrounds | Avoid. Use dark text on gold buttons. Use white text only on dark surfaces. |
| Invisible borders | Borders at `#2A2A3A` are visible on `#111118`. Test all surfaces. |
| Images with white backgrounds | Property images should either have transparent backgrounds or be full-bleed. Never a white-bordered image on a dark card. |
| Input fields blend into cards | Inputs use `--bg-muted` (#22222E) on `--bg-surface` (#111118) — visible contrast step. |

---

## 10. Placeholder & Image Philosophy

### 10.1 No Empty Gray Boxes

> *TIGI never shows an empty gray box where an image should be. Every placeholder is either a generated image or a meaningful illustration.*

### 10.2 Image Strategy

| Image Type | MVP Approach | Production Approach |
|---|---|---|
| **Property photos** | AI-generated images via `generate_image` tool — realistic, high-quality, varied property types | Real photos uploaded by property owners |
| **User avatars** | Initials-based avatar (e.g., "JD" in gold circle on dark background) | User-uploaded photo or generated initials |
| **Map views** | Static map screenshot or OpenStreetMap embed | Interactive Mapbox/Google Maps |
| **Charts and data viz** | Real charts with seeded data (Recharts/Tremor) | Real charts with real data |
| **Empty state illustrations** | Fine-line dark-themed illustrations (custom or Lucide icons composed into scenes) | Same — these are permanent |
| **Marketing/landing images** | AI-generated hero images showing premium real estate | Professional photography or curated stock |

### 10.3 AI-Generated Image Guidelines

When generating property images for seed data:
- **Architectural realism** — images should look like real property photos, not renders
- **Varied property types** — residential, commercial, land (aerial), industrial, mixed-use
- **Dark/warm tone preference** — images that complement the dark UI (golden hour, dusk, well-lit interiors)
- **High quality** — at least 1024×768, suitable for full-width hero display
- **No watermarks, no text** — clean images only

### 10.4 Image Loading

```
Phase 1: Shimmer skeleton (matches image aspect ratio)
Phase 2: Blurred placeholder (low-res version)
Phase 3: Full image (lazy-loaded, WebP optimized)
```

---

## 11. Trust & Clarity in a Legal/Financial Product

### 11.1 Trust Signals

| Signal | Implementation |
|---|---|
| **Consistent layout** | Same component patterns on every page. Users should never feel "where am I?" |
| **Verified badges** | Properties with reviewed documents show a ✓ badge. Users with completed KYC show verified status. |
| **Audit trail visibility** | Transaction history shows every step with timestamps. Users can see what happened and when. |
| **Blockchain verification links** | "Verify on Solana Explorer" links — optional but available for users who want proof |
| **Professional language** | "Your investment has been confirmed" not "Yay! You bought tokens! 🎉" |
| **Error transparency** | "Transaction failed: network timeout. Your funds have not been charged. Retry?" — not "Something went wrong" |
| **Explicit fee disclosure** | Every transaction shows cost breakdown before confirmation: amount + fee = total |

### 11.2 Legal Clarity UX Patterns

#### Disclaimers

```
Placement: contextual (near the relevant content, not hidden in a footer)
Styling: --text-muted, Body small (13px), preceded by "ℹ️" icon
Tone: factual and direct, not apologetic or defensive

Examples:
  "AI Estimate — not a licensed appraisal. Consult a qualified appraiser."
  "Tokens represent economic interest as defined in offering documents."
  "Digital estate planning is advisory. Consult a legal professional."
  "Past performance does not guarantee future results."
```

#### Confirmation Patterns

For any action involving money, legal commitment, or irreversibility:

```
Step 1: Action CTA ("Invest $5,000")
Step 2: Review modal with full summary:
  ├── What you're doing
  ├── How much it costs (breakdown)
  ├── What happens next
  ├── Terms checkbox (required)
  └── "Confirm" button (gold, primary CTA)
Step 3: Processing state (spinner, "Processing on Solana...")
Step 4: Success state (receipt-like summary with transaction ID)
```

#### Numbers and Money

```
Currency: Always show "$" prefix and "USD" suffix on first instance per section
Decimals: $485,000.00 for transaction amounts; $485K for summaries and cards
Percentages: 12.5% (one decimal), never "12.5462%"
Negative values: -$1,200.00 in error-red, with parentheses alternative: ($1,200.00)
Formatting: Use toLocaleString() — always include commas for thousands
```

### 11.3 Security-Communicating Design

| Element | Design |
|---|---|
| **Login page** | Minimal, centered, no distractions. Lock icon in logo area. |
| **KYC flow** | Institution-grade form design. Progress bar. Document upload with encryption indicator. |
| **Escrow states** | Shield icon. "Funds secured" language. Step tracker shows every condition. |
| **Wallet settings** | Locked sections behind "Reveal" buttons. Confirmation before exporting keys. |
| **Admin actions** | Double-confirmation dialogs for destructive actions. Red accent for danger zone. |

### 11.4 Anti-Patterns to Avoid

| ❌ Anti-Pattern | Why It Breaks Trust |
|---|---|
| Crypto jargon anywhere in the main UI | Alienates mainstream users; signals "crypto project" not "financial platform" |
| Playful illustrations for serious features | A cartoony empty state on a $500K transaction page is inappropriate |
| "Coming soon" on visible features | If a button exists, clicking it should do something. Don't tease unbuilt features. |
| Modal overload | More than one modal deep feels unstable. Use inline expansion or page navigation instead. |
| Auto-playing anything | No auto-play videos, no auto-scrolling carousels. Users control the pace. |
| Notification spam | Only notify for: transaction state changes, offer received, KYC status, admin action. Never marketing. |
| Rounded "pill" buttons everywhere | Pill buttons feel casual. Use rounded rectangles (border-radius: 8px) for most buttons. |
| Color for decoration | Color is information. Red = error. Green = success. Gold = primary action. Blue = link. Never decorative. |
| Progress bars without context | "Loading..." means nothing. "Processing your investment on Solana (typically 5–15 seconds)..." builds confidence. |

---

## 12. Motion & Animation

### 12.1 Animation Principles

| Principle | Rule |
|---|---|
| **Purposeful** | Every animation communicates something: entrance, state change, feedback. No animation for decoration. |
| **Fast** | 150–300ms for most transitions. Never above 500ms. Users should never wait for animation to finish. |
| **Subtle** | Animations should be felt, not noticed. If a user comments on an animation, it might be too much. |
| **Consistent** | Same animation for same action type across the entire app. Enter = fade-up. Exit = fade-out. |

### 12.2 Standard Animations

```css
/* Page enter */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: fadeIn 200ms ease-out; }

/* Card enter (staggered in grids) */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card-enter { animation: slideUp 250ms ease-out; }
/* Stagger: card nth-child delay = n × 50ms, max 6 */

/* Hover lift */
.card-hover:hover {
  transform: translateY(-2px);
  border-color: var(--border-focus);
  transition: all 200ms ease;
}

/* Button press */
.button:active { transform: scale(0.98); transition: transform 100ms ease; }

/* Modal */
.modal-enter { animation: fadeIn 200ms ease-out; }
.modal-backdrop { animation: fadeIn 150ms ease-out; background: rgba(0,0,0,0.6); }

/* Skeleton shimmer */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-muted) 25%,
    var(--bg-elevated) 50%,
    var(--bg-muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Gold glow (primary CTA hover) */
.gold-glow:hover {
  box-shadow: 0 0 20px rgba(201, 168, 76, 0.15),
              0 0 40px rgba(201, 168, 76, 0.05);
  transition: box-shadow 300ms ease;
}
```

### 12.3 What Never Animates

- Text content (no typewriter effects)
- Data values (numbers appear instantly, not count-up)
- Navigation (page transitions are instant — no slide/morph between routes)
- Form validation errors (appear instantly with red border)

---

*Document generated: March 7, 2026*  
*Platform: TIGI — Tokenized Intelligent Global Infrastructure*
