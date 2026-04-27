/**
 * Sprite compositor — renders LPC paper-doll avatars and boss sprites to canvas.
 *
 * Key features:
 * - **Image cache** — all loaded images are cached by URL to eliminate redundant
 *   network requests across React component re-renders.
 * - **HSL recolor** — per-pixel hue replacement for hair/eyes tinting (preserves
 *   saturation and luminance from the source sprite).
 * - **Body-type filtering** — gender-specific sprites are silently skipped when
 *   they don't match the body's type.
 * - **Color-variant fallback chain** — hex colors and unknown variants fall through
 *   to `base.png` or the first named variant rather than skipping the layer.
 * - **Preload helper** — `preloadAvatarImages()` warms the cache on route entry.
 *
 * Exports (keep in sync with all consumers):
 *   CELL, DRAW_ORDER, ResolvedLayer, LoadedLayer, FramePosition,
 *   CompositeOptions, BossCompositeOptions,
 *   isMaleBody, resolveLayerUrls, loadSpriteImages, detectWalkRow,
 *   compositeLayer, compositeAvatar, compositeBoss, preloadAvatarImages
 */

import type { AvatarConfig, AvatarLayerCategory, SpriteEntry } from '@/types/avatar'
import { SPRITE_MANIFEST, spriteUrl } from '@/lib/sprites/manifest'

// ── Constants ───────────────────────────────────────────────────────────────

/** Pixel dimensions of one LPC sprite cell (walk cycle frame or icon). */
export const CELL = 64

const WALK_DOWN_ROW_FULL = 10
const WALK_DOWN_ROW_WALK = 2
const WALK_FRAME_COL = 0

// Bottom → top, matching the LPC paper-doll spec.
// Head is drawn after body to provide face features (eyes, nose, mouth).
// Hair is drawn at position 4 (before clothing) as a simplified preview.
// In full animation the hair sheet would be split into rear + front layers.
export const DRAW_ORDER: AvatarLayerCategory[] = [
  'body', 'head', 'eyes', 'hair', 'pants', 'shirt',
  'boots', 'hands', 'belt', 'cape', 'helmet',
  'weapon', 'shield',
]

/**
 * Maps named color strings (as used in AvatarConfig and the character creator)
 * to their hex equivalents for runtime tinting.
 *
 * Standard colors match the LPC palette conventions; metal tones are used
 * by plate and heavier armour variants.
 */
const COLOR_HEX_MAP: Record<string, string> = {
  // Standard palette
  black:    '#222222',
  blue:     '#4466dd',
  bluegray: '#6688aa',
  brown:    '#885533',
  charcoal: '#333333',
  forest:   '#337733',
  gray:     '#888888',
  green:    '#44aa44',
  lavender: '#cc99cc',
  leather:  '#996644',
  maroon:   '#883333',
  navy:     '#223388',
  orange:   '#dd8833',
  pink:     '#dd88aa',
  purple:   '#8844aa',
  red:      '#cc3333',
  rose:     '#cc4477',
  sky:      '#88bbdd',
  slate:    '#667788',
  tan:      '#ccaa77',
  teal:     '#338888',
  walnut:   '#664433',
  white:    '#eeeeee',
  yellow:   '#ddcc33',
  // Metal tones
  brass:    '#b5a642',
  bronze:   '#cd7f32',
  ceramic:  '#e8e0d0',
  copper:   '#b87333',
  gold:     '#ffd700',
  iron:     '#434b4d',
  silver:   '#c0c0c0',
  steel:    '#71797e',
}

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
  row?: number
}

export interface CompositeOptions {
  bodyType?: 'male' | 'female'
  frame?: FramePosition
  size?: number
}

export interface BossCompositeOptions {
  palette?: import('@/lib/sprites/palette').BossPalette | null
  frame?: FramePosition
  scale?: number
}

// ── Image cache ────────────────────────────────────────────────────────────

/** Module-level image cache keyed by URL. */
const _imgCache = new Map<string, HTMLImageElement>()

/** Returns the cached image for a URL, or null if not yet loaded. */
export function getCachedImage(url: string): HTMLImageElement | undefined {
  return _imgCache.get(url)
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
 * - If the path contains `{color}`, substitutes a color variant name.
 *   - Named colors ("brown", "navy") resolve directly to their PNG file.
 *   - Hex colors (#rrggbb) cannot map to files — triggers fallback chain.
 * - Picks `pathMale` when the body is male and the entry has a male path.
 * - **Fallback chain:** if `{color}` is present but no variant matches,
 *   try substituting `base`; if that also 404s, fall back to the first
 *   named variant in `entry.colorVariants`.  Only skip the layer if
 *   nothing resolves.
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
    if (color && color.startsWith('#')) {
      // Hex color — the render-time hexTint pipeline will recolor the
      // sprite via recolorToHue().  Use the first named variant as the
      // source image so we don't need a non-existent "base.png".
      const fallback = entry.colorVariants?.[0] ?? null
      if (!fallback) return null
      path = path.replace('{color}', fallback)
    } else {
      // Named variant (or no color at all) — resolve to the actual file.
      const namedVariant = color ?? null
      if (namedVariant && entry.colorVariants?.includes(namedVariant)) {
        path = path.replace('{color}', namedVariant)
      } else {
        // Unknown named variant, or no color set → use the first variant.
        const fallback = entry.colorVariants?.[0] ?? null
        if (!fallback) return null
        path = path.replace('{color}', fallback)
      }
    }
  }

  return spriteUrl(path)
}

/**
 * Resolve all layer URLs from an AvatarConfig.
 *
 * Body-type filtering: if a sprite entry has `bodyType: 'female'` and the
 * character body is male (or vice-versa), that layer is silently skipped.
 * Universal sprites are always included.
 */
export function resolveLayerUrls(
  config: AvatarConfig,
  male: boolean,
): ResolvedLayer[] {
  const result: ResolvedLayer[] = []

  for (const category of DRAW_ORDER) {
    const layer = config[category]
    if (!layer?.id) continue

    // ── Body-type filtering ──────────────────────────────────────────────────
    const entries = SPRITE_MANIFEST[category] as Record<string, SpriteEntry>
    const entry = entries?.[layer.id]
    if (entry?.bodyType && entry.bodyType !== 'universal') {
      const isMaleEntry = entry.bodyType === 'male'
      if (isMaleEntry !== male) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[sprite-compositor] Skipping layer "${layer.id}" ` +
            `(bodyType: ${entry.bodyType}) — does not match body type ` +
            `"${male ? 'male' : 'female'}".`,
          )
        }
        continue
      }
    }
    // ── End body-type filtering ─────────────────────────────────────────────

    // Resolve hex tint: hex colors (#...) pass through directly;
    // named colors (navy, blue, brown, etc.) are mapped via COLOR_HEX_MAP
    // so that base sprites downloaded from LPC (which ship uncolored) get
    // runtime per-pixel hue recolor applied.
    let hexTint: string | null = null
    if (layer.color) {
      if (layer.color.startsWith('#')) {
        hexTint = layer.color
      } else if (COLOR_HEX_MAP[layer.color]) {
        hexTint = COLOR_HEX_MAP[layer.color]
      }
    }
    const url = resolveUrl(category, layer.id, layer.color, male)
    if (!url) continue

    result.push({ category, url, hexTint })
  }

  return result
}

// ── Image loading ───────────────────────────────────────────────────────────

/**
 * Load an image, using the module-level cache to avoid redundant requests.
 *
 * Cache strategy:
 * - If the URL is already in cache and the Image is complete, reuse it.
 * - Otherwise create a new Image, cache it, and resolve on load / reject on error.
 *
 * In development, emits a console.warn when the image fails to load.
 */
function loadImg(src: string): Promise<HTMLImageElement | null> {
  // Fast path: cached and already loaded.
  const cached = _imgCache.get(src)
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached)
  }

  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    _imgCache.set(src, img)

    const timeoutId = setTimeout(() => {
      _imgCache.delete(src)
      console.warn(`[sprite] TIMEOUT (10s): "${src.split('/').pop()}"`)
      resolve(null)
    }, 10_000)

    img.onload = () => {
      clearTimeout(timeoutId)
      console.log(`[sprite] LOADED: ${src.split('/').pop()} (${img.naturalWidth}x${img.naturalHeight})`)
      resolve(img)
    }
    img.onerror = () => {
      clearTimeout(timeoutId)
      _imgCache.delete(src)
      console.warn(`[sprite] FAILED: "${src}"`)
      resolve(null)
    }

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
  if (rowCount === 1) return 0                            // single-frame sprite (weapons, shields)
  if (rowCount >= WALK_DOWN_ROW_FULL + 1) return WALK_DOWN_ROW_FULL  // full multi-row sheet
  return WALK_DOWN_ROW_WALK                                // walk-only sheet (4 rows)
}

// ── Per-layer compositing ───────────────────────────────────────────────────

/**
 * Per-pixel HSL tint helper — recolor a pixel buffer using the target hue
 * while preserving each pixel's original saturation and lightness.
 *
 * This is needed because LPC hair sprites are palettized (indexed PNGs)
 * with pre-existing red/warm tones rather than pure grayscale.  The
 * `overlay` blend mode produces muddy reddish results on these sprites,
 * so we use per-pixel HSL replacement instead.
 *
 * @param pixels    — Uint8ClampedArray (RGBA, 4 bytes per pixel)
 * @param hexTint   — leading-# hex color, e.g. "#1a1008"
 */
function recolorToHue(pixels: Uint8ClampedArray, hexTint: string): void {
  // ── Parse target hex ────────────────────────────────────────────────────
  const tr = parseInt(hexTint.slice(1, 3), 16) / 255
  const tg = parseInt(hexTint.slice(3, 5), 16) / 255
  const tb = parseInt(hexTint.slice(5, 7), 16) / 255

  // ── Compute target HSL ──────────────────────────────────────────────────
  const tMax = Math.max(tr, tg, tb)
  const tMin = Math.min(tr, tg, tb)
  const tL = (tMax + tMin) / 2
  const tD = tMax - tMin
  const tS = tL > 0.5 ? tD / (2 - tMax - tMin) : tD / (tMax + tMin)
  let tH = 0
  if (tD > 0) {
    if (tMax === tr) tH = ((tg - tb) / tD + (tg < tb ? 6 : 0)) / 6
    else if (tMax === tg) tH = ((tb - tr) / tD + 2) / 6
    else tH = ((tr - tg) / tD + 4) / 6
  }

  // ── Per-pixel recolor ───────────────────────────────────────────────────
  // Helper: convert HSL channel to RGB (single channel)
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3]
    if (a === 0) continue // skip transparent

    const r = pixels[i] / 255
    const g = pixels[i + 1] / 255
    const b = pixels[i + 2] / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2

    // Reconstruct: target H & S, original L  →  RGB
    const q = l < 0.5 ? l * (1 + tS) : l + tS - l * tS
    const p = 2 * l - q

    pixels[i]     = Math.round(hue2rgb(p, q, tH + 1 / 3) * 255)
    pixels[i + 1] = Math.round(hue2rgb(p, q, tH) * 255)
    pixels[i + 2] = Math.round(hue2rgb(p, q, tH - 1 / 3) * 255)
  }
}

/**
 * Draw one sprite layer onto a fresh 64×64 offscreen canvas.
 *
 * Hex tinting strategy — uses per-pixel HSL recolor (not `overlay` blend mode):
 *   a. Draw the sprite frame at the given cell position.
 *   b. Extract pixel data and apply `recolorToHue()` to replace the hue
 *      while preserving each pixel's original saturation and luminance.
 *   c. Put the modified pixel data back onto the canvas.
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

  // Diagnostic: warn when source rect exceeds image bounds (will clip to transparent).
  if (sx + CELL > img.naturalWidth || sy + CELL > img.naturalHeight) {
    console.warn(`[sprite] compositeLayer: source rect (${sx},${sy},${CELL},${CELL}) exceeds image (${img.naturalWidth}x${img.naturalHeight}) for "${img.src.split('/').pop()}"`)
  }

  // Step a: draw the sprite.
  ctx.drawImage(img, sx, sy, CELL, CELL, 0, 0, CELL, CELL)

  if (hexTint) {
    // Step b: per-pixel HSL recolor — replaces hue while preserving saturation
    // and lightness from the original sprite, producing correct color results
    // regardless of the source sprite's base palette.
    //
    // try/catch guards against SecurityError on getImageData() when the
    // canvas becomes tainted (e.g. cross-origin images served without
    // permissive CORS headers despite our crossorigin="anonymous" attribute).
    // In that case we draw the layer untinted — degraded appearance is
    // preferable to a frozen card skeleton.
    try {
      const imageData = ctx.getImageData(0, 0, CELL, CELL)
      recolorToHue(imageData.data, hexTint)
      ctx.putImageData(imageData, 0, 0)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[sprite-compositor] Tinting failed for layer, drawing untinted:`,
          err,
        )
      }
    }
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
 *   - frame:   defaults to { col: 0, row: auto-detected per sprite }
 *   - size:    output canvas size in px (default: 64). Scales to the nearest
 *              multiple of 64 for crisp pixel art scaling.
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

  const canvas = document.createElement('canvas')
  canvas.width = CELL
  canvas.height = CELL
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  let loadedCount = 0
  for (const { img, hexTint } of loaded) {
    if (!img) continue
    loadedCount++

    const frame = options?.frame ?? undefined
    const layerCanvas = compositeLayer(img, hexTint, frame)
    ctx.drawImage(layerCanvas, 0, 0)
  }

  // Diagnostic: check if the composited result has any non-transparent pixels.
  try {
    const id = ctx.getImageData(0, 0, CELL, CELL)
    let opaquePx = 0
    for (let i = 3; i < id.data.length; i += 4) {
      if (id.data[i] > 0) opaquePx++
    }
    console.log(`[sprite] compositeAvatar: ${loadedCount}/${loaded.length} layers, ${opaquePx}/${CELL * CELL} opaque px, frame=(${options?.frame?.col ?? 0}, ${options?.frame?.row ?? 'auto'})`)
  } catch (e) {
    console.warn('[sprite] compositeAvatar: could not read pixels:', e)
  }

  // Scale up if requested — round to nearest multiple of CELL.
  const targetSize = options?.size ?? CELL
  if (targetSize !== CELL) {
    const roundedSize = Math.round(targetSize / CELL) * CELL
    const scaled = document.createElement('canvas')
    scaled.width = roundedSize
    scaled.height = roundedSize
    const scaledCtx = scaled.getContext('2d')!
    scaledCtx.imageSmoothingEnabled = false
    scaledCtx.drawImage(canvas, 0, 0, roundedSize, roundedSize)
    return scaled
  }

  return canvas
}

// ── Preload utility ─────────────────────────────────────────────────────────

/**
 * Pre-warms the image cache for an AvatarConfig.
 *
 * Resolves all layer URLs (applying body-type filtering and the color-variant
 * fallback chain) and loads every image into the module cache — WITHOUT
 * compositing anything.  Call this on route entry so that the first
 * `compositeAvatar()` call finds everything already in cache.
 *
 * Silently ignores layers that can't be resolved.  Does not throw on
 * individual image load failures.
 *
 * @example
 * // In a Next.js page component:
 * useEffect(() => { preloadAvatarImages(avatarConfig) }, [avatarConfig])
 */
export async function preloadAvatarImages(
  config: AvatarConfig,
  bodyType?: 'male' | 'female',
): Promise<void> {
  const male = bodyType
    ? bodyType === 'male'
    : isMaleBody(config.body?.id ?? null)

  const layers = resolveLayerUrls(config, male)
  // Fire and forget — errors are already warned inside loadImg.
  await Promise.all(layers.map((layer) => loadImg(layer.url)))
}

// ── Boss sprite compositing ─────────────────────────────────────────────────
//
// NOTE: The boss compositing block below is preserved unchanged from the
// original compositor.ts.  It handles:
//   - Folder-format boss sprites (one file per animation frame).
//   - Single-sheet format boss sprites (all frames in one PNG).
//   - Optional palette swap via swapPalette().
//   - CSS particle effect hooks via BossSprite.tsx.
// Keep this block intact when merging features from other branches.

import type { BossPalette, PixelBuffer } from '@/lib/sprites/palette'
import { swapPalette } from '@/lib/sprites/palette'
import { BOSS_SPRITE_MANIFEST } from '@/lib/sprites/palette'

/**
 * Composites a boss sprite onto a scaled canvas with optional palette swap.
 *
 * Supports two source formats:
 *   - `folder` — one PNG file per frame in a directory.  The manifest's
 *     `idleFrames` array names the files; the first frame is used by default.
 *   - `sheet` — all frames packed into a single sprite sheet.
 *     `cellW` / `cellH` on the manifest entry describe the cell dimensions.
 *
 * When `options.palette` is provided the pixel buffer is remapped through
 * `swapPalette()` before being drawn to the output canvas.
 *
 * Returns null if the boss key is not in BOSS_SPRITE_MANIFEST or if the
 * image fails to load.
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
