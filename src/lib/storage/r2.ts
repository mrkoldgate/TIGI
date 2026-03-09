// ---------------------------------------------------------------------------
// storage/r2.ts — Cloudflare R2 storage provider.
//
// R2 is S3-compatible, so this implementation uses @aws-sdk/client-s3
// via the standard AWS SDK v3 API.
//
// ── To activate this provider ────────────────────────────────────────────────
// 1. Install the SDK packages (already in package.json):
//      npm install
//
// 2. Set environment variables (see .env.example):
//      STORAGE_PROVIDER=r2
//      R2_ACCOUNT_ID=your_account_id
//      R2_ACCESS_KEY_ID=your_access_key
//      R2_SECRET_ACCESS_KEY=your_secret_key
//      R2_BUCKET_NAME=tigi-storage
//      R2_PUBLIC_URL=https://your-r2-public-domain.com
// ---------------------------------------------------------------------------

import type { StorageProvider, UploadParams, UploadResult } from './provider'

export class R2StorageProvider implements StorageProvider {
  private readonly publicUrl: string
  private readonly bucket: string
  private readonly endpoint: string

  constructor() {
    this.bucket    = process.env.R2_BUCKET_NAME ?? 'tigi-storage'
    this.publicUrl = process.env.R2_PUBLIC_URL  ?? ''
    this.endpoint  = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID) {
      throw new Error(
        'R2StorageProvider: R2_ACCOUNT_ID and R2_ACCESS_KEY_ID must be set. ' +
        'See .env.example for setup instructions.',
      )
    }
  }

  // ── Lazy S3Client factory ─────────────────────────────────────────────────
  // Imported dynamically so the AWS SDK is not bundled unless STORAGE_PROVIDER=r2.

  private async getClient() {
    const { S3Client } = await import('@aws-sdk/client-s3')
    return new S3Client({
      region:      'auto',
      endpoint:    this.endpoint,
      credentials: {
        accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  }

  // ── upload ───────────────────────────────────────────────────────────────

  async upload({ key, data, mimeType }: UploadParams): Promise<UploadResult> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = await this.getClient()
    const buffer = data instanceof Buffer ? data : Buffer.from(data)

    await client.send(new PutObjectCommand({
      Bucket:      this.bucket,
      Key:         key,
      Body:        buffer,
      ContentType: mimeType,
    }))

    return {
      key,
      url:      this.getPublicUrl(key),
      size:     buffer.length,
      mimeType,
    }
  }

  // ── delete ───────────────────────────────────────────────────────────────

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const client = await this.getClient()

    try {
      await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    } catch {
      // Idempotent — ignore if object doesn't exist.
    }
  }

  // ── getPublicUrl ─────────────────────────────────────────────────────────

  getPublicUrl(key: string): string {
    if (!this.publicUrl) {
      throw new Error('R2StorageProvider: R2_PUBLIC_URL must be set to construct public URLs.')
    }
    return `${this.publicUrl.replace(/\/$/, '')}/${key}`
  }

  // ── presignUpload ─────────────────────────────────────────────────────────
  // Generate a presigned PUT URL so the browser uploads directly to R2,
  // bypassing the Next.js serverless size limit (~4.5 MB on Vercel).

  async presignUpload(key: string, mimeType: string, expiresIn = 3600): Promise<{
    uploadUrl: string
    publicUrl: string
  }> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl }     = await import('@aws-sdk/s3-request-presigner')
    const client               = await this.getClient()

    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: mimeType }),
      { expiresIn },
    )

    return { uploadUrl, publicUrl: this.getPublicUrl(key) }
  }
}
