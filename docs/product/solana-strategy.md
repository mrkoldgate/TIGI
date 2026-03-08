# TIGI — Solana Strategy

> **Version:** 2.0  
> **Status:** Active  
> **Last updated:** March 7, 2026

---

## 1. Why Solana

### 1.1 Selection Rationale

| Criterion | Solana | Ethereum | Polygon | Why Solana Wins for TIGI |
|---|---|---|---|---|
| **Transaction cost** | ~$0.00025 | ~$1–20 | ~$0.01–0.05 | Real estate tokenization means many small transactions — sub-cent costs are essential |
| **Confirmation speed** | ~400ms finality | ~12min finality | ~2s finality | Investment confirmations need to feel instant; 400ms is indistinguishable from a database write |
| **Token standard** | SPL Token (mature) | ERC-20/721 (mature) | Same as Ethereum | SPL tokens are simple, well-documented, and have rich tooling |
| **Smart contracts** | Anchor (Rust) | Solidity | Solidity | Anchor provides type safety and security guarantees out of the box |
| **Ecosystem** | Phantom, Jupiter, Metaplex | MetaMask, OpenSea | MetaMask | Phantom has the best UX for consumer-facing apps — critical for mainstream users |
| **Mainnet capacity** | ~4,000 TPS | ~15 TPS | ~65 TPS | TIGI won't need this capacity early, but it eliminates scaling concerns entirely |
| **Developer tooling** | `@solana/web3.js`, Anchor, Helius, Shyft | Ethers.js, Hardhat | Same as Ethereum | Solana RPC providers (Helius) offer enhanced APIs for token tracking |

### 1.2 What Solana Is NOT for TIGI

- **Not a brand identity** — TIGI is a real estate platform, not a "Solana project." Solana is invisible infrastructure.
- **Not a payment rail** — users invest via the platform, not by sending SOL to addresses. The blockchain records ownership, it doesn't process payments.
- **Not a requirement for users** — no wallet pop-up, no SOL balance requirement, no chain knowledge needed.
- **Not immutable from day one** — programs are upgradeable during development; frozen for production after audit.

---

## 2. Wallet Strategy

### 2.1 Three-Tier Wallet Architecture

TIGI supports three wallet modes to serve users from "never heard of crypto" to "self-custody maximalist":

```
TIER 1: CUSTODIAL (Default — 90% of users)
├── Created silently at registration
├── Server-managed Keypair
├── Private key encrypted (AES-256-GCM) and stored in DB
├── User never sees a wallet prompt
├── Transactions signed server-side
├── User experience: "Click Invest → Confirm → Done"
├── Feels like: Robinhood, Coinbase, a normal financial app
└── Trade-off: platform holds keys (custodial risk — mitigated by encryption + HSM in prod)

TIER 2: CONNECTED (Opt-in — 8% of users)
├── User explicitly connects external wallet via Settings → Wallet
├── Phantom, Solflare, or Backpack via @solana/wallet-adapter
├── Private key stays in user's wallet extension (non-custodial)
├── Transactions require wallet approval popup
├── User experience: "Click Invest → Approve in Phantom → Done"
├── Feels like: Using a dApp, but cleaner
└── Trade-off: wallet popups interrupt flow (acceptable for crypto-native users)

TIER 3: ADVANCED (Expert — 2% of users)
├── All Tier 2 features plus:
├── Export custodial wallet private key (Settings → Wallet → Advanced → "Export Key")
├── View raw transaction data before signing
├── Direct Solana Explorer links on all transactions
├── Token account details visible
└── Trade-off: full transparency, no abstraction
```

### 2.2 Wallet Creation (Tier 1 — Custodial)

```typescript
// At user registration (server-side)
import { Keypair } from '@solana/web3.js'
import { encrypt } from '@/lib/crypto'

async function createCustodialWallet(userId: string) {
  // 1. Generate keypair
  const keypair = Keypair.generate()
  
  // 2. Encrypt private key
  const encryptedKey = await encrypt(
    Buffer.from(keypair.secretKey),
    deriveEncryptionKey(userId, process.env.WALLET_MASTER_SECRET)
  )
  
  // 3. Store in dedicated table (not in User table)
  await prisma.custodialWallet.create({
    data: {
      userId,
      publicKey: keypair.publicKey.toBase58(),
      encryptedSecretKey: encryptedKey,
      algorithm: 'AES-256-GCM',
      createdAt: new Date(),
    }
  })
  
  // 4. Update user record with public address
  await prisma.user.update({
    where: { id: userId },
    data: { walletAddress: keypair.publicKey.toBase58() }
  })
  
  // 5. Keypair is NOT returned or held in memory beyond this scope
  return keypair.publicKey.toBase58()
}
```

### 2.3 Wallet Security

| Layer | Protection |
|---|---|
| **Encryption** | AES-256-GCM per-wallet; per-user salt derived from `userId + WALLET_MASTER_SECRET` |
| **Key isolation** | Encrypted keys in separate `CustodialWallet` table; separate DB role for reads |
| **Access control** | Only the transaction signing service can decrypt; no API endpoint returns raw keys |
| **Key export** | Requires: active session + password re-confirmation + 2FA (when available) |
| **Rotation** | `WALLET_MASTER_SECRET` rotation mechanism: re-encrypt all keys without changing keypairs |
| **Production HSM** | HSM (AWS CloudHSM) for master key storage — planned for mainnet launch |

### 2.4 Wallet UX by Feature

| Feature | Custodial UX | Connected Wallet UX |
|---|---|---|
| **Investment** | "Confirm" button → server signs → processing spinner → done | "Confirm" → wallet popup → approve → processing → done |
| **Portfolio view** | Balances fetched from DB mirror (fast) | Same (DB mirror used for UI; on-chain for verification) |
| **Token transfer** | Not available in MVP (Phase 2) | Blocked in TIGI UI; user can transfer via wallet directly |
| **Settings** | "TIGI Managed Wallet" label, address shown (truncated) | Wallet name + address, "Disconnect" button |
| **Key export** | Behind Advanced → several confirmation steps | N/A (user already has their own keys) |

---

## 3. Tokenized Asset Representation in MVP

### 3.1 What a Token Represents

> **A TIGI token represents a record of economic interest in a property-specific offering, as defined in the property's offering documents. It does NOT represent direct legal title to the underlying real estate.**

This is the foundational design decision. Tokens are:
- **A unit of account** — tracking who invested how much in which property
- **Transferable proof** — on-chain transfer history proves chain of interest
- **A claim reference** — the token links to off-chain legal documents that define the actual rights

Tokens are NOT:
- A deed or title
- A legal ownership instrument recognized by courts (yet)
- A guarantee of any return

### 3.2 Token Architecture

**One SPL Token Mint per Property:**

```
Property: "Sunset Heights Condos"
├── SPL Token Mint: 7xKd...aF2g (created when admin mints tokens)
├── Total Supply: 1,000 tokens
├── Decimals: 0 (whole tokens only — each token = 1 fraction)
├── Mint Authority: Platform PDA (admin-controlled)
├── Freeze Authority: Platform PDA (compliance — can freeze transfers if needed)
│
├── Token Metadata (Metaplex):
│   ├── name: "TIGI-SUNSET-HEIGHTS"
│   ├── symbol: "TIGI"
│   ├── uri: "https://api.tigi.com/tokens/7xKd...aF2g/metadata.json"
│   └── creators: [{ address: platformAuthority, share: 100 }]
│
└── Off-chain Metadata JSON (stored on S3):
    {
      "name": "Sunset Heights Condos — Fraction",
      "description": "Represents 1/1000 economic interest...",
      "image": "https://storage.tigi.com/properties/123/hero.webp",
      "external_url": "https://tigi.com/marketplace/123",
      "properties": {
        "propertyId": "123",
        "propertyType": "residential",
        "totalFractions": 1000,
        "pricePerFraction": 485,
        "offeringDocumentUrl": "https://storage.tigi.com/properties/123/docs/offering.pdf"
      }
    }
```

### 3.3 Token Lifecycle in MVP

```
1. LISTING APPROVED
   └── Admin reviews listing → approves → listing status: ACTIVE

2. TOKEN MINTING (Admin action)
   ├── Admin clicks "Tokenize Property" in admin dashboard
   ├── Server:
   │   ├── Creates SPL Token Mint on Solana (Devnet)
   │   ├── Mints total supply to Platform Token Account (PDA)
   │   ├── Sets Metaplex metadata with off-chain URI
   │   └── Records mint address in Property.tokenMintAddress
   ├── Tokens are now "available for investment"
   └── Property detail page shows token info panel

3. INVESTMENT (Token distribution)
   ├── Investor clicks "Invest" → selects quantity → confirms
   ├── Server:
   │   ├── Creates/ensures investor's Associated Token Account (ATA)
   │   ├── Transfers tokens from Platform PDA → Investor ATA
   │   ├── Records transaction + token holding in DB
   │   └── Decrements available supply counter
   └── Investor's portfolio shows new holding

4. SECONDARY TRANSFER (Phase 2)
   ├── User A sells fractions to User B (platform-mediated)
   ├── Escrow holds tokens + payment
   └── On completion: tokens transferred A → B

5. TOKEN FREEZE (Compliance, if needed)
   ├── Compliance officer flags issue
   ├── Admin triggers freeze authority on specific token accounts
   └── Transfers blocked until resolved

6. TOKEN BURN (Decommission — rare)
   ├── Property sold entirely off-platform or delisted permanently
   ├── Admin burns remaining supply
   └── Token marked as INACTIVE in DB
```

---

## 4. Legal Ownership vs. On-Chain Representation

### 4.1 The Separation Principle

```
LEGAL WORLD (Courts, Deeds, County Records)     BLOCKCHAIN WORLD (Solana, Tokens)
──────────────────────────────────────────────   ────────────────────────────────────
Real estate title / deed                         SPL Token mint
  ↕ Recorded at county recorder's office           ↕ Recorded on Solana ledger
  ↕ Transferred via legal instruments              ↕ Transferred via token transfer
  ↕ Governed by property law                       ↕ Governed by smart contract
  ↕ Enforced by courts                             ↕ Enforced by consensus

                    ↑ These two things are NOT the same ↑
                    
BRIDGE: Offering Document (PPM / Operating Agreement)
  ├── "Each TIGI token represents one membership unit in [Property] LLC"
  ├── LLC holds legal title to the property
  ├── Token holder's rights defined by operating agreement
  └── Token transfer constitutes transfer of membership interest
      (subject to transfer restrictions in operating agreement)
```

### 4.2 Why This Matters

| Question | Answer |
|---|---|
| **If I hold tokens, do I own the property?** | You own membership units in the LLC that owns the property. Token = proof of membership. |
| **If tokens are transferred, does ownership transfer?** | The token transfer is the mechanism. The legal effectiveness depends on the operating agreement and jurisdiction. |
| **What if there's a dispute?** | The operating agreement and applicable state law govern. The token is evidence, not the final word. |
| **Can someone take my tokens?** | Only via platform freeze authority (compliance) or court order. Self-custody users control their own keys. |
| **What if TIGI goes down?** | Tokens exist on Solana independently. The operating agreement defines rights irrespective of the platform. |

### 4.3 MVP Implementation of Decoupling

| Aspect | MVP Approach | Production Evolution |
|---|---|---|
| **Legal entity per property** | Documented in offering as concept; actual LLC formation is property owner's responsibility | Automated SPV/LLC formation per tokenized property |
| **Offering documents** | PDF template attached to listing (owner uploads or platform provides template) | Auto-generated offering docs with legal review |
| **Token ↔ legal link** | Token metadata URI includes `propertyId` and `offeringDocumentUrl` | On-chain attestation linking mint to legal entity registry |
| **Transfer restrictions** | Platform UI only allows transfers to KYC-verified users | Smart contract whitelist: only approved wallets can receive |
| **Dispute resolution** | Platform admin arbiter on escrow; off-chain legal for title/ownership | Arbitration integration + insurance |

---

## 5. On-Chain vs. Off-Chain — MVP Data Map

### 5.1 What Lives On-Chain (Solana)

| Data | Why On-Chain | Implementation |
|---|---|---|
| **Token mint** | Immutable record that tokens exist for a property | SPL Token — `createMint()` |
| **Token supply** | Verifiable total supply, no inflation possible | Set at mint time; mint authority can be revoked |
| **Token balances** | Who holds how many fractions — the core ownership record | SPL Token accounts (ATAs per user per token) |
| **Token transfers** | Immutable history of every ownership change | Solana transaction log |
| **Escrow PDA state** | Funds and tokens held in escrow during transactions | Custom Anchor program — Escrow PDA |
| **Escrow conditions** | What must be met before release | Stored in Escrow PDA account data |
| **Token metadata URI** | Link from on-chain token to off-chain property data | Metaplex Token Metadata |

**On-chain data principle:** Only data that MUST be immutable, verifiable, and trustless goes on-chain. Everything else stays off-chain.

### 5.2 What Stays Off-Chain (PostgreSQL + S3)

| Data | Why Off-Chain | Storage |
|---|---|---|
| **Property details** (title, description, specs) | Rich text, frequently updated, must be searchable | PostgreSQL |
| **Property images** | Large binary files, CDN-delivered | S3 + DB references |
| **Legal documents** (title, deed, contracts) | Access-controlled, may need to be deleted (GDPR) | S3 (encrypted) + DB references |
| **User profiles and PII** | Privacy regulations require mutability and deletion | PostgreSQL (encrypted fields) |
| **KYC data** | Regulatory — must be deletable, access-restricted | PostgreSQL (encrypted) |
| **AI valuations** | Frequently recomputed, complex queries | PostgreSQL |
| **Transaction workflow state** | Multi-step process with UI state tracking | PostgreSQL |
| **Audit logs** | Application-level actions, append-only | PostgreSQL |
| **Lease records** | Mutable business data | PostgreSQL |
| **Inheritance designations** | Advisory records, user-editable | PostgreSQL |
| **Market analytics** | Aggregated, computed, time-series | PostgreSQL / Redis |

### 5.3 The Mirror Pattern

The database **mirrors** on-chain data for fast UI queries:

```
ON-CHAIN (Source of Truth)          DATABASE (Mirror for UI)
────────────────────────            ────────────────────────
SPL Token balance: 25 tokens  ───►  TokenHolding.quantity: 25
for user wallet 7xK...                for userId: "user_123"

Escrow PDA: funded, $24,250  ───►  Escrow.status: "FUNDED"
conditions: [inspection]            Escrow.amount: 24250

Token transfer: A → B, 10   ───►  Transaction.status: "COMPLETED"
txSig: 4rP2...                     Transaction.solanaSignature: "4rP2..."
```

**Sync mechanism:**
- **Write path:** Every on-chain operation is followed by an immediate DB write in the same server action
- **Reconciliation:** Background job runs every 15 minutes, compares DB mirror vs. on-chain state, logs discrepancies (never auto-corrects; alerts admin)
- **Conflict rule:** If chain and DB disagree, chain is authoritative. Admin must investigate and manually update DB.

---

## 6. Transaction Intent Flows

### 6.1 Investment Intent Flow

```
USER INTENT: "I want to invest $4,850 in Sunset Heights (10 fractions)"

Step 1: INTENT CREATION (Client → Server)
  ├── POST /api/transactions/invest
  ├── Body: { propertyId, tokenId, quantity: 10 }
  ├── Server validates:
  │   ├── User authenticated + KYC verified
  │   ├── Token has >= 10 available supply
  │   ├── User not at investment limit
  │   └── No conflicting pending transaction
  ├── Server creates Transaction record:
  │   ├── status: INITIATED
  │   ├── type: FRACTIONAL_INVESTMENT
  │   ├── amount: $4,850 (10 × $485)
  │   ├── fee: $97 (2%)
  │   └── total: $4,947
  └── Returns: { transactionId, readyToSign: true }

Step 2: TRANSACTION BUILDING (Server)
  ├── Build Solana transaction instructions:
  │   ├── Instruction 1: Transfer payment (SOL/USDC) from user → escrow PDA
  │   ├── Instruction 2: Transfer tokens from platform PDA → user ATA
  │   ├── Instruction 3: Transfer fee to platform treasury
  │   └── Bundle into single atomic transaction
  ├── [Custodial] Server signs with user's decrypted key + platform authority
  └── [Connected] Return serialized transaction for client-side signing

Step 3: SIGNING
  ├── [Custodial] Automatic — server signs and submits
  ├── [Connected] Client calls wallet adapter → wallet popup → user approves
  │   ├── Signed transaction returned to client
  │   └── Client sends signed tx back to server for submission
  └── All signing happens within 30-second timeout

Step 4: SUBMISSION & CONFIRMATION
  ├── Server submits transaction to Solana RPC
  ├── Waits for confirmation (commitment: 'confirmed')
  ├── Typical time: 5–15 seconds on Devnet
  ├── Retry logic: up to 3 attempts with exponential backoff
  └── Returns: { confirmed: true, signature: "4rP2..." }

Step 5: POST-CONFIRMATION (Server)
  ├── Update Transaction.status: COMPLETED
  ├── Update Transaction.solanaSignature: "4rP2..."
  ├── Create/update TokenHolding for user
  ├── Decrement Token.availableSupply
  ├── Write AuditLog
  ├── Send email confirmation
  └── Return success to client

Step 6: ERROR PATHS
  ├── Solana tx fails → Transaction.status: FAILED → supply NOT decremented → user notified → "Retry"
  ├── Wallet rejects (connected) → Transaction.status: CANCELLED → "You cancelled the transaction"
  ├── Timeout → Transaction.status: PENDING → background job checks status → resolves
  └── Partial failure (shouldn't happen — Solana txs are atomic) → admin alert
```

### 6.2 Offer + Escrow Intent Flow

```
USER INTENT: "I want to buy this property for $485,000"

Step 1: OFFER CREATION
  ├── Buyer submits offer: { propertyId, offerPrice, conditions, message }
  ├── Server creates Transaction record (status: OFFER_PENDING)
  ├── Notification sent to property owner
  └── Owner can: Accept / Reject / Counter

Step 2: OFFER ACCEPTED → ESCROW CREATION
  ├── Owner accepts offer
  ├── Server invokes Escrow program:
  │   ├── Creates Escrow PDA on Solana (Anchor program)
  │   ├── PDA account stores:
  │   │   ├── buyer: PublicKey
  │   │   ├── seller: PublicKey
  │   │   ├── arbiter: platformAuthorityKey
  │   │   ├── amount: u64 (in lamports or USDC decimals)
  │   │   ├── tokenMint: PublicKey
  │   │   ├── tokenAmount: u64
  │   │   ├── conditions: Vec<Condition> (simplified enum)
  │   │   ├── status: EscrowStatus (Created | Funded | Released | Refunded | Disputed)
  │   │   └── deadline: i64 (Unix timestamp)
  │   └── Transaction.status: ESCROW_CREATED
  └── Both parties notified

Step 3: ESCROW FUNDING
  ├── Buyer transfers funds to Escrow PDA
  ├── If tokenized: seller's tokens also locked in Escrow PDA
  ├── Escrow.status: FUNDED
  └── Both parties notified

Step 4: CONDITION FULFILLMENT
  ├── Conditions tracked off-chain (DB) with admin marking complete:
  │   ├── Inspection: compliance officer marks complete
  │   ├── Legal review: compliance officer marks complete
  │   ├── Title clear: compliance officer verifies
  │   └── Each condition logged in AuditLog
  ├── When ALL conditions met: Transaction.status: CONDITIONS_MET
  └── Admin can invoke settlement

Step 5: SETTLEMENT
  ├── Admin (or automated trigger) calls Escrow program's `release` instruction:
  │   ├── Funds released from PDA → seller's wallet
  │   ├── Tokens transferred from PDA → buyer's wallet
  │   ├── Platform fee deducted and sent to treasury
  │   └── Escrow.status: RELEASED
  ├── Transaction.status: COMPLETED
  ├── All parties notified
  └── AuditLog: escrow_released

Step 6: DISPUTE PATH
  ├── Either party raises dispute before settlement
  ├── Admin freezes escrow (status: DISPUTED)
  ├── Off-chain resolution process
  ├── Admin either releases to buyer or refunds to seller
  └── AuditLog: dispute with resolution
```

---

## 7. Escrow Smart Contract (Anchor Program)

### 7.1 Program Structure

```
programs/escrow/
├── Anchor.toml
├── Cargo.toml
└── src/
    └── lib.rs
        ├── create_escrow()      — Initialize escrow PDA with parties + terms
        ├── fund_escrow()        — Buyer deposits funds into PDA
        ├── release_escrow()     — Arbiter releases funds to seller + tokens to buyer
        ├── refund_escrow()      — Arbiter refunds buyer (cancellation)
        ├── dispute_escrow()     — Either party flags dispute → freezes PDA
        └── cancel_escrow()      — Mutual cancellation before funding
```

### 7.2 Escrow Account Schema

```rust
#[account]
pub struct Escrow {
    pub buyer: Pubkey,           // Buyer's wallet
    pub seller: Pubkey,          // Seller's wallet
    pub arbiter: Pubkey,         // Platform authority (multi-sig in production)
    pub amount: u64,             // Escrow amount in lamports or USDC base units
    pub token_mint: Pubkey,      // SPL Token mint of property tokens
    pub token_amount: u64,       // Number of tokens in escrow
    pub status: EscrowStatus,    // Created, Funded, Released, Refunded, Disputed
    pub created_at: i64,         // Unix timestamp
    pub deadline: i64,           // Expiry — auto-refund if not settled
    pub bump: u8,                // PDA bump seed
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum EscrowStatus {
    Created,
    Funded,
    Released,
    Refunded,
    Disputed,
    Cancelled,
}
```

### 7.3 Security Constraints

```rust
// Only the arbiter (platform) can release or refund
#[access_control(is_arbiter(&ctx.accounts.escrow, &ctx.accounts.signer))]
pub fn release_escrow(ctx: Context<ReleaseEscrow>) -> Result<()> {
    require!(ctx.accounts.escrow.status == EscrowStatus::Funded, ErrorCode::InvalidStatus);
    // ... transfer logic
}

// Either party can dispute
pub fn dispute_escrow(ctx: Context<DisputeEscrow>) -> Result<()> {
    let escrow = &ctx.accounts.escrow;
    let signer = &ctx.accounts.signer;
    require!(
        signer.key() == escrow.buyer || signer.key() == escrow.seller,
        ErrorCode::Unauthorized
    );
    // ... set status to Disputed
}
```

---

## 8. Network Strategy

### 8.1 Environment Mapping

| Environment | Network | RPC Provider | Token Value | Purpose |
|---|---|---|---|---|
| **Local dev** | Devnet | Helius (free tier) | None (test tokens) | Development and testing |
| **Preview/PR** | Devnet | Helius (free tier) | None | Pull request review |
| **Staging** | Devnet | Helius (paid tier) | None | Integration testing, demos |
| **Production (MVP)** | Devnet | Helius (paid tier) | None | Live users, demo mode |
| **Production (Post-audit)** | Mainnet-Beta | Helius (paid tier) | Real value | Real transactions |

### 8.2 Devnet → Mainnet Migration Plan

```
DEVNET PHASE (MVP through post-MVP):
├── All development and demo transactions
├── Real blockchain, real tokens — no monetary value
├── Users can verify transactions on Solana Explorer (Devnet)
├── Escrow program deployed and tested
└── No financial risk (Devnet SOL is free)

PRE-MAINNET CHECKLIST:
├── [ ] Third-party smart contract audit (OtterSec, Neodyme, or equivalent)
├── [ ] Penetration testing of custodial wallet system
├── [ ] Legal review of tokenization structure
├── [ ] Compliance framework finalized (KYC/AML real provider integrated)
├── [ ] Multi-sig setup for program upgrade authority (2-of-3)
├── [ ] Treasury wallet setup with multi-sig
├── [ ] Mainnet RPC provider contract (Helius paid plan)
├── [ ] Load testing with production-like volume
├── [ ] Disaster recovery plan documented
└── [ ] Insurance coverage review

MAINNET MIGRATION:
├── Deploy escrow program to Mainnet-Beta
├── Mark program as verified on Solana Explorer
├── Create platform treasury on Mainnet
├── Migrate user wallets (new custodial wallets on Mainnet — NOT key transfer)
├── Update RPC endpoints via environment variables
├── Gradual rollout: whitelist pilot users → open access
└── Monitor for 72 hours before removing Devnet fallback
```

### 8.3 RPC Provider Strategy

```typescript
// src/lib/solana/client.ts
import { Connection, clusterApiUrl } from '@solana/web3.js'

// Primary RPC (Helius — enhanced APIs, reliable)
const PRIMARY_RPC = process.env.SOLANA_RPC_URL

// Fallback RPC (public endpoint — rate-limited but available)
const FALLBACK_RPC = process.env.SOLANA_NETWORK === 'mainnet-beta'
  ? 'https://api.mainnet-beta.solana.com'
  : clusterApiUrl('devnet')

export function getConnection(): Connection {
  return new Connection(PRIMARY_RPC || FALLBACK_RPC, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60_000,
  })
}

// Health check — falls back to secondary if primary fails
export async function getHealthyConnection(): Promise<Connection> {
  const primary = new Connection(PRIMARY_RPC, { commitment: 'confirmed' })
  try {
    await primary.getLatestBlockhash({ commitment: 'confirmed' })
    return primary
  } catch {
    console.warn('Primary RPC failed, falling back to secondary')
    return new Connection(FALLBACK_RPC, { commitment: 'confirmed' })
  }
}
```

---

## 9. Future Fractional Ownership Evolution

### 9.1 Phase Progression

```
MVP (Now):
├── Tokens represent economic interest (defined in offering docs)
├── Transfers platform-mediated only (no peer-to-peer marketplace)
├── All on Devnet (no real value)
└── Escrow handles buy/sell via platform

Phase 2 — Secondary Market (M6+):
├── Users can list fractions for resale on TIGI marketplace
├── Order matching: seller sets ask price → buyer places order
├── Smart contract handles atomic swap (tokens ↔ payment)
├── Price discovery through market activity
└── Platform earns commission on secondary trades

Phase 3 — Yield Distribution (M10+):
├── Rental income from leased properties
├── Tokenized yield: proportional distribution to fraction holders
├── Smart contract computes and distributes yield on-chain
├── Holders receive yield directly to wallet
└── Automated quarterly/monthly distributions

Phase 4 — Cross-Platform Interoperability (M13+):
├── TIGI tokens tradeable on Solana DEXes (Jupiter, etc.)
├── Tokens compatible with DeFi protocols (lending, collateral)
├── Open metadata standard for real estate tokens
└── White-label partners recognize TIGI tokens
```

### 9.2 Token Standard Evolution

| Phase | Standard | Capability |
|---|---|---|
| MVP | SPL Token (basic) | Mint, transfer, freeze, burn |
| Phase 2 | SPL Token + Transfer Hook | Whitelist enforcement (only KYC'd wallets can receive) |
| Phase 3 | SPL Token + Yield Program | Automated yield distribution to holders |
| Phase 4 | Token-2022 (if needed) | Transfer fees, confidential transfers, permanent delegate |

---

## 10. Compliance & Legal Caution Points

### 10.1 Securities Classification

> **TIGI assumes all property tokens are securities until proven otherwise.**

| Classification | Approach |
|---|---|
| **Howey Test** | Investment of money (yes), common enterprise (yes), expectation of profit (yes), from efforts of others (yes in many cases) → likely a security |
| **Regulation** | Build with Reg D (506(b) or 506(c)) compliance scaffolding from day one |
| **Accredited investors** | MVP allows all users (Devnet has no real value). Mainnet phase will require accreditation verification or Reg A+ qualification. |
| **Exemptions** | Track emerging tokenization exemptions state-by-state |

### 10.2 Transfer Restrictions

| Restriction | MVP Implementation | Production Implementation |
|---|---|---|
| **KYC requirement** | Platform UI prevents non-verified users from transacting | Smart contract whitelist (Transfer Hook) blocks non-approved wallets |
| **Lock-up period** | Tracked in DB; UI prevents resale during lock-up | Smart contract enforced: `require!(elapsed > lockup_period)` |
| **Jurisdictional limits** | User location checked against allowed jurisdictions | Geo-blocking + wallet address screening |
| **Accreditation** | Not enforced (Devnet) | Verified before investment; accreditation status stored on-chain or off-chain |
| **Transfer limits** | No limit in MVP | Annual transfer limits per Reg D restrictions |

### 10.3 Compliance Logging

Every blockchain operation generates a compliance record:

```typescript
interface ComplianceRecord {
  id: string
  timestamp: Date
  action: 'TOKEN_MINT' | 'TOKEN_TRANSFER' | 'ESCROW_CREATE' | 'ESCROW_RELEASE' | 'ESCROW_REFUND'
  solanaSignature: string
  fromWallet: string
  toWallet: string
  tokenMint: string
  amount: number
  triggeredBy: string         // userId of the person who initiated
  kycStatusAtTime: string     // user's KYC status when action occurred
  ipAddress: string           // for audit trail
  jurisdictionAtTime: string  // user's jurisdiction when action occurred
}
```

### 10.4 What TIGI Does NOT Claim

The platform and all user-facing language must be clear:

| Claim | Language |
|---|---|
| ❌ "You own this property" | ✅ "You hold fractional economic interest as defined in the offering documents" |
| ❌ "Guaranteed returns" | ✅ "Past performance does not guarantee future results" |
| ❌ "AI appraisal" | ✅ "AI estimate — not a licensed appraisal" |
| ❌ "Legally binding escrow" | ✅ "Automated escrow — consult legal counsel for binding agreements" |
| ❌ "SEC registered" | ✅ "Platform operates under applicable exemptions" (once legal counsel confirms) |
| ❌ "Insured investment" | ✅ "Investments carry risk, including potential loss of principal" |

### 10.5 Open Legal Questions (Require Legal Counsel)

| # | Question | Impact | When Needed |
|---|---|---|---|
| 1 | Do we need broker-dealer registration to facilitate token sales? | Cannot sell tokens without clarity | Before mainnet |
| 2 | State-by-state real estate licensing requirements for tokenized sales? | May limit initial jurisdictions | Before mainnet |
| 3 | Does the platform need money transmitter licenses for custodial wallets? | Custodial wallet handling may trigger MTL | Before mainnet |
| 4 | Tax reporting obligations (1099-DIV, K-1) for fractional holders? | Must build reporting infrastructure | Before yield distribution |
| 5 | CFPB/FTC implications of AI-driven investment recommendations? | AI recommendation disclaimers | Before M6 (AI launch) |
| 6 | Cross-border transfer implications (OFAC/sanctions screening)? | Wallet-level screening may be required | Before international |
| 7 | Insurance requirements for custodial wallet assets? | May need surety bond or E&O insurance | Before mainnet |
| 8 | Intellectual property implications of AI-generated property images? | Seed data uses AI images | Ongoing |

---

## 11. Cost Analysis

### 11.1 Solana Transaction Costs

| Operation | Instructions | Estimated Cost | Frequency |
|---|---|---|---|
| Token mint creation | 3 (create mint + metadata + ATA) | ~$0.003 | Per property tokenized |
| Token transfer (investment) | 2 (transfer + ATA creation if new) | ~$0.001 | Per investment |
| Escrow creation | 2 (create PDA + initialize) | ~$0.005 | Per offer accepted |
| Escrow release | 3 (release funds + transfer tokens + close) | ~$0.002 | Per settlement |
| Metadata update | 1 | ~$0.0005 | Rare |

**Monthly cost at scale:**
- 500 investments/month × $0.001 = $0.50
- 50 escrows/month × $0.007 = $0.35
- **Total Solana fees: ~$1/month** (effectively free)

### 11.2 RPC Provider Costs

| Provider | Free Tier | Paid Tier | TIGI Usage |
|---|---|---|---|
| **Helius** | 100K credits/day | $49/mo (500K/day) → $199/mo (5M/day) | MVP: free tier. Growth: $49/mo |
| **QuickNode** | 50 req/s | $49/mo start | Backup RPC |
| **Public RPC** | Rate-limited | Free | Emergency fallback only |

---

*Document generated: March 7, 2026*  
*Platform: TIGI — Tokenized Intelligent Global Infrastructure*
