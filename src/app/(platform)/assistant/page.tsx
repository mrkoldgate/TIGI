import type { Metadata } from 'next'
import { AssistantPageView } from '@/components/assistant/assistant-panel'

export const metadata: Metadata = {
  title: 'Aria — TIGI Advisor',
  description:
    'Ask Aria about listings, valuations, the investment flow, or how any part of TIGI works.',
}

// ---------------------------------------------------------------------------
// /assistant — Full-page AI advisor experience.
//
// Uses AssistantPageView, which shares context with the floating panel so
// conversations are continuous whether accessed via the panel or this page.
//
// M2: Wire to /api/assistant/chat streaming endpoint (Vercel AI SDK).
// M6: Add context-aware suggestions based on current portfolio + watchlist.
// ---------------------------------------------------------------------------

export default function AssistantPage() {
  return (
    // Subtract TopNav height (64px = h-16) so the page fills the viewport cleanly
    <div className="h-[calc(100vh-4rem)]">
      <AssistantPageView />
    </div>
  )
}
