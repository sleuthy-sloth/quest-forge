'use client'

import { useRef, useEffect, useState } from 'react'
import type { AvatarConfig } from '@/types/avatar'
import { compositeAvatar, CELL } from '@/lib/sprites/compositor'

interface Props {
  /** Full avatar configuration from profiles.avatar_config. */
  config: AvatarConfig
  /**
   * Output size in CSS pixels. The canvas is 64×64 internally and
   * scaled up via CSS + `image-rendering: pixelated`.
   * Default 256 (4× scale).
   */
  size?: number
  className?: string
}

/**
 * Renders a player's character avatar by compositing LPC sprite layers
 * onto a single HTML5 Canvas.
 *
 * Handles the "empty" state for optional slots (accessories, headwear,
 * weapons, etc.) by simply skipping layers where `config[category].id`
 * is null — no placeholder or error rendering needed.
 *
 * Uses the `.pixelated` Tailwind utility for crisp 8-bit rendering.
 */
export default function AvatarDisplay({
  config,
  size = 256,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const configKey = JSON.stringify(config)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    setLoading(true)

    compositeAvatar(config, { size })
      .then(result => {
        if (cancelled) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, result.width, result.height)
        ctx.drawImage(result, 0, 0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, size])

  return (
    <div className={`relative inline-block pixelated ${className ?? ''}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="pixelated"
        style={{ imageRendering: 'pixelated' }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-deep/50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ember-bright border-t-transparent" />
        </div>
      )}
    </div>
  )
}
