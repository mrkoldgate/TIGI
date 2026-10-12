// ---------------------------------------------------------------------------
// build-demo-db.mjs — runs during `npm run build` on Vercel only.
//
// The schema currently uses SQLite (file:./dev.db), which works on a laptop but
// has no file to open on Vercel. This script creates prisma/dev.db at build
// time and fills it with the demo seed, so preview deployments can sign in
// with the demo accounts. src/lib/db.ts copies the file to /tmp at runtime.
//
// Demo data only: each server instance gets its own copy, and anything written
// (orders, edits) resets when the instance recycles. Swap to a hosted Postgres
// before real users arrive.
// ---------------------------------------------------------------------------
import { execSync } from 'node:child_process'

if (!process.env.VERCEL) {
  console.log('[demo-db] Not on Vercel — skipping (your local dev.db is untouched).')
  process.exit(0)
}

const run = (cmd) => execSync(cmd, { stdio: 'inherit', env: process.env })

try {
  console.log('[demo-db] Creating SQLite schema…')
  run('npx prisma db push --skip-generate --accept-data-loss')
  console.log('[demo-db] Seeding demo accounts and listings…')
  run('npx tsx prisma/seed.ts')
  console.log('[demo-db] Done.')
} catch (err) {
  // Never fail the whole deploy over demo data — the marketing site still works.
  console.warn('[demo-db] Could not build the demo database:', err?.message ?? err)
}
