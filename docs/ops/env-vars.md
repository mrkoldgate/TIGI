# TIGI — Environment Variables Reference

> **Last updated:** March 9, 2026  
> **Context:** Private Beta Launch (`private-beta-launch` branch)

**Required columns:**

- **L** = Local dev · **S** = Staging · **B** = Beta/Production
- ✅ = Required · 🟡 = Optional · ❌ = Not needed

---

## App / Auth

| Variable | Purpose | L | S | B | Example | Notes |
|---|---|---|---|---|---|---|
| `NEXTAUTH_SECRET` | Signs session JWTs | ✅ | ✅ | ✅ | `openssl rand -base64 32` | Must be unique per environment. Rotate = all sessions invalidated. |
| `NEXTAUTH_URL` | Canonical app URL for auth callbacks | ✅ | ✅ | ✅ | `http://localhost:3000` / `https://tigi-staging.vercel.app` | Must match deployment URL exactly, including protocol. |
| `NODE_ENV` | Runtime mode | ❌ | ❌ | ❌ | `production` | Auto-set by Vercel. Do not override. |

---

## Database

| Variable | Purpose | L | S | B | Example | Notes |
|---|---|---|---|---|---|---|
| `DATABASE_URL` | Prisma connection string (pooled) | ✅ | ✅ | ✅ | `postgresql://user:pass@host:5432/tigi?sslmode=require` | For Neon/Supabase: use the **pooled** connection string. |
| `DIRECT_URL` | Prisma direct connection (non-pooled) | 🟡 | ✅ | ✅ | `postgresql://user:pass@host:5432/tigi?sslmode=require` | Required for `prisma migrate deploy` on serverless. Set in `schema.prisma` as `directUrl`. |

---

## Stripe (Billing)

| Variable | Purpose | L | S | B | Example | Notes |
|---|---|---|---|---|---|---|
| `STRIPE_SECRET_KEY` | Server-side Stripe API calls | 🟡 | ✅ | ✅ | `sk_test_51...` | Use **test mode** key for staging/beta. Live key only for production. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe.js | 🟡 | ✅ | ✅ | `pk_test_51...` | Must match the secret key's mode (test/live). `NEXT_PUBLIC_` prefix exposes to browser. |
| `STRIPE_WEBHOOK_SECRET` | Validates incoming webhook signatures | 🟡 | ✅ | ✅ | `whsec_...` | Get from Stripe Dashboard → Webhooks → Signing secret. |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro plan ($29/mo) | 🟡 | ✅ | ✅ | `price_1Abc...` | Create in Stripe Dashboard → Products. |
| `STRIPE_PRO_PLUS_PRICE_ID` | Stripe Price ID for Pro+ plan ($79/mo) | 🟡 | ✅ | ✅ | `price_1Def...` | Create in Stripe Dashboard → Products. |

---

## Anthropic (AI)

| Variable | Purpose | L | S | B | Example | Notes |
|---|---|---|---|---|---|---|
| `AI_PROVIDER` | AI backend selector | ✅ | ✅ | ✅ | `mock` / `anthropic` | Set to `mock` for local dev (no API calls). Set to `anthropic` for staging/beta. |
| `ANTHROPIC_API_KEY` | Anthropic API authentication | 🟡 | ✅ | ✅ | `sk-ant-api03-...` | Only required when `AI_PROVIDER=anthropic`. Get from console.anthropic.com. |

---

## Solana / Phantom

| Variable | Purpose | L | S | B | Example | Notes |
|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint | 🟡 | ✅ | ✅ | `https://api.devnet.solana.com` | Public devnet is free but rate-limited. Use Helius or QuickNode for reliability. |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Solana cluster selector | ✅ | ✅ | ✅ | `devnet` | Options: `devnet`, `testnet`, `mainnet-beta`. **Use `devnet` for beta.** |

> **Note:** Phantom wallet configuration is client-side (browser extension settings). Users must manually switch Phantom to Devnet in Settings → Developer Settings.

---

## R2 Storage (Cloudflare)

| Variable | Purpose | L | S | B | Example | Notes |
|---|---|---|---|---|---|---|
| `R2_ACCESS_KEY_ID` | S3-compatible access key | 🟡 | ✅ | ✅ | `abc123def456...` | Create in Cloudflare Dashboard → R2 → Manage R2 API Tokens. |
| `R2_SECRET_ACCESS_KEY` | S3-compatible secret key | 🟡 | ✅ | ✅ | `wJalrXUtnFEMI...` | Paired with access key above. |
| `R2_ENDPOINT` | S3-compatible endpoint URL | 🟡 | ✅ | ✅ | `https://<account_id>.r2.cloudflarestorage.com` | Find in Cloudflare Dashboard → R2 → bucket details. |
| `R2_BUCKET_NAME` | Target R2 bucket | 🟡 | ✅ | ✅ | `tigi-uploads` | Create the bucket in Cloudflare Dashboard first. |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public URL prefix for uploaded files | 🟡 | ✅ | ✅ | `https://uploads.tigi.com` | Configure custom domain or use R2 public URL. |

> **Local dev fallback:** When R2 vars are not set, uploads go to `public/uploads/` via `LocalStorageProvider`.

---

## Analytics / Monitoring

| Variable | Purpose | L | S | B | Example | Notes |
|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics (future) | ❌ | 🟡 | 🟡 | `phc_...` | Not required for beta launch. Events log to console until configured. |
| `SENTRY_DSN` | Error tracking (future) | ❌ | 🟡 | 🟡 | `https://abc@sentry.io/123` | Recommended for beta to catch production errors. |

---

## Deployment / Runtime

| Variable | Purpose | L | S | B | Example | Notes |
|---|---|---|---|---|---|---|
| `VERCEL_URL` | Auto-set by Vercel | ❌ | ❌ | ❌ | `tigi-abc123.vercel.app` | Auto-injected. Do not set manually. |
| `MAINTENANCE_MODE` | Emergency kill switch | ❌ | 🟡 | 🟡 | `true` / `false` | When `true`, middleware redirects all requests to maintenance page. |
| `LOG_LEVEL` | Structured logger verbosity | 🟡 | 🟡 | 🟡 | `debug` / `info` / `warn` / `error` | Default: `info` in production, `debug` in development. |

---

## Quick Setup (Local Dev)

```bash
# Minimum viable .env.local for local development
cat > .env.local << 'EOF'
# Auth
NEXTAUTH_SECRET=dev-secret-change-me-in-production
NEXTAUTH_URL=http://localhost:3000

# Database (local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tigi

# AI (mock mode — no API key needed)
AI_PROVIDER=mock

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
EOF
```

## Quick Setup (Staging)

```bash
# All variables required for staging deployment
cat > .env.staging << 'EOF'
# Auth
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://tigi-staging.vercel.app

# Database
DATABASE_URL=<neon pooled connection string>
DIRECT_URL=<neon direct connection string>

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PRO_PLUS_PRICE_ID=price_...

# AI
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# R2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=tigi-uploads
NEXT_PUBLIC_R2_PUBLIC_URL=https://uploads.tigi.com
EOF
```

---

## Security Notes

- **Never commit `.env.local` or `.env.staging`** — both are in `.gitignore`
- **Rotate `NEXTAUTH_SECRET`** if you suspect session compromise — all users will be logged out
- **Stripe test keys** cannot process real charges — safe for beta
- **Anthropic API keys** have per-organization rate limits — monitor usage in dashboard
- **R2 keys** should be scoped to the specific bucket with write-only permissions
