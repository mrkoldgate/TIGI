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
    default: 'TIGI — Property in Africa you can trust',
    template: '%s | TIGI',
  },
  description:
    'TIGI checks property titles at the official registry, holds your money in licensed escrow until the deed is yours, and records who inherits it. Launching in Nigeria, Senegal and Mali. Private beta.',
  keywords: [
    'title verification',
    'land registry',
    'property escrow',
    'diaspora property',
    'Nigeria real estate',
    'Senegal real estate',
    'fractional ownership',
    'inheritance planning',
  ],
  authors: [{ name: 'TIGI' }],
  creator: 'TIGI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'TIGI',
    title: 'TIGI — Property in Africa you can trust',
    description:
      'Titles checked at the registry. Money held in escrow until the deed moves. Heirs on record.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIGI — Property in Africa you can trust',
    description: 'Titles checked at the registry. Money held in escrow until the deed moves.',
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
