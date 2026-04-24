import type { AvatarConfig, AvatarLayerCategory, SpriteEntry } from '@/types/avatar'
import { SPRITE_MANIFEST, spriteUrl } from '@/lib/sprites/manifest'

// ── Constants ───────────────────────────────────────────────────────────────

export const CELL = 64
const WALK_DOWN_ROW_FULL = 10
const WALK_DOWN_ROW_WALK = 2
const WALK_FRAME_COL = 0

// Bottom → top, matching the LPC paper-doll spec.
// Hair is drawn once at position 3 (before clothing) as a simplified preview.
// In full animation the hair sheet would be split into rear + front layers.
export const DRAW_ORDER: AvatarLayerCategory[] = [
  'body', 'eyes', 'hair', 'pants', 'shirt',
  'boots', 'hands', 'belt', 'cape', 'helmet',
  'weapon', 'shield',
]

// ── Types ───────────────────────────────────────────────────────────────────

export interface ResolvedLayer {
  category: AvatarLayerCategory
  url: string
  hexTint: string | null
}

export interface LoadedLayer {
  category: AvatarLayerCategory
  img: HTMLImageElement | null
  hexTint: string | null
}

export interface FramePosition {
  col: number
  row: number
}

export interface CompositeOptions {
  bodyType?: 'male' | 'female'
  frame?: FramePosition
  size?: number
}

// ── Body type detection ─────────────────────────────────────────────────────

/** Returns true if the body id belongs to the male variant. */
export function isMaleBody(bodyId: string | null): boolean {
  if (!bodyId) return false
  return bodyId === 'body_male' || bodyId === 'body_soldier'
}

// ── URL resolution ──────────────────────────────────────────────────────────

/**
 * Resolve the final PNG URL for a given layer slot.
 *
 * Rules:
 * - Looks up the sprite entry in SPRITE_MANIFEST by category + id.
 * - If the path contains `{color}`, substitutes `color` as the variant name
 *   (e.g. "brown" → "brown.png"). Hex colors (#rrggbb) are NOT used for file
 *   selection — they are applied on-canvas as tinting.
 * - Picks `pathMale` when the body is male and the entry has a male path.
 */
function resolveUrl(
  category: AvatarLayerCategory,
  layerId: string,
  color: string | null | undefined,
  male: boolean,
): string | null {
  const entries = SPRITE_MANIFEST[category] as Record<string, SpriteEntry>
  const entry = entries?.[layerId]
  if (!entry) return null

  let path = (male && entry.pathMale) ? entry.pathMale : entry.path

  if (path.includes('{color}')) {
    const variant =
      color && !color.startsWith('#')
        ? color
        : (entry.colorVariants?.[0] ?? null)
    if (!variant) return null
    path = path.replace('{color}', variant)
  }

  return spriteUrl(path)
}

/**
 * Resolve all layer URLs from an AvatarConfig.
 * Skips layers where the id is null/empty or the sprite cannot be resolved.
 */
export function resolveLayerUrls(
  config: AvatarConfig,
  male: boolean,
): ResolvedLayer[] {
  const result: ResolvedLayer[] = []

  for (const category of DRAW_ORDER) {
    const layer = config[category]
    if (!layer?.id) continue

    const hexTint = layer.color?.startsWith('#') ? layer.color : null
    const url = resolveUrl(category, layer.id, layer.color, male)
    if (!url) continue

    result.push({ category, url, hexTint })
  }

  return result
}

// ── Image loading ───────────────────────────────────────────────────────────

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/**
 * Load all resolved sprite images in parallel.
 * Returns an array in the same order as the input layers.
 * Failed loads produce `img: null` entries — callers should skip them.
 */
export async function loadSpriteImages(
  layers: ResolvedLayer[],
): Promise<LoadedLayer[]> {
  const results = await Promise.all(
    layers.map(async (layer) => ({
      category: layer.category,
      img: await loadImg(layer.url),
      hexTint: layer.hexTint,
    })),
  )
  return results
}

// ── Frame detection ─────────────────────────────────────────────────────────

/**
 * Auto-detect the walk-down row index from a sprite sheet's height.
 * Full LPC sheets (≥11 rows) use row 10; walk-only sheets (4 rows) use row 2.
 */
export function detectWalkRow(img: HTMLImageElement): number {
  const rowCount = Math.floor(img.naturalHeight / CELL)
  return rowCount >= WALK_DOWN_ROW_FULL + 1
    ? WALK_DOWN_ROW_FULL
    : WALK_DOWN_ROW_WALK
}

// ── Per-layer compositing ───────────────────────────────────────────────────

/**
 * Draw one sprite layer onto a fresh 64×64 offscreen canvas.
 *
 * If `hexTint` is provided:
 *   1. Draws the sprite frame.
 *   2. Multiply-blends the tint color over every pixel.
 *   3. Clips the result back to the sprite's original alpha, so transparent
 *      pixels remain clear.
 */
export function compositeLayer(
  img: HTMLImageElement,
  hexTint: string | null,
  frame?: FramePosition,
): HTMLCanvasElement {
  const off = document.createElement('canvas')
  off.width = CELL
  off.height = CELL
  const ctx = off.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  const col = frame?.col ?? WALK_FRAME_COL
  const row = frame?.row ?? detectWalkRow(img)
  const sx = col * CELL
  const sy = row * CELL

  ctx.drawImage(img, sx, sy, CELL, CELL, 0, 0, CELL, CELL)

  if (hexTint) {
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = hexTint
    ctx.fillRect(0, 0, CELL, CELL)

    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(img, sx, sy, CELL, CELL, 0, 0, CELL, CELL)

    ctx.globalCompositeOperation = 'source-over'
  }

  return off
}

// ── Full avatar compositing ─────────────────────────────────────────────────

/**
 * Composites all layers of an avatar onto a single 64×64 canvas.
 *
 * Layers are drawn bottom-to-top following DRAW_ORDER.
 * Layers with null id or unresolvable URLs are silently skipped.
 *
 * Options:
 *   - bodyType: auto-detected from config.body.id if omitted
 *   - frame: defaults to { col: 0, row: auto-detected per sprite }
 *   - size: output canvas size in px (default: 64). Scales to nearest
 *     multiple of 64 for crisp pixel art.
 */
export async function compositeAvatar(
  config: AvatarConfig,
  options?: CompositeOptions,
): Promise<HTMLCanvasElement> {
  const male = options?.bodyType
    ? options.bodyType === 'male'
    : isMaleBody(config.body?.id ?? null)

  const layers = resolveLayerUrls(config, male)
  const loaded = await loadSpriteImages(layers)

  const cellSize = CELL
  const canvas = document.createElement('canvas')
  canvas.width = cellSize
  canvas.height = cellSize
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  for (const { img, hexTint } of loaded) {
    if (!img) continue

    const frame = options?.frame ?? undefined
    const layerCanvas = compositeLayer(img, hexTint, frame)
    ctx.drawImage(layerCanvas, 0, 0)
  }

  // Scale up if requested
  const targetSize = options?.size ?? CELL
  if (targetSize !== CELL) {
    const scaled = document.createElement('canvas')
    const roundedSize = Math.round(targetSize / CELL) * CELL
    scaled.width = roundedSize
    scaled.height = roundedSize
    const scaledCtx = scaled.getContext('2d')!
    scaledCtx.imageSmoothingEnabled = false
    scaledCtx.drawImage(canvas, 0, 0, roundedSize, roundedSize)
    return scaled
  }

  return canvas
}

// ── Boss sprite compositing ─────────────────────────────────────────────────

import type { BossPalette, PixelBuffer } from '@/lib/sprites/palette'
import { swapPalette } from '@/lib/sprites/palette'
import { BOSS_SPRITE_MANIFEST } from '@/lib/sprites/palette'

export interface BossCompositeOptions {
  palette?: BossPalette | null
  frame?: FramePosition
  scale?: number
}

/**
 * Composites a boss sprite onto a scaled canvas with optional palette swap.
 */
export async function compositeBoss(
  bossKey: string,
  options?: BossCompositeOptions,
): Promise<HTMLCanvasElement | null> {
  const info = BOSS_SPRITE_MANIFEST[bossKey]
  if (!info) return null

  let url: string
  let cellSize: number

  if (info.format === 'folder') {
    url = spriteUrl(`${info.basePath}/${info.idleFrames?.[0] ?? 'Idle1.png'}`)
    cellSize = 64
  } else {
    url = spriteUrl(info.basePath)
    cellSize = info.cellW ?? 64
  }

  const img = await loadImg(url)
  if (!img) return null

  const col = options?.frame?.col ?? 0
  const row = options?.frame?.row ?? 0
  const sx = col * cellSize
  const sy = row * cellSize

  const off = document.createElement('canvas')
  off.width = cellSize
  off.height = cellSize
  const ctx = off.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, sx, sy, cellSize, cellSize, 0, 0, cellSize, cellSize)

  if (options?.palette) {
    const imageData = ctx.getImageData(0, 0, cellSize, cellSize)
    const result = swapPalette(
      { data: imageData.data, width: cellSize, height: cellSize },
      options.palette,
    )
    ctx.putImageData(
      new ImageData(
        new Uint8ClampedArray(result.data),
        cellSize,
        cellSize,
      ),
      0,
      0,
    )
  }

  const scale = options?.scale ?? 3
  const outputSize = cellSize * scale
  const output = document.createElement('canvas')
  output.width = outputSize
  output.height = outputSize
  const outCtx = output.getContext('2d')!
  outCtx.imageSmoothingEnabled = false
  outCtx.drawImage(off, 0, 0, outputSize, outputSize)

  return output
}
