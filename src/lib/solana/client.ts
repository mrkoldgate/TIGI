import { Connection, clusterApiUrl } from '@solana/web3.js'

// ---------------------------------------------------------------------------
// Solana connection factory — server-side only.
// Client-side wallet adapter uses its own ConnectionProvider.
// See solana-strategy.md §8.3 for RPC provider strategy.
// ---------------------------------------------------------------------------

export type SolanaNetwork = 'mainnet-beta' | 'devnet'

export function getNetwork(): SolanaNetwork {
  return process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta'
    ? 'mainnet-beta'
    : 'devnet'
}

function getRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL ||
    clusterApiUrl(getNetwork())
  )
}

/**
 * Returns a Solana Connection for server-side use (API routes, server actions).
 * Uses the configured RPC URL (Helius) or falls back to the public endpoint.
 */
export function getConnection(commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'): Connection {
  return new Connection(getRpcUrl(), {
    commitment,
    confirmTransactionInitialTimeout: 60_000,
  })
}

/**
 * Returns a healthy Connection — falls back to public RPC if primary is unreachable.
 * Use for transaction submission where reliability is critical.
 */
export async function getHealthyConnection(): Promise<Connection> {
  const primaryUrl = process.env.SOLANA_RPC_URL
  const fallbackUrl = clusterApiUrl(getNetwork())

  if (primaryUrl) {
    const primary = new Connection(primaryUrl, { commitment: 'confirmed' })
    try {
      await primary.getLatestBlockhash({ commitment: 'confirmed' })
      return primary
    } catch {
      console.warn('[Solana] Primary RPC unreachable — falling back to public endpoint')
    }
  }

  return new Connection(fallbackUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60_000,
  })
}

/**
 * Solana Explorer URL for a transaction or address.
 * Respects the configured network (devnet vs mainnet).
 */
export function getExplorerUrl(
  value: string,
  type: 'tx' | 'address' = 'tx',
): string {
  const network = getNetwork()
  const base = 'https://explorer.solana.com'
  const clusterParam = network === 'mainnet-beta' ? '' : '?cluster=devnet'
  return `${base}/${type}/${value}${clusterParam}`
}

/**
 * Truncates a Solana address for display.
 * e.g. "7xKdaBcD...aF2gHi3j" → "7xKd...aF2g"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}
