# Project skills for building the TIGI site

Installed from the repos in Nate Herk's Claude repo picks video (https://www.youtube.com/watch?v=HhZdNYI4pJs),
keeping the ones that apply to this codebase (Next.js 15, Tailwind, Prisma, Stripe, Vercel). Claude Code loads
every folder here as a skill when it works in this repo. Licences are in `../licenses/`.

| Skill | Source (commit) | Why it's here |
|---|---|---|
| scroll-craft | nateherkai/scroll-craft (75d81f7), MIT | Scroll-driven page design + the engine in `src/vendor/scrollcraft` |
| humanizer | blader/humanizer (225a6f3), MIT | Edits site copy for AI-writing tells |
| stripe-best-practices | stripe/ai (4f842d4), MIT | The app uses `stripe` (fees, subscriptions, payments) |
| playwright-cli | microsoft/playwright-cli (b85c7a7), Apache-2.0 | Browser testing of pages and flows; needs `npm i -g @playwright/cli@latest` |
| frontend-ui-engineering, performance-optimization, code-review-and-quality, security-and-hardening, shipping-and-launch, spec-driven-development, planning-and-task-breakdown, debugging-and-error-recovery, incremental-implementation, browser-testing-with-devtools | addyosmani/agent-skills (aeac41d), MIT | Engineering workflow; their shared checklists are in `../references/` |

Plugin enabled in `../settings.json`: **claude-security** (anthropics/claude-plugins-official, Apache-2.0), security review
with proposed patches; Claude Code offers to install it when the project is trusted.

Not installed (not relevant to this site): HyperFrames (HTML → video), Google Workspace CLI, Apify MCP Server,
Expo Skills (React Native), Supabase Agent Skills (the app uses Prisma, not Supabase), OpenSEO (needs an OpenSEO
account and its MCP server; worth adding when the marketing site is ready for an SEO pass).
