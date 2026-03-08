import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// TIGI Next.js Middleware
//
// Execution order:
//   1. Auth check (session cookie presence)
//   2. Route protection (public vs authenticated vs admin)
//   3. Rate limiting placeholder (Redis in M2)
//
// Auth verification:
//   M1 (scaffold): Cookie presence check only.
//   M2 (auth): Replace with NextAuth auth() session verification.
//
// ---------------------------------------------------------------------------

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/investors',
  '/owners',
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/legal',
  '/marketplace', // public browsing — investment requires auth
  '/api/health',
]

// Routes that require ADMIN role
const ADMIN_ROUTES = ['/admin']

// Routes that require any authenticated user
const PROTECTED_ROUTES = [
  '/portfolio',
  '/transactions',
  '/listings',
  '/inheritance',
  '/leasing',
  '/management',
  '/settings',
  '/api/properties',
  '/api/tokens',
  '/api/transactions',
  '/api/ai',
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ---------------------------------------------------------------------------
  // M1 SCAFFOLD: Minimal auth check (cookie presence only).
  // Replace this entire block in M2 with:
  //   const session = await auth()
  //   if (!session?.user) redirect to /auth/login
  //   if (isAdminRoute && session.user.role !== 'ADMIN') redirect to /marketplace
  // ---------------------------------------------------------------------------

  const hasSession = request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token')

  // Admin routes — require session (role check handled in page/route handler for now)
  if (isAdminRoute(pathname) && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protected routes — require session
  if (isProtectedRoute(pathname) && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (hasSession && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL('/marketplace', request.url))
  }

  // Add security headers to all responses
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icons, public images
     * - api/health (health check — always public)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons/|images/).*)',
  ],
}
