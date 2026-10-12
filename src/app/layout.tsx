import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import { Providers } from '@/components/providers'
import { RevealScript } from '@/components/motion/reveal-script'
import './globals.css'

// Fonts are self-hosted via @fontsource (Archivo wide display, Inter UI, JetBrains Mono data).

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: 'TIGI — Tokenized Intelligent Global Infrastructure',
    template: '%s | TIGI',
  },
  description:
    'Own real estate and land one fraction at a time. TIGI turns property into digital shares you can buy, hold, lease and pass on, with AI research on every listing. Private beta.',
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
  themeColor: '#000000',
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
    >
      <head>
        <RevealScript />
      </head>
      <body className="min-h-screen bg-black text-[#F5F5F7] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
