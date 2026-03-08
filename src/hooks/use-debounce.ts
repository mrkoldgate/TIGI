import { useState, useEffect } from 'react'

// ---------------------------------------------------------------------------
// useDebounce — Delays updating a value until after delay ms have elapsed.
// Used for search inputs in marketplace to avoid excessive API calls.
// ---------------------------------------------------------------------------

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
