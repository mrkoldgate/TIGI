// ---------------------------------------------------------------------------
// storage/r2.ts — Cloudflare R2 storage provider.
//
// R2 is S3-compatible, so this implementation uses @aws-sdk/client-s3
// and @aws-sdk/s3-request-presigner via the standard AWS SDK v3 API.
//
// ── To activate this provider ────────────────────────────────────────────────
// 1. Install the SDK packages:
//      npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
//
// 2. Set environment variables (see .env.example):
//      STORAGE_PROVIDER=r2
//      R2_ACCOUNT_ID=your_account_id
//      R2_ACCESS_KEY_ID=your_access_key
//      R2_SECRET_ACCESS_KEY=your_secret_key
//      R2_BUCKET_NAME=tigi-storage
//      R2_PUBLIC_URL=https://your-r2-public-domain.com
//
// 3. Uncomment the implementation below and remove the stub error.
// ---------------------------------------------------------------------------

import type { StorageProvider, UploadParams, UploadResult } from './provider'

export class R2StorageProvider implements StorageProvider {
  private readonly publicUrl: string
  private readonly bucket: string

  constructor() {
    this.bucket    = process.env.R2_BUCKET_NAME ?? 'tigi-storage'
    this.publicUrl = process.env.R2_PUBLIC_URL  ?? ''

    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID) {
      throw new Error(
        'R2StorageProvider: R2_ACCOUNT_ID and R2_ACCESS_KEY_ID must be set. ' +
        'See src/lib/storage/r2.ts for setup instructions.',
      )
    }
  }

  // ── upload ───────────────────────────────────────────────────────────────

  async upload({ key, data, mimeType }: UploadParams): Promise<UploadResult> {
    // TODO: Uncomment after installing @aws-sdk/client-s3
    //
    // const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    // const client = new S3Client({
    //   region: 'auto',
    //   endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    //   credentials: {
    //     accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    //     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    //   },
    // })
    //
    // await client.send(new PutObjectCommand({
    //   Bucket:      this.bucket,
    //   Key:         key,
    //   Body:        data instanceof Buffer ? data : Buffer.from(data),
    //   ContentType: mimeType,
    // }))
    //
    // return { key, url: this.getPublicUrl(key), size: data.length, mimeType }

    throw new Error(
      'R2StorageProvider.upload: Install @aws-sdk/client-s3 and uncomment the ' +
      'implementation in src/lib/storage/r2.ts.',
    )
  }

  // ── delete ───────────────────────────────────────────────────────────────

  async delete(key: string): Promise<void> {
    // TODO: Uncomment after installing @aws-sdk/client-s3
    //
    // const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    // const client = new S3Client({ ... })
    // await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    //
    void key
    throw new Error(
      'R2StorageProvider.delete: Install @aws-sdk/client-s3 and uncomment the ' +
      'implementation in src/lib/storage/r2.ts.',
    )
  }

  // ── getPublicUrl ─────────────────────────────────────────────────────────

  getPublicUrl(key: string): string {
    if (!this.publicUrl) {
      throw new Error('R2StorageProvider: R2_PUBLIC_URL must be set to construct public URLs.')
    }
    return `${this.publicUrl.replace(/\/$/, '')}/${key}`
  }

  // ── Presigned URL (future optimisation) ─────────────────────────────────
  //
  // For large files, generate a presigned PUT URL so the client uploads
  // directly to R2 without routing through your Next.js server:
  //
  // async presignUpload(key: string, mimeType: string, expiresIn = 3600) {
  //   const { S3Client } = await import('@aws-sdk/client-s3')
  //   const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
  //   const { PutObjectCommand } = await import('@aws-sdk/client-s3')
  //   const client = new S3Client({ ... })
  //   const url = await getSignedUrl(client, new PutObjectCommand({
  //     Bucket: this.bucket, Key: key, ContentType: mimeType,
  //   }), { expiresIn })
  //   return { uploadUrl: url, publicUrl: this.getPublicUrl(key) }
  // }
}
