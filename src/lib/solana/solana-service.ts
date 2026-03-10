/**
 * SolanaService — server-side Solana operations.
 * Never import this in client components.
 *
 * Abstraction layer over @solana/web3.js Connection.
 * Provides typed, testable methods for all on-chain interactions
 * needed by the TIGI platform.
 *
 * Instantiate with SolanaService.create() to get a healthy connection.
 */

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
} from '@solana/web3.js'
import { getHealthyConnection, getNetwork, getExplorerUrl } from './client'

// ── Constants ──────────────────────────────────────────────────────────────

/**
 * SPL Memo program — records arbitrary UTF-8 data on-chain.
 * Used as the initial on-chain "record" for transaction intents
 * before the full escrow/token-transfer program is live (M5).
 */
export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
)

/**
 * Approximate slots per second on Solana mainnet/devnet.
 * Used to estimate blockhash TTL (150 slots ≈ ~60–90 seconds).
 */
export const SLOTS_PER_SECOND = 2.5
export const BLOCKHASH_TTL_SLOTS = 150

// ── Types ──────────────────────────────────────────────────────────────────

export interface SolBalance {
  lamports: number
  sol: number
  display: string // "1.234 SOL"
}

export interface PreparedTransaction {
  /** Base64-encoded VersionedTransaction (unsigned). */
  serialized: string
  /** Address that must sign this transaction. */
  requiredSigner: string
  /** Blockhash embedded in the transaction. */
  blockhash: string
  /** Last valid block height — reject if chain surpasses this. */
  lastValidBlockHeight: number
  /** UTC ISO string — approximate when this preparation expires. */
  expiresAt: string
}

export interface SubmittedTransaction {
  signature: string
  explorerUrl: string
}

// ── SolanaService ──────────────────────────────────────────────────────────

export class SolanaService {
  private constructor(private readonly connection: Connection) { }

  /**
   * Creates a SolanaService with a health-checked connection.
   * Falls back to public RPC if primary is unreachable.
   */
  static async create(): Promise<SolanaService> {
    const conn = await getHealthyConnection()
    return new SolanaService(conn)
  }

  /**
   * Creates a SolanaService with a given connection (for testing).
   */
  static fromConnection(connection: Connection): SolanaService {
    return new SolanaService(connection)
  }

  // ── Balance ───────────────────────────────────────────────────────────────

  /**
   * Returns the SOL balance of a given address.
   * Throws if the address is not a valid base58 public key.
   */
  async getBalance(address: string): Promise<SolBalance> {
    const pubkey = new PublicKey(address)
    const lamports = await this.connection.getBalance(pubkey, 'confirmed')
    const sol = lamports / LAMPORTS_PER_SOL

    return {
      lamports,
      sol,
      display: `${sol.toFixed(4)} SOL`,
    }
  }

  // ── Devnet airdrop ────────────────────────────────────────────────────────

  /**
   * Requests a SOL airdrop on devnet (throws on mainnet).
   * Returns the airdrop transaction signature.
   *
   * Use only for development tooling — never expose to end users
   * in a way that suggests this has production monetary value.
   */
  async requestAirdrop(address: string, solAmount = 1): Promise<string> {
    if (getNetwork() === 'mainnet-beta') {
      throw new Error('[SolanaService] Airdrop is only available on devnet')
    }

    const pubkey = new PublicKey(address)
    const lamports = solAmount * LAMPORTS_PER_SOL
    const signature = await this.connection.requestAirdrop(pubkey, lamports)

    // Wait for confirmation before returning
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('confirmed')

    await this.connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      'confirmed',
    )

    return signature
  }

  // ── Transaction building ──────────────────────────────────────────────────

  /**
   * Builds an unsigned VersionedTransaction that writes a UTF-8 memo
   * to the Solana Memo program (or a specified program).
   *
   * This is the on-chain record for M6 transaction intents.
   * The memo encodes intent metadata in a compact JSON format.
   * The signer pays a nominal fee (~0.000005 SOL on devnet).
   *
   * After this method: caller serializes, sends to client for signing,
   * then client POSTs signed tx back to /api/intents/[id]/submit.
   *
   * @param signerAddress  Wallet public key that will sign and pay the fee
   * @param memoText       UTF-8 content to write on-chain (TIGI intent JSON)
   * @param programAddress Override the memo program address (defaults to SPL Memo)
   */
  async buildMemoTransaction(
    signerAddress: string,
    memoText: string,
    programAddress?: string,
  ): Promise<PreparedTransaction> {
    const signer = new PublicKey(signerAddress)
    const programId = programAddress ? new PublicKey(programAddress) : MEMO_PROGRAM_ID

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('confirmed')

    const memoInstruction = {
      programId,
      keys: [{ pubkey: signer, isSigner: true, isWritable: false }],
      data: Buffer.from(memoText, 'utf-8'),
    }

    const message = new TransactionMessage({
      payerKey: signer,
      recentBlockhash: blockhash,
      instructions: [memoInstruction],
    }).compileToV0Message()

    const tx = new VersionedTransaction(message)
    const serialized = Buffer.from(tx.serialize()).toString('base64')

    // TTL: Solana blockhashes are valid for ~150 slots ≈ 60–90 seconds
    const ttlMs = (BLOCKHASH_TTL_SLOTS / SLOTS_PER_SECOND) * 1_000
    const expiresAt = new Date(Date.now() + ttlMs).toISOString()

    return {
      serialized,
      requiredSigner: signerAddress,
      blockhash,
      lastValidBlockHeight,
      expiresAt,
    }
  }

  /**
   * Checks whether a blockhash is still valid (not yet expired).
   * Use before showing the "Sign transaction" UI to avoid stale-tx errors.
   */
  async isBlockhashValid(blockhash: string): Promise<boolean> {
    try {
      const result = await this.connection.isBlockhashValid(blockhash, {
        commitment: 'confirmed',
      })
      return result.value
    } catch {
      return false
    }
  }

  // ── Transaction submission ────────────────────────────────────────────────

  /**
   * Submits a signed, base64-encoded VersionedTransaction to the network.
   * The transaction must already be signed by the required signer.
   *
   * Returns the transaction signature and Solana Explorer URL.
   */
  async submitSignedTransaction(signedBase64: string): Promise<SubmittedTransaction> {
    const buf = Buffer.from(signedBase64, 'base64')
    const tx = VersionedTransaction.deserialize(buf)

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('confirmed')

    const signature = await this.connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 3,
    })

    await this.connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      'confirmed',
    )

    return {
      signature,
      explorerUrl: getExplorerUrl(signature, 'tx'),
    }
  }

  // ── Address validation ────────────────────────────────────────────────────

  /**
   * Returns true if the string is a valid Solana public key (base58, 32 bytes).
   */
  static isValidAddress(address: string): boolean {
    try {
      const key = new PublicKey(address)
      return PublicKey.isOnCurve(key.toBytes())
    } catch {
      return false
    }
  }
}
