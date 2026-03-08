import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// GET /api/health
// Basic health check endpoint for uptime monitoring and deployment verification.
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      app: 'tigi',
      version: process.env.npm_package_version ?? '0.1.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
