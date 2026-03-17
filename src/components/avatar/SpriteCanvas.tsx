'use client'

import { useRef, useEffect } from 'react'
import type { AvatarConfig, AvatarLayerCategory, SpriteEntry } from '@/types/avatar'
import { SPRITE_MANIFEST, spriteUrl } from '@/lib/sprites/manifest'

// ── LPC sprite sheet constants ────────────────────────────────────────────
// Standard LPC layout: row 10 = walk-down animation, col 0 = first frame.
// Every frame cell is 64×64 px.
const CELL = 64
const WALK_DOWN_ROW = 10
const WALK_FRAME_COL = 0

interface Props {
  /** Full avatar configuration from profiles.avatar_config. */
  config: AvatarConfig
  /**
   * Output size in CSS pixels. The canvas is always 64×64 internally and
   * scaled up via CSS + `image-rendering: pixelated`. Default 256 (4× scale).
   */
  size?: number
  className?: string
}

// ── Path resolution ───────────────────────────────────────────────────────

/** Returns true if the body id belongs to the male variant. */
function isMaleBody(bodyId: string | null): boolean {
  if (!bodyId) return false
  return bodyId === 'body_male' || bodyId === 'body_soldier'
}

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
    // Non-hex color = variant file name (e.g. 'brown', 'iron')
    const variant =
      color && !color.startsWith('#')
        ? color
        : (entry.colorVariants?.[0] ?? null)
    if (!variant) return null
    path = path.replace('{color}', variant)
  }

  return spriteUrl(path)
}

// ── Image loading ─────────────────────────────────────────────────────────

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = () => resolve(null)   // missing / 404 sprite → skip, don't crash
    img.src = src
  })
}

// ── Per-layer compositing ─────────────────────────────────────────────────

/**
 * Draw one sprite layer onto a fresh 64×64 offscreen canvas.
 *
 * If `hexTint` is provided:
 *   1. Draws the sprite frame.
 *   2. Multiply-blends the tint color over every pixel.
 *   3. Clips the result back to the sprite's original alpha, so transparent
 *      pixels remain clear.
 *
 * This produces accurate hair / clothing color tinting without polluting
 * other layers.
 */
function compositeLayer(
  img: HTMLImageElement,
  hexTint: string | null,
): HTMLCanvasElement {
  const off = document.createElement('canvas')
  off.width  = CELL
  off.height = CELL
  const ctx = off.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  const sx = WALK_FRAME_COL * CELL
  const sy = WALK_DOWN_ROW  * CELL

  // Step 1: draw the source frame
  ctx.drawImage(img, sx, sy, CELL, CELL, 0, 0, CELL, CELL)

  if (hexTint) {
    // Step 2: multiply tint
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = hexTint
    ctx.fillRect(0, 0, CELL, CELL)

    // Step 3: restore original alpha shape
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(img, sx, sy, CELL, CELL, 0, 0, CELL, CELL)
  }

  return off
}

// ── Layer draw order ──────────────────────────────────────────────────────
// Bottom → top, matching the LPC paper-doll spec.
// Hair is drawn once at position 3 (before clothing) as a simplified preview.
// In full animation the hair sheet would be split into rear + front layers.
const DRAW_ORDER: AvatarLayerCategory[] = [
  'body', 'eyes', 'hair', 'pants', 'shirt',
  'boots', 'hands', 'belt', 'cape', 'helmet',
  'weapon', 'shield',
]

// ── Component ─────────────────────────────────────────────────────────────

export default function SpriteCanvas({ config, size = 256, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Stringify config so object identity changes don't trigger spurious redraws
  const configKey = JSON.stringify(config)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    const male = isMaleBody(config.body?.id ?? null)
    let cancelled = false

    async function drawAllLayers() {
      if (!ctx) return
      ctx.clearRect(0, 0, CELL, CELL)

      for (const category of DRAW_ORDER) {
        if (cancelled) return

        const layer = config[category]
        if (!layer?.id) continue

        // Hex colors are for canvas tinting; non-hex are file variant names
        const hexTint = layer.color?.startsWith('#') ? layer.color : null
        const url = resolveUrl(category, layer.id, layer.color, male)
        if (!url) continue

        const img = await loadImg(url)
        if (cancelled) return
        if (!img) continue

        ctx.drawImage(compositeLayer(img, hexTint), 0, 0)
      }
    }

    drawAllLayers()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey])

  return (
    <canvas
      ref={canvasRef}
      width={CELL}
      height={CELL}
      style={{
        width:           size,
        height:          size,
        imageRendering: 'pixelated',
      }}
      className={className}
    />
  )
}
