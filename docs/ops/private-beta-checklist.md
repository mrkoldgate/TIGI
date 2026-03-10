# TIGI — Private Beta Launch Checklist

> **Branch:** `private-beta-launch`  
> **Target:** Staging URL live, first testers onboarded  
> **Status columns:** ⬜ Not started · 🟡 In progress · ✅ Done · ❌ Blocked

---

## 1. Infrastructure Provisioning

| # | Task | Owner | Status |
|---|---|---|---|
| 1.1 | Provision hosted PostgreSQL (Neon or Supabase) | Eng | ⬜ |
| 1.2 | Note `DATABASE_URL` and `DIRECT_URL` (for connection pooling) | Eng | ⬜ |
| 1.3 | Create Vercel project linked to GitHub repo | Eng | ⬜ |
| 1.4 | Provision Cloudflare R2 bucket for file uploads | Eng | ⬜ |
| 1.5 | Configure custom staging domain (optional) or use Vercel default | Eng | ⬜ |

---

## 2. Environment Variables

Set all in Vercel dashboard → Settings → Environment Variables.

| # | Variable | Source | Status |
|---|---|---|---|
| 2.1 | `DATABASE_URL` | Neon/Supabase | ⬜ |
| 2.2 | `DIRECT_URL` | Neon/Supabase (non-pooled) | ⬜ |
| 2.3 | `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ⬜ |
| 2.4 | `NEXTAUTH_URL` | Staging URL | ⬜ |
| 2.5 | `STRIPE_SECRET_KEY` | Stripe Dashboard (test mode) | ⬜ |
| 2.6 | `STRIPE_WEBHOOK_SECRET` | Stripe CLI or Dashboard | ⬜ |
| 2.7 | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard (test mode) | ⬜ |
| 2.8 | `AI_PROVIDER` | `anthropic` (or `mock` to disable) | ⬜ |
| 2.9 | `ANTHROPIC_API_KEY` | Anthropic Console | ⬜ |
| 2.10 | `R2_ACCESS_KEY_ID` | Cloudflare R2 | ⬜ |
| 2.11 | `R2_SECRET_ACCESS_KEY` | Cloudflare R2 | ⬜ |
| 2.12 | `R2_ENDPOINT` | Cloudflare R2 | ⬜ |
| 2.13 | `R2_BUCKET_NAME` | Cloudflare R2 | ⬜ |
| 2.14 | `NEXT_PUBLIC_SOLANA_RPC_URL` | Helius/QuickNode devnet or `https://api.devnet.solana.com` | ⬜ |
| 2.15 | `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | ⬜ |

---

## 3. Stripe Test Mode Verification

| # | Check | Status |
|---|---|---|
| 3.1 | Create Products and Prices in Stripe test mode (Pro $29/mo, Pro+ $79/mo) | ⬜ |
| 3.2 | Update `src/lib/billing/plans.ts` with real Stripe Price IDs | ⬜ |
| 3.3 | Register staging webhook endpoint in Stripe Dashboard (`/api/billing/webhook`) | ⬜ |
| 3.4 | Test checkout flow with card `4242 4242 4242 4242` | ⬜ |
| 3.5 | Verify webhook fires and user `subscriptionTier` updates in DB | ⬜ |
| 3.6 | Test customer portal link opens correctly | ⬜ |
| 3.7 | Test subscription cancellation updates tier back to `free` | ⬜ |

---

## 4. Anthropic Provider Verification

| # | Check | Status |
|---|---|---|
| 4.1 | Set `AI_PROVIDER=anthropic` in Vercel env | ⬜ |
| 4.2 | Open AI Assistant panel → send message → verify streaming response | ⬜ |
| 4.3 | View property detail → verify AI valuation narrative appears (Pro user) | ⬜ |
| 4.4 | Verify cost tracker blocks requests after budget ceiling | ⬜ |
| 4.5 | Verify free-tier user sees upgrade CTA instead of premium AI content | ⬜ |

---

## 5. Phantom Wallet Signing Verification

| # | Check | Status |
|---|---|---|
| 5.1 | Install Phantom browser extension (or Solflare) | ⬜ |
| 5.2 | Switch Phantom to Devnet (Settings → Developer Settings → Devnet) | ⬜ |
| 5.3 | Airdrop 2 SOL via Phantom or `solana airdrop 2` | ⬜ |
| 5.4 | Create investment intent from property detail page | ⬜ |
| 5.5 | Verify Phantom prompt appears with memo transaction details | ⬜ |
| 5.6 | Approve transaction → verify intent status changes to `EXECUTED` | ⬜ |
| 5.7 | Verify Solana Explorer link is valid and shows memo data | ⬜ |
| 5.8 | Test rejection flow — Phantom "Reject" → verify graceful error message | ⬜ |

---

## 6. R2 Upload Verification

| # | Check | Status |
|---|---|---|
| 6.1 | Upload profile avatar from Settings page | ⬜ |
| 6.2 | Verify avatar persists after page refresh (served from R2 URL) | ⬜ |
| 6.3 | Upload listing image during listing creation | ⬜ |
| 6.4 | Upload KYC document during onboarding | ⬜ |
| 6.5 | Verify file size limits enforced (5MB images, 10MB documents) | ⬜ |

---

## 7. Database Migration Verification

| # | Check | Status |
|---|---|---|
| 7.1 | Run `prisma migrate deploy` against hosted DB | ⬜ |
| 7.2 | Run `prisma db seed` to populate initial data | ⬜ |
| 7.3 | Verify marketplace shows seeded properties | ⬜ |
| 7.4 | Verify admin dashboard shows real user/listing counts | ⬜ |
| 7.5 | Verify `/api/health` returns `{ db: true }` | ⬜ |

---

## 8. Staging Deployment Verification

| # | Check | Status |
|---|---|---|
| 8.1 | Push `private-beta-launch` branch → Vercel auto-builds | ⬜ |
| 8.2 | Build completes with zero errors | ⬜ |
| 8.3 | Staging URL loads homepage | ⬜ |
| 8.4 | All API routes resolve (no 500s on `/api/health`) | ⬜ |
| 8.5 | Middleware runs (security headers present in response) | ⬜ |
| 8.6 | Auth cookies set correctly (no cross-domain issues) | ⬜ |

---

## 9. Critical Flow QA (Before Inviting Testers)

Test each flow end-to-end on the staging URL.

| # | Flow | Device | Status |
|---|---|---|---|
| 9.1 | Register new account → login → see dashboard | Desktop Chrome | ⬜ |
| 9.2 | Browse marketplace → view property detail → save to favorites | Desktop Chrome | ⬜ |
| 9.3 | Submit inquiry on property → verify seller sees it | Desktop Chrome | ⬜ |
| 9.4 | Create listing (as Owner) → verify it appears in marketplace | Desktop Chrome | ⬜ |
| 9.5 | Invest in property → Phantom signs → intent executed | Desktop Chrome | ⬜ |
| 9.6 | Upgrade to Pro → verify premium AI features unlock | Desktop Chrome | ⬜ |
| 9.7 | Compare 2–3 properties side-by-side | Desktop Chrome | ⬜ |
| 9.8 | Edit profile settings → verify persistence | Desktop Chrome | ⬜ |
| 9.9 | Admin login → view analytics → review queue actions | Desktop Chrome | ⬜ |
| 9.10 | Repeat flows 9.1–9.3 on mobile Safari (375px) | iOS Safari | ⬜ |

---

## 10. Tester Onboarding

| # | Step | Status |
|---|---|---|
| 10.1 | Prepare tester invite list (5–10 people max for first wave) | ⬜ |
| 10.2 | Write onboarding email with: staging URL, test credentials (or registration link), Phantom setup guide, known limitations list | ⬜ |
| 10.3 | Create shared feedback channel (Slack channel, Discord, or GitHub Discussions) | ⬜ |
| 10.4 | Share `docs/ops/tester-feedback-template.md` format | ⬜ |
| 10.5 | Set beta testing window (suggest 7–14 days) | ⬜ |
| 10.6 | Send invites | ⬜ |

---

## 11. Issue Logging Process

### For Testers

Use the feedback template (`tester-feedback-template.md`):

- **What happened** — describe the issue
- **Steps to reproduce** — numbered steps
- **Expected behavior** — what should have happened
- **Screenshot/recording** — attach if possible
- **Device/browser** — e.g. Chrome 120, iPhone 15 Safari
- **Severity** — Blocker / Major / Minor / Cosmetic

### For Engineering

| Severity | Response Time | Action |
|---|---|---|
| **Blocker** (app crashes, data loss) | < 2 hours | Hotfix immediately |
| **Major** (broken flow, wrong data) | < 24 hours | Fix in current sprint |
| **Minor** (UI glitch, slow load) | Next sprint | Backlog |
| **Cosmetic** (alignment, copy) | Next sprint | Backlog |

---

## 12. Rollback & Hotfix Guidance

### Rollback (If Staging Is Broken)

```bash
# Revert to last known good commit
git revert HEAD --no-edit
git push origin private-beta-launch

# Or redeploy previous Vercel deployment from dashboard:
# Vercel → Deployments → click three dots on previous → Redeploy
```

### Hotfix Process

```bash
# 1. Branch from private-beta-launch
git checkout -b hotfix/description private-beta-launch

# 2. Fix the issue, commit
git add .
git commit -m "Hotfix: description of fix"

# 3. Merge back
git checkout private-beta-launch
git merge hotfix/description
git push origin private-beta-launch

# 4. Vercel auto-deploys on push
```

### Emergency Kill Switches

| Switch | How |
|---|---|
| Disable AI | Set `AI_PROVIDER=mock` in Vercel env → redeploy |
| Disable Stripe | Remove `STRIPE_SECRET_KEY` → billing routes return graceful errors |
| Disable Solana | Set `NEXT_PUBLIC_SOLANA_NETWORK=disabled` → wallet features hidden |
| Full maintenance | Set `MAINTENANCE_MODE=true` → middleware redirects all requests to maintenance page |

---

## Launch Sequence (Day-of)

```
1. ✅ All sections 1–8 complete
2. ✅ Critical flow QA passed (Section 9)
3. ✅ Tester onboarding materials ready (Section 10)
4. 🚀 Send tester invites
5. 📊 Monitor error logs for first 2 hours
6. 📝 Triage incoming feedback daily
```
