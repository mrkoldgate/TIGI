# TIGI — Private Beta Readiness Checklist

Last updated: 2026-03-09
Status: **Pre-beta hardening complete (M7)**

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
- Auth session helpers
- RBAC role checks
- Solana transaction readiness checks (`evaluateReadiness`)
- Solana intent preparation (memo parsing, round-trips)
- Solana transaction programs registry
- Premium feature gates
- Intents API (POST + GET)
- Listings API
- Health API
- Settings profile PATCH API
- SolanaService address validation

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
| Investment | Intent creates an on-chain memo record only — no funds move, no escrow | Escrow program in M8 |
| Token execution | `EXECUTED` status requires manual admin approval — no automated Solana tx submission yet | M8 client-side signing flow |
| Emails | Transactional emails only log to console unless `RESEND_API_KEY` is set | Set Resend key for beta |
| Avatar upload | Upload UI is disabled — `Camera` button is visible but inactive | File storage activation in M10 |
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

## 8. Rollback Plan

1. All DB changes are Prisma migrations — reversible with `prisma migrate reset` (destructive)
2. Seed data can be re-applied safely at any time — all upserts are idempotent
3. Custodial wallets encrypted at rest — wallet data survives DB rollback as long as `PLATFORM_WALLET_SECRET` is unchanged
4. Git tags: create a `v0.7.0-beta` tag before deploying to make rollback trivial
