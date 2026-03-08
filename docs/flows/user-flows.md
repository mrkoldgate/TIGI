# TIGI — User Flows

> **Version:** 2.0  
> **Status:** Active  
> **Last updated:** March 7, 2026

---

## User Types Reference

| User Type | Description | Primary Flows |
|---|---|---|
| **Buyer** | Purchasing a whole property outright | Browse → offer → escrow → settlement |
| **Investor** | Buying fractional ownership tokens | Browse → invest → portfolio |
| **Seller / Property Owner** | Listing property for sale or tokenization | List → review → manage → accept offers |
| **Land Owner** | Listing land for sale, lease, or development | List → lease → manage tenants |
| **Developer** | Leasing land for development projects | Browse leases → apply → manage project |
| **Legal Professional** | Reviewing documents, compliance, title verification | Document review → AI summaries → compliance sign-off |
| **Financial Professional** | Advising on investments, managing client portfolios | Analytics → valuations → portfolio analysis |
| **Admin** | Platform operations, user management, system config | Dashboard → user mgmt → token minting → system health |
| **Compliance Officer** | KYC review, transaction flagging, audit trail oversight | Review queues → approve/reject → audit log |
| **Tenant** | Occupying leased property, submitting maintenance requests | Lease portal → payments → maintenance |

---

## 1. Onboarding Flow

### 1.1 New User Registration

**Applies to:** All users

```
Step 1: ENTRY POINT
├── Landing page → "Get Started" CTA
├── Marketplace → "Sign up to invest" prompt
└── Direct URL → /register

Step 2: REGISTRATION
├── Option A: Email + Password
│   ├── Form: email, full name, password (min 8 chars, 1 uppercase, 1 number)
│   ├── Client-side validation (instant feedback)
│   ├── Server: check email uniqueness
│   ├── Server: hash password (bcrypt, cost 12)
│   ├── Server: create User record (status: UNVERIFIED)
│   └── Server: send verification email via Resend
│
└── Option B: Google OAuth
    ├── Redirect to Google consent screen
    ├── Callback: create/upsert User from Google profile
    ├── Email auto-verified
    └── Skip to Step 4

Step 3: EMAIL VERIFICATION
├── User clicks link in email
├── Server: token validation (expires in 24h)
├── Server: update User.emailVerified = true
└── Redirect to Step 4

Step 4: ROLE SELECTION
├── Screen: "How will you use TIGI?"
├── Options (multi-select allowed):
│   ├── 🏦 "I want to invest in properties" → INVESTOR
│   ├── 🏠 "I want to list or sell property" → OWNER
│   ├── 🔧 "I manage properties for others" → MANAGER
│   └── 💼 "I'm a legal or financial professional" → PROFESSIONAL
├── Selected roles saved to User.roles[]
└── Note: ADMIN and COMPLIANCE_OFFICER are admin-assigned only

Step 5: PROFILE COMPLETION
├── Avatar upload (optional, S3 upload via presigned URL)
├── Phone number (optional)
├── Location / country (optional, used for jurisdiction filtering)
└── "Complete Setup" → redirect to role-appropriate dashboard

Step 6: KYC PROMPT (conditional)
├── If user selected INVESTOR or OWNER:
│   ├── Banner: "Complete identity verification to start investing"
│   ├── CTA: "Verify Now" → KYC flow (mock in MVP)
│   └── Can be dismissed; re-appears before first transaction
└── If MANAGER or PROFESSIONAL: no KYC required initially

Step 7: WELCOME STATE
├── First-time dashboard with guided setup cards:
│   ├── [Investor] "Explore the marketplace" / "Connect your wallet"
│   ├── [Owner] "List your first property" / "Complete verification"
│   ├── [Manager] "You'll be assigned properties by owners"
│   └── [Professional] "Access analytics and document tools"
└── Setup cards dismiss as user completes each action
```

**API calls:** `POST /api/auth/register`, `POST /api/auth/verify-email`, `PUT /api/users/profile`, `POST /api/users/roles`

**DB writes:** `User`, `Account` (if OAuth), `AuditLog` (registration event)

---

### 1.2 Returning User Login

**Applies to:** All users

```
Step 1: /login page
├── Email + password form
├── "Sign in with Google" button
└── "Forgot password?" link

Step 2: AUTHENTICATION
├── Email/password → NextAuth credentials provider → bcrypt compare
├── Google → NextAuth Google provider → session upsert
└── [Future M11] 2FA check → TOTP code entry

Step 3: SESSION CREATION
├── JWT minted with: userId, roles[], kycStatus, subscriptionTier
├── Set HTTP-only secure cookie
└── Redirect to role-appropriate dashboard

Step 4: DASHBOARD LANDING
├── INVESTOR → /portfolio (or /marketplace if no holdings)
├── OWNER → /listings
├── ADMIN → /admin/dashboard
├── COMPLIANCE_OFFICER → /admin/compliance
└── MANAGER/PROFESSIONAL → /marketplace
```

---

## 2. Wallet Connection Flow

**Applies to:** Investor, Buyer, Seller, Property Owner, Land Owner

```
Step 1: TRIGGER
├── Settings → Wallet → "Connect External Wallet"
├── OR: First investment attempt → "Connect wallet to invest"
├── OR: Skip entirely → custodial wallet is already active
│
│   Note: Every user gets a custodial wallet automatically at registration.
│   Connecting an external wallet is OPTIONAL and for advanced users.

Step 2: WALLET ADAPTER MODAL
├── TIGI-themed modal appears (dark, gold accent)
├── Detected installed wallets shown first (Phantom, Solflare, Backpack)
├── "Don't have a wallet?" → tooltip explaining TIGI manages one for you
└── User clicks wallet icon

Step 3: WALLET APPROVAL
├── Wallet extension popup opens
├── User approves connection
├── Wallet public key returned to TIGI
└── Wallet adapter stores connection in browser

Step 4: ACCOUNT LINKING
├── Server: save walletAddress to User record
├── Server: write AuditLog (wallet_connected)
├── UI: settings page shows truncated address + "Connected" badge
└── UI: investment flows now use external wallet for signing

Step 5: SWITCHING / DISCONNECTING
├── Settings → Wallet → "Disconnect" → reverts to custodial
├── Settings → Wallet → "Switch Wallet" → re-opens adapter modal
└── Disconnecting does NOT affect existing token holdings
    (holdings are on-chain, tied to wallet, not TIGI account)

CUSTODIAL WALLET (DEFAULT):
├── Created at registration (server-side Keypair.generate())
├── Private key encrypted (AES-256-GCM) and stored in DB
├── User never sees private key unless they go to Settings → Wallet → Advanced → "Export Key"
├── Transactions signed server-side; user just clicks "Confirm" in TIGI UI
└── No wallet popup, no browser extension needed
```

**API calls:** `PUT /api/users/wallet`, `POST /api/wallets/export` (advanced)

**DB writes:** `User.walletAddress`, `AuditLog`

---

## 3. Marketplace Browsing Flow

### 3.1 General Browse

**Applies to:** All users (including unauthenticated visitors)

```
Step 1: ENTRY
├── Sidebar → "Marketplace"
├── OR: Landing page → "Explore Properties" CTA
├── OR: Direct URL → /marketplace
└── No auth required to browse

Step 2: MARKETPLACE PAGE
├── Default view: Grid (3-col desktop), showing ACTIVE listings, sorted by newest
├── Each card shows:
│   ├── Hero image (AI-generated for seed data)
│   ├── Title, price, location (city, state)
│   ├── Type badge (Residential / Commercial / Land / etc.)
│   ├── Quick stats: sqft, beds, baths (if applicable)
│   ├── Token indicator: "Tokenized" badge + "X% sold" if applicable
│   └── "For Lease" badge if lease listing
└── View toggle: Grid ↔ List

Step 3: SEARCH
├── Top nav search bar → type query
├── Autocomplete: property names, locations, types
├── Enter → marketplace filtered to search results
└── "X results for '[query]'" with clear search button

Step 4: FILTER
├── Filter panel (sidebar on desktop, bottom sheet on mobile):
│   ├── Property Type: checkboxes (Residential, Commercial, Land, Industrial, Mixed Use)
│   ├── Price Range: dual-handle slider + manual min/max inputs
│   ├── Location: state dropdown → city dropdown (chained)
│   ├── Status: Active, Sold, Leased (default: Active only)
│   ├── Tokenized Only: toggle switch
│   └── Listing Type: Buy / Lease / All
├── Filters apply immediately (no "Apply" button)
├── Active filter count shown on filter button (mobile)
└── "Clear All Filters" button

Step 5: SORT
├── Dropdown: Newest, Price (Low → High), Price (High → Low), Most Popular
└── Default: Newest

Step 6: PAGINATION
├── Cursor-based: "Load More" button at bottom
├── 12 items per page
└── Smooth card entrance animation on load

Step 7: PROPERTY SELECTION
├── Click card → /marketplace/[id] → Property Detail Page (see §4)
├── [Authenticated] Heart icon → save to watchlist
└── [Unauthenticated] Heart → "Sign up to save properties" prompt
```

---

### 3.2 Buyer-Specific Browse

```
Additional buyer behaviors:
├── Focus on: non-tokenized properties (full purchase)
├── Filter: Listing Type → "Buy"
├── Property detail: "Make Offer" CTA prominent
└── Transaction flow: Offer → Negotiate → Escrow → Settlement
```

### 3.3 Investor-Specific Browse

```
Additional investor behaviors:
├── Focus on: tokenized properties with available fractions
├── Filter: "Tokenized Only" toggle ON
├── Property detail: "Invest" CTA prominent, fraction selector visible
├── Sorting by yield or ROI (Phase 2: once AI scoring exists)
└── "Recommended for You" section on portfolio page (mocked in MVP)
```

### 3.4 Developer-Specific Browse

```
Additional developer behaviors:
├── Focus on: Land listings with "For Lease" status
├── Filter: Type → "Land", Listing Type → "Lease"
├── Property detail: "Apply for Lease" CTA, permitted use section important
└── Interested in: zoning info, parcel size, development potential
```

---

## 4. Property Detail & Listing Creation Flow

### 4.1 Viewing a Property (All Users)

```
Step 1: PROPERTY DETAIL PAGE (/marketplace/[id])

├── HERO SECTION
│   ├── Image carousel: swipe/arrow navigation, click to full-screen lightbox
│   ├── Image count indicator: "1/12"
│   └── Share button, save/watchlist button

├── OVERVIEW SECTION
│   ├── Title, type badge, status badge
│   ├── Price (or "Starting at $X/fraction" if tokenized)
│   ├── Location: full address, city, state
│   ├── Key specs row: sqft, beds, baths, year built, lot size
│   └── Description (expandable if long)

├── AI VALUATION SECTION
│   ├── "AI Estimated Value: $XXX,XXX"
│   ├── Confidence badge: Low / Medium / High
│   ├── [MVP mock] Deterministic formula based on price, sqft, location
│   ├── "Comparable Properties" → 3 comp cards (seeded data in MVP)
│   └── [Phase 2] Full report: confidence interval, factors, comps, PDF export

├── TOKEN INFO PANEL (if tokenized)
│   ├── Total supply, available fractions, price per fraction
│   ├── Progress bar: "67% sold"
│   ├── Investor count
│   └── "Invest" CTA button → Investment Flow (§5)

├── DOCUMENTS TAB
│   ├── List of uploaded documents (title, deed, inspection, appraisal)
│   ├── Document type label + verified/pending badge
│   ├── Download button (requires auth)
│   └── [Phase 2] "AI Summary" button → legal document summarization

├── LOCATION TAB
│   ├── [MVP] Static map image or OpenStreetMap embed
│   └── [Phase 2] Interactive Mapbox with nearby amenities

├── OWNERSHIP HISTORY TAB
│   ├── Timeline of on-chain token transfers
│   ├── Each entry: date, from/to (truncated addresses), quantity
│   └── "Verify on Solana Explorer" link

├── SIMILAR PROPERTIES SECTION
│   ├── 3 property cards based on type + location match
│   └── Simple DB query (not AI-scored in MVP)

└── ACTION CTAs (role-dependent)
    ├── [Visitor] "Sign up to invest" / "Sign up to make an offer"
    ├── [Investor] "Invest" → Investment modal
    ├── [Buyer] "Make Offer" → Offer form
    ├── [Owner of this property] "Edit Listing" / "View Stats"
    └── [Admin] "Review" / "Approve" / "Flag"
```

---

### 4.2 Creating a Listing (Property Owner / Land Owner)

```
Step 1: ENTRY
├── Sidebar → "My Listings" → "List New Property" button
├── OR: Owner dashboard → "+" card
└── Requires: authenticated + OWNER role + KYC verified (or mock-verified)

Step 2: MULTI-STEP FORM

  Step 2a: BASIC INFO
  ├── Title (text, max 120 chars)
  ├── Description (rich text, max 5000 chars)
  ├── Property Type: dropdown (Residential, Commercial, Land, Industrial, Mixed Use)
  ├── Listing Type: Sale / Lease / Both
  ├── Price (USD input, formatted)
  └── [Auto-save draft on tab change]

  Step 2b: PROPERTY DETAILS
  ├── Address: street, city, state, country, postal code
  ├── Square footage (number input)
  ├── Bedrooms / bathrooms (number inputs, null for land)
  ├── Year built (number, null for land)
  ├── Lot size (acres or sqft)
  ├── Parcel ID (optional)
  ├── Zoning type (optional text)
  └── Features checklist: pool, garage, waterfront, corner lot, etc.

  Step 2c: MEDIA UPLOAD
  ├── Images:
  │   ├── Drag-and-drop zone
  │   ├── Max 20 images, max 10MB each
  │   ├── Auto-convert to WebP, auto-resize
  │   ├── Reorder via drag
  │   ├── Set primary image (hero)
  │   └── Upload to S3 via pre-signed URL
  └── Documents:
      ├── Upload PDFs/images
      ├── Categorize: Title, Deed, Survey, Inspection, Appraisal, Contract, Other
      ├── Max 50MB per document
      └── Upload to S3 (restricted bucket)

  Step 2d: TOKENIZATION OPTIONS
  ├── Toggle: "Enable fractional ownership?" 
  ├── [If yes]:
  │   ├── Number of fractions (e.g., 100, 500, 1000)
  │   ├── Price per fraction (auto-calculated from total price ÷ fractions)
  │   ├── Minimum investment (number of fractions)
  │   └── Terms text area (ownership rights, yield distribution policy)
  └── [If no]: Listed as traditional sale only

  Step 2e: LEASE TERMS (if Listing Type includes Lease)
  ├── Lease type: Commercial, Agricultural, Development, Residential
  ├── Duration: start date, end date (or month-to-month toggle)
  ├── Monthly rent (USD)
  ├── Security deposit (USD)
  ├── Permitted use (text area)
  └── Additional terms (text area)

  Step 2f: REVIEW & SUBMIT
  ├── Full preview of listing exactly as it will appear
  ├── Checklist of required fields (all must be ✅)
  ├── "Save as Draft" button (can return later)
  └── "Submit for Review" button → status changes to UNDER_REVIEW

Step 3: POST-SUBMISSION
├── Confirmation screen: "Listing submitted for review"
├── Email notification sent to owner
├── Email notification sent to compliance queue
├── Listing visible in owner dashboard with "Under Review" badge
└── Owner can edit while under review (changes re-trigger review)
```

**API calls:** `POST /api/properties`, `PUT /api/properties/[id]`, `POST /api/upload/presigned-url`

**DB writes:** `Property`, `PropertyImage`, `PropertyDocument`, `AuditLog`

---

## 5. Investment Flow

**Applies to:** Investor

```
Step 1: TRIGGER
├── Property detail page → "Invest" button (only on tokenized properties)
└── Requires: authenticated + INVESTOR role + KYC VERIFIED

Step 2: PRE-FLIGHT CHECKS (server-side, instant)
├── Check: user KYC status === VERIFIED
│   └── [If not] → redirect to KYC flow → return after verification
├── Check: token has available supply
│   └── [If sold out] → show "Fully Subscribed" state, offer waitlist
├── Check: user not already at investment limit (if applicable)
└── All checks pass → open investment modal

Step 3: INVESTMENT MODAL
├── Property summary: image thumbnail, title, price per fraction
├── Fraction selector:
│   ├── Slider: 1 to available supply (max 100 in one transaction)
│   ├── Manual number input
│   └── Quick-select buttons: 1, 5, 10, 25, 50
├── Cost breakdown:
│   ├── Fractions: X × $Y = $Z
│   ├── Platform fee (2%): $W
│   ├── Total: $Z + $W
│   └── [Phase 2] Estimated annual yield: $A
├── Terms checkbox: "I have read and agree to the offering terms"
└── "Confirm Investment" button (disabled until terms checked)

Step 4: TRANSACTION EXECUTION

  Path A: CUSTODIAL WALLET (default — most users)
  ├── User clicks "Confirm Investment"
  ├── Server builds Solana transaction:
  │   ├── Transfer SOL/USDC from user's custodial wallet to escrow PDA
  │   ├── Transfer tokens from property PDA to user's custodial wallet
  │   └── Platform fee transferred to treasury wallet
  ├── Server signs with user's custodial key + platform authority
  ├── Server submits transaction to Solana
  ├── Modal shows: spinner → "Processing on Solana..." → progress dots
  └── Wait for confirmation (typically 5–15 seconds on Devnet)

  Path B: EXTERNAL WALLET (advanced users)
  ├── User clicks "Confirm Investment"
  ├── Server builds Solana transaction (unsigned)
  ├── Transaction sent to browser → wallet adapter → Phantom/Solflare popup
  ├── User approves and signs in wallet
  ├── Signed transaction submitted to Solana
  ├── Modal shows: "Confirm in your wallet..." → "Processing..." → progress dots
  └── Wait for confirmation

Step 5: POST-TRANSACTION
├── Solana confirmation received
├── Server updates:
│   ├── Token.availableSupply decremented
│   ├── TokenHolding created/updated for user
│   ├── Transaction record created (status: COMPLETED)
│   ├── AuditLog written
│   └── Email confirmation sent to investor
├── Modal transitions to SUCCESS state:
│   ├── ✅ "Investment Complete"
│   ├── Summary: X fractions of [Property Name], total $Y
│   ├── Solana transaction signature (expandable, links to Explorer)
│   ├── "View Portfolio" CTA (primary)
│   └── "Browse More" CTA (secondary)
└── Portfolio page now shows new holding

Step 6: ERROR HANDLING
├── Solana tx fails → modal shows error with "Retry" button
├── Insufficient balance → "Add funds to your wallet" message
├── Token sold out during transaction → "Someone invested first — X fractions remaining"
├── Network timeout → "Transaction pending — check portfolio in a few minutes"
└── All errors logged; admin alerted for repeated failures
```

---

## 6. AI Valuation Usage Flow

### 6.1 Viewing an AI Valuation (All Users)

**Applies to:** All authenticated users viewing a property detail page

```
Step 1: PROPERTY DETAIL → AI VALUATION SECTION
├── [If valuation exists]: 
│   ├── "AI Estimated Value: $XXX,XXX"
│   ├── Confidence badge: Low (red-tint) / Medium (amber-tint) / High (green-tint)
│   ├── One-line explanation: "Based on 3 comparable sales and area market data"
│   └── [Free tier] "See full report" → upgrade prompt
│       [Pro tier] "See full report" → expandable detail panel
│
└── [If no valuation]: 
    ├── "No AI valuation yet"
    └── [Owner/Admin] "Generate Valuation" button

Step 2: BASIC VALUATION (Free — all users see this)
├── Estimated value (single number)
├── Confidence level (Low / Medium / High)
├── Trend indicator: ↑ / → / ↓ vs area median
└── Disclaimer: "AI estimate — not a licensed appraisal"

Step 3: FULL VALUATION REPORT (Pro — upgrade required)
├── Clicking "See full report" checks subscription:
│   ├── [Free user] → modal: "Unlock deep valuations with TIGI Pro ($29/mo)"
│   │   ├── Feature comparison: Free vs Pro
│   │   ├── "Start Free Trial" / "Upgrade Now" CTAs
│   │   └── [MVP] "Join Waitlist" (no Stripe integration yet)
│   │
│   └── [Pro user] → expanded panel:
│       ├── Value range: $X – $Y (confidence interval)
│       ├── Confidence score: 0.82 with breakdown
│       ├── Comparable Properties: 5 cards with sale price, date, distance
│       ├── Positive factors: list (location, school district, recent renovations)
│       ├── Negative factors: list (age, flood zone, market slowdown)
│       ├── Market trends: mini chart (6-month price trend for area)
│       └── "Download PDF Report" button

MVP NOTE: In MVP, the valuation is generated by MockValuationService (deterministic formula).
The UI is fully built and production-quality. The real AI model plugs in at M6.
```

---

### 6.2 Requesting a New Valuation (Owner / Admin)

```
Step 1: Property detail → "Generate Valuation" (if none exists) or "Refresh Valuation"
Step 2: Loading state: shimmer skeleton in valuation section (2–3 seconds)
Step 3: Server:
  ├── [MVP] MockValuationService.analyze(propertyData) → deterministic result
  ├── [M6] Real AI pipeline: fetch comps → structured scoring → LLM analysis → ensemble
  ├── Cache result in Redis (24h TTL)
  └── Save to AiValuation table
Step 4: Valuation section updates with result
Step 5: AuditLog: valuation_generated
```

---

## 7. Inheritance Setup Flow

**Applies to:** Investor, Property Owner (any user who holds tokens)

```
Step 1: ENTRY
├── Sidebar → "Estate Planning"
├── OR: Portfolio → Holding detail → "Add to Estate Plan"
├── OR: Settings → "Estate Planning"
└── Requires: authenticated + at least 1 token holding

Step 2: ESTATE PLAN DASHBOARD (/inheritance)
├── Advisory banner (persistent, dismissible):
│   "Digital estate planning is advisory. We recommend consulting a legal professional
│    for binding arrangements."
├── [If no designations]: Empty state with illustration
│   └── "Set Up Your Estate Plan" CTA → Step 3
├── [If designations exist]: Grid of designation cards:
│   ├── Each card: property thumbnail, token name, beneficiary name/email
│   ├── Share: "50% of 25 tokens"
│   ├── Trigger: "On manual request" / "After 365 days inactivity" / "On March 15, 2030"
│   ├── Status badge: Active / Triggered / Completed / Revoked
│   └── Actions: "Edit" / "Revoke"
└── "Add Designation" button → Step 3

Step 3: SELECT HOLDING
├── Grid of owned token holdings:
│   ├── Property thumbnail + name
│   ├── Tokens owned: X fractions
│   ├── Current value: $Y
│   └── Existing designations: "2 beneficiaries designated" or "Not designated"
├── Click holding → Step 4
└── Can only designate holdings that aren't 100% already designated

Step 4: BENEFICIARY DESIGNATION FORM
├── Beneficiary info:
│   ├── Full name (required)
│   ├── Email (required — notification sent here)
│   ├── Relationship (dropdown: Spouse, Child, Sibling, Parent, Other)
│   └── [If TIGI user] Auto-link to account; [If not] Invitation sent
├── Share:
│   ├── Percentage of this holding (slider + input, 1–100%)
│   ├── Shows: "X tokens out of Y total"
│   ├── Remaining undesignated: "Z% available for other beneficiaries"
│   └── [If adding second beneficiary] Total must not exceed 100%
├── Transfer trigger:
│   ├── Option A: Manual ("Transfer only when I explicitly request it")
│   ├── Option B: Date-based → date picker ("Transfer on or after [date]")
│   ├── Option C: Inactivity → day selector ("Transfer if I'm inactive for [X] days")
│   └── Note: "Automated triggers will be available in a future update.
│             For now, triggered transfers require admin processing."
├── Notes to beneficiary (optional text area)
└── "Confirm Designation" button

Step 5: CONFIRMATION
├── Review summary: token, beneficiary, share, trigger
├── "By confirming, you authorize TIGI to process this transfer
│    according to the specified trigger conditions, subject to
│    applicable legal verification requirements."
├── Confirm → Server:
│   ├── Create BeneficiaryDesignation record
│   ├── Send email notification to beneficiary:
│   │   "You have been designated as a beneficiary for tokenized
│   │    real estate assets on TIGI. [Learn more]"
│   ├── Write AuditLog
│   └── [MVP] No on-chain action (designation stored in DB only)
│       [Phase 2] Smart contract records conditional transfer
└── Success: "Designation saved" → return to estate plan dashboard

Step 6: MANAGING DESIGNATIONS
├── Edit: change share %, trigger type, or beneficiary details
├── Revoke: "Are you sure?" confirmation → status: REVOKED → cleanup
├── Re-designate: freed allocation available for new designation
└── All changes logged in AuditLog

Step 7: TRIGGER PROCESSING (Phase 2 — documented but not functional in MVP)
├── Manual trigger: owner requests → admin reviews → processes transfer
├── Date trigger: system cron checks daily → admin notified → processes
├── Inactivity trigger: system tracks last login → threshold reached → admin notified
├── Processing: admin verifies → initiates on-chain token transfer
└── Post-transfer: beneficiary notified, holdings updated, audit logged
```

**API calls:** `POST /api/inheritance/designations`, `PUT /api/inheritance/designations/[id]`, `DELETE /api/inheritance/designations/[id]`

**DB writes:** `BeneficiaryDesignation`, `AuditLog`

---

## 8. Land Leasing Flow

### 8.1 Listing Land for Lease (Land Owner)

```
Step 1: ENTRY
├── My Listings → select a land/property → "List for Lease" button
├── OR: create new listing with Listing Type = "Lease"
└── Requires: OWNER role, owns the property, KYC verified

Step 2: LEASE TERMS FORM
├── Lease type: Commercial / Agricultural / Development / Residential
├── Available date: date picker
├── Duration:
│   ├── Fixed term → start date + end date
│   └── Month-to-month → start date only
├── Monthly rent: USD amount
├── Security deposit: USD amount (typically 1–3 months rent)
├── Permitted use: text area
│   ├── Example: "Commercial office space, no manufacturing"
│   ├── Example: "Agricultural use — crops and livestock"
│   └── Example: "Mixed-use development, residential + retail"
├── Restrictions: text area (optional)
├── Additional terms: text area (optional)
└── "Publish Lease Listing" button

Step 3: LISTING ACTIVE
├── Property appears in marketplace with "For Lease" badge
├── Lease terms visible on property detail page
├── "Apply for Lease" CTA visible to potential tenants
└── Owner dashboard shows lease listing with application count
```

---

### 8.2 Applying for a Lease (Developer / Tenant / Investor)

```
Step 1: BROWSE
├── Marketplace → filter: Listing Type = "Lease"
├── Browse lease listings (property cards with "For Lease" badge)
└── Click → property detail page with lease terms section

Step 2: REVIEW TERMS
├── Lease terms panel:
│   ├── Type, duration, monthly rent, deposit
│   ├── Permitted use, restrictions
│   ├── Additional terms
│   └── Owner info (public profile)
├── Documents tab: any land survey, zoning documents
└── AI valuation: "Fair lease rate estimate" (mocked in MVP)

Step 3: APPLICATION
├── "Apply for Lease" button → application form modal
├── Form fields:
│   ├── Intended use description (required, text area)
│   ├── Company/entity name (if commercial/development)
│   ├── Company registration number (optional)
│   ├── Proposed lease duration (can differ from listing)
│   ├── Proposed rent (can suggest counter-offer)
│   ├── Financial references or proof of funds (file upload, optional)
│   ├── Proposed modifications to terms (text area, optional)
│   └── Cover message to owner (text area, optional)
├── "Submit Application" button
└── Confirmation: "Application submitted — owner will be notified"

Step 4: POST-SUBMISSION
├── Server:
│   ├── Create LeaseApplication record (status: PENDING)
│   ├── Send email notification to property owner
│   ├── Write AuditLog
│   └── Application visible in applicant's "My Leases" dashboard
└── Applicant can view status: Pending → Accepted / Rejected
```

---

### 8.3 Reviewing Lease Applications (Land Owner)

```
Step 1: NOTIFICATION
├── Email: "New lease application for [Property Name]"
├── In-app: notification bell → "1 new lease application"
└── Dashboard: application count badge on property card

Step 2: APPLICATION REVIEW
├── My Listings → property → "Applications" tab
├── Application list: applicant name, intended use, proposed rent, status
├── Click application → detail view:
│   ├── All submitted information
│   ├── Applicant's TIGI profile (if registered)
│   ├── Proposed vs. listing terms comparison
│   └── Uploaded financial documents (if any)

Step 3: DECISION
├── "Accept" → Step 4
├── "Reject" → reason text (optional) → notify applicant → done
└── [Phase 2] "Counter-offer" → modify terms → notify applicant

Step 4: LEASE ACTIVATION
├── Server:
│   ├── Create Lease record (status: ACTIVE)
│   ├── Link lessee to property
│   ├── If applicant is a TIGI user: create Tenant record
│   ├── Send email to lessee: "Your lease has been approved"
│   ├── Send email to owner: "Lease activated for [Property Name]"
│   ├── Update LeaseApplication status: ACCEPTED
│   └── Write AuditLog
├── Property status updates:
│   ├── Marketplace: "Leased" badge (or remains "Active" if partial/multi-tenant)
│   └── Owner dashboard: lease details visible with tenant info
└── Both parties can view lease in their respective dashboards
```

**API calls:** `POST /api/leases`, `POST /api/leases/[id]/applications`, `PUT /api/leases/[id]/applications/[appId]`

**DB writes:** `Lease`, `LeaseApplication`, `Tenant`, `AuditLog`

---

## 9. Admin & Compliance Flows

### 9.1 Admin Dashboard & User Management

**Applies to:** Admin

```
Step 1: ADMIN DASHBOARD (/admin/dashboard)
├── KPI cards row:
│   ├── Total users (with trend indicator)
│   ├── Active listings (with trend)
│   ├── Transactions this month (with total value)
│   └── Pending reviews (compliance queue count)
├── Alerts section:
│   ├── "3 listings pending review"
│   ├── "1 KYC application pending"
│   ├── "2 flagged transactions"
│   └── Click alert → navigates to relevant queue
├── Recent activity feed:
│   ├── "[User] listed [Property]" — 5 min ago
│   ├── "[User] invested in [Property]" — 12 min ago
│   ├── "[Compliance] approved [User] KYC" — 1 hour ago
│   └── Scrollable, time-stamped
└── Quick actions:
    ├── "Review Listings" → /admin/compliance
    ├── "Manage Users" → /admin/users
    └── "View Audit Log" → /admin/audit

Step 2: USER MANAGEMENT (/admin/users)
├── User table:
│   ├── Columns: name, email, role(s), KYC status, subscription, created, last login, actions
│   ├── Search: by name or email
│   ├── Filter: by role, by KYC status, by subscription tier
│   └── Sort: by name, created date, last login
├── Click user → User detail:
│   ├── Profile info, roles, KYC status, subscription
│   ├── Holdings: token portfolio summary
│   ├── Transactions: list of user's transactions
│   ├── Login history: last 10 sessions (IP, timestamp, device)
│   ├── Audit trail: all actions by this user
│   └── Actions:
│       ├── Change role (dropdown, immediate effect)
│       ├── Suspend (with reason — user notified by email)
│       ├── Unsuspend
│       ├── Force KYC re-verification
│       ├── Toggle subscription tier (MVP: manual override)
│       └── Delete account (soft delete with PII erasure prompt)
└── All actions logged to AuditLog
```

---

### 9.2 Listing Review (Compliance Officer / Admin)

```
Step 1: COMPLIANCE DASHBOARD (/admin/compliance)
├── Tabs: KYC Reviews | Listing Reviews | Flagged Transactions | Audit Log
├── Active tab: "Listing Reviews"
└── Queue of properties with status = UNDER_REVIEW

Step 2: LISTING REVIEW
├── Select listing from queue → Review detail page:
│   ├── Full property detail (same as public page)
│   ├── Owner profile info
│   ├── Uploaded documents with viewer
│   ├── AI risk assessment (mocked in MVP):
│   │   ├── Price reasonableness: ✅ within range / ⚠️ unusually low/high
│   │   ├── Image analysis: ✅ unique / ⚠️ potential duplicate
│   │   └── Document completeness: ✅ all required / ⚠️ missing [type]
│   ├── Previous listings by same owner (if any)
│   └── Checklist:
│       ├── □ Images are appropriate and show actual property
│       ├── □ Description is accurate and not misleading
│       ├── □ Price is reasonable for property type and location
│       ├── □ Required documents uploaded (title/deed)
│       └── □ Tokenization terms are clear and complete

Step 3: DECISION
├── "Approve" button:
│   ├── Property status → ACTIVE
│   ├── Property now visible in marketplace
│   ├── Email to owner: "Your listing has been approved"
│   ├── AuditLog: listing_approved by [officer], propertyId
│   └── [If tokenized] "Mint Tokens" action now available to admin
│
├── "Reject" button:
│   ├── Reason text (required)
│   ├── Property status → REJECTED
│   ├── Email to owner: "Your listing was not approved. Reason: [...]"
│   ├── Owner can edit and re-submit
│   └── AuditLog: listing_rejected by [officer], propertyId, reason
│
└── "Request Changes" button:
    ├── Feedback text (required)
    ├── Property status remains UNDER_REVIEW
    ├── Email to owner: "Please update your listing: [feedback]"
    └── AuditLog: listing_changes_requested
```

---

### 9.3 KYC Review (Compliance Officer / Admin)

```
Step 1: Compliance dashboard → "KYC Reviews" tab
├── Queue: KycVerification records with status = SUBMITTED

Step 2: Review detail:
├── User profile info
├── Submitted documents:
│   ├── ID document (front + back) — inline viewer
│   ├── Selfie — inline viewer
│   ├── Address proof — inline viewer
│   └── [MVP] All documents are dummy/test uploads (mock KYC auto-approves)
├── AI risk score (mocked):
│   ├── Low risk / Medium risk / High risk
│   └── Factors: account age, data completeness, document quality
├── Previous verification attempts (if any)
└── OFAC/sanctions check result (mocked: always "Clear")

Step 3: Decision
├── "Approve" → KYC status: APPROVED, User.kycStatus: VERIFIED → email notification
├── "Reject" → reason required → KYC status: REJECTED → email with reason → can retry
└── "Request More Info" → status stays SUBMITTED → email requesting additional documents
```

---

### 9.4 Transaction Oversight & Escrow Intervention (Admin)

```
Step 1: Admin → Transactions tab
├── All transactions: filterable by status, type, date range, amount
├── Flagged transactions highlighted with warning badge
└── Click transaction → detail view

Step 2: Transaction detail:
├── Full step tracker (same as user view)
├── Both parties' info
├── Escrow status and amounts
├── On-chain transaction signatures (links to Explorer)
├── Fraud detection indicators (mocked in MVP)
└── AuditLog entries for this transaction

Step 3: Available admin actions:
├── "Flag for Review" → mark as flagged → compliance notification
├── "Release Escrow" → trigger escrow program release (arbiter authority)
│   ├── Funds to seller, tokens to buyer
│   ├── Transaction status → COMPLETED
│   └── Both parties notified
├── "Refund Escrow" → trigger escrow program refund
│   ├── Funds returned to buyer, tokens returned to seller
│   ├── Transaction status → CANCELLED
│   └── Both parties notified
├── "Freeze Escrow" → escrow status → DISPUTED → manual resolution required
└── All actions require confirmation modal and are logged to AuditLog
```

---

### 9.5 Token Minting (Admin)

```
Step 1: Admin → Properties → Approved + tokenization-enabled property → "Mint Tokens"

Step 2: Minting confirmation:
├── Property summary
├── Token parameters: total supply, price per fraction, metadata
├── "This will create [X] SPL tokens on Solana [Devnet/Mainnet]"
└── "Confirm Minting" button

Step 3: Execution:
├── Server:
│   ├── Create SPL token mint on Solana
│   ├── Mint total supply to platform PDA
│   ├── Set token metadata (Metaplex) with off-chain URI
│   ├── Create Token record in DB (status: ACTIVE)
│   ├── Update Property.isTokenized = true
│   ├── Update Property.tokenId
│   └── Write AuditLog: token_minted
├── Progress: "Creating mint..." → "Minting tokens..." → "Setting metadata..." → "Complete"
└── Token now available for fractional purchase on property detail page
```

---

## 10. Professional User Flows

### 10.1 Legal Professional

```
Primary workflows:
├── DOCUMENT REVIEW
│   ├── Access client properties → documents tab
│   ├── View uploaded titles, deeds, contracts
│   ├── Download for offline review
│   ├── [Phase 2] "AI Summary" → instant plain-English summary + risk flags
│   └── Mark as "Reviewed" (note attached — Phase 2)
│
├── COMPLIANCE SUPPORT (if given Compliance Officer role)
│   ├── Same flows as §9.2 and §9.3
│   └── Specialized in document verification and legal sign-off
│
└── DUE DILIGENCE
    ├── Browse marketplace as any user
    ├── View AI valuations and comp data
    ├── Review transaction escrow terms
    └── [Phase 2] Generate due diligence report (AI-assisted)
```

### 10.2 Financial Professional

```
Primary workflows:
├── MARKET ANALYSIS
│   ├── Analytics dashboard → market trends, price data, yield analysis
│   ├── [MVP] Basic chart: transaction volume, average price by type
│   ├── [Phase 2] AI-powered: heat maps, predictive forecasting, deep analytics
│   └── Export data (CSV) for external analysis (Phase 2)
│
├── CLIENT ADVISORY
│   ├── View client portfolios (if granted access — Phase 2 feature)
│   ├── AI valuation reports → share with clients
│   ├── Property comparison tool → side-by-side analysis
│   └── [Phase 2] Custom portfolio optimization recommendations
│
└── INVESTMENT EVALUATION
    ├── Browse marketplace with financial lens
    ├── Focus on: yield estimates, risk ratings, token liquidity
    ├── AI valuation deep reports (Pro tier)
    └── [Phase 2] Bulk valuation API access (Enterprise tier)
```

---

*Document generated: March 7, 2026*  
*Platform: TIGI — Tokenized Intelligent Global Infrastructure*
