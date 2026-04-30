'use client'

import { useRef, useEffect } from 'react'
import type { AvatarConfig } from '@/types/avatar'
import { compositeAvatar, CELL } from '@/lib/sprites/compositor'

interface Props {
  /** Full avatar configuration from profiles.avatar_config. */
  config: AvatarConfig
  /**
   * Output size in CSS pixels. The canvas is 64×64 internally and
   * scaled up via CSS + `image-rendering: pixelated`. Default 256 (4× scale).
   */
  size?: number
  className?: string
}

export default function SpriteCanvas({ config, size = 256, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const configKey = JSON.stringify(config)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false

    compositeAvatar(config)
      .then(result => {
        if (cancelled) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, CELL, CELL)
        ctx.drawImage(result, 0, 0)
      })
      .catch(() => {
        if (cancelled) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        // Draw a simple silhouette placeholder so the canvas is never blank
        ctx.clearRect(0, 0, CELL, CELL)
        ctx.fillStyle = 'rgba(201,168,76,0.12)'
        ctx.fillRect(0, 0, CELL, CELL)
        ctx.fillStyle = 'rgba(201,168,76,0.35)'
        // Head
        ctx.beginPath()
        ctx.arc(32, 14, 9, 0, Math.PI * 2)
        ctx.fill()
        // Body
        ctx.fillRect(20, 24, 24, 22)
        // Arms
        ctx.fillRect(11, 24, 8, 16)
        ctx.fillRect(45, 24, 8, 16)
        // Legs
        ctx.fillRect(20, 47, 9, 14)
        ctx.fillRect(35, 47, 9, 14)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey])

  return (
    <canvas
      ref={canvasRef}
      width={CELL}
      height={CELL}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
      }}
      className={className}
    />
  )
}
