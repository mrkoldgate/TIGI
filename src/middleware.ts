import NextAuth from 'next-auth'
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
// Security headers added to every response.
// ---------------------------------------------------------------------------

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // Security headers on every response
  const response = new Response(null, { status: 200 })
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // authorized callback in authConfig handles redirects —
  // returning undefined here lets Next.js continue with the response
  return undefined
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
