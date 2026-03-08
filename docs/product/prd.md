# TIGI — Product Requirements Document

> **Version:** 2.0  
> **Status:** Active  
> **Last updated:** March 7, 2026  
> **Owner:** TIGI Product

---

## 1. Product Vision

**TIGI is a premium, unified platform that makes real estate investment, ownership, and management accessible to everyone — powered by Solana blockchain for transparent tokenized ownership and AI for intelligent decision-making.**

TIGI eliminates the fragmentation, illiquidity, and opacity of traditional real estate by bringing every step of the property lifecycle — listing, valuation, investment, transaction, compliance, leasing, management, and inheritance — into one platform. The blockchain layer is invisible. The AI layer is pervasive. The experience is mainstream.

### Vision Statement
> *"Own the world's most valuable asset class — one token at a time."*

### What TIGI Is
- A **real estate infrastructure platform** that uses blockchain as plumbing and AI as intelligence
- A **marketplace** where properties are listed, valued, tokenized, and traded
- An **investment platform** where anyone with $100 can own real estate fractionally
- A **management system** for property owners, landlords, and estate planners

### What TIGI Is Not
- Not a cryptocurrency exchange
- Not a blockchain company selling a protocol or chain
- Not a REIT (no pooled fund — users choose individual properties)
- Not a licensed brokerage or financial advisor (the platform facilitates — users and professionals decide)

---

## 2. The Problem

Real estate is the world's largest asset class (~$330T globally), yet it is broken for almost everyone involved.

### For Investors
| Pain | Detail |
|---|---|
| **High barrier to entry** | Minimum investment is typically $50K–$200K+ for direct ownership |
| **Illiquidity** | Properties take 3–12 months to sell; no fractional exit possible |
| **Geographic lock-in** | Investing in out-of-state or international property is logistically prohibitive |
| **Opaque valuations** | Appraisals are expensive, subjective, and point-in-time |
| **No diversification** | Average investors can own 1–2 properties max, concentrating risk |

### For Property Owners
| Pain | Detail |
|---|---|
| **Limited buyer pool** | Traditional listings reach a fraction of potential buyers |
| **Slow transactions** | Purchase closings take 30–90 days with dozens of intermediaries |
| **No fractional sale option** | Can't sell 20% of a property to raise capital |
| **Fragmented tooling** | Separate tools for listing, management, compliance, and financial tracking |

### For Estate Planners
| Pain | Detail |
|---|---|
| **Manual inheritance** | Transferring property to heirs involves probate courts, lawyers, months of delay |
| **No digital-native tools** | Physical deeds and paper trails in an increasingly digital world |
| **Complex multi-heir scenarios** | Splitting property among multiple heirs is a legal nightmare |

### For the Market
| Pain | Detail |
|---|---|
| **Lack of transparency** | Transaction histories are siloed in county records, not digitally accessible |
| **Compliance friction** | KYC/AML processes are duplicated across every transaction |
| **No single source of truth** | Ownership, valuation, compliance, and management data live in different systems |

---

## 3. Platform Pillars

Six principles govern every product decision:

### Pillar 1: One Platform, Zero Fragmentation
Everything a property owner, investor, manager, or estate planner needs is under one roof. Users never leave TIGI to complete a workflow.

### Pillar 2: Blockchain Is Invisible
Solana provides tokenization, smart contracts, and immutable ownership records — but users interact with "Buy," "Invest," and "Transfer," not wallets, gas fees, or transaction hashes. Advanced users can opt into blockchain visibility.

### Pillar 3: AI Is the Intelligence Layer
Every decision surface is AI-enhanced: property valuations, investment recommendations, risk scoring, legal document analysis, fraud detection, and market forecasting. AI is embedded in workflows, not a separate section.

### Pillar 4: Premium Trust
The UI communicates institutional quality — dark, precise, elegant. Every interaction radiates security and sophistication. If a screen doesn't look like it handles billions, it gets redesigned.

### Pillar 5: Compliance by Default
Audit trails, KYC/AML placeholders, role-based access controls, and regulatory scaffolding are built in from the first line of code — not bolted on later.

### Pillar 6: Mainstream First, Crypto Never
TIGI speaks the language of real estate and finance. No wallet pop-ups on first visit. No token tickers in the nav. No Discord community link in the footer. This is a financial product, not a crypto project.

---

## 4. User Types

### 4.1 Primary Users

#### 🏦 Retail Investor
- **Profile:** 25–50, tech-comfortable, $500–$100K to invest, interested in passive income and portfolio diversification
- **Goals:** Browse properties, invest fractionally, track returns, diversify across geographies and property types
- **Key pain:** Can't access real estate without massive capital; REITs lack transparency and control
- **TIGI differentiator:** Pick individual properties, invest any amount, see real-time portfolio performance with AI insights

#### 🏠 Property Owner / Seller
- **Profile:** Individual or entity listing property for outright sale or tokenized fractional sale
- **Goals:** Reach broader investor base, raise capital via fractional sale, manage listing through compliance review
- **Key pain:** Traditional listings limit buyer pool to local market; no fractional sale mechanism exists
- **TIGI differentiator:** List once, reach global investors, tokenize for fractional sale, track investor interest in real time

#### 🔧 Property Manager
- **Profile:** Managing rentals on behalf of self or clients
- **Goals:** Streamline tenant management, rent collection, maintenance tracking, and financial reporting
- **Key pain:** Spreadsheets, disconnected tools, manual processes
- **TIGI differentiator:** Integrated management dashboard tied to ownership records, tokenized income tracking

#### 📜 Estate Planner
- **Profile:** 40+, owns tokenized property, wants to plan inheritance
- **Goals:** Designate beneficiaries, define transfer conditions, automate estate distribution
- **Key pain:** Probate courts, paper-based processes, no digital inheritance tools for property
- **TIGI differentiator:** Digital beneficiary designation with conditional automated transfer via smart contracts

### 4.2 Internal Users

#### 🛡️ Compliance Officer
- **Profile:** TIGI internal or partner org staff responsible for regulatory adherence
- **Goals:** Review KYC submissions, approve listings, flag suspicious transactions, maintain audit trail
- **TIGI tools:** Compliance dashboard, review queues, AI-assisted risk scoring, audit log viewer

#### ⚙️ Platform Admin
- **Profile:** TIGI operations team with full platform access
- **Goals:** User management, system configuration, transaction oversight, content moderation
- **TIGI tools:** Admin dashboard with KPIs, user/transaction/compliance management, system health monitoring

### 4.3 Future Users
- **Institutional Investor** — Fund managers allocating to tokenized real estate (post-MVP)
- **Developer / API Consumer** — Third parties building on TIGI APIs (M13: white-label/enterprise)
- **Tenant** — Occupant using TIGI for lease management and maintenance requests (M10)

---

## 5. Key Use Cases

### 5.1 Core Use Cases (MVP)

| # | Use Case | User | Flow Summary |
|---|---|---|---|
| UC-1 | **Browse and discover properties** | Investor, Visitor | Search marketplace → filter by type/price/location → view property detail |
| UC-2 | **Invest fractionally** | Investor | View property → select fractions → confirm → on-chain token transfer → portfolio updated |
| UC-3 | **List property for sale/tokenization** | Owner | Create listing → upload images/docs → submit for review → compliance approval → active on marketplace |
| UC-4 | **Execute a purchase transaction** | Investor + Owner | Make offer → accept → escrow funded → conditions met → settlement → token transferred |
| UC-5 | **Track portfolio performance** | Investor | View holdings, current value, ROI, yield history, trend charts |
| UC-6 | **Complete KYC verification** | All transacting users | Submit ID + selfie + address proof → auto/manual review → approved/rejected |
| UC-7 | **Review and approve listings** | Compliance Officer | Review queue → inspect listing + documents → approve/reject with reason |
| UC-8 | **Manage users and transactions** | Admin | Admin dashboard → search users → view/suspend → review transactions → flag |

### 5.2 Extended Use Cases (Post-MVP)

| # | Use Case | User | Milestone |
|---|---|---|---|
| UC-9 | Get AI property valuation | Owner, Investor | M6 |
| UC-10 | Receive personalized investment recommendations | Investor | M6 |
| UC-11 | Summarize legal documents with AI | Owner, Compliance | M7 |
| UC-12 | Designate inheritance beneficiaries | Owner, Investor | M8 |
| UC-13 | List land for lease | Owner | M9 |
| UC-14 | Apply for a lease | Investor, Tenant | M9 |
| UC-15 | Manage tenants and maintenance | Owner, Manager | M10 |
| UC-16 | Compare properties side-by-side | Investor | M6 |
| UC-17 | View market analytics and heat maps | Investor | M6 |
| UC-18 | Detect and flag fraud | System, Compliance | M7 |

---

## 6. Feature Inventory

### 6.1 Marketplace & Listings

| Feature | Priority | Milestone | Details |
|---|---|---|---|
| Property listing creation | P0 | M3 | Multi-step form: basic info → details → media → tokenization options → review |
| Marketplace browse | P0 | M3 | Grid/list views, pagination, property cards with key metrics |
| Search & filter | P0 | M3 | Full-text search + faceted filters: type, price range, location, status, yield, tokenized-only |
| Sort | P0 | M3 | Price ↑↓, newest, most popular, highest yield |
| Property detail page | P0 | M3 | Image carousel, specs, AI valuation, token info, documents, ownership history, map |
| Listing status workflow | P0 | M3 | Draft → Under Review → Active → Sold/Leased/Delisted |
| Owner listing dashboard | P0 | M3 | Manage listings, view stats (views, inquiries, investment progress) |
| Saved listings / watchlist | P1 | M3 | Save properties, receive notifications on price/status changes |
| Property comparison | P2 | M6 | Side-by-side AI-scored comparison of 2–4 properties |

### 6.2 Tokenization & Investment

| Feature | Priority | Milestone | Details |
|---|---|---|---|
| Solana wallet adapter | P0 | M4 | Phantom, Solflare, Backpack — optional, abstracted behind simple UX |
| Custodial wallet | P0 | M4 | Platform-managed wallet for mainstream users; no wallet popup needed |
| Token minting | P0 | M4 | Admin-triggered SPL token creation per property |
| Fractional ownership display | P0 | M4 | Token supply, price per fraction, % sold, distribution chart |
| Investment flow | P0 | M4 | Select fractions → review → confirm → on-chain settlement |
| Portfolio dashboard | P0 | M4 | Holdings grid, total value, ROI, yield history, trend charts |
| Token metadata | P1 | M4 | On-chain metadata linking to off-chain property data |
| Secondary market (resale) | P2 | Post-M5 | Resell fractions to other users; order book or instant pricing |

### 6.3 Transactions & Smart Contracts

| Feature | Priority | Milestone | Details |
|---|---|---|---|
| Escrow smart contract | P0 | M5 | Anchor program: hold funds, release on condition met, arbiter override |
| Purchase workflow | P0 | M5 | Offer → accept → escrow → conditions → settlement → transfer |
| Transaction status tracker | P0 | M5 | Step-by-step progress UI with completion indicators |
| Transaction history | P0 | M5 | List of all user transactions with status, amounts, dates |
| On-chain verification | P1 | M5 | Link to Solana Explorer for transaction transparency |
| Email notifications | P1 | M5 | State change notifications for all transaction participants |
| Platform fee logic | P1 | M5 | 2% commission calculated and deducted at settlement |

### 6.4 AI Features (see Section 9 for full strategy)

| Feature | Priority | Milestone | Details |
|---|---|---|---|
| Property valuation | P0 | M6 | Estimated value + confidence score + comps + factors |
| Market intelligence dashboard | P0 | M6 | Trends, heat maps, volume, yield analytics |
| Investment recommendations | P1 | M6 | Personalized suggestions based on portfolio + risk profile |
| Legal document summarization | P1 | M7 | Upload contract → plain-English summary + risk flags |
| Fraud detection | P1 | M7 | Anomaly scoring on listings, transactions, accounts |
| Property comparison (AI-scored) | P2 | M6 | Side-by-side radar chart with category scores |
| AI chat assistant | P2 | Post-MVP | Conversational AI for platform questions and guidance |
| Predictive market forecasting | P3 | Post-MVP | Price prediction models for markets and properties |

### 6.5 Legal & Compliance

| Feature | Priority | Milestone | Details |
|---|---|---|---|
| KYC/AML verification flow | P0 | M7 | ID upload, selfie, address proof; provider-ready (Sumsub/Onfido), mock mode for MVP |
| Document management | P0 | M7 | Upload, categorize, verify titles/deeds/contracts |
| Compliance review dashboard | P0 | M7 | Pending KYC, flagged transactions, listing approvals |
| Audit trail | P0 | M7 | Immutable log of all compliance-relevant actions |
| Regulatory badges | P1 | M7 | Verified/pending/flagged status on listings and users |
| AI-assisted risk assessment | P2 | M7 | Auto-score KYC submissions and transactions for compliance review |

### 6.6 Inheritance & Estate Planning

| Feature | Priority | Milestone | Details |
|---|---|---|---|
| Beneficiary designation | P0 | M8 | Assign heirs to specific tokens/properties |
| Transfer conditions | P0 | M8 | Time-based, inactivity-based, or manual-trigger |
| Estate plan dashboard | P0 | M8 | Overview of all designations with modification capability |
| Smart contract conditional transfer | P1 | M8 | On-chain transfer execution upon verified trigger |
| Legal verification hooks | P2 | M8 | Placeholder for death certificate / court order integration |

### 6.7 Leasing & Property Management

| Feature | Priority | Milestone | Details |
|---|---|---|---|
| Lease listing creation | P0 | M9 | Terms, duration, permitted use, pricing |
| Lease application workflow | P0 | M9 | Apply → review → accept/reject |
| Tenant management | P0 | M10 | Profiles, lease terms, contact, payment history |
| Maintenance request system | P0 | M10 | Submit → assign → track → resolve lifecycle |
| Property financials | P1 | M10 | Income, expenses, net yield per property |

### 6.8 Admin & Platform Operations

| Feature | Priority | Milestone | Details |
|---|---|---|---|
| User management | P0 | M2 | Search, view, suspend, change roles |
| Basic admin dashboard | P0 | M2 | User count, listing count, activity summary |
| Full admin command center | P1 | M12 | KPIs, transaction volume, revenue, compliance queues, system health |
| Content moderation | P1 | M12 | Listing review, image review, report handling |
| System monitoring | P2 | M12 | Error rates, API latency, Solana RPC status |

---

## 7. MVP Definition

### 7.1 Scope: Milestones 1–5

The MVP delivers a **functional, demo-ready platform** where users can browse tokenized real estate, invest fractionally, and execute smart contract transactions — all with the premium TIGI dark aesthetic.

| Milestone | What Ships |
|---|---|
| **M1** | Next.js project, design system, component library, landing page |
| **M2** | Database, auth (email + OAuth), RBAC, user management |
| **M3** | Marketplace browse/search/filter, property listing, detail pages, owner dashboard |
| **M4** | Solana wallet integration, token minting, fractional investment, portfolio |
| **M5** | Escrow smart contract, purchase workflow, transaction tracking, notifications |

### 7.2 MVP User Journey
```
Register → Select Role → [Browse Marketplace] → [Pick Property] → [KYC check*]
    → [Invest / Make Offer] → [Escrow] → [Conditions Met] → [Settlement]
    → [View Portfolio] → [Track Returns]

* KYC is mock/auto-approve in MVP; real third-party integration in M7
```

### 7.3 Explicit MVP Exclusions

| Excluded | Why | When |
|---|---|---|
| AI valuation, recommendations, summarization | Requires model training and data pipeline | M6–M7 |
| Third-party KYC/AML | Needs vendor contract and integration | M7 (mock mode in M2–M5) |
| Fiat payment processing | Solana-only for MVP; fiat on-ramp later | Post-M5 |
| Secondary market / token resale | Requires market-making logic | Post-M5 |
| Inheritance workflows | Needs token + compliance layers complete | M8 |
| Leasing | Needs marketplace + smart contracts | M9 |
| Property management | Post-core-product feature | M10 |
| Mobile native app | Web-first responsive; native is future | Post-launch |
| Multi-language / i18n | English-only for MVP | Post-launch |
| Solana Mainnet | All operations on Devnet for MVP | Post-audit |

---

## 8. Post-MVP Roadmap

### Phase 3: Intelligence & Trust (Weeks 9–12)
| Milestone | Unlock |
|---|---|
| **M6 — AI Engine** | AI valuations on every property, market dashboards, personalized investment recommendations, property comparison — **transforms TIGI from marketplace to intelligence platform** |
| **M7 — Legal & KYC** | Real KYC/AML verification, document management, compliance dashboard, fraud detection — **required before production launch with real users** |

### Phase 4: Extended Workflows (Weeks 13–16)
| Milestone | Unlock |
|---|---|
| **M8 — Inheritance** | Digital estate planning — **unique differentiator**, no competitor offers this |
| **M9 — Leasing** | Land and property leasing — **expands TAM** beyond buy/sell to ongoing yield |
| **M10 — Property Mgmt** | Tenant and maintenance management — **recurring engagement**, owners stay on platform daily |

### Phase 5: Platform Maturity (Weeks 17–22)
| Milestone | Unlock |
|---|---|
| **M11 — Security** | 2FA, anomaly detection, insurance integrations — **trust multiplier** |
| **M12 — Admin** | Full command center — **operational readiness** for scaling |
| **M13 — Enterprise** | Multi-tenancy, white-label, APIs — **revenue multiplier** via B2B |

### Revenue Phase Unlocks (Post-Platform)
| Feature | Revenue Model |
|---|---|
| Fiat on-ramp | Payment processing fees |
| Secondary market | Trading commission |
| Premium AI features | Subscription (see Section 9.3) |
| API access | Usage-based pricing |
| White-label licenses | Enterprise contracts |
| Insurance referrals | Affiliate commission |

---

## 9. AI Feature Strategy

### 9.1 AI Philosophy

AI in TIGI is a **pervasive intelligence layer** — not a feature section. Every major decision surface is AI-enhanced, and AI outputs appear in-context (on property pages, during transactions, in compliance reviews) rather than in a separate "AI" tab.

| Principle | Implementation |
|---|---|
| **Embedded** | Valuation appears on property detail; recommendations appear in portfolio; risk flags appear in compliance queue |
| **Transparent** | Every AI output shows confidence score + explanation + "How was this calculated?" expandable |
| **Advisory** | AI recommends; humans decide. "AI Estimate — not a licensed appraisal" on every valuation |
| **Provider-agnostic** | Service interfaces abstract OpenAI/Anthropic/custom models — swap without touching business logic |
| **Cost-managed** | Results cached (24h TTL), rate-limited per user, tiered by subscription level |

### 9.2 AI Feature Breakdown

#### Tier 1: Core AI (Free for all users)
Available to every registered user — these make TIGI immediately more valuable than any competitor.

| Feature | What It Does | Input | Output |
|---|---|---|---|
| **Basic Property Valuation** | Estimates fair market value | Property attributes, location | Estimated value, confidence score (Low/Med/High) |
| **Market Trend Snapshots** | Shows area-level price trends | Location | 90-day price trend, direction indicator |
| **Risk Rating** | Simple risk classification per property | Property data, market data | Low/Medium/High risk badge with 1-line reason |

#### Tier 2: Premium AI (TIGI Pro subscription)
Advanced intelligence for serious investors — the primary upgrade incentive.

| Feature | What It Does | Input | Output |
|---|---|---|---|
| **Deep Valuation Report** | Comprehensive analysis with comparables, factors, and confidence intervals | Property attributes, location, market data | Full report: value range, 5 comps, positive/negative factors, market context, PDF export |
| **Investment Recommendations** | Personalized property suggestions based on portfolio and risk profile | User portfolio, risk preference, investment history | Top 10 ranked properties with match scores and portfolio impact analysis |
| **Property Comparison (AI)** | Side-by-side scoring of 2–4 properties across 6 categories | Selected properties | Radar chart, category scores (Location, Value, Yield, Risk, Liquidity, Growth), natural-language recommendation |
| **Portfolio Optimizer** | Suggests rebalancing to optimize yield, diversification, or risk | Current holdings, market data | Recommended allocations, trade suggestions, projected impact |
| **Predictive Market Forecast** | Forward-looking price predictions for markets and property types | Historical trends, economic indicators | 6/12/24-month projections with confidence bands |
| **Legal Document AI** | Summarize contracts, flag risks, extract key terms | Uploaded PDF/document | Plain-English summary, key term extraction, risk flags, recommended actions |
| **AI Chat Assistant** | Conversational Q&A about portfolio, market, and platform | User query + context | Natural language response with sourced data |

#### Tier 3: Institutional AI (Enterprise plan)
For fund managers, compliance teams, and white-label partners.

| Feature | What It Does |
|---|---|
| **Bulk Valuation API** | Value hundreds of properties programmatically |
| **Custom Scoring Models** | Configurable weight adjustments on valuation factors |
| **Portfolio Analytics API** | Fund-level analytics, reporting, and attribution |
| **Compliance AI Suite** | Automated KYC risk scoring, transaction monitoring, SAR drafting assistance |
| **White-Label AI** | AI features embedded in partner platforms via API |

### 9.3 Premium Subscription Model: TIGI Pro

#### Pricing Structure

| Plan | Price | AI Calls/Month | Features |
|---|---|---|---|
| **Free** | $0 | 10 basic valuations, unlimited browse | Core AI (Tier 1), marketplace access, 1 watchlist |
| **TIGI Pro** | $29/mo ($279/yr) | 50 deep valuations, unlimited recommendations | Tier 1 + Tier 2 AI, unlimited watchlists, PDF exports, priority support |
| **TIGI Pro+** | $79/mo ($749/yr) | Unlimited AI, priority processing | All Tier 2, legal document AI (10/mo), portfolio optimizer, predictive forecasts |
| **TIGI Enterprise** | Custom | Unlimited + API access | All tiers + API, bulk operations, SLA, dedicated support |

#### Upgrade Triggers (UX Moments)
The platform creates natural upgrade moments — not hard paywalls:

| Trigger | Where | UX |
|---|---|---|
| **"See full valuation report"** | Property detail page (basic valuation shown free) | "Upgrade to Pro for the complete report with comparables and factors" |
| **"Get personalized recommendations"** | Portfolio page (empty recommendation section) | "Pro members get AI-matched property suggestions" |
| **"Compare properties"** | Marketplace (compare button) | Free: basic table comparison. Pro: AI-scored radar chart |
| **"Summarize this document"** | Document viewer | "Upload and analyze with TIGI Pro+ legal AI" |
| **"Forecast this market"** | Analytics page | "Unlock predictive forecasts with TIGI Pro+" |
| **"Export to PDF"** | Valuation, portfolio reports | Pro feature call-out |

#### Revenue Projections (Assumptions)

| Metric | Conservative | Target | Aggressive |
|---|---|---|---|
| Registered users (Year 1) | 5,000 | 15,000 | 40,000 |
| Free → Pro conversion | 3% | 6% | 10% |
| Pro subscribers | 150 | 900 | 4,000 |
| Pro ARPU | $25/mo | $35/mo | $45/mo |
| **Annual subscription revenue** | **$45K** | **$378K** | **$2.16M** |

Plus transaction fees (2% on tokenized transactions) and enterprise contracts.

### 9.4 AI Architecture

```
┌──────────────────────────────────────────────────┐
│                  API Route / Server Action         │
│                  (rate limit + subscription check)  │
├──────────────────────────────────────────────────┤
│              AI Service Interface                  │
│     analyze(input) → AiResult<T>                   │
├────────────┬─────────────┬───────────────────────┤
│ Structured │ LLM-Based   │ Hybrid                │
│ Scoring    │ Analysis    │ Ensemble              │
│            │             │                       │
│ • Property │ • Legal     │ • Valuation           │
│   score    │   summary   │   (structured 60% +   │
│ • Risk     │ • Chat      │    LLM 40%)           │
│   score    │   assistant │ • Recommendations     │
│ • Match    │ • Market    │                       │
│   score    │   narrative │                       │
├────────────┴─────────────┴───────────────────────┤
│           Provider Adapter Layer                   │
│     OpenAI │ Anthropic │ Custom Model              │
├──────────────────────────────────────────────────┤
│           Cache Layer (Redis, 24h TTL)             │
└──────────────────────────────────────────────────┘
```

---

## 10. Success Metrics

### 10.1 MVP Metrics (M1–M5)

| Category | Metric | Target |
|---|---|---|
| **Acquisition** | Registered users | 500 |
| **Activation** | Users who complete profile + connect wallet or custodial | 60% of registered |
| **Engagement** | Weekly active users viewing marketplace | 40% of registered |
| **Transaction** | Completed investment transactions | 100 |
| **Revenue** | Total value tokenized (demo/devnet) | $1M simulated |
| **Quality** | Build passing, zero critical bugs | 100% |
| **Performance** | Page load < 3s, API p95 < 500ms | Achieved |
| **Design** | Consistent dark premium aesthetic across all pages | Visual QA pass |

### 10.2 Post-MVP Growth Metrics

| Category | Metric | 6-Month Target | 12-Month Target |
|---|---|---|---|
| **Users** | Registered users | 5,000 | 20,000 |
| **Properties** | Active listings | 200 | 1,000 |
| **Transactions** | Monthly transaction volume | $500K | $5M |
| **Revenue** | Platform commission revenue | $10K/mo | $100K/mo |
| **AI** | Pro subscribers | 200 | 1,500 |
| **AI** | AI valuation accuracy (vs. manual appraisal) | ±15% | ±10% |
| **Compliance** | KYC completion rate | 70% | 85% |
| **Retention** | Monthly active user retention | 40% | 55% |
| **NPS** | Net Promoter Score | 30 | 50 |

### 10.3 North Star Metric
> **Total value of tokenized real estate on TIGI** — this single number captures platform adoption, trust, and utility.

---

## 11. Risks & Mitigations

### 11.1 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Users don't trust blockchain for real estate** | Medium | High | Blockchain is invisible; platform feels like traditional fintech; trust built through compliance, insurance, and premium UX |
| **Cold start problem (no listings)** | High | High | Seed marketplace with 50+ generated demo properties with AI images; partner with 2–3 property owners for real listings |
| **Wallet UX causes drop-off** | Medium | Medium | Custodial wallet by default, no wallet required to browse, wallet connection is opt-in-advanced |
| **AI valuations perceived as unreliable** | Medium | Medium | Show confidence intervals, cite comparables, disclaimers, allow user feedback on accuracy |
| **Scope creep delays MVP** | Medium | High | Hard scope boundaries (see Section 7.3); M6+ features are explicitly post-MVP |

### 11.2 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Solana Devnet instability** | Medium | Medium | Retry logic, fallback mock mode, local validator for dev |
| **Smart contract vulnerabilities** | Low | Critical | Anchor framework (type-safe), comprehensive tests, third-party audit before mainnet |
| **AI API cost overruns** | Medium | Medium | Caching (24h), rate limits, tiered access, model selection per feature |
| **Database schema changes post-MVP** | Medium | Low | Start with MVP-only tables; additive migrations for post-MVP features |
| **Performance at scale** | Low | Medium | SSR with streaming, database indexing, Redis caching, CDN for static assets |

### 11.3 Regulatory Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Tokens classified as securities** | High | High | Assume securities from day one; build with Reg D/Reg A+ compliance scaffolding |
| **State-by-state licensing requirements** | Medium | Medium | Start with states that have clear tokenization frameworks; expand jurisdiction-by-jurisdiction |
| **KYC/AML enforcement action** | Low | Critical | KYC required before any transaction; AML monitoring; SAR filing capability |
| **Changing crypto regulations** | Medium | Medium | Modular compliance layer; regulatory monitoring; legal counsel on retainer |

### 11.4 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Competitor launches similar product** | Medium | Medium | Speed to market; build trust through compliance and UX; network effects once listings accumulate |
| **Real estate market downturn** | Medium | Medium | Platform is market-neutral (facilitates, doesn't hold assets); downturns increase demand for fractional/liquid options |
| **Difficulty onboarding property owners** | High | High | Make listing flow frictionless; pre-populate with generated listings; partner with real estate agents and firms |

---

## 12. Assumptions

### 12.1 Market Assumptions
- The tokenized real estate market will grow significantly (projected $4T+ by 2030)
- Retail investors want access to real estate beyond REITs and direct ownership
- Property owners want access to a broader, global investor pool
- Regulatory clarity for tokenized real estate will improve, not regress

### 12.2 Technical Assumptions
- Solana remains performant, low-cost, and well-supported for token operations
- LLM APIs (OpenAI/Anthropic) remain available and cost-effective for AI features
- Next.js and the React ecosystem continue to be the best choice for full-stack web
- PostgreSQL handles TIGI's data requirements through the first 100K users

### 12.3 User Assumptions
- Users are comfortable with digital financial products (banking apps, stock trading apps)
- Users do NOT need to understand blockchain to use TIGI (invisible infrastructure)
- Users will complete KYC if it's simple and the investment opportunity is compelling
- Premium AI features provide enough value to justify $29–$79/month subscription

### 12.4 Business Assumptions
- TIGI will not act as a broker-dealer or real estate brokerage in MVP (marketplace model)
- Platform revenue model: transaction fees (2%) + subscriptions (TIGI Pro) + enterprise contracts
- Legal entity structure and regulatory registrations will be handled in parallel with product development
- Initial market focus is United States; international expansion is post-launch

---

*Document generated: March 7, 2026*  
*Platform: TIGI — Tokenized Intelligent Global Infrastructure*
