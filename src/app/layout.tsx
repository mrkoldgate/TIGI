import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { CustomCursor } from '@/components/ui/custom-cursor'
import './globals.css'

// ---------------------------------------------------------------------------
// Font — Inter: geometric sans-serif, premium tech aesthetic
// ---------------------------------------------------------------------------

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

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
  themeColor: '#020409',
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
      className={inter.variable}
    >
      <head>
        {/* JetBrains Mono via Google Fonts CDN — code / mono contexts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#020409] text-[#F8FAFC] antialiased">
        <CustomCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
