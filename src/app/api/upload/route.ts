// ---------------------------------------------------------------------------
// POST /api/upload — Universal file upload endpoint.
//
// Receives a multipart/form-data request with:
//   file     (File)   — the binary file
//   purpose  (string) — storage namespace: "listing-images" | "listing-docs"
//                       | "user-docs-kyc" | "user-docs-inheritance" | "misc"
//
// Flow:
//   1. Authenticate
//   2. Validate file type + size
//   3. Generate a unique storage key
//   4. Call storage provider (LocalStorageProvider in dev, R2 in prod)
//   5. Return { key, url, fileName, fileSize, mimeType } for the caller
//      to persist as a PropertyImage / PropertyDocument / UserDocument record.
//
// The caller is responsible for persisting the DB record via the appropriate
// resource endpoint (e.g. POST /api/listings/[id]/images).
//
// Body size: Next.js App Router route handlers have no built-in limit, but
// Vercel's serverless limit is ~4.5 MB. For larger uploads in production,
// implement presigned URL upload via R2StorageProvider.presignUpload().
// ---------------------------------------------------------------------------

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  getStorageProvider,
  validateUpload,
  safeExtension,
} from '@/lib/storage'

// Valid purpose values → determines storage key prefix
const VALID_PURPOSES = new Set([
  'listing-images',
  'listing-docs',
  'user-docs-kyc',
  'user-docs-inheritance',
  'misc',
])

export async function POST(req: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  // ── Parse multipart body ──────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Expected multipart/form-data' } },
      { status: 400 },
    )
  }

  const file    = formData.get('file')
  const purpose = (formData.get('purpose') as string | null) ?? 'misc'

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: "'file' field is required" } },
      { status: 400 },
    )
  }

  if (!VALID_PURPOSES.has(purpose)) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: `Invalid purpose: ${purpose}` } },
      { status: 400 },
    )
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const isImage = purpose === 'listing-images' || file.type.startsWith('image/')
  const validation = validateUpload(file, isImage ? 'image' : 'document')
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: validation.message } },
      { status: 422 },
    )
  }

  // ── Generate storage key ──────────────────────────────────────────────────
  // Format: {purpose}/{userId}/{uuid}.{ext}
  // This gives per-user isolation and makes cleanup easy.
  const ext = safeExtension(file.name, file.type)
  const uuid = crypto.randomUUID()
  const key = `${purpose}/${session.user.id}/${uuid}.${ext}`

  // ── Upload ────────────────────────────────────────────────────────────────
  let url: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const storage = getStorageProvider()
    const result = await storage.upload({ key, data: buffer, mimeType: file.type })
    url = result.url
  } catch (err) {
    console.error('[api/upload POST] Storage error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'STORAGE_ERROR', message: 'Upload failed. Please try again.' } },
      { status: 500 },
    )
  }

  // ── Return metadata for the caller to persist ─────────────────────────────
  return NextResponse.json(
    {
      success: true,
      data: {
        key,
        url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    },
    { status: 201 },
  )
}
