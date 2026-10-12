'use client'

import { useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { PlaceholderImage } from '@/components/shared/placeholder-image'

// ---------------------------------------------------------------------------
// PhotoLightbox — full-screen viewer for listing photos.
// Esc closes, ← / → step through, clicking the backdrop closes.
// ---------------------------------------------------------------------------

type ImageType = 'residential' | 'commercial' | 'land' | 'industrial' | 'mixed'

export function PhotoLightbox({
  slots,
  index,
  title,
  propertyType,
  onIndex,
  onClose,
}: {
  slots: string[]
  index: number
  title: string
  propertyType?: ImageType
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const count = slots.length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % count)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + count) % count)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [index, count, onIndex, onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Photo gallery"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <p className="font-mono text-[12px] tabular-nums text-[#A0A0B2]">
          {index + 1} / {count}
        </p>
        <button onClick={onClose} className="btn-glass !px-4 !py-2 text-sm">Close</button>
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-6 pb-10" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[20px]">
          <PlaceholderImage
            key={index}
            slot={slots[index] as Parameters<typeof PlaceholderImage>[0]['slot']}
            propertyType={propertyType}
            alt={`${title} — photo ${index + 1}`}
            className="h-full w-full animate-fade-in"
            priority
          />
        </div>
        {count > 1 && (
          <>
            <button
              onClick={() => onIndex((index - 1 + count) % count)}
              className="btn-glass absolute left-8 top-1/2 !h-12 !w-12 -translate-y-1/2 !p-0"
              aria-label="Previous photo"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <button
              onClick={() => onIndex((index + 1) % count)}
              className="btn-glass absolute right-8 top-1/2 !h-12 !w-12 -translate-y-1/2 !p-0"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
