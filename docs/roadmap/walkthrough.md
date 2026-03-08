# Milestone 1 — Progress Audit

> **Date:** March 8, 2026  
> **Auditor:** Mission Controller  
> **Scope:** Codebase review against M1 implementation plan, PRD, MVP scope, and design principles

---

## 1. What Appears Complete ✅

| Task | Status | Evidence |
|---|---|---|
| **T1: Project Scaffold** | ✅ Complete | Next.js 15, TS strict, Tailwind v4, App Router, `src/` directory, `.env.example`, `next.config.ts` |
| **T2: Design Tokens** | ✅ Complete | [globals.css](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/app/globals.css) (425 lines) — all colors, typography, spacing, animations, gradients, scrollbar, selection match [design-principles.md](file:///Users/issamac/.gemini/antigravity/scratch/tigi/docs/product/design-principles.md) exactly |
| **T3: shadcn/ui (partial)** | ⚠️ Partial | [button.tsx](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/components/ui/button.tsx) (5 variants + loading), `card.tsx`, `badge.tsx`, `input.tsx`, `skeleton.tsx` present. Missing: `dialog`, `dropdown-menu`, `sheet`, `tooltip`, `avatar`, `separator`, `scroll-area`, `tabs`, `table` |
| **T5: Global Layout** | ✅ Complete | [sidebar.tsx](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/components/layout/sidebar.tsx) (213 lines, collapse, mobile overlay, gold active state), `top-nav.tsx`, `app-shell.tsx`, [(platform)/layout.tsx](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/components/wallet/wallet-provider.tsx#30-31), [(marketing)/layout.tsx](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/components/wallet/wallet-provider.tsx#30-31), `marketing-nav.tsx`, `marketing-footer.tsx` |
| **T6: Homepage** | ✅ Complete | [(marketing)/page.tsx](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/components/wallet/wallet-provider.tsx#30-31) (839 lines) — Hero, Featured Properties, Platform Areas, AI+Invest, Land/Legacy, CTA. Matches PRD and design spec. |
| **T8: Auth Shell** | ✅ Complete | Login, register, email verify pages. [auth.config.ts](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/auth.config.ts) + [auth.ts](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/auth.ts) (NextAuth v5). Sessions, OAuth config, credentials provider all present. |
| **T9: Role-Ready Model** | ✅ Complete | [rbac.ts](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/lib/auth/rbac.ts) (108 lines, 10 permission checks), [types/index.ts](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/types/index.ts) (261 lines, 38 interfaces). Roles: `INVESTOR | OWNER | BOTH | ADMIN | COMPLIANCE_OFFICER`. Permission matrix maps [role-matrix.md](file:///Users/issamac/.gemini/antigravity/scratch/tigi/docs/flows/role-matrix.md). |
| **T10: Wallet Shell** | ✅ Complete | [wallet-provider.tsx](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/components/wallet/wallet-provider.tsx) (Phantom + Solflare, Devnet), `wallet-button.tsx`, `wallet-modal.tsx`, `wallet-display.tsx`, `use-tigi-wallet.ts`, settings wallet page. `solana/client.ts` + `custodial.ts`. |

**Also implemented beyond M1 plan:**
- Onboarding flow (role selection, profile, interests, completion) — 11 files
- Admin shell layout (`admin-shell.tsx`, admin dashboard page)
- Prisma schema with core models
- Middleware with route protection
- API routes: register, role update, onboarding, wallet connect/disconnect, health check

---

## 2. What Is Still Missing From M1 ❌

### 2a. Missing shadcn/ui Components (T3 gap)

9 of 14 planned shadcn components are not installed:

| Component | Needed For | Impact |
|---|---|---|
| `dialog.tsx` | Investment modal, confirmation dialogs, wallet modal | **High** — blocks M3 investment flow |
| `dropdown-menu.tsx` | Top-nav user menu, settings options | **High** — top nav menu incomplete |
| `sheet.tsx` | Mobile sidebar overlay (currently using custom implementation) | **Medium** — custom impl works but diverges from component system |
| `tooltip.tsx` | Icon-only sidebar labels, data explanations | **Medium** |
| `tabs.tsx` | Property detail tabs, settings tabs | **High** — blocks M3 property detail |
| `table.tsx` | Transaction history, admin tables | **Medium** — blocks M3+M4 |
| `avatar.tsx` | User avatar in nav/sidebar | **Low** — [InitialsAvatar](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/components/shared/placeholder-image.tsx#163-189) exists as custom |
| `separator.tsx` | Visual dividers | **Low** |
| `scroll-area.tsx` | Sidebar scroll, long content | **Low** |

### 2b. Missing Custom Atom Components (T4 gap)

| Component | Status | Plan Reference |
|---|---|---|
| `stat-card.tsx` | ❌ Not created | T4 — needed for portfolio, analytics, dashboards |
| `property-card.tsx` (reusable) | ⚠️ Inline in homepage only | T4 — not extracted as reusable component |
| `status-badge.tsx` | ⚠️ Basic `badge.tsx` exists, no property-specific variants | T4 |
| `section-header.tsx` | ⚠️ `page-header.tsx` exists but different pattern | T4 |
| `empty-state.tsx` | ⚠️ Inline patterns exist, not extracted as reusable | T4 |

### 2c. Platform Shell Pages Violate MVP Principle (T11 gap)

Current platform pages show **"Coming in M3/M4/M5" labels** — this violates [mvp-scope.md](file:///Users/issamac/.gemini/antigravity/scratch/tigi/docs/product/mvp-scope.md) §1 Rule 1:

> *"No 'coming soon' placeholders on live pages."*

| Page | Current State | Should Be |
|---|---|---|
| `/marketplace` | "Marketplace Coming in M3" | Mock property grid with cards |
| `/portfolio` | "Portfolio Coming in M4" | Stat cards (zeroed) + empty holding state |
| `/transactions` | Likely similar | Transaction list empty state |
| `/listings` | ❌ Route exists only via sidebar | Owner listing empty state |
| `/inheritance` | ❌ No page | Advisory banner + empty state |
| `/leasing` | ❌ No page | Empty state |
| `/analytics` | ❌ No page | Empty state |
| `/settings` | Basic page exists | Settings tabs (Profile, Wallet, Security) |

### 2d. Placeholder Images (T7 gap)

- No AI-generated images exist in `public/images/`
- Homepage uses Unsplash URLs via [PlaceholderImage](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/components/shared/placeholder-image.tsx#62-134) component — functional and premium-looking ✅
- **Assessment:** The Unsplash strategy is actually better than planned (real photos, no gray boxes). This is effectively **complete via a better approach** than `generate_image`. Mark T7 as complete.

---

## 3. UI Consistency Gaps

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **Hardcoded hex values** | [page.tsx](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/app/%28marketing%29/page.tsx) homepage uses raw `#C9A84C`, `#111118`, etc. instead of Tailwind tokens | **Medium** | Replace with `bg-bg-surface`, `text-gold-400`, etc. This is sustainable only if Tailwind config aliases are set — verify `tailwind.config.ts` maps the `@theme` tokens to class names |
| **Inconsistent button usage** | Homepage CTAs use raw `<Link>` with inline Tailwind classes instead of `<Button>` component | **Medium** | Refactor homepage CTAs to use `<Button asChild><Link>` pattern |
| **Missing `hover:scale-[1.02]`** | [button.tsx](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/components/ui/button.tsx) primary variant has no `hover:scale-[1.02]` — only `active:scale-[0.98]` | **Low** | Add `hover:scale-[1.02]` to primary variant per design-principles §5.4 |
| **Font loading not verified** | `layout.tsx` loads Outfit, Inter, JetBrains Mono via `next/font` — need to verify all 3 are actually applied | **Low** | Browser test at 375px/768px/1440px |

---

## 4. Technical Debt Risks

| Risk | Description | Severity | Mitigation |
|---|---|---|---|
| **Inline component definitions** | Homepage has [FeaturedPropertyCard](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/app/%28marketing%29/page.tsx#659-730), [MockAiValuationCard](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/app/%28marketing%29/page.tsx#569-643), [FeatureShowcaseCard](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/app/%28marketing%29/page.tsx#456-505) defined inline (800+ lines in one file) | **Medium** | Extract to `src/components/marketing/` before M3 |
| **Dual type definitions** | [SessionUser](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/lib/auth/rbac.ts#10-15) is defined in both [types/index.ts](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/types/index.ts) and [rbac.ts](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/lib/auth/rbac.ts) — will diverge | **High** | Consolidate: [rbac.ts](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/lib/auth/rbac.ts) should import from [types/index.ts](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/types/index.ts) |
| **No `components.json` alignment** | shadcn/ui was partially set up but 9 components are missing — future `npx shadcn add` calls may conflict with custom implementations | **Medium** | Install missing components before building custom alternatives |
| **Prisma schema not reviewed** | `prisma/schema.prisma` exists but hasn't been audited against [database-outline.md](file:///Users/issamac/.gemini/antigravity/scratch/tigi/docs/architecture/database-outline.md) | **Low** | Review in M2 (its milestone) |

---

## 5. Recommended Next Tasks (Priority Order)

### Next-1: Install Missing shadcn/ui Components
**Why first:** Every M2+ feature needs dialogs, tabs, tables, and dropdowns. Installing now prevents custom implementations that diverge from the component system.
```bash
npx -y shadcn@latest add dialog dropdown-menu sheet tooltip tabs table avatar separator scroll-area
```
**Effort:** ~10 min | **Implementation:** Direct Claude

---

### Next-2: Extract Reusable Atom Components
Extract from homepage inline code + create missing atoms:
- `src/components/ui/stat-card.tsx` — from design spec
- `src/components/ui/property-card.tsx` — from [FeaturedPropertyCard](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/app/%28marketing%29/page.tsx#659-730) inline
- `src/components/ui/empty-state.tsx` — standardized pattern
- `src/components/ui/section-header.tsx` — from `PageHeader` pattern

**Effort:** ~20 min | **Implementation:** Direct Claude

---

### Next-3: Fix Platform Shell Pages
Replace "Coming in MX" labels with proper empty states using the new `EmptyState` component. Add missing routes (`/inheritance`, `/leasing`, `/analytics`, `/listings`). Follow [mvp-scope.md](file:///Users/issamac/.gemini/antigravity/scratch/tigi/docs/product/mvp-scope.md) Rule 1.

**Effort:** ~20 min | **Implementation:** Direct Claude

---

### Next-4: Fix UI Consistency
- Refactor homepage to use `<Button>` component for CTAs
- Fix dual [SessionUser](file:///Users/issamac/.gemini/antigravity/scratch/tigi/src/lib/auth/rbac.ts#10-15) type definition
- Add `hover:scale-[1.02]` to primary button variant

**Effort:** ~15 min | **Implementation:** Direct Claude

---

### Next-5: Browser Verification (T12)
Run dev server, verify at 375px/768px/1440px:
- Fonts loading correctly
- Sidebar collapse/expand
- Homepage sections render
- Auth pages render
- Mobile responsive

**Effort:** ~15 min | **Implementation:** Direct Claude (browser tool)

---

### Next-6: Begin M2 — Database & Auth
Once above complete, M1 is done. Move to:
- Prisma schema finalization
- Real NextAuth session management
- User CRUD API routes
- RBAC enforcement in middleware

---

## Summary

**M1 is ~75% complete.** The foundation (scaffold, tokens, layout, homepage, auth, roles, wallet) is strong. The gaps are: missing shadcn components (9/14), no reusable atoms extracted, platform pages showing "coming soon" labels, and minor UI consistency issues. All gaps are mechanical — no design decisions or research needed. Estimated time to close: **~1.5 hours of focused implementation**.
