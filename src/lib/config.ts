// ---------------------------------------------------------------------------
// config.ts — Centralised, validated runtime configuration for TIGI.
//
// All environment-variable access goes through this module. Callers get a
// typed Config object and a clear error message at startup if anything is
// missing — rather than a cryptic runtime failure deep in a request handler.
//
// Usage:
//   import { config } from '@/lib/config'
//   const url = config.app.url          // string
//   const key = config.ai.anthropicKey  // string | undefined (optional)
//
// Validation:
//   Call assertRequiredConfig() in instrumentation.ts or app/layout.tsx (server)
//   to catch missing required variables at boot time.
//
// Pattern:
//   - Required vars:  throw on missing, value always string
//   - Optional vars:  return undefined, callers handle the absence
// ---------------------------------------------------------------------------

// ── Helpers ─────────────────────────────────────────────────────────────────

function required(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `[config] Missing required environment variable: ${key}\n` +
      `  Copy .env.example to .env.local and set ${key}.`,
    )
  }
  return value
}

function optional(key: string): string | undefined {
  return process.env[key] || undefined
}

function bool(key: string, defaultValue = false): boolean {
  const v = process.env[key]
  if (v === undefined) return defaultValue
  return v === 'true' || v === '1'
}

// ── Config shape ─────────────────────────────────────────────────────────────

export interface TIGIConfig {
  app: {
    url:     string
    name:    string
    nodeEnv: string
  }
  auth: {
    secret:             string
    googleClientId:     string | undefined
    googleClientSecret: string | undefined
  }
  database: {
    url: string
  }
  redis: {
    url:   string | undefined
    token: string | undefined
  }
  ai: {
    provider:     'mock' | 'anthropic' | 'openai'
    anthropicKey: string | undefined
    openaiKey:    string | undefined
  }
  storage: {
    provider:        'local' | 'r2' | 's3'
    r2AccountId:     string | undefined
    r2AccessKeyId:   string | undefined
    r2SecretKey:     string | undefined
    r2BucketName:    string | undefined
    r2PublicUrl:     string | undefined
  }
  solana: {
    network:    string
    serverRpc:  string | undefined
    clientRpc:  string | undefined
    platformKey: string | undefined
  }
  kyc: {
    provider: 'mock' | 'sumsub' | 'onfido'
    sumsubApiKey:    string | undefined
    sumsubSecretKey: string | undefined
  }
  billing: {
    provider:              'mock' | 'stripe'
    stripeSecretKey:       string | undefined
    stripeWebhookSecret:   string | undefined
    priceIdProMonthly:     string | undefined
    priceIdProAnnual:      string | undefined
    priceIdProPlusMonthly: string | undefined
    priceIdProPlusAnnual:  string | undefined
  }
  features: {
    walletConnect: boolean
    aiFeatures:    boolean
    maintenance:   boolean
  }
}

// ── Builder ──────────────────────────────────────────────────────────────────

function buildConfig(): TIGIConfig {
  const aiProvider      = (optional('AI_PROVIDER')      ?? 'mock') as TIGIConfig['ai']['provider']
  const storageProvider = (optional('STORAGE_PROVIDER') ?? 'local') as TIGIConfig['storage']['provider']
  const kycProvider     = (optional('KYC_PROVIDER')     ?? 'mock') as TIGIConfig['kyc']['provider']
  const billingProvider = (optional('BILLING_PROVIDER') ?? 'mock') as TIGIConfig['billing']['provider']

  return {
    app: {
      url:     optional('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000',
      name:    optional('NEXT_PUBLIC_APP_NAME') ?? 'TIGI',
      nodeEnv: process.env.NODE_ENV ?? 'development',
    },
    auth: {
      // AUTH_SECRET is required in production; NextAuth will error without it
      secret:             optional('AUTH_SECRET') ?? '',
      googleClientId:     optional('GOOGLE_CLIENT_ID'),
      googleClientSecret: optional('GOOGLE_CLIENT_SECRET'),
    },
    database: {
      // DATABASE_URL is always required — the app cannot run without it
      url: optional('DATABASE_URL') ?? '',
    },
    redis: {
      url:   optional('REDIS_URL'),
      token: optional('REDIS_TOKEN'),
    },
    ai: {
      provider:     aiProvider,
      anthropicKey: optional('ANTHROPIC_API_KEY'),
      openaiKey:    optional('OPENAI_API_KEY'),
    },
    storage: {
      provider:      storageProvider,
      r2AccountId:   optional('R2_ACCOUNT_ID'),
      r2AccessKeyId: optional('R2_ACCESS_KEY_ID'),
      r2SecretKey:   optional('R2_SECRET_ACCESS_KEY'),
      r2BucketName:  optional('R2_BUCKET_NAME'),
      r2PublicUrl:   optional('R2_PUBLIC_URL'),
    },
    solana: {
      network:     optional('SOLANA_NETWORK') ?? 'devnet',
      serverRpc:   optional('SOLANA_RPC_URL'),
      clientRpc:   optional('NEXT_PUBLIC_SOLANA_RPC_URL'),
      platformKey: optional('PLATFORM_WALLET_SECRET'),
    },
    kyc: {
      provider:        kycProvider,
      sumsubApiKey:    optional('SUMSUB_API_KEY'),
      sumsubSecretKey: optional('SUMSUB_SECRET_KEY'),
    },
    billing: {
      provider:              billingProvider,
      stripeSecretKey:       optional('STRIPE_SECRET_KEY'),
      stripeWebhookSecret:   optional('STRIPE_WEBHOOK_SECRET'),
      priceIdProMonthly:     optional('STRIPE_PRO_MONTHLY_PRICE_ID'),
      priceIdProAnnual:      optional('STRIPE_PRO_ANNUAL_PRICE_ID'),
      priceIdProPlusMonthly: optional('STRIPE_PRO_PLUS_MONTHLY_PRICE_ID'),
      priceIdProPlusAnnual:  optional('STRIPE_PRO_PLUS_ANNUAL_PRICE_ID'),
    },
    features: {
      walletConnect: bool('NEXT_PUBLIC_ENABLE_WALLET_CONNECT', true),
      aiFeatures:    bool('NEXT_PUBLIC_ENABLE_AI_FEATURES', false),
      maintenance:   bool('NEXT_PUBLIC_MAINTENANCE_MODE', false),
    },
  }
}

// ── Singleton ────────────────────────────────────────────────────────────────
// Config is built once per process. Safe to import anywhere.

export const config: TIGIConfig = buildConfig()

// ── Startup validation ───────────────────────────────────────────────────────
// Call assertRequiredConfig() once at boot (e.g. from instrumentation.ts)
// to surface missing critical env vars before any request is served.

export function assertRequiredConfig(): void {
  const errors: string[] = []

  if (!process.env.AUTH_SECRET) {
    errors.push('AUTH_SECRET — required for session signing')
  }
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL — required for Prisma')
  }
  if (config.ai.provider === 'anthropic' && !config.ai.anthropicKey) {
    errors.push('ANTHROPIC_API_KEY — required when AI_PROVIDER=anthropic')
  }
  if (config.ai.provider === 'openai' && !config.ai.openaiKey) {
    errors.push('OPENAI_API_KEY — required when AI_PROVIDER=openai')
  }
  if (config.storage.provider === 'r2') {
    if (!config.storage.r2AccountId)   errors.push('R2_ACCOUNT_ID — required when STORAGE_PROVIDER=r2')
    if (!config.storage.r2AccessKeyId) errors.push('R2_ACCESS_KEY_ID — required when STORAGE_PROVIDER=r2')
    if (!config.storage.r2SecretKey)   errors.push('R2_SECRET_ACCESS_KEY — required when STORAGE_PROVIDER=r2')
    if (!config.storage.r2BucketName)  errors.push('R2_BUCKET_NAME — required when STORAGE_PROVIDER=r2')
  }
  if (config.kyc.provider === 'sumsub') {
    if (!config.kyc.sumsubApiKey)    errors.push('SUMSUB_API_KEY — required when KYC_PROVIDER=sumsub')
    if (!config.kyc.sumsubSecretKey) errors.push('SUMSUB_SECRET_KEY — required when KYC_PROVIDER=sumsub')
  }
  if (config.billing.provider === 'stripe') {
    if (!config.billing.stripeSecretKey)     errors.push('STRIPE_SECRET_KEY — required when BILLING_PROVIDER=stripe')
    if (!config.billing.stripeWebhookSecret) errors.push('STRIPE_WEBHOOK_SECRET — required when BILLING_PROVIDER=stripe')
    if (!config.billing.priceIdProMonthly)   errors.push('STRIPE_PRO_MONTHLY_PRICE_ID — required when BILLING_PROVIDER=stripe')
    if (!config.billing.priceIdProAnnual)    errors.push('STRIPE_PRO_ANNUAL_PRICE_ID — required when BILLING_PROVIDER=stripe')
    if (!config.billing.priceIdProPlusMonthly) errors.push('STRIPE_PRO_PLUS_MONTHLY_PRICE_ID — required when BILLING_PROVIDER=stripe')
    if (!config.billing.priceIdProPlusAnnual)  errors.push('STRIPE_PRO_PLUS_ANNUAL_PRICE_ID — required when BILLING_PROVIDER=stripe')
  }

  if (errors.length > 0) {
    const list = errors.map(e => `  • ${e}`).join('\n')
    throw new Error(
      `[config] TIGI startup failed — missing required environment variables:\n${list}\n\n` +
      `  Copy .env.example to .env.local and fill in the missing values.`,
    )
  }
}
