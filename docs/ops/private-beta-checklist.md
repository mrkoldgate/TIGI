# TIGI — Private Beta Readiness Checklist

Last updated: 2026-03-09
Status: **Deployment-ready (M8)**

---

## 1. Required Environment Variables

All variables live in `.env.local` for local dev or your deployment platform's secret manager.
Reference file: `.env.example`

### Critical — App will not function without these

| Variable | Description | How to get it |
|---|---|---|
| `AUTH_SECRET` | NextAuth JWT signing secret | `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection string | Railway / Supabase / self-hosted |
| `NEXT_PUBLIC_APP_URL` | Full URL of the deployment | e.g. `https://beta.tigi.com` |

### Auth providers (at least one required)

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth App client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth App client secret |

> Credentials provider (email + password) works with no additional vars — bcrypt is included.

### Solana

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SOLANA_NETWORK` | Yes | `devnet` for beta, `mainnet-beta` for production |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Recommended | Helius or Alchemy RPC URL (client-side wallet adapter) |
| `SOLANA_RPC_URL` | Recommended | Same or separate Helius RPC URL (server-side API routes) |
| `PLATFORM_WALLET_SECRET` | **Critical** | Master secret for custodial wallet AES-256-GCM encryption. See security note below. |

> **Security note on `PLATFORM_WALLET_SECRET`:**
> Without this, custodial wallets fall back to a static dev key. This is logged loudly with a warning.
> For beta, set a strong random secret: `openssl rand -base64 48`
> For production: store in AWS KMS / CloudHSM, not in env vars.

> **Helius RPC:** Public Solana endpoints are rate-limited and unreliable under load.
> Sign up at https://helius.dev — free tier is sufficient for private beta.
> Set both `SOLANA_RPC_URL` and `NEXT_PUBLIC_SOLANA_RPC_URL`.

### Optional for beta (degrade gracefully if unset)

| Variable | Default | Description |
|---|---|---|
| `AI_PROVIDER` | `mock` | `mock` \| `openai` \| `anthropic`. Mock uses deterministic responses. |
| `ANTHROPIC_API_KEY` | — | Required if `AI_PROVIDER=anthropic` |
| `OPENAI_API_KEY` | — | Required if `AI_PROVIDER=openai` |
| `KYC_PROVIDER` | `mock` | `mock` auto-approves all KYC submissions |
| `REDIS_URL` / `REDIS_TOKEN` | — | Required for rate limiting, session caching. Falls back to no-op. |
| `RESEND_API_KEY` | — | Email delivery. Falls back to console logging. |
| `EMAIL_FROM` | `noreply@tigi.com` | Sender address for transactional emails |
| `STORAGE_PROVIDER` | `r2` | File upload provider. Avatar upload is disabled in UI until this is set. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, etc. | — | Required if `STORAGE_PROVIDER=r2` |
| `LOG_LEVEL` | `info` (prod) / `debug` (dev) | `debug \| info \| warn \| error` |

---

## 2. Database Setup

```bash
# 1. Run migrations (creates all tables)
npm run db:migrate

# 2. Seed demo data (28 properties, 4 users, tokens, AI valuations)
npm run db:seed

# Admin credentials for beta testing:
#   admin@tigi.com      / TigiDev2026!
#   owner@tigi.com      / TigiDev2026!
#   investor@tigi.com   / TigiDev2026!
#   compliance@tigi.com / TigiDev2026!
```

> Change all seed passwords before any external access.

---

## 3. Solana Devnet Readiness Verification

Before inviting beta users, run the devnet test script:

```bash
npm run test:devnet
```

This verifies:
- Devnet RPC is reachable
- Custodial wallet airdrop and balance check work
- `IntentPreparationService` can build serialized transactions for all 4 intent types
- Memo payload round-trips correctly
- `validatePreparation()` correctly assesses transaction freshness

The script is safe to run as often as needed — it uses a fresh keypair each run and only requests a 1 SOL devnet airdrop.

---

## 4. Unit Test Suite

```bash
npm run test          # run all unit tests
npm run test:coverage # coverage report
```

Current coverage areas:

### Library / logic

- Auth session helpers
- RBAC role checks
- Solana transaction readiness checks (`evaluateReadiness`)
- Solana intent preparation (memo parsing, round-trips)
- Solana transaction programs registry
- Premium feature gates
- SolanaService address validation
- AI orchestrator (mock + Anthropic paths, fallback behaviour)

### API routes

- `GET /api/health`
- `POST /api/listings`, `GET /api/listings`
- `GET /api/listings/[id]`, `PATCH /api/listings/[id]`
- `POST /api/intents`, `GET /api/intents`
- `POST /api/intents/[id]/prepare`
- `POST /api/intents/[id]/submit` (including TX_FAILED + blockhash expiry)
- `POST /api/billing/checkout`, `POST /api/billing/webhook`
- `PATCH /api/settings/profile`
- `POST /api/upload` (auth, purpose validation, size limits, storage errors)
- `POST /api/inquiries`, `GET /api/inquiries`

---

## 5. Pre-Beta Operational Checklist

### Infrastructure

- [ ] PostgreSQL instance provisioned and `DATABASE_URL` set
- [ ] Prisma migrations run (`npm run db:migrate`)
- [ ] Seed data loaded (`npm run db:seed`) or production data verified
- [ ] Redis configured (or accepted degraded: no rate limiting)
- [ ] Deployment platform (Vercel / Railway / Fly.io) configured

### Auth

- [ ] `AUTH_SECRET` is a fresh 32+ byte random secret
- [ ] Google OAuth credentials configured and callback URL set to `{APP_URL}/api/auth/callback/google`
- [ ] `/api/health` endpoint returns `{ status: "ok" }` after deploy

### Solana

- [ ] `PLATFORM_WALLET_SECRET` is set to a strong random value
- [ ] Helius (or equivalent) RPC endpoints configured
- [ ] `npm run test:devnet` passes all checks
- [ ] Network is set to `devnet` — **never `mainnet-beta`** during beta

### Admin access

- [ ] An ADMIN-role user exists (seed or manual)
- [ ] Admin dashboard accessible at `/admin/dashboard`
- [ ] Analytics page accessible at `/admin/analytics` (shows live DB counts)

### Email

- [ ] `RESEND_API_KEY` configured (or accepted: emails log to console)
- [ ] `EMAIL_FROM` is a domain you control and have configured SPF/DKIM for
- [ ] Transactional email template tested (inquiry, KYC, notification)

### Security

- [ ] `AUTH_SECRET` is NOT the same as any other secret
- [ ] `PLATFORM_WALLET_SECRET` is stored in secrets manager, not plaintext env
- [ ] `.env.local` is in `.gitignore` — verify it was never committed
- [ ] CSP headers verified in browser DevTools Network tab (present on every response)
- [ ] `/admin` routes return 403 for non-admin users

---

## 6. Known Beta Limitations

These are intentional limitations, not bugs:

| Area | Limitation | Planned fix |
|---|---|---|
| KYC | `KYC_PROVIDER=mock` auto-approves all submissions | Real SumSub / Onfido integration in M9 |
| Investment | Intent creates an on-chain memo record only — no funds move, no escrow | Escrow program in M9 |
| Token execution | Phantom signing active (M8). Client signs and submits to devnet. ADMIN approval still required for status advance. | Admin workflow in M9 |
| Emails | Transactional emails only log to console unless `RESEND_API_KEY` is set | Set Resend key for beta |
| Avatar upload | Upload UI active — requires `STORAGE_PROVIDER=r2` with R2 vars set. Falls back gracefully when unset. | Configure R2 vars for beta |
| Revenue analytics | Admin analytics `/admin/analytics` shows placeholder for revenue | Stripe integration in M10 |
| AI valuation | Uses mock/seed data unless `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` is set | Configure API key to enable |
| Rate limiting | Redis-backed rate limits inactive until `REDIS_URL` is set | Set Upstash Redis for beta |

---

## 7. Logging & Observability

The logger (`src/lib/logger.ts`) outputs:
- **Development**: pretty-printed lines to stdout
- **Production**: JSON to stdout (pipe to Logtail, Axiom, Datadog, etc.)

Set `LOG_LEVEL=debug` during early beta to capture full request detail.

To forward to an external log drain, replace the `emit()` function in `src/lib/logger.ts`.

---

## 8. Device and Browser Compatibility

Test these specific combinations before inviting beta users. The app uses Solana wallet adapters and `navigator.clipboard` — both require modern browsers.

### Minimum supported environments

| Environment | Minimum version | Notes |
|---|---|---|
| Chrome / Edge | 115+ | Primary target — wallet adapters best supported |
| Firefox | 119+ | Phantom extension available; test wallet modal |
| Safari (macOS) | 17+ | No Phantom extension — test "Connect wallet" flow gracefully degrades |
| Safari (iOS) | 17+ | Mobile browser — no wallet extension; wallet-dependent UI must hide cleanly |
| Chrome (Android) | 115+ | Phantom mobile in-app browser is separate — test basic flows only |

### Required browser checks

- [ ] Sign in with Google OAuth — Chrome, Firefox, Safari
- [ ] Sign in with email/password — all three browsers
- [ ] Marketplace loads and property cards render correctly on mobile (375 px viewport)
- [ ] Inquiry modal slides up correctly on mobile (bottom sheet) and centres on desktop
- [ ] Investment modal scroll works on mobile (max-height + overflow-y-auto)
- [ ] Phantom wallet modal opens and closes on Chrome/Firefox (extension required)
- [ ] "No wallet" state renders cleanly on Safari (extension unavailable)
- [ ] Avatar upload: file picker opens, image updates immediately after upload
- [ ] Settings save button feedback (Saving… / Saved / Error) visible and readable
- [ ] `/api/health` accessible without JS (curl check)

### Phantom-specific compatibility

- [ ] Phantom v24+ required for VersionedTransaction support (the prepare/submit flow uses `VersionedTransaction`)
- [ ] Instruct beta users to update Phantom if the signing step fails silently
- [ ] Test with Solflare extension as a secondary wallet option

### Known limitations

- **No mobile wallet support** — Phantom mobile in-app browser is out of scope for beta. Users on mobile should use desktop Chrome/Firefox to sign transactions.
- **Safari clipboard** — the `navigator.clipboard.writeText` call in the wallet display requires a user gesture in Safari. If copy-to-clipboard for wallet addresses fails, this is expected.

---

## 9. M8 Provider Activation — Stripe Test Mode

### Prerequisites

```bash
npm install   # installs stripe package (added in M8)
```

### Stripe test-mode setup

1. Sign in to [https://dashboard.stripe.com](https://dashboard.stripe.com) and switch to **Test mode**.
2. Create two products: **TIGI Pro** and **TIGI Pro+**. Add monthly + annual prices for each.
3. Copy the four `price_...` IDs into `.env.local`:

```dotenv
BILLING_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_PRO_PLUS_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_PLUS_ANNUAL_PRICE_ID=price_...
```

1. Register a webhook endpoint in Stripe dashboard → **Webhooks → Add endpoint**:
   - URL: `https://your-domain.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
2. Copy the `whsec_...` signing secret:

```dotenv
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Testing locally with Stripe CLI

```bash
# Install Stripe CLI, then:
stripe login
stripe listen --forward-to localhost:3000/api/billing/webhook

# Trigger test events:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

### Verification checklist

- [ ] `npm install` succeeds (stripe package resolves)
- [ ] `BILLING_PROVIDER=stripe` + all Stripe env vars set
- [ ] Click "Upgrade to Pro" in the UI → redirects to Stripe Checkout (test card: `4242 4242 4242 4242`)
- [ ] After successful checkout → user's `subscriptionTier` updated in DB
- [ ] Webhook receives `checkout.session.completed` → `auditLog` entry created
- [ ] `BILLING_PROVIDER=mock` still works for local dev without any Stripe keys

---

## 10. M8 Provider Activation — Anthropic

### Setup

```dotenv
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

### Anthropic verification checklist

- [ ] Open the Aria assistant → responses come from Claude Haiku (not mock)
- [ ] Pro+ user requests a deep valuation → narrative enriched by Claude Sonnet
- [ ] Remove `ANTHROPIC_API_KEY` → app falls back to mock (no crash, no user-visible error)
- [ ] `AI_PROVIDER=mock` (default) → no Anthropic SDK loaded, no API calls made

### Fallback behaviour (verified in unit tests)

If Anthropic throws at runtime (rate limit, overload, outage):

- `orchestrator.chat` falls back to mock response silently
- `orchestrator.enrichValuationNarrative` returns the rule-based summary unchanged
- Both paths log the error via `logger.error` — check logs, not user-facing errors

---

## 11. M8 Wallet + Storage Activation

### Phantom wallet signing — test instructions

1. Install [Phantom](https://phantom.app) browser extension and create/import a devnet wallet
2. Add devnet SOL via `npm run test:devnet` (script airdrops 1 SOL to a test keypair) or use `solana airdrop 1 <your-address>` with the Solana CLI
3. Sign in to TIGI and navigate to a listing
4. Create an intent (`EXPRESS_INTEREST` requires no KYC; `PREPARE_INVEST` requires KYC_VERIFIED)
5. Navigate to the intent detail page — you should see the **Signing requirements** checklist
6. Connect Phantom via the wallet modal
7. Click **Prepare to sign** → status advances to READY_TO_SIGN
8. Click **Sign with Phantom** → Phantom popup appears
9. Approve in Phantom → status shows "Recording on Solana…" → then "Interest recorded on Solana"
10. Click "View on Solana Explorer" — transaction should be visible on devnet

**Edge cases to verify:**

- [ ] Click "Sign" then immediately close Phantom popup → error clears, no crash
- [ ] Wait >90 seconds after prepare → "Preparation window expired" appears with Refresh button
- [ ] Connect a different Phantom wallet than the one used to prepare → "Wrong wallet connected" warning shown
- [ ] Disconnect Phantom mid-flow → panel reverts to "Connect wallet to sign"

### R2 storage — test instructions

1. Sign up at [Cloudflare Dashboard](https://dash.cloudflare.com) and create an R2 bucket called `tigi-storage-dev`
2. Create an R2 API token with Object Read/Write permissions
3. Set a custom domain or use the R2 public bucket URL
4. Configure `.env.local`:

```dotenv
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=tigi-storage-dev
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

1. Run `npm install` (adds `@aws-sdk/client-s3`)
2. Go to Settings → Profile → click the camera icon on your avatar
3. Select a JPEG/PNG/WebP file ≤ 2 MB
4. Verify the avatar updates immediately and persists on page reload
5. Check your R2 bucket dashboard — `user-avatar/{userId}/{uuid}.jpg` should appear

**Verification checklist:**

- [ ] `STORAGE_PROVIDER=r2` + all R2 vars set — upload goes to R2
- [ ] `STORAGE_PROVIDER=local` (or unset) — upload goes to `public/uploads/` (dev fallback)
- [ ] File > 2 MB → "Avatar must be 2 MB or smaller" error shown, no upload
- [ ] Unsupported file type (e.g. PDF) → "Unsupported file type" error shown

---

## 12. M8 Deployment and Environment Activation

### Build pipeline changes (M8)

The build script now runs `prisma generate` before `next build`. This ensures the Prisma client is always regenerated from `schema.prisma` — required when the schema has changed since `node_modules` was last populated.

```bash
# What "npm run build" now does:
prisma generate && next build
```

**Never use `prisma migrate dev` in production.** It creates new migration files and is interactive. Use `db:deploy` instead:

```bash
# Development: create migrations from schema changes
npm run db:migrate   # prisma migrate dev

# Production: apply pending migrations without creating new ones
npm run db:deploy    # prisma migrate deploy
```

### First deploy to Vercel — step by step

1. Push the repo to GitHub.
2. Import the project in [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js — no framework configuration needed (`vercel.json` is present).
4. Set all required environment variables in Vercel → Settings → Environment Variables (see Section 1). At minimum:
   - `AUTH_SECRET`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL` (set to `https://your-project.vercel.app` or your custom domain)
5. Add optional provider vars (`BILLING_PROVIDER`, `AI_PROVIDER`, `STORAGE_PROVIDER`, etc.).
6. **Before the first deploy**, run migrations against your hosted database:

```bash
# Run from your local machine against the hosted DB:
DATABASE_URL="postgresql://..." npm run db:deploy

# Or use the Vercel CLI post-build hook (see below).
```

1. Click **Deploy**. The build will run `prisma generate && next build`.
1. After deploy, verify the health check:

```bash
curl https://your-project.vercel.app/api/health
# Expected: {"status":"ok","checks":{"database":"ok"},...}
```

### Running `db:deploy` as part of Vercel deploy

To run migrations automatically on each Vercel deploy, add a **post-build** command in the Vercel project settings:

```bash
npm run db:deploy
```

Or set it as the build command override in `vercel.json`:

```json
{
  "buildCommand": "npm run db:deploy && npm run build"
}
```

> **Note:** The `vercel.json` currently uses `npm run build` only (which includes `prisma generate`). Update to `npm run db:deploy && npm run build` if you want migrations to run automatically on every deploy. Only do this if your DB user has migration permissions.

### Environment validation at startup

`src/instrumentation.ts` calls `assertRequiredConfig()` on every cold start. It checks:

- `AUTH_SECRET` is set
- `DATABASE_URL` is set
- Provider-specific vars are set (Anthropic key, Stripe keys, R2 creds, etc.)
- In production: `NEXT_PUBLIC_APP_URL` is not `localhost`

Config failures are logged with a prominent banner but do not crash the process (to keep `/api/health` responsive). Check logs immediately after first deploy.

### `next.config.ts` — R2 image domains

`next.config.ts` now reads `R2_PUBLIC_URL` at build time and dynamically adds the hostname to `images.remotePatterns`. This means:

- `R2_PUBLIC_URL=https://pub-abc.r2.dev` → `pub-abc.r2.dev` added to `remotePatterns`
- `R2_PUBLIC_URL=https://assets.tigi.com` → `assets.tigi.com` added to `remotePatterns`
- `R2_PUBLIC_URL` unset → only the wildcard `*.r2.cloudflarestorage.com` and `*.r2.dev` patterns apply

**Important:** `R2_PUBLIC_URL` must be set at build time (not just runtime) because `next.config.ts` runs during the build. Set it in Vercel's environment variables before deploying.

### Deployment readiness checklist

#### Build

- [ ] `npm run build` succeeds locally with `DATABASE_URL` pointing to a local or staging DB
- [ ] `prisma generate` runs (now part of build) — no `PrismaClientInitializationError` in logs
- [ ] `npm run db:deploy` run against hosted DB before first deploy

#### Vercel configuration

- [ ] `vercel.json` is present — Vercel uses `npm run build` and 30s function timeout
- [ ] `NEXT_PUBLIC_APP_URL` is set to the real HTTPS URL (not localhost)
- [ ] `R2_PUBLIC_URL` is set at build time if using R2 with a custom domain
- [ ] All `*_SECRET` and `*_KEY` vars added to Vercel Environment Variables (not committed to git)

#### Post-deploy verification

- [ ] `/api/health` returns `{ "status": "ok" }` — confirms DB connectivity
- [ ] Config validation banner is NOT in logs (all required vars set)
- [ ] Sign in works (Google OAuth callback URL registered with correct `NEXT_PUBLIC_APP_URL`)
- [ ] Avatar upload works (if `STORAGE_PROVIDER=r2`, uploaded image renders in the UI)
- [ ] Stripe checkout redirects correctly (if `BILLING_PROVIDER=stripe`)

---

## 13. Rollback Plan

1. All DB changes are Prisma migrations — reversible with `prisma migrate reset` (destructive)
2. Seed data can be re-applied safely at any time — all upserts are idempotent
3. Custodial wallets encrypted at rest — wallet data survives DB rollback as long as `PLATFORM_WALLET_SECRET` is unchanged
4. Git tags: create a `v0.8.0-beta` tag before deploying to make rollback trivial
5. Stripe: setting `BILLING_PROVIDER=mock` immediately disables Stripe without a redeploy
