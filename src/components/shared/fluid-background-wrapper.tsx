'use client'

import dynamic from 'next/dynamic'

// Dynamically import the Three.js canvas — client-only, no SSR
const FluidBackground = dynamic(
  () => import('./fluid-background').then((m) => m.FluidBackground),
  { ssr: false }
)

export function FluidBackgroundWrapper() {
  return <FluidBackground />
}
