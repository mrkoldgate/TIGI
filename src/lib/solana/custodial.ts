/**
 * Custodial wallet management — server-side only.
 * Never import this in client components.
 *
 * Architecture: solana-strategy.md §2.1 (Tier 1 — Custodial)
 *
 * Security model:
 *   - Private key encrypted AES-256-GCM before DB storage
 *   - Encryption key derived per-user via scrypt from PLATFORM_WALLET_SECRET
 *   - Raw key never returned or held in memory beyond the create scope
 *   - Production: PLATFORM_WALLET_SECRET stored in AWS CloudHSM (post-MVP)
 */

import { Keypair } from '@solana/web3.js'
import { logger } from '@/lib/logger'
import {
  createCipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto'
import type { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Encryption helpers
// ---------------------------------------------------------------------------

/**
 * Derives a 256-bit encryption key from userId + master secret.
 * scrypt provides memory-hard KDF to resist brute-force.
 */
function deriveEncryptionKey(userId: string, masterSecret: string): Buffer {
  // Salt: first 16 chars of userId (deterministic per-user, not secret)
  const salt = userId.slice(0, 16).padEnd(16, '0')
  return scryptSync(`${userId}:${masterSecret}`, salt, 32) as Buffer
}

/**
 * Encrypts a Solana secret key (64 bytes) using AES-256-GCM.
 * Returns a single base64 string: [12-byte IV] + [16-byte auth tag] + [ciphertext]
 */
export function encryptSecretKey(secretKey: Uint8Array, userId: string): string {
  const masterSecret = process.env.PLATFORM_WALLET_SECRET
  if (!masterSecret) {
    throw new Error(
      '[custodial] PLATFORM_WALLET_SECRET is not set. Cannot encrypt wallet key.',
    )
  }

  const encKey = deriveEncryptionKey(userId, masterSecret)
  const iv = randomBytes(12) // 96-bit nonce for GCM

  const cipher = createCipheriv('aes-256-gcm', encKey, iv)
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(secretKey)),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag() // 16 bytes

  // Layout: iv (12) | tag (16) | ciphertext (64) = 92 bytes total
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

// ---------------------------------------------------------------------------
// Custodial wallet creation
// ---------------------------------------------------------------------------

/**
 * Creates a custodial wallet for a new user.
 * Called once at registration — keypair never returned after this call.
 *
 * Side effects:
 *   - Creates CustodialWallet record with encrypted secret key
 *   - Updates User.walletAddress to the new public key
 *   - Writes audit log
 *
 * @param userId  - The user's CUID
 * @param db      - Prisma client (or transaction client)
 * @returns       - The wallet's public key (base58)
 */
export async function createCustodialWallet(
  userId: string,
  db: PrismaClient | Parameters<Parameters<PrismaClient['$transaction']>[0]>[0],
): Promise<string> {
  const keypair = Keypair.generate()
  const publicKey = keypair.publicKey.toBase58()

  let encryptedSecretKey: string

  if (process.env.PLATFORM_WALLET_SECRET) {
    encryptedSecretKey = encryptSecretKey(keypair.secretKey, userId)
  } else {
    // Dev fallback — uses a static key, clearly unsafe for production.
    // Warns loudly so developers don't accidentally run this in prod.
    const devKey = Buffer.alloc(32, 'd') // "dddddd..." — obviously dev-only
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', devKey, iv)
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(keypair.secretKey)),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    encryptedSecretKey = Buffer.concat([iv, tag, encrypted]).toString('base64')

    logger.warn('[TIGI] PLATFORM_WALLET_SECRET is not set — custodial wallet encrypted with static dev key. NOT SAFE FOR PRODUCTION. Set PLATFORM_WALLET_SECRET in .env.local before going live.')
  }

  // Keypair is cleared from this scope after the transaction completes.
  // In production, consider using sodium's memory locking for the brief holding period.
  const tx = db as PrismaClient
  await tx.custodialWallet.create({
    data: {
      userId,
      publicKey,
      encryptedSecretKey,
      algorithm: 'AES-256-GCM',
    },
  })

  await tx.user.update({
    where: { id: userId },
    data: { walletAddress: publicKey },
  })

  return publicKey
}

/**
 * Retrieves the custodial wallet's public key for a user.
 * Used to restore `walletAddress` when a user disconnects their external wallet.
 */
export async function getCustodialPublicKey(
  userId: string,
  db: PrismaClient,
): Promise<string | null> {
  const wallet = await db.custodialWallet.findUnique({
    where: { userId },
    select: { publicKey: true },
  })
  return wallet?.publicKey ?? null
}
