// ---------------------------------------------------------------------------
// storage/local.ts — Local filesystem storage provider.
//
// Writes uploads to public/uploads/{key} so Next.js serves them statically.
// Suitable for local development without any cloud credentials.
//
// Limitations:
//   - Not suitable for production (Vercel and most serverless platforms
//     have read-only filesystems; writes to /tmp are ephemeral).
//   - public/uploads/ should be in .gitignore to avoid committing uploads.
// ---------------------------------------------------------------------------

import { mkdir, writeFile, unlink } from 'fs/promises'
import { join, dirname } from 'path'
import type { StorageProvider, UploadParams, UploadResult } from './provider'

export class LocalStorageProvider implements StorageProvider {
  private readonly baseDir: string
  private readonly baseUrl: string

  constructor() {
    // Resolve relative to the Next.js project root at runtime.
    this.baseDir = join(process.cwd(), 'public', 'uploads')
    this.baseUrl = '/uploads'
  }

  async upload({ key, data, mimeType }: UploadParams): Promise<UploadResult> {
    const filePath = join(this.baseDir, key)

    // Ensure the directory hierarchy exists.
    await mkdir(dirname(filePath), { recursive: true })

    // Write the file. Buffer and Uint8Array are both accepted by writeFile.
    await writeFile(filePath, data instanceof Buffer ? data : Buffer.from(data))

    return {
      key,
      url:      this.getPublicUrl(key),
      size:     data.length,
      mimeType,
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(join(this.baseDir, key))
    } catch (err: unknown) {
      // ENOENT = file already deleted — ignore; re-throw anything else.
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
    }
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`
  }
}
