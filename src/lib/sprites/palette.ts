// src/lib/sprites/palette.ts

export interface BossPalette {
  /** Hex color for the dark luminance band (L < 85) */
  primary: string
  /** Hex color for the mid luminance band (85 ≤ L < 170) */
  secondary: string
  /** Hex color for the bright luminance band (L ≥ 170) */
  accent: string
  /** CSS glow color for drop-shadow filter */
  glow: string
}

export const BOSS_PALETTES: Record<string, BossPalette> = {
  hollow_dark: {
    primary:   '#1a0a2e',
    secondary: '#4a0080',
    accent:    '#9b30ff',
    glow:      '#4a0080',
  },
  ember_corrupt: {
    primary:   '#1a0500',
    secondary: '#c0390a',
    accent:    '#ff8c00',
    glow:      '#ff4500',
  },
  frost_hollow: {
    primary:   '#000d1a',
    secondary: '#0066aa',
    accent:    '#aaddff',
    glow:      '#00ccff',
  },
  ash_gray: {
    primary:   '#0d0d0d',
    secondary: '#555555',
    accent:    '#c8c8c8',
    glow:      '#888888',
  },
  blight_hollow: {
    primary:   '#1a0d2e',
    secondary: '#3d1a5c',
    accent:    '#9b4dff',
    glow:      '#6a1fa8',
  },
}

// ---------------------------------------------------------------------------
// Boss sprite manifest
// ---------------------------------------------------------------------------

export type BossSpriteFormat = 'folder' | 'sheet' | 'procedural'

export interface BossSpriteInfo {
  format: BossSpriteFormat
  /** Folder path prefix (folder) or single PNG path (sheet), relative to /sprites */
  basePath: string
  /** Sheet only: individual cell width in pixels */
  cellW?: number
  /** Sheet only: individual cell height in pixels */
  cellH?: number
  /** Sheet only: number of columns */
  cols?: number
  /** Sheet only: number of rows */
  rows?: number
  /** Folder only: idle animation frame filenames */
  idleFrames?: string[]
}

export const BOSS_SPRITE_MANIFEST: Record<string, BossSpriteInfo> = {
  // --- Sheet-based: single PNG, 64×64 cells ---
  bat: {
    format: 'sheet',
    basePath: 'bosses/bat.png',
    cellW: 64, cellH: 64, cols: 7, rows: 4,
  },
  ghost: {
    format: 'sheet',
    basePath: 'bosses/ghost.png',
    cellW: 64, cellH: 64, cols: 6, rows: 4,
  },
  slime: {
    format: 'sheet',
    basePath: 'bosses/slime.png',
    cellW: 64, cellH: 64, cols: 8, rows: 4,
  },
  eyeball: {
    format: 'sheet',
    basePath: 'bosses/eyeball.png',
    cellW: 64, cellH: 64, cols: 7, rows: 4,
  },
  pumpking: {
    format: 'sheet',
    basePath: 'bosses/pumpking.png',
    cellW: 64, cellH: 64, cols: 6, rows: 4,
  },
  bee: {
    format: 'sheet',
    basePath: 'bosses/bee.png',
    cellW: 64, cellH: 64, cols: 3, rows: 2,
  },
  big_worm: {
    format: 'sheet',
    basePath: 'bosses/big_worm.png',
    cellW: 64, cellH: 64, cols: 6, rows: 4,
  },
  man_eater_flower: {
    format: 'sheet',
    basePath: 'bosses/man_eater_flower.png',
    cellW: 64, cellH: 64, cols: 12, rows: 8,
  },
  small_worm: {
    format: 'sheet',
    basePath: 'bosses/small_worm.png',
    cellW: 64, cellH: 64, cols: 11, rows: 4,
  },
  snake: {
    format: 'sheet',
    basePath: 'bosses/snake.png',
    cellW: 64, cellH: 64, cols: 7, rows: 4,
  },

  // --- Procedural: drawn by Canvas 2D, no sprite files ---
  procedural_treant: {
    format: 'procedural',
    basePath: '',
  },
  procedural_giant: {
    format: 'procedural',
    basePath: '',
  },
  procedural_golem: {
    format: 'procedural',
    basePath: '',
  },
  procedural_flame: {
    format: 'procedural',
    basePath: '',
  },
  procedural_hollow_king: {
    format: 'procedural',
    basePath: '',
  },
  procedural_automaton: {
    format: 'procedural',
    basePath: '',
  },
}

// ---------------------------------------------------------------------------
// Luminance colorization palette swap
// ---------------------------------------------------------------------------

/**
 * Plain pixel buffer — structurally compatible with browser ImageData.
 * Using a plain interface keeps swapPalette testable in Node without browser globals.
 */
export interface PixelBuffer {
  data: Uint8ClampedArray
  width: number
  height: number
}

/**
 * Applies luminance-colorization to every opaque pixel.
 * Maps three luminance bands to palette.primary / secondary / accent via lerp.
 * Returns a new PixelBuffer — does NOT mutate the input.
 *
 * Band mapping:
 *   L < 85  → lerp(black, primary,   L / 85)
 *   L < 170 → lerp(primary, secondary, (L - 85) / 85)
 *   L ≥ 170 → lerp(secondary, accent,  (L - 170) / 85)
 *
 * In BossSprite: call ctx.putImageData(new ImageData(result.data, result.width), 0, 0)
 */
export function swapPalette(imageData: PixelBuffer, palette: BossPalette): PixelBuffer {
  const src = imageData.data
  const dst = new Uint8ClampedArray(src.length)
  dst.set(src)

  const primary   = hexToRgb(palette.primary)
  const secondary = hexToRgb(palette.secondary)
  const accent    = hexToRgb(palette.accent)

  for (let i = 0; i < dst.length; i += 4) {
    if (dst[i + 3] === 0) continue

    const r = dst[i], g = dst[i + 1], b = dst[i + 2]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b

    let nr: number, ng: number, nb: number

    if (lum < 85) {
      const t = lum / 85
      nr = Math.round(lerp(0, primary.r, t))
      ng = Math.round(lerp(0, primary.g, t))
      nb = Math.round(lerp(0, primary.b, t))
    } else if (lum < 170) {
      const t = (lum - 85) / 85
      nr = Math.round(lerp(primary.r, secondary.r, t))
      ng = Math.round(lerp(primary.g, secondary.g, t))
      nb = Math.round(lerp(primary.b, secondary.b, t))
    } else {
      const t = (lum - 170) / 85
      nr = Math.round(lerp(secondary.r, accent.r, t))
      ng = Math.round(lerp(secondary.g, accent.g, t))
      nb = Math.round(lerp(secondary.b, accent.b, t))
    }

    dst[i] = nr; dst[i + 1] = ng; dst[i + 2] = nb
  }

  return { data: dst, width: imageData.width, height: imageData.height }
}

// ── Shared ImageBitmap cache (for BossSprite) ──────────────────
// Module-level cache keyed by URL so that boss sprites don't re-fetch
// the same PNG on every mount.
const _bitmapCache = new Map<string, ImageBitmap>()

/**
 * Fetches an image from `url` and converts it to an ImageBitmap,
 * caching the result so subsequent calls for the same URL share the
 * same bitmap.  Returns null on failure.
 */
export async function fetchBitmap(url: string): Promise<ImageBitmap | null> {
  const cached = _bitmapCache.get(url)
  if (cached) return cached
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    const bmp = await createImageBitmap(blob)
    _bitmapCache.set(url, bmp)
    return bmp
  } catch {
    return null
  }
}

/** Clears the bitmap cache (for testing or memory management). */
export function clearBitmapCache(): void {
  _bitmapCache.forEach((b) => b.close())
  _bitmapCache.clear()
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}
