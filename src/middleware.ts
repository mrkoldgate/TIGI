import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'

// ---------------------------------------------------------------------------
// TIGI Next.js Middleware
//
// Uses Auth.js v5 edge-compatible middleware pattern:
//   - authConfig (auth.config.ts) — no Prisma, no bcrypt, edge-safe
//   - auth.authorized callback handles route protection logic
//   - JWT strategy means no DB calls in middleware
//
// Route protection is defined in authConfig.callbacks.authorized.
// Security headers injected into every response via NextResponse.next().
// ---------------------------------------------------------------------------

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // Stripe webhook must receive the raw, unmodified request body.
  // Skip any response mutation for that route.
  if (req.nextUrl.pathname === '/api/billing/webhook') {
    return NextResponse.next()
  }

  // Apply security headers to every response.
  // Must use NextResponse.next() — headers set on a plain Response are discarded.
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      // Stripe + Solana RPC (Helius + public devnet/mainnet + WebSocket for confirmations)
      "connect-src 'self' https://api.stripe.com https://*.helius-rpc.com https://api.devnet.solana.com https://api.mainnet-beta.solana.com wss://*.helius-rpc.com wss://api.devnet.solana.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  )

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico and public assets
     * - api/health (always public)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons/|images/).*)',
  ],
}
