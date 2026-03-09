'use client'

// ---------------------------------------------------------------------------
// compare-context.tsx — Global compare tray.
//
// Tracks up to 3 property selections for side-by-side comparison.
// State is persisted in sessionStorage so it survives route navigations
// within the same tab but resets on a new session.
//
// Usage:
//   const { addToCompare, isComparing, compareEntries } = useCompare()
// ---------------------------------------------------------------------------

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

export const MAX_COMPARE = 3
const STORAGE_KEY = 'tigi:compare'

// ── Types ──────────────────────────────────────────────────────────────────

export interface CompareEntry {
  id:    string
  title: string
}

interface CompareCtxValue {
  compareEntries:   CompareEntry[]
  compareIds:       string[]               // derived; convenient for `includes` checks
  addToCompare:     (id: string, title: string) => void
  removeFromCompare:(id: string) => void
  clearCompare:     () => void
  isComparing:      (id: string) => boolean
  isFull:           boolean
}

// ── Context ────────────────────────────────────────────────────────────────

const CompareCtx = createContext<CompareCtxValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────

export function CompareProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CompareEntry[]>([])

  // Hydrate from sessionStorage once on mount (client only)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) setEntries(JSON.parse(raw) as CompareEntry[])
    } catch {
      // corrupt / unavailable — start fresh
    }
  }, [])

  const persist = useCallback((next: CompareEntry[]) => {
    setEntries(next)
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }, [])

  const addToCompare = useCallback((id: string, title: string) => {
    setEntries((prev) => {
      if (prev.some((e) => e.id === id)) return prev   // already in
      if (prev.length >= MAX_COMPARE) return prev       // tray full
      const next = [...prev, { id, title }]
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const removeFromCompare = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id)
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clearCompare = useCallback(() => persist([]), [persist])

  const isComparing = useCallback(
    (id: string) => entries.some((e) => e.id === id),
    [entries],
  )

  return (
    <CompareCtx.Provider
      value={{
        compareEntries:   entries,
        compareIds:       entries.map((e) => e.id),
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
        isFull: entries.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareCtx.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCompare(): CompareCtxValue {
  const ctx = useContext(CompareCtx)
  if (!ctx) throw new Error('useCompare must be used inside <CompareProvider>')
  return ctx
}
