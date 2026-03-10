import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Syne } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

// ---------------------------------------------------------------------------
// Font loading — distinctive premium typography
// ---------------------------------------------------------------------------

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
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
  themeColor: '#050508',
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
      className={`${playfair.variable} ${syne.variable}`}
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
      <body className="min-h-screen bg-[#050508] text-[#F0EDE6] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
