'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import type { AvatarConfig } from '@/types/avatar'
import {
  compositeLayer,
  resolveLayerUrls,
  loadSpriteImages,
  CELL,
  DRAW_ORDER,
  isMaleBody,
} from '@/lib/sprites/compositor'

interface Props {
  /** Full avatar configuration from profiles.avatar_config. Pass null to show placeholder permanently. */
  config: AvatarConfig | null
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
 * onto a single HTML5 Canvas using progressive reveal animation.
 *
 * **Progressive Loading:** Layers are loaded and composited SEQUENTIALLY
 * bottom-to-top following `DRAW_ORDER`. As each layer's image loads it is
 * drawn onto the canvas IMMEDIATELY, yielding between layers with
 * `requestAnimationFrame` so the browser paints each intermediate frame.
 * The avatar visually "builds itself" — body appears first (~100ms), then
 * eyes, then hair, then clothing, etc. This eliminates the jarring
 * "blank spinner → full avatar" transition of a parallel load approach.
 *
 * **Skeleton Placeholder:** When `config` is null or loading is in progress,
 * a pixel-art style silhouette placeholder is shown with a subtle CSS wobble
 * animation and a 4-segment progress indicator that fills as layers complete.
 *
 * **Error Resilience:** If `compositeLayer` or image loading fails for any
 * layer, it is skipped silently and the remaining layers continue building.
 * The avatar renders partially rather than crashing.
 *
 * **Cleanup:** The useEffect sets a `cancelled` flag and checks it before each
 * layer draw and after each `await`. If the component unmounts mid-build the
 * in-progress composite is abandoned safely.
 *
 * Uses the `.pixelated` Tailwind utility for crisp 8-bit rendering plus inline
 * `imageRendering: 'pixelated'` and the `-ms-interpolation-mode: nearest-neighbor`
 * fallback for older browsers.
 *
 * @example
 * // With full config — progressive reveal animation
 * <AvatarDisplay config={avatarConfig} size={256} />
 *
 * // With null config — permanent skeleton placeholder
 * <AvatarDisplay config={null} size={256} />
 */
export default function AvatarDisplay({
  config,
  size = 256,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'idle' | 'building' | 'done'>('idle')
  const [loadedCount, setLoadedCount] = useState(0)
  const totalLayers = DRAW_ORDER.length

  // Stable config key for useEffect dependency — avoids re-renders from object identity changes
  const configKey = useMemo(
    () => (config !== null ? JSON.stringify(config) : 'null'),
    [config],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    // Null config means render placeholder permanently — no canvas work needed
    if (!canvas || config === null) return

    let cancelled = false

    const buildAvatar = async () => {
      const male = isMaleBody(config.body?.id ?? null)
      const layers = resolveLayerUrls(config, male)

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.imageSmoothingEnabled = false

      // Build layers sequentially to enable progressive reveal.
      // Unlike compositeAvatar() which loads all images in parallel first,
      // this approach composites each layer as soon as its image is available.
      for (let i = 0; i < layers.length; i++) {
        // Check cancelled flag BEFORE any async work or drawing
        if (cancelled) return

        const { category, url, hexTint } = layers[i]

        // Update progress indicator — represents completed layers
        setLoadedCount(i + 1)

        try {
          // Load this single layer's image (cache-aware via loadSpriteImages)
          const [layer] = await loadSpriteImages([{ category, url, hexTint }])

          // Check again after await — component may have unmounted
          if (cancelled || !layer?.img) continue

          // Composite onto offscreen canvas for this layer
          const frame = compositeLayer(layer.img, hexTint)

          // Final cancellation check before the actual draw
          if (cancelled) return

          // Draw the layer onto the main canvas at 64×64
          // NOT clearing first — layers accumulate so the avatar
          // visually "builds up" from body (first) to shield (last).
          ctx.drawImage(frame, 0, 0)

          // Yield to browser so it can paint this intermediate frame,
          // creating the progressive reveal animation effect
          await new Promise(r => requestAnimationFrame(r))
        } catch {
          // Error resilience: skip failed layers silently and continue
          // with remaining layers rather than crashing the whole avatar
          if (process.env.NODE_ENV !== 'production') {
            console.warn(
              `[AvatarDisplay] Skipping layer "${category}" due to load/composite error.`,
            )
          }
        }
      }

      // All layers processed — mark complete unless cancelled mid-build
      if (!cancelled) {
        setPhase('done')
      }
    }

    // Begin async build
    setPhase('building')
    setLoadedCount(0)
    buildAvatar()

    // Cleanup: set cancelled flag and abandon in-progress composite
    return () => {
      cancelled = true
    }
  }, [config, size])

  // ── Progress bar segments (4 segments for 13 layers ~3.25 each) ────────
  const segments = 4
  const layersPerSegment = totalLayers / segments
  const filledSegments = Math.floor(loadedCount / layersPerSegment)
  const progressChar = '█'
  const emptyChar = '░'

  return (
    <div
      className={`relative inline-block pixelated ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      {/* Main canvas — 64×64 internal resolution, CSS-scaled to `size` */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="pixelated"
        style={{
          width: size,
          height: size,
          imageRendering: 'pixelated',
          // @ts-expect-error — fallback for IE/older Edge
          msInterpolationMode: 'nearest-neighbor',
        }}
      />

      {/* Skeleton placeholder — shown when config is null OR building in progress */}
      {phase !== 'done' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-sm"
          style={{
            backgroundColor: '#1a0a2e',
            animation: 'avatar-wobble 1.5s ease-in-out infinite',
          }}
        >
          {/* Pixel-art silhouette icon — simple blocky head+shoulders shape */}
          <svg
            viewBox="0 0 16 16"
            width={size * 0.4}
            height={size * 0.4}
            className="pixelated opacity-40"
            style={{ imageRendering: 'pixelated' }}
            aria-hidden="true"
          >
            {/* Head */}
            <rect x="5" y="2" width="6" height="6" fill="#3d1a5c" />
            {/* Body/shoulders */}
            <rect x="3" y="8" width="10" height="6" fill="#3d1a5c" />
            {/* Arms */}
            <rect x="1" y="8" width="2" height="5" fill="#3d1a5c" />
            <rect x="13" y="8" width="2" height="5" fill="#3d1a5c" />
          </svg>

          {/* 4-segment pixel progress bar + count */}
          <div
            className="mt-1 font-pixel text-[8px] tracking-tight"
            style={{ color: '#a855f7', fontSize: size * 0.045 }}
            aria-live="polite"
            aria-label={`Loading avatar: ${loadedCount} of ${totalLayers} layers`}
          >
            {/* Segmented progress bar */}
            <span className="opacity-70">
              {Array.from({ length: segments }, (_, i) =>
                i < filledSegments ? progressChar : emptyChar,
              ).join('')}
            </span>
            {/* Numeric count */}
            <span className="ml-1 opacity-90">
              {loadedCount}/{totalLayers}
            </span>
          </div>
        </div>
      )}

      {/* Wobble keyframe — 2px vertical oscillation for pixel-art feel */}
      <style>{`
        @keyframes avatar-wobble {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  )
}
