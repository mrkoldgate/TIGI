'use client'

// ---------------------------------------------------------------------------
// SavedListingsContext — platform-wide save / favorites state.
//
// Two operating modes:
//
//   API mode  (initialEntries provided — authenticated user):
//     • State is seeded from the server (DB query in platform layout).
//       No localStorage read on mount — DB is authoritative.
//     • toggleSave calls POST/DELETE /api/saved with optimistic update +
//       rollback on error. localStorage is also written as an offline cache.
//
//   Local mode (initialEntries not provided — unauthenticated / SSR):
//     • Hydrates from localStorage on mount.
//     • Writes to localStorage on every change. No API calls.
//
// The context shape and hook API are stable — consumers don't change when
// the data layer swaps between modes.
// ---------------------------------------------------------------------------

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { track } from '@/lib/analytics/client'

// ── Types ──────────────────────────────────────────────────────────────────

export interface SavedEntry {
  id: string
  savedAt: number // Unix ms — used for "Date saved" sort in favorites page
}

interface SavedListingsContextValue {
  /** Fast O(1) membership check — use for isSaved() on cards/detail pages. */
  savedIds: Set<string>
  /** Ordered array (most-recently-saved first) — use for the favorites page. */
  savedEntries: SavedEntry[]
  /** Toggle save state. Adds with current timestamp if not saved, removes if saved. */
  toggleSave: (id: string) => void
  isSaved: (id: string) => boolean
  savedCount: number
  clearAll: () => void
}

const SavedListingsContext = createContext<SavedListingsContextValue | null>(null)

// ── Storage helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = 'tigi_saved_ids'

function readStorage(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is SavedEntry =>
        typeof e === 'object' && typeof e.id === 'string' && typeof e.savedAt === 'number',
    )
  } catch {
    return []
  }
}

function writeStorage(entries: SavedEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage quota exceeded or private mode — fail silently
  }
}

// ── Provider ───────────────────────────────────────────────────────────────

interface SavedListingsProviderProps {
  children: React.ReactNode
  /**
   * Server-seeded initial entries (from DB query in platform layout).
   * When provided, the provider operates in API mode:
   *   - skips localStorage read on mount
   *   - syncs every toggle with POST/DELETE /api/saved
   * When undefined (unauthenticated), falls back to localStorage-only mode.
   */
  initialEntries?: SavedEntry[]
}

export function SavedListingsProvider({
  children,
  initialEntries,
}: SavedListingsProviderProps) {
  // If initialEntries is defined, user is authenticated → API mode.
  const isApiMode = initialEntries !== undefined

  // Seed from server when authenticated; start empty for local mode
  // (local mode hydrates from localStorage in useEffect below).
  const [entries, setEntries] = useState<SavedEntry[]>(initialEntries ?? [])

  // Local mode: hydrate from localStorage on mount
  useEffect(() => {
    if (!isApiMode) {
      setEntries(readStorage())
    }
  }, [isApiMode])

  // Always keep localStorage in sync as an offline cache
  useEffect(() => {
    writeStorage(entries)
  }, [entries])

  const savedIds = useMemo(() => new Set(entries.map((e) => e.id)), [entries])

  const toggleSave = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const isCurrentlySaved = prev.some((e) => e.id === id)
        const next = isCurrentlySaved
          ? prev.filter((e) => e.id !== id)
          : [{ id, savedAt: Date.now() }, ...prev]

        // Track favorite save/remove event
        track({
          name: isCurrentlySaved ? 'favorite.removed' : 'favorite.saved',
          properties: { listingId: id },
        })

        if (isApiMode) {
          // Optimistic update already applied via `next`.
          // Fire API call; roll back to `prev` on error.
          if (isCurrentlySaved) {
            fetch(`/api/saved/${id}`, { method: 'DELETE' }).catch(() => {
              setEntries(prev)
            })
          } else {
            fetch('/api/saved', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            }).catch(() => {
              setEntries(prev)
            })
          }
        }

        return next
      })
    },
    [isApiMode],
  )

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds])

  const clearAll = useCallback(() => {
    setEntries([])
    // Note: does not bulk-delete from API — acceptable for MVP.
    // Add DELETE /api/saved (bulk) in M3 if needed.
  }, [])

  const value: SavedListingsContextValue = useMemo(
    () => ({
      savedIds,
      savedEntries: entries,
      toggleSave,
      isSaved,
      savedCount: entries.length,
      clearAll,
    }),
    [savedIds, entries, toggleSave, isSaved, clearAll],
  )

  return (
    <SavedListingsContext.Provider value={value}>
      {children}
    </SavedListingsContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useSavedListings(): SavedListingsContextValue {
  const ctx = useContext(SavedListingsContext)
  if (!ctx) {
    throw new Error('useSavedListings must be used inside <SavedListingsProvider>')
  }
  return ctx
}
