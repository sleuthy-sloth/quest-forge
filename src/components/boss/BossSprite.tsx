'use client'

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react'
import { spriteUrl } from '@/lib/sprites/manifest'
import {
  BOSS_PALETTES,
  BOSS_SPRITE_MANIFEST,
  swapPalette,
  fetchBitmap,
} from '@/lib/sprites/palette'
import { PROCEDURAL_BOSS_REGISTRY } from '@/lib/sprites/proceduralBosses'
import {
  PARTICLE_CSS_KEYFRAMES,
  PARTICLE_DEFS,
} from '@/lib/sprites/particles'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BossSpriteConfig {
  base_sprite: string
  palette: string
  scale: number
  particles: string[]
  frame: string
  glow_color: string
}

export interface BossSpriteHandle {
  takeDamage: () => void
  defeat: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FRAME_INTERVAL_MS = 400

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BossSprite = forwardRef<BossSpriteHandle, { config: BossSpriteConfig }>(
  function BossSprite({ config }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const flashRef  = useRef<HTMLDivElement>(null)
    const framesRef = useRef<ImageBitmap[]>([])
    const frameIdx  = useRef(0)
    const rafHandle = useRef<number>(0)
    const intervalHandle = useRef<ReturnType<typeof setInterval> | null>(null)

    const [loaded, setLoaded] = useState(false)
    const [loadError, setLoadError] = useState(false)

    const spriteInfo = BOSS_SPRITE_MANIFEST[config.base_sprite]
    const palette    = BOSS_PALETTES[config.palette] ?? BOSS_PALETTES.hollow_dark

    // Native size: folder and procedural sprites are 256×256; sheet sprites use cellW
    const nativeSize  = spriteInfo?.format === 'folder' || spriteInfo?.format === 'procedural' ? 256 : (spriteInfo?.cellW ?? 64)
    const displaySize = nativeSize * config.scale

    // -----------------------------------------------------------------------
    // Load + palette-swap sprite frames
    // -----------------------------------------------------------------------
    useEffect(() => {
      if (!spriteInfo) return

      let cancelled = false

      async function load() {
        // Procedural sprites are drawn directly — no image loading needed
        if (spriteInfo.format === 'procedural') {
          setLoaded(true)
          return
        }

        const offscreen = document.createElement('canvas')
        offscreen.width  = nativeSize
        offscreen.height = nativeSize
        const ctx = offscreen.getContext('2d')!

        let rawFrames: ImageBitmap[]

        if (spriteInfo.format === 'folder') {
          const urls = (spriteInfo.idleFrames ?? ['Idle1.png']).map(
            (f) => spriteUrl(`${spriteInfo.basePath}/${f}`)
          )
          rawFrames = (
            await Promise.all(urls.map((url) => fetchBitmap(url)))
          ).filter((b): b is ImageBitmap => b !== null)
        } else {
          const url = spriteUrl(spriteInfo.basePath)
          const sheet = await fetchBitmap(url)
          if (!sheet) { setLoadError(true); return }
          const w = spriteInfo.cellW ?? 64
          const h = spriteInfo.cellH ?? 64
          const cols = spriteInfo.cols ?? 1
          const frameCount = Math.min(3, cols)
          rawFrames = await Promise.all(
            Array.from({ length: frameCount }, (_, i) =>
              createImageBitmap(sheet, i * w, 0, w, h)
            )
          )
        }

        if (cancelled) return

        // Apply palette swap to each frame
        const swapped: ImageBitmap[] = []
        for (const bmp of rawFrames) {
          ctx.clearRect(0, 0, nativeSize, nativeSize)
          ctx.drawImage(bmp, 0, 0, nativeSize, nativeSize)
          const imgData  = ctx.getImageData(0, 0, nativeSize, nativeSize)
          const recolored = swapPalette(imgData, palette)
          // Copy to a fresh ArrayBuffer to satisfy strict ImageData constructor typing
          const buf = new Uint8ClampedArray(recolored.data)
          ctx.putImageData(new ImageData(buf, recolored.width), 0, 0)
          swapped.push(await createImageBitmap(offscreen))
        }

        if (cancelled) return
        framesRef.current = swapped
        setLoaded(true)
      }

      load().catch((err) => {
        console.error('[BossSprite] Failed to load sprite:', err)
        setLoadError(true)
      })
      return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.base_sprite, config.palette])

    // -----------------------------------------------------------------------
    // Idle animation loop
    // -----------------------------------------------------------------------
    useEffect(() => {
      if (!loaded) return

      // Respect user's motion preference.
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // ---------------------------------------------------------------------
      // Procedural branch: draw via Canvas 2D rAF loop
      // ---------------------------------------------------------------------
      if (spriteInfo?.format === 'procedural') {
        const drawFn = PROCEDURAL_BOSS_REGISTRY[config.base_sprite]
        if (!drawFn) { setLoadError(true); return }

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (prefersReducedMotion) {
          drawFn(ctx, displaySize, displaySize, palette, 0)
          return
        }

        const tick = (ts: number) => {
          drawFn(ctx, displaySize, displaySize, palette, ts)
          rafHandle.current = requestAnimationFrame(tick)
        }
        rafHandle.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafHandle.current)
      }

      // ---------------------------------------------------------------------
      // Sprite-sheet / folder frame-based animation
      // ---------------------------------------------------------------------
      function draw() {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const frames = framesRef.current
        if (!frames.length) return

        ctx.clearRect(0, 0, displaySize, displaySize)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(frames[frameIdx.current], 0, 0, displaySize, displaySize)
      }

      draw()

      if (!prefersReducedMotion) {
        intervalHandle.current = setInterval(() => {
          const frames = framesRef.current
          if (!frames.length) return
          frameIdx.current = (frameIdx.current + 1) % frames.length
          rafHandle.current = requestAnimationFrame(draw)
        }, FRAME_INTERVAL_MS)
      }

      return () => {
        if (intervalHandle.current) clearInterval(intervalHandle.current)
        cancelAnimationFrame(rafHandle.current)
      }
    }, [loaded, displaySize, config.base_sprite, config.palette, palette, spriteInfo])

    // -----------------------------------------------------------------------
    // Imperative API
    // -----------------------------------------------------------------------
    useImperativeHandle(ref, () => ({
      takeDamage() {
        const flash = flashRef.current
        if (!flash) return
        flash.style.opacity = '0.6'
        setTimeout(() => { if (flash) flash.style.opacity = '0' }, 150)
      },

      defeat() {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (intervalHandle.current) clearInterval(intervalHandle.current)
        cancelAnimationFrame(rafHandle.current)

        const accentHex = BOSS_PALETTES[config.palette]?.accent ?? '#ffffff'
        const accentR = parseInt(accentHex.slice(1, 3), 16)
        const accentG = parseInt(accentHex.slice(3, 5), 16)
        const accentB = parseInt(accentHex.slice(5, 7), 16)

        const totalPixels    = displaySize * displaySize
        const pixelsPerFrame = Math.ceil(totalPixels * 0.03)
        const startTime      = performance.now()
        const duration       = 2000

        function disintegrate() {
          const elapsed = performance.now() - startTime
          if (elapsed >= duration) {
            ctx!.clearRect(0, 0, displaySize, displaySize)
            return
          }

          const imgData = ctx!.getImageData(0, 0, displaySize, displaySize)
          const d = imgData.data
          const seed = Math.floor(elapsed)

          // Erase a pseudo-random selection of pixels each frame
          for (let p = 0; p < pixelsPerFrame; p++) {
            const idx = ((seed * 2654435761 + p * 40503) >>> 0) % totalPixels
            d[idx * 4 + 3] = 0
          }
          ctx!.putImageData(imgData, 0, 0)

          // Draw small rising accent-colored dots
          ctx!.fillStyle = `rgba(${accentR},${accentG},${accentB},0.7)`
          for (let p = 0; p < 4; p++) {
            const x = ((seed * 1013904223 + p * 1664525) >>> 0) % displaySize
            const y = displaySize - ((seed / 10 + p * 20) % displaySize)
            ctx!.fillRect(x, Math.max(0, y), 2, 2)
          }

          rafHandle.current = requestAnimationFrame(disintegrate)
        }

        rafHandle.current = requestAnimationFrame(disintegrate)
      },
    }))

    // -----------------------------------------------------------------------
    // Decorative frame
    // -----------------------------------------------------------------------
    const frameColor = config.frame === 'frame_epic' ? '#aa44ff' : '#888'

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    if (loadError) {
      const isProcedural = spriteInfo?.format === 'procedural'
      return (
        <div style={{
          width: displaySize,
          height: displaySize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111',
          border: `3px solid ${frameColor}`,
          color: '#555',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          textAlign: 'center',
          imageRendering: 'pixelated',
        }}>
          {isProcedural ? 'rendering\nerror' : '☠\nsprite\nunavailable'}
        </div>
      )
    }

    return (
      <div style={{ position: 'relative', width: displaySize, height: displaySize, display: 'inline-block' }}>
        <style>{PARTICLE_CSS_KEYFRAMES}</style>

        <canvas
          ref={canvasRef}
          width={displaySize}
          height={displaySize}
          style={{
            imageRendering: 'pixelated',
            display: 'block',
            filter: loaded ? `drop-shadow(0 0 8px ${config.glow_color})` : undefined,
          }}
        />

        {/* Red flash overlay for takeDamage() */}
        <div
          ref={flashRef}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 0, 0, 0)',
            opacity: 0,
            transition: 'opacity 0.05s',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />

        {/* Decorative frame */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          border: `3px solid ${frameColor}`,
          boxShadow: `0 0 12px ${config.glow_color}, inset 0 0 8px ${config.glow_color}44`,
        }} />

        {/* CSS Particles */}
        {config.particles.map((particleKey) => {
          const def = PARTICLE_DEFS[particleKey]
          if (!def) return null
          return Array.from({ length: def.count }, (_, i) => (
            <div key={`${particleKey}-${i}`} style={def.style(i, def.count)} />
          ))
        })}
      </div>
    )
  }
)

BossSprite.displayName = 'BossSprite'
export default BossSprite
