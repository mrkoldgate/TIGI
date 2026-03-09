#!/usr/bin/env tsx
/**
 * scripts/test-devnet.ts — Solana devnet E2E readiness verification.
 *
 * Tests the full intent-preparation path on devnet without submitting
 * a transaction (submission requires a signed tx from a real wallet).
 *
 * What this verifies:
 *   1. Solana devnet RPC is reachable and returns a valid blockhash
 *   2. A fresh devnet keypair can receive an airdrop and confirm a balance
 *   3. IntentPreparationService can build a serialized unsigned tx for each
 *      intent type (EXPRESS_INTEREST, PREPARE_INVEST, PREPARE_PURCHASE, PREPARE_LEASE)
 *   4. validatePreparation() correctly assesses the freshly-built tx as valid
 *   5. IntentPreparationService.parseMemo() round-trips the memo payload correctly
 *   6. SolanaService.isValidAddress() correctly validates addresses
 *
 * Explicit non-goals (not tested here):
 *   - Signing the transaction (requires Phantom/Solflare client interaction)
 *   - Submitting the signed tx to the network
 *   - Legal title or property transfer semantics
 *
 * Usage:
 *   npm run test:devnet
 *   # or directly:
 *   tsx scripts/test-devnet.ts
 *
 * Requires:
 *   NEXT_PUBLIC_SOLANA_NETWORK=devnet (default)
 *   SOLANA_RPC_URL (optional — falls back to public devnet endpoint)
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 */

// Load .env.local for local runs. tsx does not auto-load .env files.
import { config as dotenv } from 'dotenv'
dotenv({ path: '.env.local' })
dotenv({ path: '.env' })

import { Keypair } from '@solana/web3.js'
import { SolanaService } from '../src/lib/solana/solana-service'
import { IntentPreparationService } from '../src/lib/solana/intent-preparation'
import { getNetwork } from '../src/lib/solana/client'

// ── Result tracking ────────────────────────────────────────────────────────

interface CheckResult {
  name:    string
  passed:  boolean
  detail:  string
  elapsed: number
}

const results: CheckResult[] = []
let allPassed = true

function pass(name: string, detail: string, elapsed: number) {
  results.push({ name, passed: true, detail, elapsed })
  console.log(`  ✓  ${name}  (${elapsed}ms)`)
  if (detail) console.log(`     ${detail}`)
}

function fail(name: string, detail: string, elapsed: number) {
  results.push({ name, passed: false, detail, elapsed })
  allPassed = false
  console.error(`  ✗  ${name}  (${elapsed}ms)`)
  console.error(`     ${detail}`)
}

async function check(name: string, fn: () => Promise<string>): Promise<void> {
  const t0 = Date.now()
  try {
    const detail = await fn()
    pass(name, detail, Date.now() - t0)
  } catch (err) {
    fail(name, (err as Error).message, Date.now() - t0)
  }
}

// ── Mock intent shapes ─────────────────────────────────────────────────────

const MOCK_INTENTS = [
  { id: 'devtest-001', intentType: 'EXPRESS_INTEREST', propertyId: 'res-001', fractionQty: null },
  { id: 'devtest-002', intentType: 'PREPARE_INVEST',   propertyId: 'res-001', fractionQty: 5  },
  { id: 'devtest-003', intentType: 'PREPARE_PURCHASE', propertyId: 'com-001', fractionQty: null },
  { id: 'devtest-004', intentType: 'PREPARE_LEASE',    propertyId: 'com-002', fractionQty: null },
]

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════════════')
  console.log('  TIGI · Solana Devnet E2E Readiness Verification')
  console.log('══════════════════════════════════════════════════════\n')

  const network = getNetwork()
  console.log(`  Network:  ${network}`)
  console.log(`  RPC URL:  ${process.env.SOLANA_RPC_URL || '(public devnet fallback)'}\n`)

  if (network === 'mainnet-beta') {
    console.error('  ERROR: This script must run against devnet.')
    console.error('  Set NEXT_PUBLIC_SOLANA_NETWORK=devnet in .env.local\n')
    process.exit(1)
  }

  // ── 1. RPC connectivity ──────────────────────────────────────────────────

  console.log('── RPC Connectivity ─────────────────────────────────')

  let service!: SolanaService

  await check('Solana devnet RPC is reachable', async () => {
    service = await SolanaService.create()
    return 'SolanaService.create() succeeded'
  })

  // If RPC check failed, bail — subsequent checks will all fail
  if (!results[0].passed) {
    console.error('\n  Aborting: RPC is unreachable. Check SOLANA_RPC_URL.\n')
    process.exit(1)
  }

  // ── 2. Address validation ────────────────────────────────────────────────

  console.log('\n── Address Validation ───────────────────────────────')

  await check('Valid Solana public key accepted', async () => {
    const kp = Keypair.generate()
    const addr = kp.publicKey.toBase58()
    if (!SolanaService.isValidAddress(addr)) throw new Error(`isValidAddress returned false for valid key: ${addr}`)
    return `Accepted: ${addr.slice(0, 16)}…`
  })

  await check('Invalid address rejected', async () => {
    const bad = ['', 'not-a-key', '0x1234567890', 'AAAA']
    for (const addr of bad) {
      if (SolanaService.isValidAddress(addr)) {
        throw new Error(`isValidAddress returned true for invalid address: "${addr}"`)
      }
    }
    return `Correctly rejected ${bad.length} invalid addresses`
  })

  // ── 3. Devnet airdrop + balance ──────────────────────────────────────────

  console.log('\n── Devnet Airdrop & Balance ──────────────────────────')

  const testKeypair = Keypair.generate()
  const testAddress = testKeypair.publicKey.toBase58()

  console.log(`  Test wallet: ${testAddress}`)

  await check('Balance check returns 0 for fresh wallet', async () => {
    const balance = await service.getBalance(testAddress)
    if (balance.lamports !== 0) throw new Error(`Expected 0 lamports, got ${balance.lamports}`)
    return `Balance: ${balance.display}`
  })

  let airdropSig = ''
  await check('Devnet airdrop (1 SOL) succeeds', async () => {
    airdropSig = await service.requestAirdrop(testAddress, 1)
    return `Signature: ${airdropSig.slice(0, 20)}…`
  })

  if (results.find(r => r.name.includes('airdrop'))?.passed) {
    await check('Balance reflects airdrop', async () => {
      const balance = await service.getBalance(testAddress)
      if (balance.sol < 0.9) throw new Error(`Expected ~1 SOL, got ${balance.display}`)
      return `Balance: ${balance.display}`
    })
  }

  // ── 4. Transaction preparation ───────────────────────────────────────────

  console.log('\n── Intent Transaction Preparation ───────────────────')

  let prepService!: IntentPreparationService

  await check('IntentPreparationService.create() succeeds', async () => {
    prepService = await IntentPreparationService.create()
    return 'Service instantiated with healthy RPC connection'
  })

  if (!results.find(r => r.name.includes('IntentPreparationService'))?.passed) {
    console.error('\n  Aborting: Cannot create IntentPreparationService.\n')
    process.exit(1)
  }

  // Prepare one transaction per intent type
  const preppedTransactions: Array<{
    intentType: string
    prep: Awaited<ReturnType<IntentPreparationService['prepareIntent']>>
  }> = []

  for (const intent of MOCK_INTENTS) {
    await check(`prepareIntent: ${intent.intentType}`, async () => {
      const prep = await prepService.prepareIntent(intent, testAddress)

      if (!prep.serialized)           throw new Error('Missing serialized transaction')
      if (!prep.blockhash)            throw new Error('Missing blockhash')
      if (!prep.requiredSigner)       throw new Error('Missing requiredSigner')
      if (!prep.memoText)             throw new Error('Missing memoText')
      if (prep.requiredSigner !== testAddress) {
        throw new Error(`requiredSigner mismatch: expected ${testAddress}, got ${prep.requiredSigner}`)
      }

      preppedTransactions.push({ intentType: intent.intentType, prep })

      const serializedBytes = Buffer.from(prep.serialized, 'base64').length
      return `serialized=${serializedBytes}B, blockhash=${prep.blockhash.slice(0, 12)}…, program=${prep.program}`
    })
  }

  // ── 5. Memo round-trip ───────────────────────────────────────────────────

  console.log('\n── Memo Payload Round-trip ───────────────────────────')

  for (const { intentType, prep } of preppedTransactions) {
    await check(`parseMemo round-trip: ${intentType}`, async () => {
      const parsed = IntentPreparationService.parseMemo(prep.memoText)
      if (!parsed)                         throw new Error('parseMemo returned null')
      if (parsed.app !== 'tigi')           throw new Error(`app mismatch: ${parsed.app}`)
      if (parsed.v !== 2)                  throw new Error(`version mismatch: ${parsed.v}`)
      if (!parsed.intent)                  throw new Error('intent ID missing')
      if (!parsed.prop)                    throw new Error('property ID missing')
      if (typeof parsed.ts !== 'number')   throw new Error('timestamp missing')

      const intentObj = MOCK_INTENTS.find(i => i.intentType === intentType)!
      if (intentType === 'PREPARE_INVEST' && parsed.qty !== intentObj.fractionQty) {
        throw new Error(`qty mismatch: expected ${intentObj.fractionQty}, got ${parsed.qty}`)
      }

      return `v=${parsed.v} type="${parsed.type}" prop="${parsed.prop}" ts=${parsed.ts}`
    })
  }

  // ── 6. validatePreparation ───────────────────────────────────────────────

  console.log('\n── Transaction Validation ────────────────────────────')

  if (preppedTransactions.length > 0) {
    const { prep } = preppedTransactions[0]!
    await check('validatePreparation: freshly-built tx is valid', async () => {
      const result = await prepService.validatePreparation(prep)
      if (!result.valid) throw new Error(`Expected valid=true, got reason: ${result.reason}`)
      return 'Blockhash confirmed live on devnet'
    })

    await check('validatePreparation: artificially aged tx is expired', async () => {
      const stale = { ...prep, preparedAt: new Date(Date.now() - 120_000).toISOString() }
      const result = await prepService.validatePreparation(stale)
      if (result.valid) throw new Error('Expected valid=false for stale preparation')
      return `Correctly expired: "${result.reason}"`
    })
  }

  // ── Summary ──────────────────────────────────────────────────────────────

  const passed = results.filter(r => r.passed).length
  const total  = results.length
  const failed = total - passed

  console.log('\n══════════════════════════════════════════════════════')
  console.log(`  Results: ${passed}/${total} passed${failed > 0 ? `, ${failed} FAILED` : ''}`)
  console.log('══════════════════════════════════════════════════════\n')

  if (!allPassed) {
    console.error('  FAILED checks:\n')
    results.filter(r => !r.passed).forEach(r => {
      console.error(`  ✗  ${r.name}`)
      console.error(`     ${r.detail}\n`)
    })
    process.exit(1)
  } else {
    console.log('  All checks passed. Devnet path is ready.\n')
    console.log('  Next step: connect Phantom/Solflare to sign a prepared')
    console.log('  transaction and submit via POST /api/intents/[id]/submit.\n')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('\n  Unexpected error:', err)
  process.exit(1)
})
