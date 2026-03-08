# TIGI — AI Features Strategy

> **Version:** 2.0  
> **Status:** Active  
> **Last updated:** March 7, 2026

---

## 1. AI Philosophy

### 1.1 Core Principles

| Principle | Implementation |
|---|---|
| **Embedded** | AI outputs appear in-context (on property pages, in portfolios, in compliance queues) — never in a separate "AI" section |
| **Transparent** | Every output shows confidence, basis, methodology, and freshness. Users can evaluate the AI's reasoning. |
| **Advisory** | AI recommends. Humans decide. No auto-trading, no auto-approvals, no action without explicit user confirmation. |
| **Cost-managed** | Results cached, rate-limited, tiered by subscription. No open-ended API calls. Every feature has a cost ceiling. |
| **Provider-agnostic** | Service interfaces abstract the provider. Swap OpenAI ↔ Anthropic ↔ custom model without touching business logic. |
| **Honest** | AI says "I don't have enough data for a confident estimate" when appropriate. Low-confidence results are labeled, not hidden. |

### 1.2 Classification System

Every AI feature is classified on three dimensions:

| Dimension | Categories |
|---|---|
| **Access** | `FREE` — all users \ `PREMIUM` — TIGI Pro subscribers \ `ENTERPRISE` — API/bulk access |
| **Phase** | `MVP` — ships with mock implementation \ `M6` — first real AI milestone \ `M7` — legal/compliance AI \ `POST-MVP` — future roadmap |
| **Engine** | `RULE` — deterministic rules, no model \ `SCORING` — weighted structured model, no LLM \ `LLM` — large language model call \ `HYBRID` — scoring + LLM combined |

---

## 2. Feature Inventory

### Quick Reference Matrix

| # | Feature | Access | Phase | Engine | Est. Cost/Call | Cache TTL |
|---|---|---|---|---|---|---|
| 1 | Property Valuation (Basic) | FREE | MVP (mock) → M6 | HYBRID | $0.03–0.08 | 24h |
| 2 | Property Valuation (Deep Report) | PREMIUM | M6 | HYBRID | $0.10–0.25 | 24h |
| 3 | Land Valuation | FREE (basic) / PREMIUM (deep) | M6 | HYBRID | $0.05–0.20 | 24h |
| 4 | Investment Recommendations | PREMIUM | M6 | SCORING | $0.01–0.02 | 6h |
| 5 | Investor Analytics & Portfolio Optimizer | PREMIUM | M6 | SCORING + LLM | $0.05–0.15 | 12h |
| 6 | Fraud & Anomaly Detection | INTERNAL | M7 | RULE + SCORING | ~$0 | Real-time |
| 7 | Legal Document Summarization | PREMIUM | M7 | LLM | $0.15–0.50 | 7d |
| 8 | Title & Deed Parsing | PREMIUM | M7 | LLM | $0.10–0.30 | 30d |
| 9 | Inheritance Scenario Simulation | PREMIUM | M8 | SCORING + LLM | $0.05–0.15 | On-demand |
| 10 | Lease Optimization | PREMIUM | M9 | SCORING + LLM | $0.05–0.15 | 12h |
| 11 | Development Feasibility | ENTERPRISE | POST-MVP | HYBRID | $0.20–0.50 | 24h |
| 12 | AI Assistant (Chat) | PREMIUM | POST-MVP | LLM | $0.02–0.10 | None |

**Total monthly AI cost projections** (see §14 for full analysis)

---

## 3. Feature 1: Property Valuation

### 3.1 Basic Valuation (FREE)

| Attribute | Value |
|---|---|
| **Access** | FREE — all authenticated users |
| **Phase** | MVP (mock) → M6 (real) |
| **Engine** | SCORING (MVP) → HYBRID (M6) |
| **Appears** | Property detail page — "AI Estimated Value" section |

**What it does:**
Estimates fair market value for any residential or commercial property.

**MVP implementation (mock):**
```
Deterministic formula:
  baseValue = price * 1.0 (±5% random for realism)
  adjustments:
    + (sqft > areaMedian) → +3%
    + (yearBuilt > 2010) → +5%
    - (yearBuilt < 1970) → -3%
  confidence = "Medium" (always, in mock)

Output: { estimatedValue, confidence: "Medium", basis: "Area market data" }
```

**M6 implementation (real):**
```
Structured scoring model (60% weight):
  ├── Comparable sales analysis (price/sqft of 5 nearest sold properties)
  ├── Location score (school district, walk score, crime data)
  ├── Property condition adjustments (age, renovations, features)
  ├── Market trend coefficient (area 90-day price movement)
  └── Output: quantitative estimate + confidence interval

LLM analysis (40% weight):
  ├── Prompt: property data + comps + market context
  ├── Model: GPT-4o-mini (cost-efficient for valuations)
  ├── Output: qualitative assessment, positive/negative factors, narrative
  └── Temperature: 0.3 (factual, not creative)

Ensemble: weighted average → final estimate + confidence score (0.0–1.0)
```

**Output:**
```typescript
interface BasicValuation {
  estimatedValue: number           // $485,000
  confidence: 'low' | 'medium' | 'high'
  trend: 'up' | 'stable' | 'down' // vs. area median
  basis: string                    // "Based on 3 comparable sales within 0.5mi"
  disclaimer: string              // Static legal disclaimer
  generatedAt: Date
}
```

---

### 3.2 Deep Valuation Report (PREMIUM)

| Attribute | Value |
|---|---|
| **Access** | PREMIUM — TIGI Pro subscribers |
| **Phase** | M6 |
| **Engine** | HYBRID (scoring 60% + LLM 40%) |
| **Appears** | Property detail page → "See Full Report" expandable |

**What it adds over basic:**

| Component | Detail |
|---|---|
| Value range | $470,000 – $505,000 (confidence interval) |
| Confidence score | 0.82 (numeric, not just Low/Med/High) |
| Comparable properties | 5 cards: address, sale price, sale date, distance, sqft, adjustments |
| Positive factors | List: "Strong school district (8/10)", "Recent kitchen renovation", etc. |
| Negative factors | List: "FEMA flood zone (Zone AE)", "Above-median days on market in area" |
| Market context | 6-month price trend chart for the area |
| Investment analysis | Estimated rental yield, cap rate, cash-on-cash return projections |
| PDF export | Downloadable report with TIGI branding |

**LLM prompt structure:**
```
System: You are a real estate valuation analyst. Provide a detailed 
analysis of the following property. Be factual, cite specific data 
points, and clearly state confidence level with reasoning.

User: 
Property: {title, address, type, sqft, beds, baths, yearBuilt, features}
Listed Price: ${price}
Comparable Sales (last 12 months): {comp1...comp5}
Area Statistics: {medianPrice, avgDaysOnMarket, pricePerSqft, trend}

Respond with:
1. Estimated value range (low - high)
2. Best estimate with confidence (0.0-1.0)
3. Positive factors (list with data backing)
4. Negative factors (list with data backing)  
5. Investment analysis (rental yield estimate, cap rate)
6. One-paragraph narrative summary
```

**Cost:** ~$0.10–0.25 per deep valuation (GPT-4o-mini with structured output)

---

## 4. Feature 2: Land Valuation

| Attribute | Value |
|---|---|
| **Access** | FREE (basic) / PREMIUM (deep) |
| **Phase** | M6 |
| **Engine** | HYBRID |
| **Appears** | Property detail page (when type = land) |

**Why it's separate from property valuation:**
Land valuation uses fundamentally different factors. There are no beds/baths/sqft comps — instead: acreage, zoning, topography, road access, utilities, development potential, agricultural productivity, mineral rights.

**Land-specific factors:**
```
Structured scoring inputs:
  ├── Parcel size (acres)
  ├── Zoning classification (residential, commercial, agricultural, mixed)
  ├── Road frontage (feet)
  ├── Utility access (water, sewer, electric, gas — each scored)
  ├── Topography (flat, rolling, steep — derived or user-input)
  ├── Environmental constraints (wetlands, flood zone, easements)
  ├── Comparable land sales (price per acre in similar zoning)
  ├── Development potential score (zoning + size + utilities + access)
  └── Agricultural productivity (if applicable)

LLM analysis (for deep report):
  ├── Market narrative for area land values
  ├── Development feasibility assessment
  ├── Zoning risk analysis
  └── Comparable sale adjustments and commentary
```

**Output (basic — FREE):**
```typescript
interface LandValuationBasic {
  estimatedValuePerAcre: number
  totalEstimatedValue: number
  confidence: 'low' | 'medium' | 'high'
  primaryFactor: string           // "Strong development potential due to R-3 zoning"
  disclaimer: string
}
```

**Output (deep — PREMIUM):** Same as property deep report but with land-specific factors, development potential score, and agricultural/commercial use analysis.

---

## 5. Feature 3: Investment Recommendations

| Attribute | Value |
|---|---|
| **Access** | PREMIUM — TIGI Pro |
| **Phase** | M6 |
| **Engine** | SCORING (primary) + LLM (narrative only) |
| **Appears** | Portfolio page → "Recommended for You" section |

**MVP mock:**
Simple database query: properties matching user's preferred type and location, sorted by newest. No ML.

**M6 implementation:**

```
Input:
  ├── User profile: risk tolerance (conservative/moderate/aggressive)
  ├── User portfolio: current holdings (types, locations, values)
  ├── User behavior: saved properties, viewed properties, search history
  └── User preferences: property type preferences, location preferences

Scoring model:
  ├── Diversification score: how much does this property diversify the portfolio?
  │   ├── Type diversity (user holds 80% residential → commercial scores higher)
  │   ├── Geographic diversity (user holds 100% Texas → Florida scores higher)
  │   └── Price tier diversity (user holds all <$100K → mid-tier scores higher)
  │
  ├── Risk-match score: does this match the user's stated risk tolerance?
  │   ├── Conservative → higher confidence valuations, established areas
  │   ├── Moderate → balanced mix
  │   └── Aggressive → higher yield, emerging areas, development land
  │
  ├── Yield score: estimated annual return vs. portfolio average
  │
  ├── Trend score: is the property's area trending up?
  │
  └── Final score = weighted sum → rank → top 10

LLM (narrative generation only):
  ├── For each top-3 recommendation, generate a 2-sentence explanation
  ├── "This Austin commercial property would diversify your portfolio 
  │    beyond residential. Estimated 8.2% yield is above your portfolio 
  │    average of 6.1%."
  └── Model: GPT-4o-mini, temperature 0.5
```

**Output:**
```typescript
interface Recommendation {
  propertyId: string
  matchScore: number            // 0.0–1.0
  reasons: string[]             // ["Diversifies into commercial", "Above-average yield"]
  portfolioImpact: {
    newDiversificationScore: number
    projectedPortfolioYield: number
  }
  narrative: string             // LLM-generated explanation
}
```

**Rate limit:** 10 recommendation refreshes/day (Pro), 50/day (Pro+)

**Cost:** ~$0.01–0.02 per recommendation set (scoring is free; LLM narrative is minimal)

---

## 6. Feature 4: Investor Analytics & Portfolio Optimizer

| Attribute | Value |
|---|---|
| **Access** | PREMIUM (Pro+) |
| **Phase** | M6 |
| **Engine** | SCORING (analytics) + LLM (insights narrative) |
| **Appears** | Portfolio page → "Analytics" tab |

**Components:**

| Component | Engine | What It Does |
|---|---|---|
| Portfolio breakdown | RULE | Pie charts: by type, by location, by token allocation |
| Performance tracking | RULE | ROI over time, value change, yield history |
| Diversification score | SCORING | 0–100 score measuring type + geographic + price tier spread |
| Risk assessment | SCORING | Portfolio-level risk rating based on concentration, market volatility, property types |
| Optimization suggestions | SCORING + LLM | "Sell 10% of [Property A] and invest in commercial to improve diversification by 15%" |
| Market exposure report | SCORING | Heatmap of portfolio concentration by state/city |

**Optimization model:**
```
Inputs:
  ├── Current holdings (quantities, values, types, locations)
  ├── User's stated risk tolerance
  ├── Market data (area trends, yield averages)
  └── User goal: "maximize yield" | "minimize risk" | "maximize diversification"

Processing:
  ├── Calculate current portfolio metrics
  ├── Run Monte Carlo or simple scenario analysis
  ├── Identify imbalances (>40% in one type or location)
  ├── Generate rebalancing suggestions
  └── Project impact of each suggestion

LLM narrative:
  "Your portfolio is heavily concentrated in Texas residential (72%). 
   Consider diversifying into Florida commercial or Arizona land to 
   reduce geographic risk. Projected diversification improvement: +23%."
```

**Cost:** ~$0.05–0.15 per optimization run (scoring free, LLM for narrative)

---

## 7. Feature 5: Fraud & Anomaly Detection

| Attribute | Value |
|---|---|
| **Access** | INTERNAL — Compliance/Admin only (users never see this directly) |
| **Phase** | MVP (basic rules) → M7 (full model) |
| **Engine** | RULE (MVP) → RULE + SCORING (M7) |
| **Appears** | Admin → Compliance dashboard → "Flagged Items" |

**MVP rules (always running, zero cost):**
```
Listing flags:
  ├── Price < 50% of area median for property type → FLAG
  ├── Price > 300% of area median → FLAG
  ├── Multiple listings from same user in 24h (>5) → FLAG
  ├── Description contains known spam keywords → FLAG
  └── Images duplicated from another listing → FLAG (hash comparison)

Transaction flags:
  ├── Transaction amount > $500K → REVIEW (threshold alert)
  ├── User invests in >10 properties in 24h → FLAG
  ├── User created account <24h ago and transacts → FLAG
  └── Same buyer+seller in >3 transactions → FLAG

Account flags:
  ├── Multiple failed login attempts (>10 in 1h) → TEMP_LOCK
  ├── Profile info matches another account → FLAG
  └── KYC documents flagged by mock provider → FLAG
```

**M7 scoring model:**
```
Anomaly score (0–100) per entity:
  ├── Listing anomaly: price deviation, listing velocity, image uniqueness
  ├── Transaction anomaly: amount patterns, frequency, counterparty patterns
  ├── Account anomaly: login patterns, geographic inconsistency, device fingerprint
  └── Combined risk score with weighted categories

Threshold:
  ├── 0–30: Normal (no action)
  ├── 31–60: Watch (logged, reviewed weekly)
  ├── 61–80: Flag (immediate compliance review)
  └── 81–100: Block (auto-suspend pending human review)
```

**Cost:** Essentially $0 — all rule-based and structured scoring. No LLM calls.

---

## 8. Feature 6: Legal Document Summarization

| Attribute | Value |
|---|---|
| **Access** | PREMIUM (Pro+: 10 docs/month) |
| **Phase** | M7 |
| **Engine** | LLM |
| **Appears** | Property detail → Documents tab → "AI Summary" button per document |

**What it does:**
Takes an uploaded legal document (purchase agreement, title report, deed, lease contract, inspection report) and produces:

```typescript
interface DocumentSummary {
  documentType: 'purchase_agreement' | 'title_report' | 'deed' | 'lease' | 'inspection' | 'other'
  summary: string                       // 3–5 paragraph plain-English summary
  keyTerms: {
    term: string                        // "Earnest money"
    value: string                       // "$15,000 due within 5 business days"
    section: string                     // "Section 4.2"
  }[]
  obligations: {
    party: 'buyer' | 'seller' | 'both'
    obligation: string                  // "Buyer must complete inspection within 14 days"
    deadline: string | null             // "14 days from effective date"
  }[]
  riskFlags: {
    severity: 'low' | 'medium' | 'high'
    flag: string                        // "Property is in a flood zone (Zone AE)"
    recommendation: string              // "Request flood insurance documentation"
  }[]
  disclaimer: string                    // "AI summary — not legal advice"
}
```

**Implementation:**
```
Step 1: Extract text from PDF (pdf-parse or similar)
Step 2: Chunk document if > 8K tokens
Step 3: LLM call per chunk:
  ├── Model: GPT-4o (needs reasoning capability for legal nuance)
  ├── Temperature: 0.2 (factual, precise)
  ├── System prompt: legal analyst role with structured output schema
  └── Include document type hint for better parsing
Step 4: Merge chunk results
Step 5: Cache result (7-day TTL — documents don't change)
```

**Cost:** ~$0.15–0.50 per document (depends on length; average legal doc = 8K–20K tokens)

**Rate limit:** 10 documents/month (Pro+), unlimited (Enterprise)

---

## 9. Feature 7: Title & Deed Parsing

| Attribute | Value |
|---|---|
| **Access** | PREMIUM (Pro+) |
| **Phase** | M7 |
| **Engine** | LLM + structured extraction |
| **Appears** | Listing creation flow → "Auto-fill from title" feature |

**What it does:**
Extracts structured data from uploaded title reports and deeds to auto-populate listing fields and flag ownership issues.

```typescript
interface TitleParseResult {
  propertyAddress: {
    street: string
    city: string
    state: string
    zip: string
    county: string
  }
  parcelId: string | null
  legalDescription: string           // Lot and block, metes and bounds
  currentOwner: {
    name: string
    ownershipType: 'individual' | 'joint' | 'trust' | 'llc' | 'corporation'
  }
  encumbrances: {
    type: 'mortgage' | 'lien' | 'easement' | 'covenant' | 'judgment'
    holder: string
    amount: number | null
    description: string
  }[]
  titleStatus: 'clear' | 'encumbered' | 'clouded'
  flags: {
    severity: 'info' | 'warning' | 'critical'
    issue: string                    // "Active mortgage with Chase ($215,000 remaining)"
    recommendation: string           // "Mortgage must be satisfied at closing"
  }[]
}
```

**UX flow:**
```
Owner uploads title report during listing creation
  → "Analyzing document..." (3–5 second spinner)
  → Auto-fill confirmation: "We found the following. Please verify:"
    → Address fields pre-populated
    → Owner name matched against TIGI account
    → Encumbrances listed with warning badges
    → "Confirm & Continue" or "Edit Manually"
```

**Cost:** ~$0.10–0.30 per parse (GPT-4o, structured output mode)

---

## 10. Feature 8: Inheritance Scenario Simulation

| Attribute | Value |
|---|---|
| **Access** | PREMIUM (Pro+) |
| **Phase** | M8 |
| **Engine** | SCORING + LLM (narrative) |
| **Appears** | Inheritance page → "Simulate Scenarios" button |

**What it does:**
Lets a user model different inheritance distribution scenarios and see projected outcomes.

**Scenarios simulated:**
```
User inputs:
  ├── Holdings to include in estate plan
  ├── Beneficiaries (names, relationships)
  ├── Distribution preferences (equal split, custom percentages, specific-asset assignments)
  └── Trigger preferences (manual, date, inactivity)

Model calculates for each scenario:
  ├── Per-beneficiary: list of received tokens, current market value, projected 5-year value
  ├── Tax implications estimate: (basic — "consult tax professional" disclaimer)
  │   ├── Estimated estate value
  │   ├── Federal estate tax threshold ($12.92M in 2024)
  │   └── "Your estate is below/above the federal threshold"
  ├── Transfer complexity score: simple (1 beneficiary, 1 holding) → complex (5 beneficiaries, 10 holdings, conditional triggers)
  ├── Risk flags:
  │   ├── "Beneficiary [name] is not a TIGI user — transfer may require manual process"
  │   ├── "Inactivity trigger set to 90 days — this may trigger during extended travel"
  │   └── "No legal documentation uploaded — we recommend attaching a will reference"
  └── LLM narrative: plain-English summary of the scenario outcome and recommendations

Output:
  ├── Side-by-side scenario comparison table
  ├── Recommended scenario (highest simplicity score with user's preferences)
  └── "Apply this plan" CTA → pre-fills designation forms
```

**Cost:** ~$0.05–0.15 per simulation (scoring free, LLM for narrative summary)

---

## 11. Feature 9: Lease Optimization

| Attribute | Value |
|---|---|
| **Access** | PREMIUM (Pro+) |
| **Phase** | M9 |
| **Engine** | SCORING + LLM (narrative) |
| **Appears** | Lease listing creation → "Optimize Terms" assistant |

**What it does:**
Helps landlords set competitive lease terms and helps tenants evaluate lease fairness.

**For landlords (listing creation):**
```
Inputs:
  ├── Property details (type, size, location, features)
  ├── Owner's desired rent
  ├── Comparable lease listings in area (DB query)
  └── Market vacancy rates (seeded data or API)

Scoring model:
  ├── Rent competitiveness: owner's rent vs. area median → percentile
  ├── Vacancy risk: if rent > 120% of median → higher vacancy risk
  ├── Optimal rent range: 90th–110th percentile of area comps
  ├── Recommended deposit: market standard for property type
  └── Term recommendation: optimal lease duration based on market conditions

LLM narrative:
  "Your proposed rent of $2,800/month places this unit at the 75th percentile 
   for 2BR units in Downtown Austin. Market vacancy is currently low (3.2%), 
   suggesting you could price up to $3,100 without significant vacancy risk."

Output:
  ├── Recommended rent range
  ├── Competitive position indicator (below/at/above market)
  ├── Vacancy risk rating
  ├── Suggested term structure
  └── "Apply Recommendations" button → auto-fill lease form
```

**For tenants (lease evaluation):**
```
"Is this lease fair?"
  ├── Compare proposed rent to area comps → fair/above/below market
  ├── Flag unusual terms in lease contract (if uploaded)
  ├── Deposit reasonableness check
  └── Simple score: "This lease is [competitively priced / above market / below market]"
```

**Cost:** ~$0.05–0.15 per optimization (scoring dominant, LLM for narrative)

---

## 12. Feature 10: Development Feasibility Analysis

| Attribute | Value |
|---|---|
| **Access** | ENTERPRISE |
| **Phase** | POST-MVP |
| **Engine** | HYBRID (scoring + LLM) |
| **Appears** | Land detail page → "Development Analysis" (Enterprise badge) |

**What it does:**
For developers evaluating land for purchase or lease, provides a feasibility assessment covering zoning, projected costs, ROI modeling, and risk analysis.

```
Inputs:
  ├── Land parcel data (size, zoning, location, topography)
  ├── Proposed development type (residential, commercial, mixed-use)
  ├── Estimated units/sqft
  └── Market data (area demand, comparable developments, absorption rates)

Scoring model:
  ├── Zoning compatibility score
  ├── Infrastructure readiness (utilities, road access, drainage)
  ├── Market demand score (absorption rate, competitor supply pipeline)
  ├── Estimated development cost (per sqft benchmarks by type and market)
  ├── Projected revenue (sale price or rental income benchmarks)
  ├── Estimated ROI range
  └── Risk score (regulatory, market, environmental, construction)

LLM analysis:
  ├── Market narrative and demand assessment
  ├── Comparable development case studies
  ├── Regulatory risk assessment
  └── Executive summary with recommendation

Output:
  ├── Feasibility score: 0–100 (with breakdown)
  ├── Pro-forma estimate (simplified: cost, revenue, ROI)
  ├── Risk matrix by category
  ├── Comparable developments (2–3 examples)
  ├── Narrative report (3–5 paragraphs)
  └── PDF export with TIGI branding
```

**Cost:** ~$0.20–0.50 per analysis (data-heavy, GPT-4o for detailed narrative)

**Rate limit:** By contract (Enterprise plan)

---

## 13. Feature 11: AI Assistant (Chat)

| Attribute | Value |
|---|---|
| **Access** | PREMIUM (Pro+) |
| **Phase** | POST-MVP |
| **Engine** | LLM (RAG with platform data) |
| **Appears** | Floating chat widget (bottom-right), accessible from any platform page |

**What it does:**
A conversational interface that answers questions about the user's portfolio, market data, platform features, and general real estate topics.

**Example queries:**
```
"What's my portfolio's total ROI this month?"
  → Fetches portfolio data → calculates → presents in chat

"Compare the Austin property with the Miami one I saved"
  → Fetches both properties → runs comparison scoring → narrative response

"What does 'cap rate' mean?"
  → General knowledge response (no API call needed, use system prompt knowledge)

"Am I diversified enough?"
  → Fetches portfolio → runs diversification scoring → recommendations

"When is my lease on Lot 42 up for renewal?"
  → Fetches lease data → responds with date and options
```

**Implementation:**
```
Architecture:
  ├── RAG (Retrieval Augmented Generation):
  │   ├── User context: portfolio, transactions, watchlist, settings
  │   ├── Platform data: property details, market stats
  │   └── Knowledge base: real estate glossary, TIGI help docs
  ├── Tool calling: LLM can invoke platform APIs to fetch real-time data
  ├── Conversation memory: last 10 messages (session-scoped, not persistent)
  └── Guardrails:
      ├── Cannot execute transactions (read-only)
      ├── Cannot access other users' data
      ├── Cannot provide legal or financial advice (disclaimers enforced)
      └── "I can't help with that" for off-topic queries
```

**Cost:** ~$0.02–0.10 per message (GPT-4o-mini for most; GPT-4o for complex reasoning)

**Rate limit:** 50 messages/day (Pro+), unlimited (Enterprise)

---

## 14. Cost Analysis & Management

### 14.1 Per-Feature Cost Breakdown

| Feature | Model | Avg Tokens In | Avg Tokens Out | Cost/Call | Calls/Day (Est.) | Daily Cost |
|---|---|---|---|---|---|---|
| Basic Valuation | GPT-4o-mini | 2K | 500 | $0.03 | 200 | $6.00 |
| Deep Valuation | GPT-4o-mini | 4K | 2K | $0.15 | 50 | $7.50 |
| Land Valuation | GPT-4o-mini | 3K | 1K | $0.08 | 30 | $2.40 |
| Recommendations | GPT-4o-mini | 1K | 500 | $0.02 | 100 | $2.00 |
| Portfolio Optimizer | GPT-4o-mini | 2K | 1K | $0.08 | 20 | $1.60 |
| Legal Summary | GPT-4o | 15K | 3K | $0.35 | 10 | $3.50 |
| Title Parsing | GPT-4o | 10K | 1K | $0.20 | 10 | $2.00 |
| Inheritance Sim | GPT-4o-mini | 2K | 1K | $0.08 | 5 | $0.40 |
| Lease Optimization | GPT-4o-mini | 2K | 1K | $0.08 | 10 | $0.80 |
| AI Chat | GPT-4o-mini | 1K | 500 | $0.03 | 200 | $6.00 |
| **Total** | | | | | | **~$32/day** |

**Monthly estimate:** ~$960/month at 10K users (5% Pro conversion)

### 14.2 Cost Management Strategies

| Strategy | Implementation | Savings |
|---|---|---|
| **Aggressive caching** | Redis cache with TTL per feature (6h–30d). Same property + same model version = cached result. | 60–80% call reduction |
| **Tiered model selection** | GPT-4o-mini for most features; GPT-4o only for legal document analysis | 50% cost reduction vs. all-GPT-4o |
| **Structured output mode** | JSON mode for structured responses → fewer tokens, more predictable output | 20% token reduction |
| **Rate limiting** | Per-user daily caps by subscription tier | Prevents runaway costs |
| **Batch processing** | Nightly batch for market intelligence updates (one call covers many properties) | 70% savings vs. on-demand |
| **Scoring models first** | Rule-based and structured scoring models handle most logic; LLM only for narrative | 80% of computation is $0 |
| **Prompt optimization** | Minimal system prompts, focused instructions, avoid chain-of-thought for simple tasks | 30% token reduction |

### 14.3 Cost Ceiling by Tier

| Tier | Monthly AI Budget per User | Enforcement |
|---|---|---|
| Free | $0.30 (10 basic valuations max) | Rate limit: 10 calls/month |
| Pro ($29/mo) | $5.00 | Rate limit: 50 deep valuations, unlimited basic |
| Pro+ ($79/mo) | $15.00 | Rate limit: unlimited valuations, 10 doc summaries, optimizer |
| Enterprise | Custom (SLA-defined) | API key with metered billing |

Revenue vs. cost at target subscription rates:
```
Pro:  $29 revenue — $5 AI cost  = $24 margin (83%)
Pro+: $79 revenue — $15 AI cost = $64 margin (81%)
```

---

## 15. Architecture

### 15.1 Service Structure

```
src/lib/ai/
├── interfaces/                      # Provider-agnostic contracts
│   ├── valuation.interface.ts       #   IValuationService
│   ├── land-valuation.interface.ts  #   ILandValuationService
│   ├── recommendations.interface.ts #   IRecommendationService
│   ├── portfolio.interface.ts       #   IPortfolioAnalyticsService
│   ├── fraud.interface.ts           #   IFraudDetectionService
│   ├── legal-summary.interface.ts   #   ILegalSummaryService
│   ├── title-parser.interface.ts    #   ITitleParserService
│   ├── inheritance.interface.ts     #   IInheritanceSimService
│   ├── lease.interface.ts           #   ILeaseOptimizationService
│   ├── feasibility.interface.ts     #   IFeasibilityService
│   └── assistant.interface.ts       #   IAssistantService
│
├── providers/
│   ├── openai/
│   │   ├── client.ts                # OpenAI SDK singleton
│   │   ├── valuation.ts             # OpenAI valuation implementation
│   │   ├── legal-summary.ts         # OpenAI legal summary implementation
│   │   └── assistant.ts             # OpenAI chat implementation
│   └── anthropic/
│       ├── client.ts                # Anthropic SDK singleton
│       └── valuation.ts             # Claude-based alternative
│
├── scoring/                         # Zero-cost structured models
│   ├── property-score.ts            # Weighted property scoring
│   ├── land-score.ts                # Land-specific scoring
│   ├── risk-score.ts                # Risk classification
│   ├── match-score.ts               # User-property matching
│   ├── diversification-score.ts     # Portfolio diversification
│   ├── fraud-rules.ts               # Rule-based fraud flags
│   └── lease-competitiveness.ts     # Rent benchmarking
│
├── mock/                            # MVP mock implementations
│   ├── valuation.mock.ts            # Deterministic formula
│   ├── recommendations.mock.ts      # Simple DB query sort
│   └── fraud.mock.ts                # Basic rules only
│
├── cache.ts                         # Redis-backed caching layer
├── rate-limiter.ts                  # Per-user rate limiting
├── subscription-gate.ts             # Tier verification before calls
├── cost-tracker.ts                  # Per-user cost tracking for budgets
└── index.ts                         # Service factory
```

### 15.2 Service Factory

```typescript
// src/lib/ai/index.ts
import { env } from '@/lib/env'

export function getValuationService(): IValuationService {
  switch (env.AI_PROVIDER) {
    case 'openai':    return new OpenAIValuationService()
    case 'anthropic': return new AnthropicValuationService()
    case 'mock':      return new MockValuationService()
    default:          return new MockValuationService()
  }
}

// Same pattern for all 11 service interfaces
```

### 15.3 Request Pipeline

```
User action (e.g. "Generate Valuation")
  │
  ├── API route: POST /api/ai/valuation
  │   ├── Auth check
  │   ├── Subscription gate (is user on correct tier?)
  │   ├── Rate limit check (has user exceeded daily quota?)
  │   ├── Cost budget check (has user exceeded monthly AI budget?)
  │   │
  │   ├── Cache check (Redis):
  │   │   ├── Key = hash(featureId + propertyId + modelVersion + tier)
  │   │   ├── [HIT] → return cached result (fast path)
  │   │   └── [MISS] → continue
  │   │
  │   ├── Execute AI pipeline:
  │   │   ├── Fetch required data (property, comps, market stats)
  │   │   ├── Run scoring model (structured, $0 cost)
  │   │   ├── Run LLM call (if needed by feature + tier)
  │   │   ├── Combine results (ensemble for hybrid features)
  │   │   └── Build typed response
  │   │
  │   ├── Cache write (Redis, TTL per feature)
  │   ├── Cost tracking (increment user's monthly AI usage)
  │   ├── DB write (AiValuation table for audit trail)
  │   ├── Audit log
  │   │
  │   └── Return: { success: true, data: ValuationResult }
  │
  └── UI renders result with confidence, basis, and disclaimer
```

---

## 16. Ethical Guidelines

| Guideline | Implementation |
|---|---|
| **No investment advice** | All outputs framed as "estimates" and "analysis," never "you should buy this" |
| **Bias monitoring** | Track AI valuation accuracy by location, property type, and price tier — flag systematic bias |
| **Human override** | Compliance officers can override any AI score or flag |
| **No discrimination** | AI models never receive protected-class data (race, ethnicity, religion) as inputs |
| **Audit trail** | Every AI call is logged: feature, input hash, output, model, cost, user, timestamp |
| **User feedback** | "Was this valuation helpful?" — feedback loop for model improvement |
| **Regular review** | Quarterly accuracy review: compare AI valuations to actual sale prices |

---

*Document generated: March 7, 2026*  
*Platform: TIGI — Tokenized Intelligent Global Infrastructure*
