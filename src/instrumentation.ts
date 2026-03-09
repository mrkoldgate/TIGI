// ---------------------------------------------------------------------------
// instrumentation.ts — Next.js server startup hook.
//
// Runs once when the Next.js server process boots (both production and dev).
// Used to validate required environment variables early so the app fails fast
// with a helpful message rather than crashing deep inside a request handler.
//
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
// ---------------------------------------------------------------------------

export async function register() {
  // Only run validation in the Node.js runtime (not Edge).
  // Edge routes have their own lightweight config access.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertRequiredConfig } = await import('@/lib/config')
    try {
      assertRequiredConfig()
    } catch (err) {
      // Log clearly and let the process continue —
      // a hard crash here would prevent the /api/health endpoint from
      // responding, making debugging harder on deploy platforms.
      console.error(
        '\n╔════════════════════════════════════════╗\n' +
        '║  TIGI — CONFIG VALIDATION FAILED       ║\n' +
        '╚════════════════════════════════════════╝\n',
        (err as Error).message,
        '\n'
      )
    }
  }
}
