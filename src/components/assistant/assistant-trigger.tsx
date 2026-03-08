'use client'

import { Sparkles, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAssistant } from '@/lib/assistant/assistant-context'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// AssistantTrigger — floating pill button to open / close the Aria panel.
//
// Design: a pill with a sparkle icon and "Aria" label — not a chat bubble.
// When the panel is open it collapses to an icon-only close button.
//
// Hidden on /assistant (the full-page view) since Aria is already visible.
// Position: fixed bottom-6 right-6, z-30 (below panel z-50, above content).
// ---------------------------------------------------------------------------

export function AssistantTrigger() {
  const { isOpen, toggle } = useAssistant()
  const pathname = usePathname()

  // Don't float over the dedicated full-page assistant route
  if (pathname === '/assistant' || pathname.startsWith('/assistant/')) {
    return null
  }

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Close Aria' : 'Open Aria'}
      className={cn(
        'fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full border shadow-lg shadow-black/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/50',
        isOpen
          ? 'h-10 w-10 justify-center border-[#2A2A3A] bg-[#111118] hover:border-[#3A3A4A]'
          : 'border-[#C9A84C]/25 bg-[#111118] px-4 py-2.5 hover:border-[#C9A84C]/50 hover:shadow-[#C9A84C]/5'
      )}
    >
      {isOpen ? (
        <X className="h-4 w-4 text-[#6B6B80]" />
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-[#C9A84C]" />
          <span className="text-sm font-medium text-[#F5F5F7]">Aria</span>
        </>
      )}
    </button>
  )
}
