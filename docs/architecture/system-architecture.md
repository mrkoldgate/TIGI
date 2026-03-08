# TIGI — System Architecture

> **Version:** 2.0  
> **Status:** Active  
> **Last updated:** March 7, 2026

---

## 1. Architecture Overview

TIGI is a **modular monolith** deployed as a single Next.js application — with clearly separated service modules that can be extracted into microservices when scaling demands it. This gives us startup-speed iteration with enterprise-quality separation of concerns.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                  │
│                                                                        │
│  Next.js 15 App Router ─ React 19 ─ TypeScript ─ Tailwind ─ shadcn    │
│  SSR + Streaming ─ Client Components ─ Responsive ─ Dark Design System │
│                                                                        │
│  Route Groups:                                                         │
│    (marketing)/   → Landing, about, pricing (public)                   │
│    (platform)/    → Marketplace, portfolio, analytics (authenticated)  │
│    (admin)/       → Admin dashboard, compliance, user mgmt (admin)     │
│    api/           → REST route handlers (internal + public)            │
├────────────────────────────────────────────────────────────────────────┤
│                          API LAYER                                     │
│                                                                        │
│  Next.js Route Handlers (REST) + Server Actions (mutations)            │
│  Middleware: Auth → RBAC → Rate Limit → Validation → Handler           │
│                                                                        │
│  Request Pipeline:                                                     │
│    1. Auth middleware verifies session/JWT                              │
│    2. RBAC middleware checks role against route requirements            │
│    3. Zod validates request body/params                                │
│    4. Handler executes business logic                                  │
│    5. Audit logger records action                                      │
│    6. Response returns with standard envelope                          │
├────────────┬──────────────┬──────────────┬─────────────────────────────┤
│  CORE      │  SOLANA      │  AI ENGINE   │  INTEGRATIONS               │
│  SERVICES  │  LAYER       │  LAYER       │  LAYER                      │
│            │              │              │                             │
│  Users     │  RPC Client  │  Valuation   │  Auth Provider              │
│  Property  │  Token Ops   │  Risk Score  │  KYC Provider (mock→real)   │
│  Txn Mgr   │  Escrow Prog │  Legal AI    │  File Storage (S3/R2)       │
│  Legal     │  Wallet Adpt │  Fraud Det   │  Email (Resend)             │
│  Inherit   │  Metadata    │  Reco Engine │  Maps (placeholder)         │
│  Lease     │  Treasury    │  Market AI   │  Payment (future)           │
│  Mgmt      │              │              │  Insurance (future)         │
├────────────┴──────────────┴──────────────┴─────────────────────────────┤
│                          DATA LAYER                                    │
│                                                                        │
│  PostgreSQL (Prisma ORM)    Redis Cache        File Storage (S3/R2)    │
│  ─ Source of truth for UI    ─ Sessions         ─ Property images      │
│  ─ All business data         ─ Rate limits      ─ Documents/PDFs      │
│  ─ Audit log (append-only)   ─ AI result cache  ─ User uploads        │
│  ─ Compliance records        ─ Real-time data   ─ Token metadata JSON │
│                                                                        │
│  Solana (Devnet → Mainnet)                                             │
│  ─ Source of truth for OWNERSHIP                                       │
│  ─ SPL token balances and transfers                                    │
│  ─ Escrow program state                                                │
│  ─ Immutable transaction signatures                                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer-by-Layer Breakdown

### 2.1 Frontend Layer

| Aspect | Decision | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR + streaming for SEO and performance; RSC for data-fetching simplicity |
| **Language** | TypeScript (strict mode) | Type safety across components, API calls, and Prisma queries |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Utility-first with pre-built, customizable components — no custom CSS drift |
| **State** | React Server Components (default) + `useState`/`useReducer` for client interactivity | Minimal client-side state; server-first data pattern |
| **Forms** | React Hook Form + Zod | Type-safe form validation matching API schemas |
| **Charts** | Recharts or Tremor | Dark-theme compatible, composable chart library |
| **Wallet UI** | `@solana/wallet-adapter-react-ui` (custom-themed) | Standard Solana wallet connection with TIGI dark styling |

**Route Structure:**
```
src/app/
├── (marketing)/              # Public — no auth required
│   ├── page.tsx              # Landing page
│   ├── about/page.tsx
│   ├── pricing/page.tsx      # TIGI Pro subscription page
│   └── layout.tsx            # Marketing layout (no sidebar)
│
├── (platform)/               # Authenticated — requires login
│   ├── layout.tsx            # App shell: sidebar + topnav + content
│   ├── marketplace/
│   │   ├── page.tsx          # Browse/search/filter properties
│   │   └── [id]/page.tsx     # Property detail
│   ├── portfolio/page.tsx    # User's holdings and performance
│   ├── transactions/
│   │   ├── page.tsx          # Transaction list
│   │   └── [id]/page.tsx     # Transaction detail with step tracker
│   ├── analytics/page.tsx    # Market intelligence dashboards
│   ├── listings/
│   │   ├── page.tsx          # Owner's listing management
│   │   └── new/page.tsx      # Multi-step listing creation form
│   ├── inheritance/page.tsx  # Estate plan dashboard (M8)
│   ├── leasing/page.tsx      # Lease management (M9)
│   ├── management/page.tsx   # Property management (M10)
│   └── settings/page.tsx     # Profile, wallet, subscription, security
│
├── (admin)/                  # Admin-only — requires admin role
│   ├── layout.tsx            # Admin layout with admin sidebar
│   ├── dashboard/page.tsx    # KPIs, alerts, quick actions
│   ├── users/page.tsx        # User management
│   ├── compliance/page.tsx   # Review queues
│   └── transactions/page.tsx # Transaction oversight
│
└── api/                      # API route handlers
    ├── auth/[...nextauth]/
    ├── properties/
    ├── tokens/
    ├── transactions/
    ├── ai/
    ├── admin/
    └── webhooks/
```

---

### 2.2 Backend / API Layer

**Pattern:** Next.js Route Handlers for REST endpoints + Server Actions for form mutations.

**Request lifecycle:**
```
Incoming Request
  │
  ├─ middleware.ts (global Next.js middleware)
  │   ├─ Session verification (auth check)
  │   ├─ Route protection (public vs. authenticated vs. admin)
  │   └─ Rate limiting (Redis counter per IP/user)
  │
  ├─ Route Handler / Server Action
  │   ├─ Zod schema validation (request body/params)
  │   ├─ RBAC check: requireRole(['INVESTOR', 'ADMIN'])
  │   ├─ Resource authorization: requireOwnership(userId, resourceId)
  │   ├─ Business logic (service module call)
  │   ├─ Audit log write
  │   └─ Response with standard envelope
  │
  └─ Standard Response Format:
      {
        success: boolean,
        data?: T,
        error?: { code: string, message: string, details?: object },
        meta?: { page, total, cursor }
      }
```

**Service module pattern:**
```typescript
// src/lib/services/property.service.ts
export class PropertyService {
  // Dependencies injected (Prisma client, Solana client, etc.)
  constructor(private db: PrismaClient, private solana: SolanaService) {}

  async create(input: CreatePropertyInput, userId: string): Promise<Property> {
    // 1. Validate business rules
    // 2. Write to database
    // 3. If tokenized, trigger on-chain operations
    // 4. Log audit event
    // 5. Return result
  }
}
```

---

### 2.3 Database Layer (PostgreSQL + Prisma)

**Role:** Single source of truth for all business data and the primary source for UI rendering.

**Key schema areas:** (full schema in `database-outline.md`)

| Schema Group | Tables | Purpose |
|---|---|---|
| **Identity** | `User`, `Session`, `Account` | Users, auth sessions, OAuth accounts |
| **Property** | `Property`, `PropertyImage`, `PropertyDocument` | Listings, media, legal documents |
| **Blockchain** | `Token`, `TokenHolding` | Token mint records, ownership ledger (mirrors on-chain) |
| **Transaction** | `Transaction`, `TransactionStep`, `Escrow` | Multi-step workflows, escrow tracking |
| **Compliance** | `KycVerification`, `AuditLog` | KYC records, immutable audit trail |
| **Inheritance** | `BeneficiaryDesignation` | Estate plan records |
| **Leasing** | `Lease`, `Tenant`, `MaintenanceRequest` | Lease terms, tenant management |
| **AI** | `AiValuation` | Cached AI analysis results |

**Prisma configuration:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

**Connection management:**
```typescript
// src/lib/db.ts — Singleton pattern for serverless environments
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

### 2.4 Solana Layer

**Role:** Source of truth for **ownership** — token balances, transfer history, and escrow state.

**Components:**

| Component | Library | Purpose |
|---|---|---|
| **RPC Client** | `@solana/web3.js` | Connection to Solana Devnet/Mainnet |
| **Token Operations** | `@solana/spl-token` | Mint creation, token transfers, balance queries |
| **Wallet Adapter** | `@solana/wallet-adapter-*` | External wallet connection (Phantom, Solflare) |
| **Escrow Program** | Custom Anchor program | Multi-condition escrow for property transactions |
| **Metadata** | `@metaplex-foundation/mpl-token-metadata` | On-chain metadata linking tokens to property data |

**Module structure:**
```
src/lib/solana/
├── client.ts           # RPC connection singleton
├── tokens.ts           # Mint creation, transfer, burn, balance
├── escrow.ts           # Escrow program instruction builders
├── wallet.ts           # Wallet adapter configuration
├── custodial.ts        # Server-side custodial wallet management
├── metadata.ts         # Token metadata read/write
├── treasury.ts         # Platform treasury operations (fee collection)
└── types.ts            # Solana-specific TypeScript types
```

**RPC provider strategy:**
```typescript
// src/lib/solana/client.ts
import { Connection, clusterApiUrl } from '@solana/web3.js'

const RPC_ENDPOINT = process.env.SOLANA_RPC_URL
  || (process.env.NODE_ENV === 'production'
    ? 'https://mainnet.helius-rpc.com/?api-key=...'
    : clusterApiUrl('devnet'))

export const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60_000,
})
```

---

### 2.5 AI Engine Layer

**Role:** Intelligence layer providing valuation, recommendations, risk scoring, legal analysis, and fraud detection.

**Architecture:**
```
src/lib/ai/
├── interfaces/                 # Provider-agnostic service contracts
│   ├── valuation.ts            #   IValuationService
│   ├── recommendations.ts     #   IRecommendationService
│   ├── legal-summary.ts       #   ILegalSummaryService
│   ├── fraud-detection.ts     #   IFraudDetectionService
│   └── market-intelligence.ts #   IMarketIntelligenceService
├── providers/                  # Provider-specific implementations
│   ├── openai/
│   │   ├── client.ts           # OpenAI SDK instance
│   │   ├── valuation.ts        # GPT-4o-based valuation
│   │   └── legal-summary.ts    # GPT-4o-based summarization
│   └── anthropic/
│       └── valuation.ts        # Claude-based valuation (alternative)
├── scoring/                    # Structured models (no LLM)
│   ├── property-score.ts       # Weighted feature scoring
│   ├── risk-score.ts           # Risk classification model
│   └── match-score.ts          # User-property match scoring
├── cache.ts                    # Redis-backed result caching
├── rate-limiter.ts             # Per-user AI call rate limits
├── subscription-gate.ts        # Tier check before premium AI calls
└── index.ts                    # Service factory (resolves provider by config)
```

**Service factory pattern:**
```typescript
// src/lib/ai/index.ts
export function getValuationService(): IValuationService {
  const provider = process.env.AI_PROVIDER || 'openai'
  switch (provider) {
    case 'openai': return new OpenAIValuationService()
    case 'anthropic': return new AnthropicValuationService()
    case 'mock': return new MockValuationService() // MVP fallback
    default: throw new Error(`Unknown AI provider: ${provider}`)
  }
}
```

**Subscription gating:**
```typescript
// Before executing a premium AI call
const userTier = await getUserSubscriptionTier(userId)
if (feature.requiredTier === 'pro' && userTier === 'free') {
  throw new SubscriptionRequiredError('TIGI Pro required for deep valuations')
}
```

---

### 2.6 Auth Layer

**Technology:** NextAuth.js v5 (Auth.js) — handles sessions, providers, and JWT.

**Auth flow:**
```
User clicks "Sign In"
  │
  ├── Email + Password → Credentials provider → Prisma user lookup → bcrypt verify
  ├── Google OAuth → Google provider → Prisma upsert user
  └── (Future) Wallet sign-in → SIWS (Sign In With Solana) → Prisma upsert user
  │
  ├── Session created (JWT or database session)
  ├── Session enriched with: userId, role, kycStatus, subscriptionTier
  └── Session available in all RSC via auth() and in client via useSession()
```

**RBAC middleware:**
```typescript
// src/lib/auth/rbac.ts
export function requireRole(allowedRoles: Role[]) {
  return async (req: Request) => {
    const session = await auth()
    if (!session?.user) throw new UnauthenticatedError()
    if (!allowedRoles.includes(session.user.role)) throw new ForbiddenError()
    return session
  }
}

// Usage in route handler:
export async function POST(req: Request) {
  const session = await requireRole(['OWNER', 'ADMIN'])(req)
  // ... handler logic
}
```

---

### 2.7 File Storage Layer

**Technology:** AWS S3 or Cloudflare R2 — for property images, documents, and generated reports.

**Bucket structure:**
```
tigi-storage/
├── properties/{propertyId}/
│   ├── images/           # Property photos (WebP, optimized)
│   │   ├── hero.webp
│   │   ├── gallery-1.webp
│   │   └── ...
│   └── documents/        # PDFs: title, deed, contract, inspection
│       ├── title-deed.pdf
│       └── ...
├── users/{userId}/
│   ├── avatar.webp
│   └── kyc/              # KYC documents (restricted access)
│       ├── id-front.jpg
│       └── ...
├── tokens/{tokenId}/
│   └── metadata.json     # Off-chain token metadata
└── reports/
    └── valuations/{propertyId}/
        └── report-{date}.pdf
```

**Upload flow:**
```
Client → Pre-signed URL request (API) → Upload directly to S3 → API records URL in DB
```

---

### 2.8 Admin Layer

**Separation:** Admin routes are in a separate route group `(admin)/` with their own layout. Admin API routes are under `/api/admin/` with `requireRole(['ADMIN'])` middleware.

**Admin capabilities by milestone:**

| Milestone | Admin Features |
|---|---|
| **M2 (MVP)** | User list, role assignment, suspend/unsuspend, basic dashboard (counts) |
| **M3** | Listing review queue (approve/reject), content moderation |
| **M4** | Token minting trigger, token freeze/burn |
| **M5** | Transaction oversight, escrow intervention (release/refund) |
| **M7** | KYC review queue, compliance dashboard, audit log viewer |
| **M12** | Full command center: KPIs, charts, system health, all management functions |

---

### 2.9 Analytics Layer

**Implementation strategy:** Start simple, evolve to dedicated analytics.

| Phase | Approach | Metrics |
|---|---|---|
| **MVP** | Database queries + server-side aggregation | User count, listing count, transaction count, basic charts |
| **M6** | Redis-cached aggregations + AI-generated insights | Market trends, yield analysis, heat map data |
| **M12** | Dedicated analytics service + Vercel Analytics | Full KPI dashboard, funnel analysis, cohort tracking |
| **Post-MVP** | Third-party analytics (Mixpanel/Amplitude) or self-hosted (Plausible) | User behavior, conversion funnels, retention curves |

---

## 3. Data Flow Architecture

### 3.1 Read Flow (User views property detail page)

```
Browser Request → Next.js (SSR/RSC)
  │
  ├── Server Component fetches from Prisma:
  │   ├── Property data (details, images, documents)
  │   ├── Token data (supply, price per fraction, % sold)
  │   ├── AI Valuation (cached, if exists)
  │   └── Owner info (public profile)
  │
  ├── If token data exists → Also fetch from Solana RPC:
  │   ├── Current on-chain token supply (verify against DB)
  │   └── Holder count (optional, for transparency display)
  │
  └── Rendered HTML streamed to browser
      └── Client components hydrate for:
          ├── Image carousel interactivity
          ├── Investment modal
          └── Wallet connection (if user clicks "Invest")
```

### 3.2 Write Flow (User invests in a property)

```
User clicks "Confirm Investment" → Client Component
  │
  ├── POST /api/transactions/invest
  │   ├── Auth middleware → verify session
  │   ├── Zod validation → { propertyId, tokenId, quantity }
  │   ├── Business logic:
  │   │   ├── Check KYC status → must be VERIFIED
  │   │   ├── Check token availability → quantity <= availableSupply
  │   │   ├── Check subscription tier → if premium AI features involved
  │   │   ├── Calculate total cost + platform fee
  │   │   │
  │   │   ├── DATABASE WRITE (Prisma transaction):
  │   │   │   ├── Create Transaction record (status: INITIATED)
  │   │   │   ├── Create Escrow record (status: CREATED)
  │   │   │   ├── Decrement Token.availableSupply
  │   │   │   └── Write AuditLog
  │   │   │
  │   │   ├── SOLANA OPERATIONS:
  │   │   │   ├── [Custodial user] Server signs → transfer SOL/USDC to escrow PDA
  │   │   │   ├── [External wallet] Return transaction for client signing
  │   │   │   └── Confirm transaction on-chain
  │   │   │
  │   │   ├── POST-CONFIRMATION:
  │   │   │   ├── Update Transaction status → COMPLETED
  │   │   │   ├── Update Escrow status → RELEASED
  │   │   │   ├── Create/update TokenHolding (user now holds fractions)
  │   │   │   ├── Write AuditLog (completion)
  │   │   │   └── Send email notification
  │   │   │
  │   │   └── ERROR HANDLING:
  │   │       ├── Solana tx fails → Transaction status: FAILED → rollback supply
  │   │       ├── Retry logic (3 attempts, exponential backoff)
  │   │       └── If all retries fail → alert admin, notify user
  │   │
  │   └── Return: { success: true, transactionId, status }
  │
  └── Client updates UI → success modal → redirect to portfolio
```

### 3.3 AI Flow (Property valuation request)

```
User clicks "Generate Valuation" → Client Component
  │
  ├── POST /api/ai/valuation
  │   ├── Auth middleware
  │   ├── Subscription gate → check if user has required tier
  │   ├── Rate limit check → user hasn't exceeded daily AI quota
  │   │
  │   ├── Cache check (Redis):
  │   │   ├── Key: hash(propertyId + modelVersion + tier)
  │   │   ├── [HIT] → return cached result immediately
  │   │   └── [MISS] → proceed to AI execution
  │   │
  │   ├── AI Execution:
  │   │   ├── Fetch property data from DB
  │   │   ├── Fetch comparable sales (DB + external data)
  │   │   ├── Run structured scoring model → quantitative score
  │   │   ├── Run LLM analysis → qualitative assessment
  │   │   ├── Combine: structured (60%) + LLM (40%) → final estimate
  │   │   └── Build result: { value, confidence, comps, factors, report }
  │   │
  │   ├── Cache write (Redis, TTL: 24 hours)
  │   ├── DB write (AiValuation table for historical tracking)
  │   │
  │   └── Return: { success: true, valuation: AiValuationResult }
  │
  └── Client renders valuation card with confidence meter, comps, and factor breakdown
```

### 3.4 Admin Flow (Compliance review)

```
Compliance Officer opens /admin/compliance
  │
  ├── Server Component fetches:
  │   ├── Pending KYC reviews (KycVerification where status = SUBMITTED)
  │   ├── Pending listing approvals (Property where status = UNDER_REVIEW)
  │   ├── Flagged transactions (Transaction where flagged = true)
  │   └── Fraud alerts (from AI fraud detection system)
  │
  ├── Officer clicks "Review" on a KYC submission
  │   ├── Detail view: user info, uploaded documents, AI risk score
  │   ├── Officer clicks "Approve" or "Reject"
  │   │
  │   ├── POST /api/admin/kyc/review
  │   │   ├── requireRole(['COMPLIANCE_OFFICER', 'ADMIN'])
  │   │   ├── Update KycVerification status
  │   │   ├── Update User.kycStatus
  │   │   ├── Write AuditLog (who reviewed, decision, reason)
  │   │   └── Send email notification to user
  │   │
  │   └── Queue updates in real-time (or on next page refresh)
```

---

## 4. On-Chain vs. Off-Chain Data Separation

### 4.1 The Two Sources of Truth

TIGI operates with a deliberate **dual source of truth** model:

| Concern | Source of Truth | Stored Where |
|---|---|---|
| **Who owns what (tokens)** | Solana blockchain | SPL token accounts |
| **Everything else** | PostgreSQL database | Prisma-managed tables |

This means:
- **The UI reads from the database** for all rendering — it's fast, queryable, and relational
- **The blockchain is the verifiable ownership record** — it's immutable, transparent, and trustless
- **The database mirrors blockchain state** — after every on-chain operation, the DB is updated to match

### 4.2 Data Classification

| Data | Location | Reason |
|---|---|---|
| Property title, description, specs | **DB only** | Rich text, frequently updated, must be searchable |
| Property images | **S3 + DB reference** | Large binary files, CDN-optimal |
| Legal documents (PDFs) | **S3 + DB reference** | Large files, access-controlled |
| User profiles, PII | **DB only (encrypted)** | Privacy regulations, mutability required |
| KYC submission data | **DB only (encrypted)** | Regulatory requirement, must be deletable (GDPR) |
| AI valuations | **DB only** | Frequent re-computation, complex queries |
| Token mint address | **DB + on-chain** | DB for fast lookup, chain for verification |
| Token ownership (who holds how many) | **Chain (authoritative) + DB (mirror)** | Chain is truth; DB is for fast UI queries |
| Token transfer history | **Chain (authoritative) + DB (mirror)** | Chain is immutable log; DB for searchable history |
| Escrow state | **Chain (authoritative) + DB (mirror)** | Chain enforces conditions; DB tracks for UI |
| Transaction workflow status | **DB (primary) + chain (settlement)** | DB manages multi-step workflow; chain records final settlement |
| Audit logs | **DB only** | Application-level actions; append-only table |
| Token metadata JSON | **S3 (hosted) + chain (URI reference)** | Chain stores URI pointing to off-chain JSON |

### 4.3 Reconciliation

A periodic background job ensures DB and chain stay in sync:

```typescript
// src/lib/solana/reconciliation.ts
// Runs every 15 minutes (cron job or Vercel cron)
export async function reconcileTokenHoldings() {
  // 1. Get all active tokens from DB
  const tokens = await prisma.token.findMany({ where: { status: 'ACTIVE' } })

  for (const token of tokens) {
    // 2. Fetch on-chain supply and holder balances
    const onChainSupply = await getTokenSupply(token.mintAddress)
    const onChainHolders = await getTokenHolders(token.mintAddress)

    // 3. Compare with DB records
    // 4. Log discrepancies (never auto-fix — alert admin)
    if (onChainSupply !== token.totalSupply) {
      await logDiscrepancy('supply_mismatch', token.id, { onChainSupply, dbSupply: token.totalSupply })
    }

    // 5. Update DB mirror for holder balances if chain is ahead
    // (This handles cases where transfers happened outside TIGI)
  }
}
```

---

## 5. Legal Ownership vs. Blockchain Representation — Decoupling Strategy

### 5.1 The Fundamental Principle

> **TIGI tokens represent an economic interest in a property, not direct legal title. In the MVP, legal ownership transfer remains a traditional off-chain process. The blockchain records the tokenized representation — the legal system records the actual ownership.**

This is not a limitation — it's a deliberate architecture decision that:
- Keeps TIGI on the right side of property law in every jurisdiction
- Avoids the unsolved legal problem of "is a token a deed?"
- Allows TIGI to operate before regulatory frameworks catch up
- Protects users by grounding ownership in established legal systems

### 5.2 How It Works in Practice

```
LEGAL LAYER (Off-Chain)                    BLOCKCHAIN LAYER (On-Chain)
─────────────────────────                  ─────────────────────────────
Property deed/title                        SPL Token (mint per property)
  ↕ Filed with county recorder               ↕ Represents economic interest
  ↕ Transferred via legal agreement           ↕ Transferable between wallets
  ↕ Governed by property law                  ↕ Governed by smart contract

SPV (Special Purpose Vehicle)              Token fraction = share of SPV
  ↕ Holds legal title to property             ↕ On-chain proof of share ownership
  ↕ LLC or trust structure                    ↕ Immutable transfer history
```

### 5.3 Implementation Approach

| Aspect | MVP Implementation | Production Evolution |
|---|---|---|
| **Legal entity** | Each tokenized property's offering documents reference that tokens represent membership interests in a property-specific LLC/SPV | Automated SPV creation per property |
| **Offering documents** | PDF upload (PPM template) attached to property listing | Auto-generated offering docs with legal review |
| **Token ↔ legal linkage** | Token metadata URI contains property ID and offering doc reference | On-chain attestation linking token mint to legal entity registry |
| **Transfer restrictions** | UI-enforced: only KYC'd users can receive tokens | Smart contract-enforced whitelist: only approved wallets can receive |
| **Dispute resolution** | Platform arbiter authority on escrow; off-chain legal process for title disputes | Arbitration integration; insurance-backed resolution |

### 5.4 What TIGI Does NOT Claim

The platform must clearly communicate:
1. Tokens are **not deeds** — they represent economic interest as defined in offering documents
2. Token transfers do **not** constitute legal title transfer
3. AI valuations are **not** licensed appraisals
4. Smart contract escrow is a **settlement mechanism**, not a legal escrow (unless in partnership with a licensed escrow agent)
5. TIGI is a **platform/marketplace**, not a broker-dealer or real estate brokerage (MVP)

---

## 6. Scalability Considerations

### 6.1 Current Architecture Scaling Profile

| Component | MVP Capacity | Bottleneck Point | Scaling Path |
|---|---|---|---|
| **Next.js (Vercel)** | Auto-scales (serverless) | Cold starts on complex pages | Edge functions, ISR for static pages |
| **PostgreSQL** | ~10K concurrent connections | Complex queries on large datasets | Read replicas, connection pooling (PgBouncer), query optimization |
| **Redis** | ~100K ops/sec | Memory limits | Redis Cluster or Upstash auto-scaling |
| **Solana RPC** | ~1K req/sec (Helius free) | Rate limiting | Paid RPC tier, multiple provider failover |
| **S3/R2** | Virtually unlimited | None for storage | CDN (CloudFront/Cloudflare) for delivery |
| **AI APIs** | Rate-limited by provider | Token limits, costs | Caching, batching, model optimization |

### 6.2 Scaling Milestones

**100 users** (MVP Demo)
- Single PostgreSQL instance, no cache needed
- Solana Devnet, free RPC tier
- Direct S3 uploads

**10,000 users** (Post-Launch)
- Add Redis for sessions, rate limiting, AI caching
- Connection pooling for Prisma
- CDN for images
- Paid RPC provider

**100,000 users** (Growth)
- PostgreSQL read replicas for marketplace queries
- Dedicated search (Typesense/Meilisearch) for full-text property search
- Background job queue (BullMQ or Inngest) for async operations
- Multiple RPC providers with failover

**1,000,000+ users** (Enterprise)
- Microservice decomposition (Property Service, Transaction Service, AI Service)
- Event bus (Redis Streams or Kafka) for async communication
- Dedicated analytics database (ClickHouse or TimescaleDB)
- Multi-region deployment

### 6.3 Database Scaling Strategy

```
MVP:                          Growth:                       Enterprise:
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│PostgreSQL│                  │PostgreSQL│──Read Replica ──▶│Typesense │
│ (single) │                  │ (primary)│                  │ (search) │
└──────────┘                  └──────────┘                  └──────────┘
                                   │                             │
                              ┌────┴────┐                  ┌────┴────┐
                              │  Redis  │                  │ClickHouse│
                              │ (cache) │                  │(analytics)│
                              └─────────┘                  └──────────┘
```

---

## 7. Security Architecture

### 7.1 Authentication Security

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt with cost factor 12 |
| Session tokens | HTTP-only, Secure, SameSite=Lax cookies |
| CSRF protection | Double-submit cookie pattern (built into Auth.js) |
| OAuth | Server-side code exchange (no implicit grant) |
| 2FA (M11) | TOTP via authenticator app; SMS fallback |
| Brute force protection | Rate limit: 5 failed attempts → 15-minute lockout |

### 7.2 API Security

| Measure | Implementation |
|---|---|
| Input validation | Zod schemas on every endpoint; reject unknown fields |
| SQL injection | Prisma parameterized queries (built-in) |
| XSS prevention | React's built-in escaping; CSP headers |
| Rate limiting | Redis sliding window: 100 req/min authenticated, 20 req/min anonymous |
| CORS | Restrict to TIGI domains only |
| HTTPS | Enforced everywhere (Vercel default) |

### 7.3 Data Security

| Data Type | Protection |
|---|---|
| PII (email, name, address) | Encrypted in transit (TLS 1.3); database-level encryption at rest |
| Sensitive PII (SSN, tax ID) | Application-level AES-256 encryption before DB write; separate table with restricted access |
| KYC documents | S3 bucket with no public access; pre-signed URLs with 5-minute expiry; server-side encryption |
| Wallet private keys (custodial) | AES-256-GCM encryption; per-user salt + master secret derivation; HSM for production |
| Audit logs | Append-only table; no UPDATE/DELETE permissions; separate DB role for writes |

### 7.4 Blockchain Security

| Measure | Implementation |
|---|---|
| Smart contract audits | Third-party audit (OtterSec/Neodyme) before mainnet deployment |
| Program upgrade authority | Multi-sig (2-of-3) for upgrades; eventual freeze for immutability |
| Transaction verification | All transactions simulated (preflight) before submission |
| Custodial key management | Encrypted at rest; rotation capability; HSM for production |
| Escrow arbiter | Platform-controlled multi-sig; cannot drain — only release to buyer or refund to seller |

### 7.5 Monitoring & Incident Response

| Monitor | Tool | Alert |
|---|---|---|
| Application errors | Sentry | Immediate: error spike > 5x baseline |
| API latency | Vercel Analytics | Warn: p95 > 1s; Critical: p95 > 3s |
| Failed auth attempts | Custom logging + Redis | Alert: > 10 failures from single IP in 5 min |
| Solana RPC failures | Custom health check | Alert: > 3 consecutive failures |
| Database connection issues | Prisma metrics | Alert: connection pool > 80% utilized |
| Unauthorized access attempts | Audit log analysis | Alert: RBAC violation patterns |

---

## 8. Mock-First vs. Production-Ready Strategy

### 8.1 What Is Mocked in MVP

| Component | Mock Implementation | Goes Production | Production Target |
|---|---|---|---|
| **KYC/AML** | Auto-approve all submissions; mock verification UI with simulated review flow | M7 | Third-party provider (Sumsub/Onfido) |
| **Solana network** | Devnet (real blockchain, fake tokens with no value) | Pre-mainnet audit | Mainnet-Beta |
| **AI valuation** | Deterministic scoring model + hardcoded confidence; no LLM calls | M6 | OpenAI/Anthropic + structured model ensemble |
| **AI recommendations** | Sort properties by match to user preferences (no ML) | M6 | ML-scored ranking with portfolio optimization |
| **Legal document AI** | "Feature coming soon" placeholder | M7 | LLM-based summarization + structured extraction |
| **Fraud detection** | Rule-based flags (price < 50% of area median → flag) | M7 | ML anomaly model + rule engine |
| **Email notifications** | Console.log in dev; Resend in staging | M5 | Resend with templates, delivery tracking |
| **Maps integration** | Static placeholder map image or embedded free map | M3 | Google Maps / Mapbox with dynamic markers |
| **Insurance marketplace** | Static placeholder cards | M11 | Insurance API integrations |
| **Payment processing (fiat)** | Not available — crypto-only | Post-MVP | Stripe / fiat on-ramp partner |
| **Property images** | AI-generated images (generate_image tool) | Ongoing | Real property photos from owners |
| **Comparable sales data** | Seeded mock comps in database | M6 | Zillow API / public records integration |

### 8.2 What Is Production-Ready from Day One

| Component | Why Production-Ready Immediately |
|---|---|
| **Auth (NextAuth)** | Security cannot be mocked; real session management, password hashing, OAuth flows |
| **Database (PostgreSQL + Prisma)** | Schema must handle real data patterns from the start; migrations must be reliable |
| **RBAC middleware** | Permission enforcement must work correctly to prevent unauthorized access |
| **Audit logging** | Compliance requires immutable logs from the very first action |
| **Input validation (Zod)** | Data integrity cannot be deferred |
| **File storage (S3/R2)** | Real uploads from listing creation flow; pre-signed URL security |
| **Design system** | The TIGI look and feel must be premium from M1 — not "we'll fix the UI later" |
| **Error handling** | Structured error responses, graceful degradation, user-friendly error states |
| **Environment config** | `.env` management, secret handling, environment-specific overrides |

### 8.3 Mock → Production Transition Pattern

Every mocked service follows this interface pattern to make transition seamless:

```typescript
// Interface (never changes)
interface IKycService {
  submitVerification(userId: string, data: KycSubmissionData): Promise<KycResult>
  checkStatus(userId: string): Promise<KycStatus>
}

// Mock implementation (MVP)
class MockKycService implements IKycService {
  async submitVerification(userId: string, data: KycSubmissionData): Promise<KycResult> {
    // Auto-approve after 2 second simulated delay
    await delay(2000)
    return { status: 'APPROVED', provider: 'mock' }
  }
}

// Production implementation (M7)
class SumsubKycService implements IKycService {
  async submitVerification(userId: string, data: KycSubmissionData): Promise<KycResult> {
    // Real API call to Sumsub
    const result = await this.client.createApplicant(data)
    return { status: mapStatus(result.status), provider: 'sumsub', refId: result.id }
  }
}

// Factory selects based on environment
function getKycService(): IKycService {
  return process.env.KYC_PROVIDER === 'sumsub'
    ? new SumsubKycService()
    : new MockKycService()
}
```

---

## 9. Deployment Architecture

### 9.1 MVP Deployment

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│     Vercel       │     │     Railway       │     │    AWS S3 /     │
│                  │     │                   │     │   Cloudflare R2  │
│  Next.js App     │────▶│  PostgreSQL       │     │                 │
│  SSR + API       │     │  + Redis          │     │  Images, Docs   │
│  Edge Functions  │     │                   │     │  Token Metadata  │
└────────┬─────────┘     └──────────────────┘     └─────────────────┘
         │
    ┌────┴─────────────┐
    │                  │
┌───▼──────────┐  ┌────▼─────────┐
│   Solana      │  │   AI APIs    │
│   Devnet      │  │   OpenAI /   │
│   (Helius)    │  │   Anthropic  │
└──────────────┘  └──────────────┘
```

### 9.2 Environment Strategy

| Environment | Hosting | Database | Blockchain | AI | Purpose |
|---|---|---|---|---|---|
| **local** | `npm run dev` | Docker PostgreSQL | Solana Devnet | Mock service | Developer workstation |
| **preview** | Vercel preview deploy | Railway (shared) | Solana Devnet | Mock service | PR review |
| **staging** | Vercel (staging domain) | Railway (staging) | Solana Devnet | Real AI (limited) | Integration testing, demos |
| **production** | Vercel (production) | Railway (production) | Solana Mainnet | Real AI | Live users |

### 9.3 Environment Variables

```bash
# .env.example — Template for all environments
# Auth
AUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://..."

# Solana
SOLANA_RPC_URL="https://..."
SOLANA_NETWORK="devnet"  # devnet | mainnet-beta
PLATFORM_WALLET_SECRET="..."  # Encrypted treasury wallet

# AI
AI_PROVIDER="mock"  # mock | openai | anthropic
OPENAI_API_KEY="..."
ANTHROPIC_API_KEY="..."

# Storage
S3_BUCKET="..."
S3_REGION="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# Email
RESEND_API_KEY="..."

# KYC
KYC_PROVIDER="mock"  # mock | sumsub | onfido
SUMSUB_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="https://..."
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
```

---

## 10. Directory Structure (Final)

```
tigi/
├── docs/                              # Documentation (this directory)
├── programs/                          # Solana/Anchor smart contracts
│   └── escrow/
│       ├── src/lib.rs
│       └── Anchor.toml
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                        # Demo data seeding
├── src/
│   ├── app/                           # Next.js App Router (see §2.1)
│   ├── components/
│   │   ├── ui/                        # shadcn/ui + custom atoms
│   │   ├── layout/                    # Sidebar, TopNav, AppShell
│   │   ├── marketplace/               # Property cards, filters, search
│   │   ├── portfolio/                 # Holdings, charts, performance
│   │   ├── transactions/              # Step tracker, timeline
│   │   ├── forms/                     # Multi-step forms, inputs
│   │   └── charts/                    # Dark-themed chart components
│   ├── lib/
│   │   ├── services/                  # Business logic service modules
│   │   │   ├── property.service.ts
│   │   │   ├── token.service.ts
│   │   │   ├── transaction.service.ts
│   │   │   ├── user.service.ts
│   │   │   └── compliance.service.ts
│   │   ├── solana/                    # Solana integration (see §2.4)
│   │   ├── ai/                        # AI services (see §2.5)
│   │   ├── auth/                      # Auth config + RBAC helpers
│   │   ├── storage/                   # S3/R2 upload/download helpers
│   │   ├── email/                     # Email templates + send functions
│   │   ├── validators/                # Zod schemas (shared with API + forms)
│   │   ├── db.ts                      # Prisma client singleton
│   │   ├── utils.ts                   # General utilities
│   │   └── constants.ts              # App-wide constants
│   ├── hooks/                         # Custom React hooks
│   ├── types/                         # Global TypeScript types
│   └── middleware.ts                  # Next.js middleware (auth, RBAC, rate limit)
├── tests/
│   ├── unit/                          # Service and utility tests
│   ├── integration/                   # API route tests
│   └── e2e/                           # Playwright browser tests
├── public/
│   ├── images/                        # Static images, generated assets
│   └── icons/                         # Favicons, app icons
├── .env.example
├── .env.local                         # Local dev (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

*Document generated: March 7, 2026*  
*Platform: TIGI — Tokenized Intelligent Global Infrastructure*
