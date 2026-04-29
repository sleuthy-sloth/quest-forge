'use client'

import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { spriteUrl } from '@/lib/sprites/manifest'
import {
  BOSS_PALETTES,
  BOSS_SPRITE_MANIFEST,
  swapPalette,
  fetchBitmap,
  type BossPalette,
  type BossSpriteInfo,
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

const FRAME_INTERVAL_MS = 400

// ---------------------------------------------------------------------------
// Sub-Component: CanvasBossRenderer
// Handles legacy folder/sheet PNG sprites with palette swapping
// ---------------------------------------------------------------------------

const CanvasBossRenderer = forwardRef<BossSpriteHandle, { 
  config: BossSpriteConfig, 
  palette: BossPalette,
  displaySize: number,
  nativeSize: number,
  spriteInfo: BossSpriteInfo
}>(({ config, palette, displaySize, nativeSize, spriteInfo }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<ImageBitmap[]>([])
  const frameIdx  = useRef(0)
  const rafHandle = useRef<number>(0)
  const intervalHandle = useRef<ReturnType<typeof setInterval> | null>(null)
  const [loaded, setLoaded] = useState(false)

  useImperativeHandle(ref, () => ({
    takeDamage: () => {
      // Handled by parent via flash overlay
    },
    defeat: () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (intervalHandle.current) clearInterval(intervalHandle.current)
      cancelAnimationFrame(rafHandle.current)

      const accentHex = palette?.accent ?? '#ffffff'
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

        for (let p = 0; p < pixelsPerFrame; p++) {
          const idx = ((seed * 2654435761 + p * 40503) >>> 0) % totalPixels
          d[idx * 4 + 3] = 0
        }
        ctx!.putImageData(imgData, 0, 0)

        ctx!.fillStyle = `rgba(${accentR},${accentG},${accentB},0.7)`
        for (let p = 0; p < 4; p++) {
          const x = ((seed * 1013904223 + p * 1664525) >>> 0) % displaySize
          const y = displaySize - ((seed / 10 + p * 20) % displaySize)
          ctx!.fillRect(x, Math.max(0, y), 2, 2)
        }

        rafHandle.current = requestAnimationFrame(disintegrate)
      }
      rafHandle.current = requestAnimationFrame(disintegrate)
    }
  }))

  useEffect(() => {
    let cancelled = false
    async function load() {
      const offscreen = document.createElement('canvas')
      offscreen.width  = nativeSize
      offscreen.height = nativeSize
      const ctx = offscreen.getContext('2d')!

      let rawFrames: ImageBitmap[] = []

      if (spriteInfo.format === 'folder') {
        const urls = (spriteInfo.idleFrames ?? ['Idle1.png']).map(
          (f: string) => spriteUrl(`${spriteInfo.basePath}/${f}`)
        )
        rawFrames = (
          await Promise.all(urls.map((url: string) => fetchBitmap(url)))
        ).filter((b): b is ImageBitmap => b !== null)
      } else {
        const url = spriteUrl(spriteInfo.basePath)
        const sheet = await fetchBitmap(url)
        if (!sheet) return
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

      const swapped: ImageBitmap[] = []
      for (const bmp of rawFrames) {
        ctx.clearRect(0, 0, nativeSize, nativeSize)
        ctx.drawImage(bmp, 0, 0, nativeSize, nativeSize)
        const imgData  = ctx.getImageData(0, 0, nativeSize, nativeSize)
        const recolored = swapPalette(imgData, palette)
        const buf = new Uint8ClampedArray(recolored.data)
        ctx.putImageData(new ImageData(buf, recolored.width), 0, 0)
        swapped.push(await createImageBitmap(offscreen))
      }

      if (cancelled) return
      framesRef.current = swapped
      setLoaded(true)
    }
    load()
    return () => { cancelled = true }
  }, [config.base_sprite, config.palette, nativeSize, palette, spriteInfo])

  useEffect(() => {
    if (!loaded) return
    const draw = () => {
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
    intervalHandle.current = setInterval(() => {
      const frames = framesRef.current
      if (!frames.length) return
      frameIdx.current = (frameIdx.current + 1) % frames.length
      rafHandle.current = requestAnimationFrame(draw)
    }, FRAME_INTERVAL_MS)
    return () => {
      if (intervalHandle.current) clearInterval(intervalHandle.current)
      cancelAnimationFrame(rafHandle.current)
    }
  }, [loaded, displaySize])

  return (
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
  )
})

CanvasBossRenderer.displayName = 'CanvasBossRenderer'

// ---------------------------------------------------------------------------
// Main Component: BossSprite
// ---------------------------------------------------------------------------

const BossSprite = forwardRef<BossSpriteHandle, { config: BossSpriteConfig }>(
  function BossSprite({ config }, ref) {
    const flashRef  = useRef<HTMLDivElement>(null)
    const childRef  = useRef<BossSpriteHandle>(null)
    const [isDefeated, setIsDefeated] = useState(false)

    const spriteInfo = BOSS_SPRITE_MANIFEST[config.base_sprite]
    const palette    = BOSS_PALETTES[config.palette] ?? BOSS_PALETTES.hollow_dark
    const isProcedural = spriteInfo?.format === 'procedural'

    const nativeSize  = spriteInfo?.format === 'folder' || isProcedural ? 256 : (spriteInfo?.cellW ?? 64)
    const displaySize = nativeSize * config.scale

    useImperativeHandle(ref, () => ({
      takeDamage() {
        const flash = flashRef.current
        if (!flash) return
        flash.style.opacity = '0.6'
        setTimeout(() => { if (flash) flash.style.opacity = '0' }, 150)
      },

      defeat() {
        if (isProcedural) {
          const flash = flashRef.current
          if (flash) {
            flash.style.opacity = '1'
            flash.style.background = 'white'
            setTimeout(() => {
              setIsDefeated(true)
              flash.style.opacity = '0'
            }, 500)
          }
        } else {
          childRef.current?.defeat()
        }
      },
    }))

    const frameColor = config.glow_color || (config.frame === 'frame_epic' ? '#aa44ff' : '#888')

    return (
      <div style={{ position: 'relative', width: displaySize, height: displaySize, display: 'inline-block' }}>
        <style>{PARTICLE_CSS_KEYFRAMES}</style>

        <AnimatePresence>
          {!isDefeated && (
            <motion.div
              key="sprite-content"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: 0, 
                scale: 0.5, 
                filter: 'blur(20px)',
                transition: { duration: 0.8, ease: "easeIn" } 
              }}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: `drop-shadow(0 0 12px ${config.glow_color})`,
              }}
            >
              {isProcedural ? (() => {
                const ProceduralComponent = PROCEDURAL_BOSS_REGISTRY[config.base_sprite]
                return ProceduralComponent ? (
                  <ProceduralComponent
                    palette={palette}
                    size={displaySize}
                    glowColor={config.glow_color}
                  />
                ) : (
                  <div style={{ color: '#555' }}>registry error</div>
                )
              })() : (
                <CanvasBossRenderer
                  ref={childRef}
                  config={config}
                  palette={palette}
                  displaySize={displaySize}
                  nativeSize={nativeSize}
                  spriteInfo={spriteInfo}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
            zIndex: 20,
          }}
        />

        {/* Decorative frame */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          border: `3px solid ${frameColor}`,
          boxShadow: `0 0 12px ${config.glow_color}, inset 0 0 8px ${config.glow_color}44`,
          zIndex: 30,
        }} />

        {/* CSS Particles */}
        {!isDefeated && config.particles.map((particleKey) => {
          const def = PARTICLE_DEFS[particleKey]
          if (!def) return null
          return Array.from({ length: def.count }, (_, i) => (
            <div key={`${particleKey}-${i}`} style={{ ...def.style(i, def.count), zIndex: 15 }} />
          ))
        })}
      </div>
    )
  }
)

BossSprite.displayName = 'BossSprite'
export default BossSprite
