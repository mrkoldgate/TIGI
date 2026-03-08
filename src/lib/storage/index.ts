// ---------------------------------------------------------------------------
// storage/index.ts — Provider factory.
//
// Resolves the active storage provider based on environment variables:
//
//   STORAGE_PROVIDER=r2  →  R2StorageProvider  (requires R2_ACCOUNT_ID etc.)
//   STORAGE_PROVIDER=s3  →  R2StorageProvider  (R2 is S3-compatible)
//   (unset / other)      →  LocalStorageProvider
//
// Usage:
//   import { getStorageProvider } from '@/lib/storage'
//   const storage = getStorageProvider()
//   const result = await storage.upload({ key, data, mimeType })
// ---------------------------------------------------------------------------

export type { StorageProvider, UploadParams, UploadResult } from './provider'
export { validateUpload, safeExtension, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES, MAX_IMAGE_BYTES, MAX_DOCUMENT_BYTES } from './provider'

import type { StorageProvider } from './provider'
import { LocalStorageProvider } from './local'
import { R2StorageProvider }    from './r2'

let _provider: StorageProvider | null = null

/**
 * Returns the singleton storage provider instance.
 * Constructed lazily so env vars are resolved at runtime, not at import time.
 */
export function getStorageProvider(): StorageProvider {
  if (_provider) return _provider

  const providerType = process.env.STORAGE_PROVIDER?.toLowerCase()

  if ((providerType === 'r2' || providerType === 's3') && process.env.R2_ACCOUNT_ID) {
    _provider = new R2StorageProvider()
    return _provider
  }

  // Default: local filesystem (dev without cloud credentials)
  _provider = new LocalStorageProvider()
  return _provider
}

/**
 * Reset the singleton (useful in tests or when rotating credentials).
 */
export function resetStorageProvider(): void {
  _provider = null
}
