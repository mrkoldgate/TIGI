'use client'

// ---------------------------------------------------------------------------
// AvatarUploadButton — Camera button overlay for avatar upload on the profile
// settings page.
//
// Flow:
//   1. User clicks camera button → hidden <input type="file"> opens picker
//   2. File is validated client-side (type + size)
//   3. POST /api/upload with purpose=user-avatar → returns { url }
//   4. PATCH /api/settings/profile with { avatarUrl: url } to persist
//   5. onAvatarChange(url) called so parent can update display immediately
//
// States: idle | uploading | error
// Max size enforced: 2 MB (matches server-side limit)
// Accepted types: JPEG, PNG, WebP
// ---------------------------------------------------------------------------

import { useRef, useState, useCallback } from 'react'
import { Camera, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as Tooltip from '@radix-ui/react-tooltip'

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const ACCEPT_TYPES   = 'image/jpeg,image/png,image/webp'

interface AvatarUploadButtonProps {
  onAvatarChange: (url: string) => void
  className?:     string
}

export function AvatarUploadButton({ onAvatarChange, className }: AvatarUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state,    setState]    = useState<'idle' | 'uploading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!e.target) return
    // Reset so the same file can be re-selected after an error
    e.target.value = ''

    if (!file) return

    // ── Client-side validation ───────────────────────────────────────────
    const allowed = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
    if (!allowed.has(file.type)) {
      setErrorMsg('Please upload a JPEG, PNG, or WebP image.')
      setState('error')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMsg('Image must be 2 MB or smaller.')
      setState('error')
      return
    }

    setState('uploading')
    setErrorMsg(null)

    try {
      // ── 1. Upload to storage ─────────────────────────────────────────
      const form = new FormData()
      form.append('file', file)
      form.append('purpose', 'user-avatar')

      const uploadRes  = await fetch('/api/upload', { method: 'POST', body: form })
      const uploadJson = await uploadRes.json() as {
        success: boolean
        data?:   { url: string }
        error?:  { message: string }
      }

      if (!uploadRes.ok || !uploadJson.success || !uploadJson.data?.url) {
        throw new Error(uploadJson.error?.message ?? 'Upload failed')
      }

      const avatarUrl = uploadJson.data.url

      // ── 2. Persist to profile ────────────────────────────────────────
      const patchRes = await fetch('/api/settings/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ avatarUrl }),
      })

      if (!patchRes.ok) {
        throw new Error('Failed to save avatar. Please try again.')
      }

      // ── 3. Update display ────────────────────────────────────────────
      onAvatarChange(avatarUrl)
      setState('idle')
    } catch (err) {
      setErrorMsg((err as Error).message ?? 'Upload failed. Please try again.')
      setState('error')
    }
  }, [onAvatarChange])

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null)
              setState('idle')
              inputRef.current?.click()
            }}
            disabled={state === 'uploading'}
            aria-label="Upload profile photo"
            className={cn(
              'absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center',
              'rounded-full border border-[#2A2A3A] bg-[#1A1A24]',
              'transition-colors hover:border-[#C9A84C]/50 hover:bg-[#252530]',
              'disabled:cursor-not-allowed disabled:opacity-60',
              state === 'error' && 'border-[#EF4444]/40',
              className,
            )}
          >
            {state === 'uploading' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C9A84C]" />
            ) : state === 'error' ? (
              <AlertCircle className="h-3.5 w-3.5 text-[#EF4444]" />
            ) : (
              <Camera className="h-3.5 w-3.5 text-[#6B6B80]" />
            )}
          </button>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={6}
            className="z-50 rounded-lg border border-[#2A2A3A] bg-[#111118] px-2.5 py-1.5 text-[11px] text-[#A0A0B2] shadow-xl"
          >
            {state === 'error' && errorMsg
              ? errorMsg
              : state === 'uploading'
              ? 'Uploading…'
              : 'Upload profile photo'}
            <Tooltip.Arrow className="fill-[#2A2A3A]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_TYPES}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleFileChange}
      />
    </Tooltip.Provider>
  )
}
