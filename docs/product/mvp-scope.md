# TIGI — MVP Scope Definition

> **Version:** 2.0  
> **Status:** Active  
> **Last updated:** March 7, 2026

---

## 1. MVP Philosophy

The TIGI MVP ships a **complete vertical slice** of the platform — not a half-built version of everything, but a fully functional, visually premium, demo-ready experience across the core workflows. Every screen that ships must feel finished. Every feature that ships must work end-to-end.

**Three rules govern MVP scope decisions:**

1. **If it ships, it's polished.** No "coming soon" placeholders on live pages. If a feature isn't ready, the UI doesn't hint at it.
2. **Mocked ≠ missing.** Several backend integrations (KYC, AI, maps) are mocked with functional UIs and simulated responses. Users experience the workflow; the real provider plugs in later.
3. **Deferred = documented.** Everything cut from MVP has a specific phase assignment and reason.

---

## 2. What Is in the MVP — Production-Ready

These features ship fully functional, tested, and polished.

### 2.1 Auth & Onboarding

| Feature | Spec |
|---|---|
| **Email + password registration** | Bcrypt hashing, email validation, secure session |
| **Google OAuth login** | One-click sign-in via NextAuth Google provider |
| **Email verification** | Verification link sent on registration; required before transacting |
| **Role selection** | Onboarding step: Investor / Property Owner / Both — stored in user record, drives RBAC |
| **Profile setup** | Name, avatar upload (S3), phone (optional), location (optional) |
| **User settings page** | Edit profile, change password, manage connected accounts |
| **Session management** | JWT-based sessions, secure HTTP-only cookies, auto-refresh |
| **Logout** | Server-side session invalidation |

**What does NOT ship in auth MVP:**
- 2FA (deferred to Phase 3 — M11)
- Sign In With Solana / wallet-based auth (deferred to Phase 2)
- Magic link / passwordless login (deferred)

---

### 2.2 Wallet Connection

| Feature | Spec |
|---|---|
| **Solana wallet adapter** | Phantom, Solflare, Backpack — modal with TIGI dark styling |
| **Custodial wallet (default)** | Server-managed keypair created at registration; encrypted AES-256-GCM at rest |
| **Wallet display in settings** | Shows connected wallet address (truncated) or "TIGI Managed Wallet" |
| **Wallet switching** | Users can connect external wallet or revert to custodial |
| **No wallet required to browse** | Marketplace and property pages are fully accessible without wallet |

**UX principle:** First-time users never see a wallet prompt. Custodial wallet is created silently. Wallet connection is under Settings > Wallet for advanced users.

---

### 2.3 Marketplace

| Feature | Spec |
|---|---|
| **Browse page** | Grid view (3-col desktop, 2-col tablet, 1-col mobile) + list view toggle |
| **Property cards** | Hero image, title, price, location, type badge, token status indicator, stat preview (sqft, beds, baths) |
| **Search** | Full-text search across title, description, location — autocomplete suggestions |
| **Filters** | Type (residential, commercial, land, industrial, mixed), price range (slider), location (state/city dropdown), status (active, sold, leased), tokenized-only toggle |
| **Sort** | Newest, price low-high, price high-low, most popular |
| **Pagination** | Cursor-based, 12 items per page |
| **Empty states** | "No properties match your filters" with clear CTA to reset |
| **Seed data** | 20+ properties with AI-generated images, realistic descriptions, varied types and locations |

---

### 2.4 Property Listing & Detail Pages

| Feature | Spec |
|---|---|
| **Property detail page** | Full-width hero image carousel (click to expand), specs section, description, token info panel, documents tab, similar properties |
| **Image carousel** | Swipeable, full-screen lightbox, lazy-loaded WebP images |
| **Token info panel** | Total supply, available fractions, price per fraction, % sold progress bar, investor count |
| **Documents tab** | List of uploaded docs (title, deed, etc.) with download buttons; verified badge if reviewed |
| **Similar properties** | 3 cards at bottom based on type + location match (simple query, not AI) |
| **Listing creation (Owner)** | Multi-step form: Basic Info → Property Details → Media Upload → Tokenization Options → Review & Submit |
| **Image upload** | Drag-and-drop, reorder, set primary, max 20 images, auto-resize to WebP |
| **Document upload** | PDF/image upload, categorize by type (title, deed, inspection, appraisal, contract, other) |
| **Listing status workflow** | Draft → Under Review → Active → Sold/Leased/Delisted |
| **Owner dashboard** | Grid of own listings with status badges, views count, and quick-action buttons (edit, pause, delist) |

---

### 2.5 Fractional Investment

| Feature | Spec |
|---|---|
| **Investment modal** | Select fraction quantity (slider + input), shows total cost + platform fee (2%), terms checkbox |
| **Custodial flow** | One-click confirm → server-side Solana transaction → success screen |
| **External wallet flow** | "Confirm in wallet" → Phantom/Solflare popup → sign → confirm → success screen |
| **Transaction confirmation** | Success modal with transaction summary, portfolio link CTA, email confirmation |
| **Portfolio page** | Holdings grid: property card per holding, fractions owned, current value, ROI %, cost basis |
| **Portfolio summary bar** | Total portfolio value, total invested, overall ROI, number of holdings |
| **Holding detail** | Click a holding → purchase history, value chart placeholder, property link, transfer/sell actions (disabled in MVP, labeled "Coming Phase 2") |

**On Solana Devnet:** All token operations are real blockchain transactions on Devnet — real SPL tokens, real wallets, real signatures — but with no real monetary value.

---

### 2.6 Transaction Workflow

| Feature | Spec |
|---|---|
| **Purchase offer** | "Make Offer" button on property detail → offer form (price, conditions, notes) |
| **Offer management (Owner)** | Notification → view offer → accept / reject / counter |
| **Escrow creation** | On acceptance: Anchor escrow program creates PDA, buyer funds escrow |
| **Step tracker UI** | Visual pipeline: Offer Accepted → Escrow Funded → Inspection → Legal Review → Settlement → Token Transfer |
| **Condition completion** | Admin/compliance marks steps complete as conditions are met |
| **Settlement** | Escrow releases: funds to seller, tokens to buyer |
| **Transaction history** | List view: all transactions with status badge, type, amount, date, counterparty |
| **Transaction detail** | Full step tracker + parties + amounts + on-chain signature link |
| **Email notifications** | State change emails to all involved parties (buyer, seller) |

---

### 2.7 Dashboards

| Feature | Spec |
|---|---|
| **Investor dashboard** | Portfolio summary, recent transactions, watchlist, market snapshot |
| **Owner dashboard** | Listings overview, investment progress per tokenized property, recent inquiries |
| **Admin dashboard** | User count, listing count, transaction count, pending reviews, recent activity feed |
| **Compliance dashboard** | Pending KYC queue, pending listing reviews, flagged transactions |

Each dashboard is the default landing page for its role. First-time users see a guided welcome state with setup CTAs.

---

### 2.8 Admin & Compliance

| Feature | Spec |
|---|---|
| **User management** | User list with search/filter, role column, KYC status, actions: view detail, change role, suspend |
| **Listing review queue** | Properties in Under Review status → view listing + docs → approve / reject with reason |
| **Token minting trigger** | Admin-only action: for approved properties → trigger SPL token creation on Solana |
| **Transaction oversight** | All transactions list → view detail → flag / escalate |
| **Escrow intervention** | Admin can trigger release or refund via arbiter authority |
| **Audit log viewer** | Searchable, filterable log of all compliance-relevant actions |

---

### 2.9 Inheritance Setup v1

| Feature | Spec |
|---|---|
| **Estate plan page** | `/inheritance` — dashboard showing all owned tokens eligible for designation |
| **Beneficiary designation form** | Per token holding: beneficiary email, share percentage, trigger type (manual / date / inactivity) |
| **Multiple beneficiaries** | Split a holding among 2+ beneficiaries (percentages must sum to 100%) |
| **Estate plan overview** | Grid of all designations: token, beneficiary, trigger, status |
| **Edit / revoke** | Modify or remove any designation |
| **Beneficiary notification** | Email sent to beneficiary informing them of the designation |
| **Advisory notice** | Persistent banner: "Digital estate planning is advisory. We recommend consulting a legal professional." |

**What does NOT ship in v1:**
- Automated trigger execution (no system actually transfers tokens on inactivity/date — it records the plan)
- Legal document verification hooks (placeholder — "Upload verification documents" section with "Coming soon")
- Smart contract conditional transfer (the designation is stored in PostgreSQL, not on-chain)

**Why it's in MVP:** Inheritance is a unique differentiator. Showing the setup UI + stored plans demonstrates the concept for demos and early users, even though automated triggers are Phase 2.

---

### 2.10 Land Leasing v1

| Feature | Spec |
|---|---|
| **Lease listing creation** | Owner flow: select owned property/land → "List for Lease" → form: type (commercial, agricultural, development), duration, monthly rent, deposit, permitted use, terms |
| **Lease listings in marketplace** | Lease-type listings appear in marketplace with "For Lease" badge; filterable via type filter |
| **Lease detail page** | Property info + lease terms + "Apply for Lease" CTA |
| **Lease application** | Applicant form: intended use, company info (if commercial), financial references, proposed modifications |
| **Application review (Owner)** | Owner sees applications → accept / reject |
| **Active lease record** | After acceptance: lease record created with status ACTIVE, visible in owner and tenant dashboards |
| **Lease dashboard** | Owner: active/pending leases. Tenant: active leases with terms and payment schedule display |

**What does NOT ship in v1:**
- Smart contract payment schedules (payments are tracked manually, not enforced on-chain)
- Automated rent collection
- Permit and zoning data integration
- Lease renewal/termination workflows (manual status change by admin)

**Why it's in MVP:** Leasing extends TIGI's utility beyond buy/sell and demonstrates ongoing yield workflows. The v1 UI + database records establish the pattern; smart contract enforcement comes in Phase 2.

---

### 2.11 Premium Visual Experience

Every page must meet this bar — there is no "we'll style it later":

| Aspect | Standard |
|---|---|
| **Dark theme** | `#0A0A0F` root → `#111118` surface → `#1A1A24` cards — no white backgrounds anywhere |
| **Gold accents** | `#C9A84C` for primary CTAs, active states, premium touches — used sparingly, never garish |
| **Typography** | Outfit for headings, Inter for body, JetBrains Mono for data — loaded via Google Fonts |
| **Animation** | `fade-in` on page mount (200ms), `slide-up` on cards (250ms), hover border transitions (150ms), gold glow on primary CTA hover |
| **Loading states** | Shimmer skeleton screens matching card/page layout — never a spinning wheel |
| **Empty states** | Illustrated empty states with explanatory text and action CTA — never a blank page |
| **Error states** | Human-readable error messages with retry action — never a raw error dump |
| **Responsive** | Every page tested at: 375px (mobile), 768px (tablet), 1440px (desktop) |
| **Property images** | AI-generated for all seed data — high-quality, realistic, no gray placeholder boxes |
| **Micro-interactions** | Card hover lift, button press scale (0.98), tooltip fade, sidebar collapse animation |
| **Consistency** | Every card, button, badge, and input uses design tokens from the TIGI design system — zero ad-hoc styles |

---

## 3. What Is Mocked but Functional

These features have **working UIs and simulated responses** — the user experiences the full workflow, but the backend uses a mock provider instead of a real third-party integration.

| Feature | What the User Sees | What Actually Happens | Goes Real In |
|---|---|---|---|
| **KYC verification** | User fills out form, uploads ID photos, sees "Verification submitted" → status changes to "Verified" after 3 seconds | `MockKycService` auto-approves all submissions. No real ID check. UI is production-quality. | Phase 2 (M7) — Sumsub/Onfido |
| **AI property valuation** | Property detail shows "AI Estimated Value: $X" with confidence badge (Low/Med/High) | `MockValuationService` returns deterministic value based on price, sqft, and location formula. No LLM calls. | Phase 2 (M6) — OpenAI/Anthropic ensemble |
| **AI recommendations** | Portfolio page shows "Recommended for You" with 3 property cards | Simple database query sorted by type/location match to user's holdings. No ML model. | Phase 2 (M6) |
| **Map on property detail** | Embedded static map showing property location marker | Free static map image or `<iframe>` of OpenStreetMap. No interactive map SDK. | Phase 2 (M6) — Mapbox/Google Maps |
| **Email notifications** | User receives transaction status emails | Real emails via Resend in staging/production. `console.log` in local dev. Templates are production-quality. | Already real in staging |
| **Comparable sales** | Valuation section shows 3 comparison properties | Seeded comp data in database — not fetched from external API. | Phase 2 (M6) — Zillow/public records |
| **TIGI Pro subscription** | Pricing page exists; "Upgrade" buttons visible on premium features | No payment processing. Clicking upgrade shows "Coming soon — join waitlist" modal. Subscription state is admin-toggleable in DB. | Phase 2 — Stripe |

### Mock Implementation Contract
Every mock service implements the **same interface** as the production service. Transitioning from mock → real is a config change (`KYC_PROVIDER=sumsub` instead of `KYC_PROVIDER=mock`), not a rewrite.

---

## 4. What Is Deferred to Phase 2

Phase 2 covers **Milestones 6–10** — Intelligence, Compliance, and Extended Workflows.

| Feature | Phase 2 Milestone | Why Deferred | Dependency |
|---|---|---|---|
| **Real AI valuation engine** | M6 | Requires LLM integration, scoring model tuning, and comp data pipeline | Marketplace data (M3) |
| **Market intelligence dashboards** | M6 | Requires aggregated transaction data that only exists once marketplace is active | Transaction data (M5) |
| **Investment recommendations (ML)** | M6 | Requires portfolio data and user behavior patterns | Portfolio data (M4) |
| **Property comparison (AI-scored)** | M6 | Requires valuation engine | AI valuation (M6) |
| **Portfolio optimizer** | M6 | Requires ML-scored recommendations and portfolio analysis | M6 AI engine |
| **Predictive market forecast** | M6 | Requires historical data and economic indicator integration | Market data pipeline |
| **Real KYC/AML integration** | M7 | Requires vendor contract (Sumsub/Onfido), compliance legal review | Legal review |
| **Legal document AI summarization** | M7 | Requires LLM integration with legal-domain prompts | AI engine (M6) |
| **Fraud/anomaly detection** | M7 | Requires transaction patterns and ML anomaly model | Transaction data (M5) |
| **Compliance review with AI risk scoring** | M7 | Combines KYC + AI services | M6 + M7 |
| **Inheritance automated triggers** | M8 | Requires smart contract conditional transfer logic | Escrow program maturity (M5) |
| **Inheritance legal verification hooks** | M8 | Requires legal document integration and verification partners | Legal layer (M7) |
| **Lease smart contract enforcement** | M9 | Requires on-chain lease program development | Escrow program (M5) |
| **Lease payment tracking** | M9 | Requires payment integration | Payment gateway |
| **Lease renewal/termination workflows** | M9 | Requires lease smart contract | M9 |
| **Tenant maintenance request system** | M10 | Full lifecycle: submit → assign → track → resolve | Property mgmt module |
| **Property financial reporting** | M10 | Income/expense tracking per property | Tenant + lease data (M9) |
| **Secondary market (token resale)** | Post-M5 | Requires market-making logic and regulatory review | Legal + M4 maturity |
| **Fiat payment processing** | Post-M5 | Requires Stripe integration and money transmitter analysis | Legal review |
| **Sign In With Solana** | Post-M4 | Nice-to-have; email auth sufficient for mainstream users | Wallet adapter (M4) |
| **Interactive maps (Mapbox/Google)** | M6 | Paid integration; static maps sufficient for MVP | — |

---

## 5. What Is Deferred to Phase 3

Phase 3 covers **Milestones 11–13** — Platform Maturity, Admin Command Center, and Enterprise.

| Feature | Phase 3 Milestone | Why Deferred |
|---|---|---|
| **2FA (TOTP + SMS)** | M11 | Security enhancement — email + password + OAuth sufficient for MVP |
| **Anomaly detection (login patterns)** | M11 | Requires user behavior baseline data |
| **Insurance marketplace integrations** | M11 | Requires insurance API partnerships |
| **Security audit log with alerting** | M11 | Requires production traffic patterns for meaningful alerts |
| **Full admin command center** | M12 | KPI charts, funnel analysis, system health — needs months of data to be useful |
| **Content moderation system** | M12 | Image review, report handling — volume-dependent |
| **System health monitoring** | M12 | Error rates, API latency, RPC status — production ops concern |
| **Multi-tenancy** | M13 | Enterprise architecture — not needed until partner demand exists |
| **White-label configuration** | M13 | Configurable branding, domains — enterprise growth feature |
| **API documentation (OpenAPI)** | M13 | External API consumers don't exist yet |
| **Rate limiting + usage metering** | M13 | Enterprise billing concern |
| **Partner onboarding flows** | M13 | Enterprise sales concern |
| **Mobile native app** | Post-launch | Responsive web-first; native when user base justifies it |
| **Multi-language / i18n** | Post-launch | English-only until international expansion |
| **Solana Mainnet deployment** | Post-audit | Requires third-party smart contract audit; devnet is sufficient for MVP+demo |

---

## 6. MVP Feature Matrix — One-Page View

| Feature Area | In MVP (Production) | In MVP (Mocked) | Phase 2 | Phase 3 |
|---|---|---|---|---|
| **Auth** | Email/pass, Google OAuth, RBAC, sessions | — | SIWS | 2FA |
| **Onboarding** | Registration, role selection, profile setup | KYC (auto-approve) | Real KYC | — |
| **Wallet** | Phantom/Solflare adapter, custodial wallet | — | — | — |
| **Marketplace** | Browse, search, filter, sort, cards, grid/list | Maps (static) | Interactive maps, AI-scored comparison | — |
| **Listings** | Create, edit, upload, status workflow, owner dashboard | — | — | — |
| **Property Detail** | Carousel, specs, token panel, docs, similar | AI valuation (formula), comps (seeded) | Real AI valuation, real comps | — |
| **Investment** | Fraction purchase, portfolio, holding detail | — | Secondary market, portfolio optimizer | — |
| **Transactions** | Offer, escrow, step tracker, history, notifications | — | — | — |
| **Inheritance** | Beneficiary designation, estate plan UI, notifications | — | Automated triggers, legal hooks, on-chain transfer | — |
| **Leasing** | Lease listings, applications, active lease records | — | Smart contract enforcement, payment tracking, renewal | — |
| **AI** | — | Basic valuation, simple recommendations | Full AI engine (6 features) | Predictive forecasting |
| **Admin** | User mgmt, listing review, token minting, tx oversight | — | — | Full command center |
| **Compliance** | Audit log, review dashboard | KYC (mock) | Real KYC, fraud detection, AI risk scoring | — |
| **Subscription** | Pricing page, waitlist capture | — | Stripe integration, tier gating | Enterprise billing |
| **Premium UX** | Full design system, animations, skeletons, empty states, generated images | — | — | — |

---

## 7. MVP User Stories

### Investor (7 stories)
1. I can register with email or Google, select "Investor" role, and set up my profile
2. I can browse the marketplace, filter by property type and price, and sort results
3. I can view a property detail page with images, specs, token info, and AI valuation estimate
4. I can connect my Solana wallet or use the default TIGI-managed wallet
5. I can purchase fractional ownership tokens and see them in my portfolio
6. I can track my active transactions step-by-step from offer through settlement
7. I can set up an inheritance plan for my token holdings

### Owner (5 stories)
8. I can create a property listing with images, documents, and tokenization options
9. I can manage my listings from a dashboard (edit, pause, view stats)
10. I can accept or reject purchase offers and see investment progress
11. I can list my land/property for lease and review lease applications
12. I can designate beneficiaries for my token holdings

### Admin / Compliance (4 stories)
13. I can review and approve/reject property listings
14. I can trigger token minting for approved properties
15. I can manage users (view, search, change role, suspend)
16. I can view the audit log and review flagged transactions

---

## 8. MVP Technical Requirements

### Performance
| Metric | Target |
|---|---|
| Landing page load (LCP) | < 2.5s |
| Marketplace page load | < 3s |
| API p95 latency (reads) | < 300ms |
| API p95 latency (writes) | < 800ms |
| Solana transaction confirmation | < 30s |

### Quality
| Metric | Target |
|---|---|
| TypeScript strict mode | Enabled, zero `any` types |
| Build pass | `npm run build` exits 0 |
| Lint pass | `npm run lint` exits 0 |
| Responsive breakpoints tested | 375px, 768px, 1440px |
| Core flows tested | Auth, invest, transact — integration tests pass |

### Infrastructure
| Component | MVP Choice |
|---|---|
| Frontend + API | Vercel |
| Database | Railway PostgreSQL |
| Cache | Upstash Redis |
| File storage | Cloudflare R2 or AWS S3 |
| Blockchain | Solana Devnet (Helius RPC) |
| Email | Resend |
| AI | Mock service (env-switchable) |
| KYC | Mock service (env-switchable) |

---

## 9. MVP Exit Criteria

The MVP is **done** when all of the following are true:

- [ ] All 16 user stories implemented and manually verified
- [ ] `npm run build` passes with zero errors
- [ ] Landing page, marketplace, property detail, portfolio, transaction tracker, inheritance setup, and lease listing all render correctly at 375px, 768px, and 1440px
- [ ] 20+ seeded properties with AI-generated images in the marketplace
- [ ] Investor can complete full investment flow: browse → invest → portfolio updated
- [ ] Owner can complete full listing flow: create → submit → admin approves → active → investor buys
- [ ] Transaction escrow flow works end-to-end on Solana Devnet
- [ ] Inheritance beneficiary designation can be created, viewed, edited, and revoked
- [ ] Lease listing can be created, browsed, applied for, and approved
- [ ] Admin can review listings, mint tokens, manage users, and view audit log
- [ ] Mock KYC completes without error
- [ ] Mock AI valuation displays on property detail page
- [ ] Premium dark aesthetic is consistent across every page (no unstyled elements)
- [ ] Deployable to Vercel with valid staging environment

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Including inheritance + leasing in MVP expands scope** | 1–2 week delay | v1 is UI + database only, no smart contract enforcement — bounded complexity |
| **Solana Devnet instability during demos** | Broken demo | Retry logic + admin manual override + "network status" indicator in UI |
| **20+ seed properties with quality images** | Dev time on content | Generate images in batch via `generate_image`; write seed script with Prisma |
| **Custodial wallet key management** | Security risk if breached | AES-256-GCM encryption; separate DB table; restricted access; HSM placeholder for production |
| **Design system consistency across 15+ pages** | Visual inconsistency | Component library locked in M1; all pages use design tokens; visual QA checklist |
| **Multi-step forms (listing, lease) are complex** | UX bugs, data loss | React Hook Form with draft auto-save; step validation before proceed; back navigation preserves state |

---

*Document generated: March 7, 2026*  
*Platform: TIGI — Tokenized Intelligent Global Infrastructure*
