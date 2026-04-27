#!/usr/bin/env npx tsx
/**
 * Uploads all sprite (PNG) and audio (MP3, OGG, WAV) assets from
 * public/sprites/ to Supabase Storage.
 *
 * - Creates the "sprites" bucket if it doesn't exist (public access).
 * - Preserves the full directory structure as storage object keys.
 * - Skips files that already exist — safe to re-run at any time.
 *
 * Usage:
 *   npx tsx scripts/upload-sprites.ts
 *
 * Env vars are read from .env.local automatically; no extra setup needed.
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Load .env.local (tsx runs outside Next.js, so we handle this ourselves)
// ---------------------------------------------------------------------------
const envFile = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    // Don't override values already set in the shell environment
    if (!(key in process.env)) process.env[key] = value
  }
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SPRITES_LOCAL_DIR = path.join(process.cwd(), 'public', 'sprites')
const BUCKET = 'sprites'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌  Missing required environment variables:\n' +
    '    NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n' +
    '    These should be in .env.local'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function ensureBucket(): Promise<void> {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw new Error(`Could not list buckets: ${error.message}`)

  if (buckets.some((b) => b.name === BUCKET)) {
    console.log(`  Bucket "${BUCKET}" already exists.`)
    return
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav'],
  })
  if (createError) throw new Error(`Could not create bucket: ${createError.message}`)
  console.log(`  ✅ Created public bucket "${BUCKET}".`)
}

const ASSET_EXTENSIONS = new Set(['.png', '.mp3', '.ogg', '.wav', '.jpg', '.jpeg', '.gif', '.webp'])

const EXT_MIME: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.wav':  'audio/wav',
}

/** Recursively collects asset files under dir (PNG sprites + audio). */
function walkAssets(dir: string, result: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkAssets(full, result)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (ASSET_EXTENSIONS.has(ext)) result.push(full)
    }
  }
  return result
}

function contentTypeFor(absPath: string): string {
  return EXT_MIME[path.extname(absPath).toLowerCase()] ?? 'application/octet-stream'
}

/** Storage key for an absolute local path: relative to public/sprites/, forward slashes. */
function toStorageKey(absPath: string): string {
  return path.relative(SPRITES_LOCAL_DIR, absPath).split(path.sep).join('/')
}

type UploadResult = 'uploaded' | 'skipped' | 'error'

async function uploadFile(absPath: string): Promise<UploadResult> {
  const storageKey = toStorageKey(absPath)
  const fileBuffer = fs.readFileSync(absPath)

  const { error } = await supabase.storage.from(BUCKET).upload(storageKey, fileBuffer, {
    contentType: contentTypeFor(absPath),
    upsert: false, // error (not overwrite) if the object already exists
  })

  if (!error) return 'uploaded'

  // Supabase returns a duplicate/conflict error when the object already exists
  const msg = error.message.toLowerCase()
  const code = (error as { statusCode?: string | number }).statusCode
  if (msg.includes('already exists') || msg.includes('duplicate') || code === '409' || code === 409) {
    return 'skipped'
  }

  console.error(`\n  ❌  ${storageKey}: ${error.message}`)
  return 'error'
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n🗡️   Quest Forge — Sprite Uploader\n')

  if (!fs.existsSync(SPRITES_LOCAL_DIR)) {
    console.error(`❌  Sprite directory not found: ${SPRITES_LOCAL_DIR}`)
    process.exit(1)
  }

  console.log('📦  Checking storage bucket…')
  await ensureBucket()

  const assets = walkAssets(SPRITES_LOCAL_DIR)
  console.log(`\n📂  Found ${assets.length} asset file(s) to process.\n`)

  let uploaded = 0
  let skipped = 0
  let errors = 0
  const total = assets.length
  const width = String(total).length

  for (let i = 0; i < assets.length; i++) {
    const absPath = assets[i]
    const label = toStorageKey(absPath)
    process.stdout.write(`  [${String(i + 1).padStart(width)}/${total}] ${label} … `)

    const result = await uploadFile(absPath)
    if (result === 'uploaded') {
      console.log('\u2705 uploaded')
      uploaded++
    } else if (result === 'skipped') {
      console.log('\u23ED\uFE0F  already exists')
      skipped++
    } else {
      errors++
    }
  }

  console.log('\n─────────────────────────────────────────────')
  console.log(`  ✅ Uploaded  : ${uploaded}`)
  console.log(`  ⏭️  Skipped   : ${skipped}`)
  console.log(`  ❌ Errors    : ${errors}`)
  console.log('─────────────────────────────────────────────\n')

  const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
  console.log(`🔗  Public sprite base URL:\n    ${baseUrl}\n`)
  console.log(
    `    Add this to your .env.local:\n` +
    `    NEXT_PUBLIC_SPRITE_BASE_URL=${baseUrl}\n`
  )

  if (errors > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
