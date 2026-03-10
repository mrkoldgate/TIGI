# TIGI — Private Beta Launch Risks

> **Last updated:** March 9, 2026  
> **Severity:** 🔴 High · 🟡 Medium · 🟢 Low

---

## 1. Auth / Session Issues

| | |
|---|---|
| **Risk** | Sessions fail on staging due to `NEXTAUTH_SECRET` or `NEXTAUTH_URL` mismatch |
| **Impact** | 🔴 Users cannot log in — entire platform inaccessible |
| **Symptom** | Login redirects back to sign-in page, JWT decode errors in logs, `401` on all API calls |
| **Mitigation** | Verify `NEXTAUTH_URL` matches the exact staging URL (including `https://`). Generate a fresh `NEXTAUTH_SECRET` per environment. |
| **Fallback** | Rotate `NEXTAUTH_SECRET` in Vercel dashboard → redeploy. All existing sessions invalidated (acceptable for beta). |

---

## 2. Prisma / DB Migration Problems

| | |
|---|---|
| **Risk** | `prisma migrate deploy` fails on hosted DB, or schema drift causes runtime query errors |
| **Impact** | 🔴 All data-backed pages return empty or crash |
| **Symptom** | `PrismaClientKnownRequestError` in logs, marketplace shows zero listings, 500 errors on dashboard |
| **Mitigation** | Run `prisma migrate deploy` (not `dev`) on staging. Test with `prisma db seed` immediately after. Verify `/api/health` returns `db: true`. |
| **Fallback** | If migration is corrupt: `prisma migrate reset` on staging DB (destroys data — acceptable for beta). Re-seed. |

---

## 3. Missing Environment Variables

| | |
|---|---|
| **Risk** | One or more env vars missing in Vercel, causing silent failures |
| **Impact** | 🟡 Specific features break (AI returns mock, billing 500s, uploads fail) — app doesn't crash |
| **Symptom** | Features that worked locally don't work on staging. Console shows `undefined` for config values. |
| **Mitigation** | Cross-reference `docs/ops/env-vars.md` against Vercel dashboard before first deploy. `src/lib/config.ts` validates required vars at startup. |
| **Fallback** | Add missing var in Vercel → redeploy. No code change needed. |

---

## 4. Stripe Flow Failures

| | |
|---|---|
| **Risk** | Checkout session creation fails, or webhook doesn't fire on subscription completion |
| **Impact** | 🟡 Users can't upgrade to Pro — premium features remain locked |
| **Symptom** | "Upgrade" button returns error or redirects to broken Stripe page. User pays but tier doesn't update. |
| **Mitigation** | Use test-mode keys. Register webhook endpoint (`/api/billing/webhook`) in Stripe Dashboard with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Test with `4242 4242 4242 4242`. |
| **Fallback** | Manually update user `subscriptionTier` in DB via Prisma Studio. Disable billing CTA by setting `STRIPE_SECRET_KEY` to empty. |

---

## 5. Anthropic Provider Failures

| | |
|---|---|
| **Risk** | API key invalid, rate limited, or LLM returns unexpected format |
| **Impact** | 🟡 AI assistant and premium valuations show errors instead of content |
| **Symptom** | Assistant panel shows "Something went wrong", valuation narrative missing, 429 errors in logs |
| **Mitigation** | Cost tracker enforces per-user daily budget ceiling. Assistant pipeline has try/catch returning graceful error blocks. Monitor Anthropic usage dashboard. |
| **Fallback** | Set `AI_PROVIDER=mock` in Vercel → redeploy. All AI features revert to deterministic rule-based output. Zero code changes. |

---

## 6. Phantom Wallet Signing Issues

| | |
|---|---|
| **Risk** | Wallet adapter fails to connect, SSR hydration mismatch, or signed transaction rejected by Solana |
| **Impact** | 🟡 Investment intent flow completes in DB but never reaches on-chain |
| **Symptom** | "Connect Wallet" button unresponsive, React hydration error in console, Phantom popup doesn't appear, or transaction fails with `BlockhashNotFound` |
| **Mitigation** | Wallet components isolated in `"use client"` boundaries. `validatePreparation()` checks blockhash freshness before showing sign button. Devnet test script validates backend pipeline independently. |
| **Fallback** | If wallet adapter is broken: intent flow still works (DB-only, no on-chain). Users see "Pending wallet signature" status. Fix and re-prompt. |

---

## 7. R2 Upload Failures

| | |
|---|---|
| **Risk** | R2 credentials wrong, bucket doesn't exist, or CORS blocks browser uploads |
| **Impact** | 🟢 File uploads fail — listings created without images, avatars don't save |
| **Symptom** | Upload button shows error toast, images show broken placeholder, 403 from R2 endpoint |
| **Mitigation** | Configure R2 bucket CORS to allow staging origin. Test upload before inviting testers. File size validation runs client-side before upload attempt. |
| **Fallback** | Remove R2 env vars → `StorageProvider` falls back to `LocalStorageProvider` (writes to `public/uploads/`). Works on Vercel but files are ephemeral (lost on redeploy). Acceptable for beta. |

---

## 8. Role / Permission Bugs

| | |
|---|---|
| **Risk** | RBAC checks too strict (block legitimate users) or too loose (expose admin routes) |
| **Impact** | 🟡 Users can't access features they should, or non-admins see admin pages |
| **Symptom** | 403 errors on legitimate actions, or testers discover admin dashboard is publicly accessible |
| **Mitigation** | `rbac.ts` has 11 named permissions tested in `rbac.test.ts`. Middleware checks role on every request. Seed data includes users at each role level for QA. |
| **Fallback** | If too strict: temporarily widen permission in `PERMISSION_MAP` → deploy. If too loose: add explicit `requireApiAuth('ADMIN')` guard → deploy. |

---

## 9. Broken Dashboard Data

| | |
|---|---|
| **Risk** | Dashboard KPIs, portfolio stats, or admin analytics show wrong numbers or NaN |
| **Impact** | 🟢 Confusing UX but no data loss |
| **Symptom** | "$NaN" in portfolio value, "0 listings" when there are 24, negative ROI percentages |
| **Mitigation** | All formatters (`formatPrice`, `fmtPct`) have null/NaN guards. Seed data populates realistic values. Verify admin analytics match `SELECT COUNT(*)` after seeding. |
| **Fallback** | Fix formatter, re-seed if data is corrupt. Dashboard components have loading/error states that catch rendering failures. |

---

## 10. Staging vs Local Mismatches

| | |
|---|---|
| **Risk** | Features work locally but break on Vercel due to edge runtime, serverless cold starts, or missing Node APIs |
| **Impact** | 🟡 Random 500 errors on specific routes |
| **Symptom** | Route works on `localhost:3000` but returns 500 on staging. Vercel logs show `ReferenceError: crypto is not defined` or similar. |
| **Mitigation** | Run `npm run build` locally before deploying (catches most TS/import issues). `vercel.json` configures correct runtime per route. Middleware uses edge-safe `authConfig` (no Prisma, no bcrypt). |
| **Fallback** | Add `export const runtime = 'nodejs'` to failing route if it needs Node APIs. Redeploy. |

---

## 11. Unclear User Messaging in Blockchain / Legal Flows

| | |
|---|---|
| **Risk** | Beta testers misunderstand Solana transactions as real financial commitments, or interpret legal disclaimers as binding advice |
| **Impact** | 🔴 Reputational / legal risk if testers believe they made real investments |
| **Symptom** | Tester feedback like "I invested $5,000 — where's my property?" or "Your legal advice says..." |
| **Mitigation** | All transaction UIs include "Devnet — No Real Value" badge. Legal pages carry "informational only, not legal advice" disclaimers (per `legal-assumptions.md`). Onboarding email explicitly states: "This is a test environment using Solana Devnet. No real money or property is involved." |
| **Fallback** | Add a persistent global banner: "⚠️ BETA — Devnet Only — No Real Transactions" across all pages. One-line middleware change. |

---

## Risk Summary Matrix

| # | Risk | Severity | Likelihood | Quick Fix Available? |
|---|---|---|---|---|
| 1 | Auth/session | 🔴 High | Medium | ✅ Rotate secret |
| 2 | DB migration | 🔴 High | Medium | ✅ Reset + re-seed |
| 3 | Missing env vars | 🟡 Medium | High | ✅ Add in Vercel |
| 4 | Stripe | 🟡 Medium | Medium | ✅ Manual DB update |
| 5 | Anthropic | 🟡 Medium | Low | ✅ Swap to mock |
| 6 | Phantom wallet | 🟡 Medium | Medium | ✅ DB-only fallback |
| 7 | R2 uploads | 🟢 Low | Medium | ✅ Local fallback |
| 8 | RBAC bugs | 🟡 Medium | Low | ✅ Permission tweak |
| 9 | Dashboard data | 🟢 Low | Low | ✅ Re-seed |
| 10 | Staging mismatch | 🟡 Medium | Medium | ✅ Runtime flag |
| 11 | Blockchain/legal messaging | 🔴 High | Low | ✅ Global banner |
