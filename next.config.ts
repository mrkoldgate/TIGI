import type { NextConfig } from 'next'

// ---------------------------------------------------------------------------
// R2 custom domain support
// When R2_PUBLIC_URL is set to a custom domain (e.g. https://assets.tigi.com
// or https://pub-abc.r2.dev), parse the hostname and add it to remotePatterns
// so Next.js Image can serve uploaded files from that domain.
// The wildcard *.r2.cloudflarestorage.com below covers the S3-compatible API
// endpoint only — not r2.dev public URLs or custom domains.
// ---------------------------------------------------------------------------
const r2ExtraHostname = (() => {
  const r2Url = process.env.R2_PUBLIC_URL
  if (!r2Url) return undefined
  try {
    const { hostname } = new URL(r2Url)
    if (!hostname || hostname.endsWith('.r2.cloudflarestorage.com')) return undefined
    return hostname
  } catch {
    return undefined
  }
})()

const nextConfig: NextConfig = {
  experimental: {
    // Enable React 19 features
    reactCompiler: false,
    // Enable src/instrumentation.ts for startup config validation
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      // Placeholder image services for seed data
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      // Local dev: uploads written to public/uploads/ by LocalStorageProvider
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      // Production storage — R2 S3-compatible API endpoint
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      // R2 public bucket URL (r2.dev) and custom domains
      ...(r2ExtraHostname ? [{ protocol: 'https' as const, hostname: r2ExtraHostname }] : []),
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Strict mode for better development experience
  reactStrictMode: true,
}

export default nextConfig
