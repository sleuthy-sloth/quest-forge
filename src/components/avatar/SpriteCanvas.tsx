'use client'

import { useEffect, useRef } from 'react'
import { spriteUrl } from '@/lib/sprites/manifest'

export interface SpriteLayer {
  /** Path relative to the sprite base (e.g. "bodies/male_walkcycle.png"). */
  path: string
  /** Optional: skip this layer (avoids loading unnecessary images). */
  hidden?: boolean
}

interface SpriteCanvasProps {
  /** Ordered list of sprite layers to composite, bottom to top. */
  layers: SpriteLayer[]
  /** Width of each sprite frame in pixels (LPC default: 64). */
  frameWidth?: number
  /** Height of each sprite frame in pixels (LPC default: 64). */
  frameHeight?: number
  /** Display scale — must be an integer (LPC pixel-art rule). */
  scale?: 1 | 2 | 3 | 4
  className?: string
}

/**
 * Composites multiple LPC sprite sheet layers onto a single <canvas>.
 *
 * Each layer URL is resolved through NEXT_PUBLIC_SPRITE_BASE_URL via
 * spriteUrl(), so sprites are always fetched from Supabase Storage in
 * production and from /public/sprites/ in local dev.
 *
 * Only renders the idle front-facing frame (row 2, frame 0 of the LPC
 * walk-cycle sheet). For animation, use SpriteAnimator instead.
 */
export default function SpriteCanvas({
  layers,
  frameWidth = 64,
  frameHeight = 64,
  scale = 2,
  className,
}: SpriteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // LPC idle-front is the first frame of the third row (row index 2),
    // so the source region starts at (0, frameHeight * 2).
    const srcX = 0
    const srcY = frameHeight * 2 // walk-south row

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Crisp pixel rendering — never use nearest-neighbour via CSS alone.
    ctx.imageSmoothingEnabled = false

    const visibleLayers = layers.filter((l) => !l.hidden)

    // Load all images in parallel, then draw in order.
    Promise.all(
      visibleLayers.map(
        (layer) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(img)
            img.onerror = () => resolve(null) // missing sprite → skip, not crash
            img.src = spriteUrl(layer.path)
          })
      )
    ).then((images) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const img of images) {
        if (!img) continue
        ctx.drawImage(
          img,
          srcX, srcY, frameWidth, frameHeight,
          0, 0, frameWidth * scale, frameHeight * scale
        )
      }
    })
  }, [layers, frameWidth, frameHeight, scale])

  return (
    <canvas
      ref={canvasRef}
      width={frameWidth * scale}
      height={frameHeight * scale}
      className={className}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
