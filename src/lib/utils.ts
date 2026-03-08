import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ---------------------------------------------------------------------------
// cn — Tailwind class merging utility. Used across ALL components.
// Combines clsx (conditional classes) + tailwind-merge (deduplication).
// ---------------------------------------------------------------------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

export function formatCurrency(
  amount: number,
  options?: {
    compact?: boolean
    currency?: string
    decimals?: number
  }
): string {
  const { compact = false, currency = 'USD', decimals } = options ?? {}

  if (compact) {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`
    }
    if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  }).format(amount)
}

// ---------------------------------------------------------------------------
// Percentage formatting
// ---------------------------------------------------------------------------

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

// ---------------------------------------------------------------------------
// Wallet address truncation
// e.g. "7xKd...aF2g" — only shown in advanced/settings contexts
// ---------------------------------------------------------------------------

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

// ---------------------------------------------------------------------------
// Date formatting — professional financial style
// ---------------------------------------------------------------------------

export function formatDate(date: Date | string, style: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const formats: Record<typeof style, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  }
  return new Intl.DateTimeFormat('en-US', formats[style]).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 30) return formatDate(d, 'medium')
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

// ---------------------------------------------------------------------------
// Sleep utility — for mock service delays (MVP only)
// ---------------------------------------------------------------------------

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Standard API response builder
// ---------------------------------------------------------------------------

export function apiSuccess<T>(data: T, meta?: object) {
  return { success: true as const, data, ...(meta ? { meta } : {}) }
}

export function apiError(code: string, message: string, details?: object) {
  return { success: false as const, error: { code, message, ...(details ? { details } : {}) } }
}
