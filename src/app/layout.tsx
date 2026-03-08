import type { Metadata, Viewport } from 'next'
import { Outfit, Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

// ---------------------------------------------------------------------------
// Font loading — Google Fonts with display=swap for performance
// ---------------------------------------------------------------------------

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
})

// JetBrains Mono loaded via next/font/local or via @font-face in CSS
// (Google Fonts doesn't host JetBrains Mono — use local or CDN)

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: 'TIGI — Tokenized Intelligent Global Infrastructure',
    template: '%s | TIGI',
  },
  description:
    'Own real estate one fraction at a time. TIGI makes property investment accessible to everyone through tokenized fractional ownership powered by Solana.',
  keywords: [
    'real estate',
    'fractional ownership',
    'property investment',
    'tokenized real estate',
    'Solana',
    'real estate marketplace',
  ],
  authors: [{ name: 'TIGI' }],
  creator: 'TIGI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'TIGI',
    title: 'TIGI — Tokenized Intelligent Global Infrastructure',
    description:
      'Own real estate one fraction at a time. The premium platform for tokenized property investment.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIGI — Tokenized Intelligent Global Infrastructure',
    description: 'Own real estate one fraction at a time.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0F',
  colorScheme: 'dark',
}

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${inter.variable}`}
    >
      <head>
        {/* JetBrains Mono via Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
