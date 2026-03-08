// ---------------------------------------------------------------------------
// storage/provider.ts — Storage provider interface.
//
// All uploads in TIGI flow through this abstraction. Swap the implementation
// by changing getStorageProvider() in index.ts:
//
//   LocalStorageProvider  → writes to public/uploads/ (dev, no credentials)
//   R2StorageProvider     → Cloudflare R2 via @aws-sdk/client-s3 (production)
//
// Key naming convention (enforced by callers, not the provider):
//   listing-images/{listingId}/{uuid}.{ext}
//   listing-docs/{listingId}/{uuid}.{ext}
//   user-docs/{purpose}/{userId}/{uuid}.{ext}
// ---------------------------------------------------------------------------

// ── Core types ────────────────────────────────────────────────────────────────

export interface UploadParams {
  /** Storage key — the path within the bucket */
  key: string
  /** Raw file bytes */
  data: Buffer | Uint8Array
  /** MIME type, e.g. "image/jpeg" */
  mimeType: string
}

export interface UploadResult {
  /** Storage key (path within the bucket) */
  key: string
  /** Public-accessible URL for display in the app */
  url: string
  /** Size in bytes */
  size: number
  /** MIME type */
  mimeType: string
}

export interface DeleteParams {
  key: string
}

// ── Provider interface ────────────────────────────────────────────────────────

export interface StorageProvider {
  /**
   * Upload a file server-side. Used by the /api/upload route handler.
   * Returns the public URL and storage key once the file is durably stored.
   */
  upload(params: UploadParams): Promise<UploadResult>

  /**
   * Delete a stored object. Idempotent — should not throw if key doesn't exist.
   */
  delete(key: string): Promise<void>

  /**
   * Construct the public URL for a given storage key.
   * Useful for reconstructing URLs after DB reads.
   */
  getPublicUrl(key: string): string
}

// ── File validation helpers ───────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

export const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
])

export const MAX_IMAGE_BYTES    = 20 * 1024 * 1024 // 20 MB
export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024 // 50 MB

export function validateUpload(
  file: File,
  purpose: 'image' | 'document',
): { valid: true } | { valid: false; message: string } {
  const allowed = purpose === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES
  const maxSize = purpose === 'image' ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES

  if (!allowed.has(file.type)) {
    const types = purpose === 'image'
      ? 'JPEG, PNG, or WebP'
      : 'PDF, JPEG, or PNG'
    return { valid: false, message: `Unsupported file type. Please upload a ${types} file.` }
  }

  if (file.size > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024)
    return { valid: false, message: `File too large. Maximum size is ${mb} MB.` }
  }

  return { valid: true }
}

/** Derive a safe file extension from a MIME type or original filename. */
export function safeExtension(fileName: string, mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg':  'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  }
  if (mimeMap[mimeType]) return mimeMap[mimeType]
  const fromName = fileName.split('.').pop()?.toLowerCase()
  return fromName && /^[a-z0-9]{1,6}$/.test(fromName) ? fromName : 'bin'
}
