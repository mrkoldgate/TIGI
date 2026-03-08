'use client'

// ---------------------------------------------------------------------------
// SavedListingsContext — platform-wide save / favorites state.
//
// MVP: persists to localStorage under the key `tigi_saved_ids`.
//      Initializes to empty on server render, hydrates on mount.
//
// DB integration path:
//   1. Replace the localStorage read in the useEffect with:
//        const data = await fetch('/api/saved').then(r => r.json())
//        setEntries(data.entries)
//   2. Replace the localStorage write with:
//        await fetch('/api/saved', { method: 'POST', body: JSON.stringify({ id, savedAt }) })
//   3. Replace the delete with:
//        await fetch(`/api/saved/${id}`, { method: 'DELETE' })
//   4. Wrap optimistic updates with rollback on error.
//
// The context shape and hook API are intentionally stable so consumers don't
// need to change when the data layer swaps from localStorage → API.
// ---------------------------------------------------------------------------

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

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
    // Validate shape: must be an array of { id, savedAt }
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

export function SavedListingsProvider({ children }: { children: React.ReactNode }) {
  // Start empty — avoids SSR hydration mismatch.
  // Hydrated from localStorage in the useEffect below.
  const [entries, setEntries] = useState<SavedEntry[]>([])

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    setEntries(readStorage())
  }, [])

  // Persist to localStorage whenever entries change (skip the initial SSR render)
  useEffect(() => {
    writeStorage(entries)
  }, [entries])

  const savedIds = useMemo(() => new Set(entries.map((e) => e.id)), [entries])

  const toggleSave = useCallback((id: string) => {
    setEntries((prev) => {
      if (prev.some((e) => e.id === id)) {
        // Remove
        return prev.filter((e) => e.id !== id)
      }
      // Add — newest first
      return [{ id, savedAt: Date.now() }, ...prev]
    })
  }, [])

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds])

  const clearAll = useCallback(() => setEntries([]), [])

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
