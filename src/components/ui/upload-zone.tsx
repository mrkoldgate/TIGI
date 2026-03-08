'use client'

// ---------------------------------------------------------------------------
// UploadZone — reusable polished drag-and-drop upload component.
//
// Used by:
//   - Listing document upload (compliance: title deed, appraisal, etc.)
//   - KYC document upload (identity docs, selfie)
//   - Inheritance module (beneficiary supporting docs)
//
// Props:
//   accept       — MIME types to accept (e.g. { 'application/pdf': ['.pdf'] })
//   maxBytes     — max file size in bytes (default 50 MB)
//   onFile       — callback fired when a valid file is selected
//   uploading    — show uploading spinner state
//   uploaded     — show success state (file name + remove action)
//   fileName     — name to display in uploaded state
//   onRemove     — callback to clear the uploaded file
//   label        — primary label text
//   hint         — secondary hint text
//   accept       — HTML accept string forwarded to <input>
//   error        — error message to display below the zone
//   disabled     — disable all interactions
// ---------------------------------------------------------------------------

import React, { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface UploadZoneProps {
  /** Human-readable primary label */
  label?: string
  /** Hint text (file types, size limit, etc.) */
  hint?: string
  /** Native <input accept="…"> string */
  accept?: string
  /** Max allowed file size in bytes. Violations show an inline error. */
  maxBytes?: number
  /** Called when the user selects a valid file */
  onFile: (file: File) => void
  /** Show uploading spinner (overrides idle state) */
  uploading?: boolean
  /** Show uploaded success state */
  uploaded?: boolean
  /** File name to display in uploaded state */
  fileName?: string
  /** Called when the user clicks Remove in uploaded state */
  onRemove?: () => void
  /** Error message shown below the zone */
  error?: string
  /** Disabled state */
  disabled?: boolean
  /** Extra class names on the outer wrapper */
  className?: string
  /** Accent colour — defaults to gold (#C9A84C) */
  accentColor?: string
}

export function UploadZone({
  label = 'Click or drag to upload',
  hint,
  accept,
  maxBytes = 50 * 1024 * 1024,
  onFile,
  uploading = false,
  uploaded = false,
  fileName,
  onRemove,
  error,
  disabled = false,
  className,
  accentColor = '#C9A84C',
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const displayError = error ?? localError

  const validate = useCallback(
    (file: File): string | null => {
      if (maxBytes && file.size > maxBytes) {
        const mb = Math.round(maxBytes / 1024 / 1024)
        return `File exceeds ${mb} MB limit`
      }
      return null
    },
    [maxBytes],
  )

  const handleFile = useCallback(
    (file: File) => {
      setLocalError(null)
      const err = validate(file)
      if (err) {
        setLocalError(err)
        return
      }
      onFile(file)
    },
    [validate, onFile],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be re-selected after a remove
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleClick = () => {
    if (!disabled && !uploading && !uploaded) {
      inputRef.current?.click()
    }
  }

  // ── Uploaded state ─────────────────────────────────────────────────────────

  if (uploaded && fileName) {
    return (
      <div className={cn('w-full', className)}>
        <div
          className="flex items-center gap-3 rounded-xl border border-[#2A2A3A] bg-[#14141E] px-4 py-3"
          style={{ borderColor: accentColor + '40' }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: accentColor + '20' }}
          >
            <CheckIcon color={accentColor} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#F5F5F7]">{fileName}</p>
            <p className="text-xs text-[#6B6B80]">Uploaded successfully</p>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 rounded-lg border border-transparent px-2 py-1 text-xs text-[#6B6B80] transition-colors hover:border-[#EF4444] hover:text-[#EF4444]"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Uploading state ────────────────────────────────────────────────────────

  if (uploading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center gap-3 rounded-xl border border-[#2A2A3A] bg-[#14141E] px-4 py-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: accentColor + '20' }}
          >
            <SpinnerIcon color={accentColor} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#F5F5F7]">Uploading…</p>
            <p className="text-xs text-[#6B6B80]">{fileName ?? 'Processing file'}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Idle / drag state ─────────────────────────────────────────────────────

  return (
    <div className={cn('w-full', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
          'min-h-[120px] w-full px-6 py-8 transition-all duration-200',
          disabled
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-pointer',
          isDragging
            ? 'bg-[#1A1A24]'
            : 'bg-[#14141E] hover:bg-[#1A1A24]',
          displayError ? 'border-[#EF4444]' : isDragging ? 'border-opacity-100' : 'border-[#2A2A3A]',
        )}
        style={isDragging && !displayError ? { borderColor: accentColor } : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={handleChange}
        />

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
          style={{ backgroundColor: accentColor + '20' }}
        >
          <UploadIcon color={isDragging ? accentColor : '#6B6B80'} />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: isDragging ? accentColor : '#A0A0B2' }}>
            {label}
          </p>
          {hint && (
            <p className="mt-0.5 text-xs text-[#6B6B80]">{hint}</p>
          )}
        </div>
      </div>

      {displayError && (
        <p className="mt-1.5 text-xs text-[#EF4444]">{displayError}</p>
      )}
    </div>
  )
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function UploadIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function SpinnerIcon({ color }: { color: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-spin"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
