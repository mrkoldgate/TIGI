import { describe, it, expect } from 'vitest'
import { SolanaService } from '@/lib/solana/solana-service'

// ---------------------------------------------------------------------------
// SolanaService — pure / static method unit tests (no RPC calls).
//
// RPC-dependent methods (getBalance, requestAirdrop, buildMemoTransaction,
// isBlockhashValid, submitSignedTransaction) are covered by the devnet
// integration script (scripts/test-devnet.ts) rather than unit tests
// to avoid flaky network dependencies in CI.
// ---------------------------------------------------------------------------

describe('SolanaService.isValidAddress', () => {
  // ── Valid addresses ──────────────────────────────────────────────────────

  it('accepts a freshly-generated Solana public key', async () => {
    // Import Keypair dynamically so the module can be resolved even in CI
    // where Solana web3.js may not have network access.
    const { Keypair } = await import('@solana/web3.js')
    const kp = Keypair.generate()
    expect(SolanaService.isValidAddress(kp.publicKey.toBase58())).toBe(true)
  })

  it('accepts known devnet public keys', () => {
    // SPL Memo program address — a widely-known valid key
    expect(SolanaService.isValidAddress('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')).toBe(true)
    // System program
    expect(SolanaService.isValidAddress('11111111111111111111111111111111')).toBe(true)
  })

  // ── Invalid addresses ────────────────────────────────────────────────────

  it('rejects empty string', () => {
    expect(SolanaService.isValidAddress('')).toBe(false)
  })

  it('rejects a hex-prefixed Ethereum-style address', () => {
    expect(SolanaService.isValidAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe(false)
  })

  it('rejects a short string', () => {
    expect(SolanaService.isValidAddress('AAAA')).toBe(false)
  })

  it('rejects a plain English string', () => {
    expect(SolanaService.isValidAddress('not-a-key')).toBe(false)
  })

  it('rejects a UUID (not a base58 Solana key)', () => {
    expect(SolanaService.isValidAddress('550e8400-e29b-41d4-a716-446655440000')).toBe(false)
  })

  it('rejects a base58 string that is not on the ed25519 curve', () => {
    // All-zeros is a valid base58 decode but not on the curve
    const allZeros = '1'.repeat(32)
    // This may or may not throw — we just assert it returns false
    expect(SolanaService.isValidAddress(allZeros)).toBe(false)
  })
})
