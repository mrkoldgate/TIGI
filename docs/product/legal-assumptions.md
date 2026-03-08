# TIGI — Legal & Regulatory Assumptions

> **Version:** 2.0  
> **Status:** Active  
> **Last updated:** March 7, 2026  
> **Disclaimer:** This document is for product development planning only. It is NOT legal advice. All assumptions herein must be reviewed by qualified legal counsel before any production deployment involving real users, real assets, or real money.

---

## 1. Purpose

This document defines the **product assumptions and boundaries** that guide how TIGI is built — specifically where legal, regulatory, and compliance concerns shape feature scope, UI language, data handling, and workflow design.

It answers one question for every builder on the team: **"What can we build, what can we NOT claim, and what must we label as placeholder?"**

---

## 2. KYC & AML Assumptions

### 2.1 Assumption: KYC Is Required Before Any Financial Transaction

| Rule | Implementation |
|---|---|
| No user can invest, purchase, sell, or transfer tokens without completing KYC | Server-side enforcement: every transaction route checks `user.kycStatus === 'VERIFIED'` |
| No user can list a property for tokenized sale without KYC | Listing submission blocked if KYC not complete |
| No user can receive inheritance transfer without KYC | Beneficiary must be KYC-verified before transfer executes |
| Browsing the marketplace does NOT require KYC | Public access for discovery; KYC prompted at first transactional action |

### 2.2 MVP Implementation: Mock KYC

| Aspect | MVP Behavior | Production Behavior |
|---|---|---|
| **Provider** | `MockKycService` — internal | Sumsub, Onfido, or equivalent |
| **User experience** | User fills out form, uploads placeholder documents → auto-approved in 3 seconds | User fills out form, uploads real ID → real verification (seconds to hours) |
| **Verification result** | Always `APPROVED` | `APPROVED`, `REJECTED`, or `NEEDS_REVIEW` based on real checks |
| **Document storage** | Stored in S3 (encrypted) — same flow as production | Same |
| **Audit trail** | Full audit log of submission and approval | Same + provider reference ID |

### 2.3 What TIGI Assumes About KYC/AML

| Assumption | Implication for Development |
|---|---|
| **All transacting users must be identity-verified** | KYC gate on every write operation involving money or tokens |
| **KYC data must be deletable** | GDPR right-to-erasure applies; use soft-delete + data anonymization |
| **KYC data is sensitive PII** | Encrypt at rest (AES-256); access-restricted DB table; pre-signed URLs for document viewing with short expiry |
| **AML monitoring will be needed** | Build transaction logging with the fields needed for SAR filing (amount, parties, timestamps, IP, jurisdiction) |
| **OFAC/sanctions screening will be needed** | Placeholder in compliance model; not enforced in MVP but data fields exist |
| **Re-verification may be required** | Build KYC as a repeatable flow, not a one-time event; admin can trigger re-verification |

### 2.4 What TIGI Does NOT Do in MVP

- ❌ Actually verify identity documents (mock provider auto-approves)
- ❌ Screen against OFAC/sanctions lists
- ❌ File Suspicious Activity Reports (SARs)
- ❌ Perform ongoing AML transaction monitoring
- ❌ Verify accredited investor status

All of these are **architected for** (data models, API interfaces, service contracts exist) but **not executed** until real providers are integrated (M7).

---

## 3. Title & Deed Verification Assumptions

### 3.1 Assumption: TIGI Does NOT Verify Title

> **TIGI is a platform, not a title company.** The platform accepts uploaded title documents and displays them — it does not independently verify clear title, search for liens, or guarantee title.

| What TIGI Does | What TIGI Does NOT Do |
|---|---|
| Accepts title/deed PDF uploads from property owners | Conduct independent title searches |
| Stores documents securely (encrypted S3) | Guarantee chain of title |
| Displays documents on property detail page | Verify document authenticity |
| Compliance officer can review and mark "Reviewed" | Provide title insurance |
| AI can parse and summarize documents (M7) | Render legal opinions on title status |

### 3.2 MVP Implementation

| Feature | Behavior |
|---|---|
| **Document upload** | Owner uploads title/deed during listing creation; categorized by type |
| **Document display** | Visible on property detail page under "Documents" tab; download requires auth |
| **Compliance review** | Compliance officer views documents in review queue; marks as "Reviewed" (not "Verified") |
| **Verified badge** | "Documents Reviewed" badge (not "Title Verified") — language is critical |
| **AI parsing** (M7) | Extracts fields (address, owner, encumbrances) from uploaded documents; clearly marked as "AI extraction — verify manually" |

### 3.3 Required Disclaimers

Every document-related UI surface must include:

```
"Documents uploaded by the property owner. TIGI does not independently 
verify title or guarantee document authenticity. Buyers should conduct 
their own due diligence and obtain independent title insurance."
```

### 3.4 Future Evolution

| Phase | Capability |
|---|---|
| MVP | Manual upload + display + compliance review |
| M7 | AI parsing and summarization with extraction confidence scores |
| Post-MVP | Title search API integration (DataTree, CoreLogic) |
| Post-MVP | Title insurance marketplace partnership |
| Post-MVP | On-chain attestation linking verified title to token mint |

---

## 4. Tokenized Asset Representation Limits

### 4.1 Assumption: Tokens Are NOT Deeds

> **A TIGI token represents an economic interest as defined in the property's offering documents. It does not constitute, replace, or supersede legal title.**

| What a Token IS | What a Token IS NOT |
|---|---|
| A digital record of investment | A property deed |
| A unit of account in a property-specific offering | A legal ownership instrument recognized by all courts |
| Transferable proof of economic interest | A guaranteed claim against the property itself |
| On-chain evidence of participation | A security registered with the SEC (unless explicitly registered) |

### 4.2 Legal Structure Assumption

```
Property LLC / SPV ──── owns ────► Real Property (title/deed)
     │
     │ issues membership units represented by
     │
TIGI Token ──── held by ────► Investor
     │
     │ rights defined in
     │
Offering Document / Operating Agreement
```

**TIGI assumes** each tokenized property will be wrapped in a property-specific LLC or SPV. The LLC holds legal title. Token holders are members of the LLC. Token transfer = membership interest transfer.

**In MVP:** This structure is documented as the intended model. Actual LLC formation is the property owner's responsibility. TIGI provides a template offering document.

### 4.3 UI Language Rules

| ❌ Never Say | ✅ Say Instead |
|---|---|
| "You own this property" | "You hold fractional economic interest in this property" |
| "Deed delivered" | "Tokens transferred to your account" |
| "Ownership transferred" | "Transaction settled — your holding is updated" |
| "Buy this property" (for fractional) | "Invest in this property" |
| "Your property" (for partial holders) | "Your holding in [Property Name]" |
| "Guaranteed return" | "Estimated yield based on current data" |
| "Solana confirms you own this" | "On-chain record of your investment" |

### 4.4 Token Transfer Restrictions

| Restriction | MVP Enforcement | Production Enforcement |
|---|---|---|
| **KYC required for receipt** | Platform UI blocks transfers to non-verified users | Smart contract Transfer Hook blocks non-whitelisted wallets |
| **Lock-up period** | Not enforced (Devnet — no real value) | Smart contract enforced; configurable per token |
| **Accredited investor check** | Not enforced (Devnet) | Required before investment; status stored in DB |
| **Jurisdictional limits** | Not enforced | User location checked against allowed jurisdictions before transaction |
| **Maximum holder count** | Not enforced | Reg D 506(b): max 35 non-accredited investors per offering |

---

## 5. Inheritance & Legal Execution Limits in MVP

### 5.1 Assumption: Inheritance Features Are Advisory, Not Legally Binding

> **TIGI's estate planning features record the user's intent. They do not create a will, trust, or legally binding estate plan. They do not execute without human review.**

### 5.2 What MVP Inheritance Can and Cannot Do

| ✅ Can Do | ❌ Cannot Do |
|---|---|
| Record beneficiary designations | Create a legally binding will or trust |
| Store trigger preferences (manual, date, inactivity) | Automatically transfer tokens without admin intervention |
| Send notification emails to beneficiaries | Verify death or incapacity |
| Display estate plan overview | Replace probate court proceedings |
| Allow modification and revocation by the owner | Guarantee execution in the event of dispute |
| Log all actions to audit trail | Supersede existing legal estate planning documents |

### 5.3 Required Disclaimers

Every inheritance-related page must display:

```
"TIGI's digital estate planning tools help you record your wishes for 
tokenized assets. These designations are advisory and do not constitute 
a legally binding estate plan. We strongly recommend working with a 
qualified estate planning attorney.

Token transfers initiated through estate planning features require 
administrative verification and may require legal documentation 
(e.g., death certificate, court order) before execution."
```

### 5.4 Trigger Execution Boundaries

| Trigger Type | MVP Behavior | What Actually Happens |
|---|---|---|
| **Manual** | Owner clicks "Execute Transfer" | Admin reviews → admin manually processes transfer |
| **Date-based** | System flags when date arrives | Admin receives alert → reviews → decides whether to process |
| **Inactivity-based** | System flags when inactivity threshold reached | Admin receives alert → attempts to contact user → reviews → decides |
| **None** | Automated transfer | ❌ No automated token transfers without human review in MVP or near-term phases |

### 5.5 Required Legal Documentation for Execution (Post-MVP)

When inheritance transfers are processed for real (Mainnet):

| Document | Purpose | Verification |
|---|---|---|
| Death certificate | Proves trigger event | Compliance officer verifies against government records |
| Letter testamentary / court order | Proves authority to distribute | Compliance officer verifies document + issuing court |
| Beneficiary identity verification | Proves beneficiary is who they claim | KYC verification of beneficiary |
| Tax clearance (if applicable) | No outstanding estate tax liens | Tax document review |

---

## 6. Land Leasing Assumptions

### 6.1 Assumption: TIGI Is a Listing Platform, Not a Landlord

> **TIGI facilitates lease listings, applications, and record-keeping. TIGI is not a party to any lease agreement. The lease relationship is between the property owner and the tenant.**

### 6.2 What TIGI Does vs. Does Not Do

| ✅ TIGI Does | ❌ TIGI Does Not |
|---|---|
| Provide a listing platform for lease listings | Sign or enforce lease agreements |
| Facilitate lease application submission | Screen tenants (credit checks, background checks) |
| Record lease terms and status | Collect or process rent payments (MVP) |
| Notify parties of application status | Guarantee tenant suitability or payment |
| Display lease information on dashboards | Enforce eviction or lease termination |
| Log all lease actions to audit trail | Provide legal representation in lease disputes |
| AI-optimize lease pricing (M9 — premium) | Guarantee AI-suggested pricing is optimal or legal |

### 6.3 MVP Leasing Limitations

| Limitation | Detail |
|---|---|
| **No smart contract enforcement** | Lease terms recorded in DB only; no on-chain lease contract in MVP |
| **No rent collection** | Payments tracked manually by owner; no integrated payment processing |
| **No tenant screening** | No credit check, background check, or employment verification API |
| **No automated renewal** | Lease expiry tracked; renewal is a manual re-listing process |
| **No eviction workflow** | Lease termination is a status change by admin; no legal process support |
| **No zoning verification** | Permitted use is owner-stated; no integration with zoning databases |
| **No habitability compliance** | No inspection or habitability standard checking |

### 6.4 Required Disclaimers

```
"TIGI provides a platform for listing and managing lease opportunities. 
TIGI is not a party to any lease agreement and does not guarantee 
the suitability of any tenant or the accuracy of any listing information. 

Landlords and tenants are responsible for their own lease agreements, 
tenant screening, legal compliance, and dispute resolution. 
Consult local landlord-tenant laws before entering any agreement."
```

### 6.5 Lease AI Disclaimers

For AI lease optimization features (M9+):

```
"AI-suggested lease pricing and terms are estimates based on 
available market data. They do not guarantee occupancy, income, 
or legal compliance with local rent control or housing regulations. 
Consult a real estate professional for binding lease decisions."
```

---

## 7. Compliance Review Points

### 7.1 Where Human Review Is Required

The platform has specific points where automated processing stops and human (compliance officer or admin) review is required:

| Review Point | Trigger | Reviewer | What They Check |
|---|---|---|---|
| **New listing** | Owner submits listing | Compliance Officer | Images appropriate, description accurate, price reasonable, documents present |
| **KYC submission** | User submits verification | Compliance Officer | Documents valid, identity matches, risk assessment acceptable (mock in MVP) |
| **Token minting** | Listing approved + tokenization | Admin | Token parameters correct, offering docs attached, supply and price verified |
| **Transaction flag** | Automated fraud rule triggered | Compliance Officer | Transaction legitimacy, user history, suspicious patterns |
| **Escrow release** | All conditions marked met | Admin | All parties agree, documents verified, conditions genuinely met |
| **Escrow dispute** | Either party raises dispute | Admin | Evidence review, decision on release or refund |
| **Inheritance trigger** | Date/inactivity threshold reached | Admin + Compliance | Verify trigger legitimacy, contact account holder, review documentation |
| **User suspension** | Reports, violations, or fraud flags | Admin | Evidence review, severity assessment, action decision |
| **Role elevation** | Request for COMPLIANCE_OFFICER or ADMIN | Admin | Identity verification, authorization approval |

### 7.2 Audit Trail Requirements

Every compliance-relevant action generates an immutable audit log entry:

```typescript
interface AuditLogEntry {
  id: string
  timestamp: Date
  action: AuditAction              // Enum of all auditable actions
  actorId: string                  // Who performed the action
  actorRole: string                // Their role at the time
  targetType: 'USER' | 'PROPERTY' | 'TRANSACTION' | 'TOKEN' | 'LEASE' | 'INHERITANCE'
  targetId: string                 // What was acted upon
  details: Record<string, any>     // Action-specific data
  ipAddress: string                // Actor's IP
  previousState?: string           // Before state (for changes)
  newState?: string                // After state (for changes)
}
```

**Audit log rules:**
- **Append-only** — no UPDATE or DELETE permissions on the audit log table
- **Separate DB role** — only the audit service can write; admins can read but not modify
- **Retention** — minimum 7 years (regulatory standard for financial records)
- **Searchable** — indexed by actor, target, action type, and date range
- **Exportable** — CSV/JSON export for regulatory reporting

---

## 8. What Is Placeholder vs. Production in MVP

### 8.1 Feature Classification

| Feature | MVP Status | What's Real | What's Simulated | Goes Production |
|---|---|---|---|---|
| **Auth (email + OAuth)** | Production | Real sessions, real password hashing, real OAuth | — | Already real |
| **RBAC** | Production | Real permission enforcement at API + UI | — | Already real |
| **Database + Prisma** | Production | Real schema, real migrations, real queries | — | Already real |
| **File uploads (S3)** | Production | Real uploads, real pre-signed URLs, real encryption | — | Already real |
| **Audit logging** | Production | Real append-only log, real data capture | — | Already real |
| **Input validation** | Production | Real Zod validation on every endpoint | — | Already real |
| **Design system** | Production | Full dark theme, real components, real animations | — | Already real |
| **KYC verification** | Placeholder | Full UI flow, document upload, status tracking | Auto-approval, no real ID check | M7 |
| **AI valuation** | Placeholder | UI rendering, confidence badges, comp display | Deterministic formula, no LLM | M6 |
| **AI recommendations** | Placeholder | "Recommended for You" section with cards | Simple DB query sort, no ML | M6 |
| **Solana transactions** | Semi-real | Real blockchain transactions on Devnet | No monetary value, free test tokens | Post-audit |
| **Escrow program** | Semi-real | Real Anchor program on Devnet | No real funds at risk | Post-audit |
| **Maps** | Placeholder | Static image or basic embed | No interactive SDK | M6 |
| **Email notifications** | Semi-real | Real emails via Resend in staging | `console.log` in local dev | Already real in staging |
| **Comparable sales data** | Placeholder | Display of comp cards | Seeded mock data, not real market data | M6 |
| **TIGI Pro subscription** | Placeholder | Pricing page, upgrade CTAs, tier display | No payment processing, admin-toggled | Phase 2 (Stripe) |
| **Fraud detection** | Placeholder | Flagged items in compliance queue | Basic rules only, no ML model | M7 |
| **Inheritance triggers** | Placeholder | Date/inactivity tracking in DB | No automated execution, admin manual | M8 |
| **Lease payments** | Placeholder | Payment amount display on lease records | No collection or processing | M9+ |

### 8.2 Placeholder Labeling Standard

Every placeholder feature must follow this UI pattern:

```
FUNCTIONAL PLACEHOLDERS (mock service running):
├── UI looks and behaves identically to production
├── No "Coming Soon" label (this is a functional feature, just with a mock backend)
├── Service interface matches production contract
└── Transition to real: config change, not code rewrite

NON-FUNCTIONAL PLACEHOLDERS (feature not built yet):
├── Feature is NOT visible in the UI
├── No buttons, no empty sections, no "Coming Soon" teasers
├── The page/section simply doesn't exist in navigation
└── Transition to real: build feature, add to navigation
```

**Rule:** If a user can interact with it, the mock must be indistinguishable from production. If we can't make it indistinguishable, we don't show it.

---

## 9. What Must NOT Be Presented as Legally Final

### 9.1 Absolute Prohibitions in UI Language

The following must NEVER appear in any user-facing text, tooltip, modal, email, or document within TIGI:

| ❌ Prohibited Claim | Why |
|---|---|
| "TIGI guarantees..." anything | Platform provides no guarantees — it facilitates |
| "Legally-binding ownership transfer" | Token transfer is not automatically a legal ownership transfer |
| "SEC-compliant" or "SEC-approved" | Unless and until securities counsel confirms and registration/exemption is in place |
| "Insured" or "Protected investment" | Unless specific insurance is obtained and disclosed |
| "Licensed appraisal" or "Official valuation" | AI estimates are not licensed appraisals |
| "This token IS your deed" | Tokens represent economic interest, not title |
| "Your investment is safe" or "Risk-free" | All investments carry risk |
| "Tax-free" or "Tax-optimized" | TIGI does not provide tax advice |
| "Estate plan is complete" | TIGI records intent; legal estate plans require attorneys |
| "Lease is legally executed" | TIGI records lease terms; legal execution is between parties |
| "Your identity is verified" without qualifier | In MVP, verification is simulated; even in production, TIGI verifies documents, not identity itself |

### 9.2 Required Qualifier Templates

**For AI outputs:**
```
"AI Estimate — not a licensed appraisal. This analysis is generated by 
automated systems and should not be the sole basis for investment decisions."
```

**For investment actions:**
```
"Investing involves risk, including the potential loss of your entire 
investment. Past performance does not guarantee future results. 
TIGI does not provide investment advice."
```

**For token transactions:**
```
"Tokens represent economic interest as defined in the property's offering 
documents. Token transfer does not automatically constitute legal transfer 
of real property title."
```

**For KYC (MVP):**
```
Internally labeled as mock — but user-facing text is identical to production:
"Verification submitted. We'll review your documents shortly."
(No mention of "mock" or "simulated" — the UX is realistic)
```

**For inheritance:**
```
"This designation records your wishes for digital asset distribution. 
It does not create a will, trust, or legally binding estate plan. 
All transfers require administrative review and may require legal 
documentation. Consult a qualified attorney."
```

**For leasing:**
```
"TIGI facilitates lease listings and applications. Lease agreements 
are between property owners and tenants. TIGI is not a party to 
any lease and does not guarantee terms or tenant suitability."
```

---

## 10. Jurisdiction & Geographic Assumptions

### 10.1 MVP Jurisdiction: United States Only

| Decision | Rationale |
|---|---|
| US-focused MVP | Clearest regulatory path for tokenized real estate; most relevant case law |
| English-only | No i18n complexity; consistent legal language |
| All 50 states allowed for browsing | No restriction on viewing listings |
| Tokenized transactions limited initially | Some states have clearer tokenization frameworks than others |

### 10.2 State-Level Considerations

| Concern | Approach |
|---|---|
| **Real estate licensing** | TIGI operates as a technology platform / marketplace, not a brokerage. If licensing is required in specific states, those states may be excluded until licensing is obtained. |
| **Money transmitter laws** | Custodial wallets may trigger MTL requirements. Analysis required state-by-state. Build with jurisdiction-gate capability. |
| **Rent control / landlord-tenant law** | Lease optimization AI will NOT account for local rent control. Disclaimer: "Consult local regulations." |
| **Property tax implications** | TIGI does not track or advise on property taxes from fractional ownership. |
| **Securities blue sky laws** | Reg D preempts most state blue sky laws for 506(c). Legal counsel must confirm. |

### 10.3 International Expansion Considerations (Post-MVP)

| Region | Key Issue | Status |
|---|---|---|
| Canada | Different securities framework (CSA) | Not in scope |
| UK | FCA regulation, different property law | Not in scope |
| EU | MiCA regulation, GDPR implications | Not in scope |
| UAE / Dubai | Emerging crypto-friendly jurisdiction | Future consideration |
| Singapore | MAS regulated, clear digital asset framework | Future consideration |

---

## 11. Data Privacy Assumptions

### 11.1 GDPR / Privacy Readiness

Even though MVP targets US users, TIGI builds with data privacy best practices:

| Principle | Implementation |
|---|---|
| **Data minimization** | Collect only what's needed; no "nice to have" fields |
| **Purpose limitation** | Each data field has a documented purpose |
| **Right to access** | Users can export all their data (Settings → Privacy → "Download My Data") |
| **Right to delete** | Soft-delete with PII anonymization; audit trail references preserved with anonymized IDs |
| **Encryption at rest** | Sensitive fields (SSN, tax ID, KYC docs) encrypted at application level |
| **Consent tracking** | Track what the user consented to and when (Terms acceptance, KYC consent, newsletter opt-in) |

### 11.2 Data Retention Assumptions

| Data Type | Retention | Reason |
|---|---|---|
| Transaction records | 7 years minimum | Financial regulatory standard |
| Audit logs | 7 years minimum | Compliance requirement |
| KYC documents | Duration of relationship + 5 years | AML regulations |
| User profiles | Until deletion requested | Service provision |
| AI valuation history | 2 years | Product improvement + audit trail |
| Session data | 30 days after expiry | Security review capability |

---

## 12. Insurance & Liability Assumptions

### 12.1 TIGI's Liability Position

| Area | Assumption |
|---|---|
| **Investment losses** | TIGI is not liable for investment losses; users invest at their own risk |
| **AI accuracy** | AI estimates are not guarantees; disclaimers protect against reliance claims |
| **Smart contract bugs** | Pre-mainnet audit mitigates risk; residual risk acknowledged in terms of service |
| **Custodial wallet breach** | Encryption + HSM mitigates; terms of service limit liability; insurance needed for mainnet |
| **Title defects** | TIGI does not verify title; buyers are responsible for their own due diligence |
| **Lease disputes** | TIGI is not a party to leases; disputes are between landlord and tenant |
| **Estate execution failures** | Advisory feature; legal estate plans require attorneys |

### 12.2 Insurance Needs (Pre-Mainnet)

| Insurance Type | Purpose | Priority |
|---|---|---|
| **Errors & Omissions (E&O)** | Protects against professional service claims | Required before mainnet |
| **Cyber liability** | Covers data breach costs, custodial wallet exposure | Required before mainnet |
| **Directors & Officers (D&O)** | Protects leadership from personal liability | Required before fundraising |
| **Fidelity bond** | Covers employee theft / key mismanagement | Required for custodial wallets on mainnet |
| **General liability** | Standard business insurance | Required |

---

## 13. Terms of Service & Legal Documents Needed

### 13.1 Documents Required Before Production Launch

| Document | Purpose | Priority |
|---|---|---|
| **Terms of Service** | Platform usage terms, liability limitations, dispute resolution | Before any real users |
| **Privacy Policy** | Data collection, use, sharing, retention, deletion | Before any real users |
| **Investment Disclaimer** | Risk disclosure for token purchases | Before any real transactions |
| **Offering Document Template** | Template PPM / operating agreement for property tokenization | Before property tokenization |
| **KYC/AML Policy** | Internal compliance procedures | Before real KYC integration |
| **Cookie Policy** | Tracking disclosures | Before production |
| **Acceptable Use Policy** | Content standards, prohibited activities | Before user-generated content |

### 13.2 MVP Status

In MVP (Devnet, no real value), these documents exist as:
- **Terms of Service:** Placeholder — "This is a development preview. No real transactions occur."
- **Privacy Policy:** Basic template covering data collection practices
- **All others:** Not required for Devnet/demo operation; must be finalized before mainnet

---

*Document generated: March 7, 2026*  
*Platform: TIGI — Tokenized Intelligent Global Infrastructure*
