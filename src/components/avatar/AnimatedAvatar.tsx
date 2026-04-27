'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import type { AvatarConfig } from '@/types/avatar'
import { compositeAvatar, CELL } from '@/lib/sprites/compositor'
import {
  type AnimationPreset,
  ATTACK_ACTION,
  LPC_ACTION_DEFAULT_ROWS,
  LPC_WALK_COLS,
  LPC_IDLE_INTERVAL_MS,
  LPC_ATTACK_INTERVAL_MS,
  LPC_AUTO_ATTACK_MS,
} from '@/lib/constants/lpc-animations'

// ── Props ─────────────────────────────────────────────────────────────────────

interface AnimatedAvatarProps {
  /** Full avatar configuration from profiles.avatar_config or enemy presets. */
  config: AvatarConfig

  /**
   * Output size in CSS pixels. The canvas is always 64×64 internally and
   * scaled up via CSS with `image-rendering: pixelated`. Default 192 (3×).
   */
  size?: number

  className?: string

  /**
   * When true, the avatar periodically plays an attack burst animation.
   * Only takes effect when `animationPreset` is also provided.
   *
   * On the first trigger, attack frames are composited lazily while the
   * idle loop continues running — no visual pause.
   *
   * @default false
   */
  autoAttack?: boolean

  /**
   * Milliseconds between the start of one attack burst and the next.
   * Only takes effect when `autoAttack` is true and `animationPreset`
   * is provided.
   *
   * @default 8000
   */
  autoAttackInterval?: number

  /**
   * Determines which LPC sprite sheet row is used for attack animation.
   *
   * - `warrior`  → slash row   (weapon slash)
   * - `mage`     → cast row    (spell cast)
   * - `rogue`    → thrust row  (stab / thrust)
   * - `scholar`  → slash row   (same as warrior)
   *
   * When omitted, attack logic is entirely disabled regardless of
   * `autoAttack` — the component behaves identically to Phase 3
   * (idle loop only).
   */
  animationPreset?: AnimationPreset

  /**
   * Called once all idle frames have been composited and the first
   * frame is ready to render.  Useful for coordinating loading
   * skeletons in wrapping components.
   */
  onFramesReady?: () => void

  /**
   * Called when ALL idle frames failed to composite (every
   * `compositeAvatar` call threw or returned unusable results).
   * The component will continue rendering (blank canvases), but
   * wrapping components like EnemyRenderer can use this to swap
   * in a fallback silhouette instead of an infinite skeleton.
   */
  onFramesError?: () => void

  /**
   * On-demand attack trigger.  Increment this number to fire one
   * attack burst immediately (uses `animationPreset` to determine
   * the attack action).  Ignored while already attacking or when
   * `animationPreset` is not set.
   *
   * Used by BattleArena to synchronise attacks with quiz answers:
   *   - Correct answer → increment to trigger player's attack
   *   - Wrong answer   → increment to trigger enemy's attack
   *
   * Compatible with `autoAttack` — both can be active at once;
   * external triggers and the periodic timer are independent.
   *
   * @example
   * const [attackTick, setAttackTick] = useState(0)
   * // On correct answer:
   * setAttackTick(t => t + 1)
   * // Pass to AnimatedAvatar:
   * <AnimatedAvatar attackTrigger={attackTick} ... />
   */
  attackTrigger?: number
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Renders an LPC avatar with a looping idle animation and optional
 * periodic attack bursts.
 *
 * **Animation strategy (rAF + timestamp):**
 * - Pre-composites 6 idle walk frames at mount time.
 * - A single `requestAnimationFrame` loop advances frames by comparing
 *   elapsed time against the frame interval — no `setInterval`.
 * - Attack frames are composited lazily on first trigger, cached for
 *   subsequent attacks.
 *
 * **State model:**
 *   idle → attacking:  triggered by auto-attack timer (if enabled)
 *   attacking → idle:  after all 6 attack frames complete
 *   - No mid-attack interruption (attack always finishes its 6-frame cycle).
 *   - Auto-attack triggers are ignored while attacking.
 *   - Idle resumes at frame 0 after attack completes.
 *
 * **Reduced motion:**
 * - Reads `prefers-reduced-motion: reduce` on mount.
 * - When active, only frame 0 is rendered and the rAF loop is never
 *   started. Attack logic is entirely suppressed.
 *
 * **Cancellation safety:**
 * - A single `cancelledRef` guards all async and rAF operations.
 * - Checked after every `await` in compositing, at the top of every
 *   rAF callback, and before every draw.
 * - Set to `true` in the cleanup of both effects.
 *
 * **Attack frame compositing (lazy + safe):**
 * - On first attack trigger, 6 frames are composited sequentially with
 *   a rAF yield between each, preventing a CPU hitch.
 * - During compositing the idle loop continues uninterrupted.
 * - A `pendingAttackRef` queues the state transition so the attack
 *   starts as soon as frames are ready.
 *
 * **Performance:**
 * - All frames are pre-composited offscreen. The rAF callback only
 *   draws cached canvases — no per-frame pixel work.
 * - The compositor's built-in `_imgCache` deduplicates image loads
 *   across multiple instances on the same page.
 */
export default function AnimatedAvatar({
  config,
  size = 192,
  className,
  autoAttack = false,
  autoAttackInterval = LPC_AUTO_ATTACK_MS,
  animationPreset,
  onFramesReady,
  onFramesError,
  attackTrigger,
}: AnimatedAvatarProps) {
  const canvasRef          = useRef<HTMLCanvasElement>(null)
  const rafRef             = useRef<number>(0)

  // ── Frame storage ─────────────────────────────────────────────────────────
  /** Pre-composited idle (walk-cycle) frames — 6 canvases. */
  const idleFramesRef      = useRef<HTMLCanvasElement[]>([])
  /** Lazily-composited attack frames — null until first attack trigger. */
  const attackFramesRef    = useRef<HTMLCanvasElement[] | null>(null)

  // ── Animation state (all refs — no React re-renders) ────────────────────
  const animStateRef       = useRef<'idle' | 'attacking'>('idle')
  const frameIndexRef      = useRef(0)
  const lastFrameTimeRef   = useRef(0)
  const lastAttackTimeRef  = useRef(0)

  // ── Safety & queue ───────────────────────────────────────────────────────
  const pendingAttackRef        = useRef(false)
  const isCompositingAttackRef  = useRef(false)
  /** Gates auto-attack until at least one idle frame has been rendered. */
  const hasInitializedRef       = useRef(false)

  /**
   * Tracks the previous `attackTrigger` prop value so the on-demand
   * attack effect can detect increments and fire one attack burst.
   */
  const prevAttackTriggerRef = useRef(attackTrigger)

  // ── Lifecycle safety ───────────────────────────────────────────────────────
  /**
   * Incremented on each compositing effect invocation.  buildFrames checks
   * this to discard stale async completions from unmounted / re-mounted
   * instances.  SEPARATE from rAFIdRef so that the compositing effect's
   * in-flight async work is NOT invalidated when the rAF effect mounts.
   */
  const compositeIdRef          = useRef(0)
  /**
   * Incremented on each rAF animation effect invocation.  animate() checks
   * this to discard stale callbacks.  SEPARATE from compositeIdRef.
   */
  const rAFIdRef                = useRef(0)
  /** Tracks whether the browser tab is visible (pauses auto-attack when hidden). */
  const isTabActiveRef          = useRef(true)
  /** Set to true only after ALL 6 idle frames have been composited. */
  const idleFramesReadyRef      = useRef(false)

  // ── Stale load status — triggers the rAF effect ──────────────────────────
  const [loaded, setLoaded] = useState(false)

  // ── Notify parent when frames are ready ───────────────────────────────────
  useEffect(() => {
    if (loaded && onFramesReady) onFramesReady()
  }, [loaded, onFramesReady])

  // ── On-demand attack trigger ─────────────────────────────────────────────
  /**
   * Watches the `attackTrigger` prop for increments and fires one attack
   * burst per increment via `triggerAttack()`.
   *
   * Guarded by `loaded` (idle frames must be ready) and `animationPreset`
   * (must know the attack action).  If the avatar is already attacking,
   * `triggerAttack()` silently ignores the call.
   */
  useEffect(() => {
    if (!loaded || !animationPreset) return
    if (attackTrigger === prevAttackTriggerRef.current) return

    prevAttackTriggerRef.current = attackTrigger
    triggerAttack(ATTACK_ACTION[animationPreset], compositeIdRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attackTrigger, loaded, animationPreset])

  // Stable key so pre-composition re-runs only when the config shape changes.
  const configKey = useMemo(() => JSON.stringify(config), [config])

  // ── Unified liveness guard ─────────────────────────────────────────────────
  /**
   * Returns true if this component instance is still the active generation,
   * AND all required async asset hydration is complete.
   *
   * Unifies the two independent liveness systems into a single check:
   * 1. rAFIdRef  — rAF effect re-mount safety (discards stale rAF callbacks)
   * 2. idleFramesReadyRef — idle frames fully composited (not mid-flight)
   *
   * Visibility is NOT included — the rAF loop should still tick when the tab
   * is hidden so it can catch up on resume.  Auto-attack and safety timeout
   * apply their own visibility gating inline.
   */
  const isAnimationActive = (rafInstanceId: number) =>
    rAFIdRef.current === rafInstanceId && idleFramesReadyRef.current

  // ── Attack row resolution ─────────────────────────────────────────────────
  /**
   * Resolve the sprite sheet row for a given attack action.
   *
   * Returns the camera-facing (south/down) LPC row for the action.
   * No sprite dimension validation is performed — the compositor
   * handles out-of-bounds rows gracefully (blank transparent layer).
   */
  function resolveAttackRow(action: 'slash' | 'thrust' | 'cast'): number {
    return LPC_ACTION_DEFAULT_ROWS[action]
  }

  // ── Attack state machine helpers ──────────────────────────────────────────
  /** Transition to the attacking animation state. */
  function startAttack() {
    animStateRef.current   = 'attacking'
    frameIndexRef.current  = 0
    lastFrameTimeRef.current = performance.now()
  }

  /**
   * Asynchronously composite all 6 attack frames.
   *
   * Yields to the browser between each frame composite via
   * `requestAnimationFrame` — this keeps the idle animation
   * smooth during the first attack setup (~96 ms spread across
   * 6 rAF ticks).
   *
   * If a pending attack was queued (via `pendingAttackRef`),
   * it fires the transition immediately after caching the frames.
   */
  async function compositeAttackFrames(
    action: 'slash' | 'thrust' | 'cast',
    compositeInstanceId: number,
  ) {
    if (isCompositingAttackRef.current) return
    isCompositingAttackRef.current = true

    try {
      const frames: HTMLCanvasElement[] = []

      for (let col = 0; col < LPC_WALK_COLS; col++) {
        if (compositeInstanceId !== compositeIdRef.current) {
          pendingAttackRef.current = false
          return
        }

        const frame = await compositeAvatar(config, {
          frame: { col, row: resolveAttackRow(action) },
        })

        if (compositeInstanceId !== compositeIdRef.current) {
          pendingAttackRef.current = false
          return
        }

        frames.push(frame)
      }

      attackFramesRef.current = frames

      // Guard: if component unmounted during async compositing, don't start.
      if (compositeInstanceId !== compositeIdRef.current) {
        pendingAttackRef.current = false
        return
      }

      // If an attack was queued while we were compositing, start it now.
      if (pendingAttackRef.current) {
        pendingAttackRef.current = false
        startAttack()
      }
    } catch (err) {
      console.error('[AnimatedAvatar] Attack compositing failed:', err)
      pendingAttackRef.current = false
    } finally {
      isCompositingAttackRef.current = false
    }
  }

  /**
   * Trigger an attack burst.
   *
   * - Guarded against mid-attack interruption (no-op if already attacking).
   * - Guarded against duplicate pending compositing (no-op if already queued).
   * - On first call: composites frames lazily and queues the transition.
   * - On subsequent calls: transitions to attacking state immediately
   *   (frames are already cached).
   */
  function triggerAttack(
    action: 'slash' | 'thrust' | 'cast',
    compositeInstanceId: number,
  ) {
    if (animStateRef.current !== 'idle') return
    if (pendingAttackRef.current) return
    if (isCompositingAttackRef.current) {
      // Already compositing — queue the transition for when frames are ready.
      pendingAttackRef.current = true
      return
    }
    if (compositeInstanceId !== compositeIdRef.current) return

    // Anchor the auto-attack timer to the trigger time (not completion time)
    // so that compositing delay doesn't shorten the idle gap between attacks.
    lastAttackTimeRef.current = performance.now()

    if (!attackFramesRef.current) {
      pendingAttackRef.current = true
      compositeAttackFrames(action, compositeIdRef.current)
      return
    }

    startAttack()
  }

  // ── Phase 1: Pre-composite idle frames ──────────────────────────────────
  useEffect(() => {
    const compositeInstanceId = ++compositeIdRef.current
    idleFramesReadyRef.current = false

    async function buildFrames() {
      console.log(`[AnimatedAvatar] buildFrames start, compositeId=${compositeInstanceId}`)
      const frames: HTMLCanvasElement[] = []
      let frameFailures = 0

      for (let col = 0; col < LPC_WALK_COLS; col++) {
        if (compositeInstanceId !== compositeIdRef.current) {
          console.warn(`[AnimatedAvatar] buildFrames aborted at col ${col}: compositeId mismatch (was ${compositeInstanceId}, now ${compositeIdRef.current})`)
          return
        }

        try {
          const frame = await compositeAvatar(config, {
            frame: { col },
          })

          if (compositeInstanceId !== compositeIdRef.current) {
            console.warn(`[AnimatedAvatar] buildFrames aborted after compositeAvatar col ${col}: compositeId mismatch`)
            return
          }
          // Diagnostic: check if this frame has any content.
          const ctx = frame.getContext('2d')
          if (ctx) {
            const id = ctx.getImageData(0, 0, CELL, CELL)
            let opaquePx = 0
            for (let i = 3; i < id.data.length; i += 4) {
              if (id.data[i] > 0) opaquePx++
            }
            console.log(`[AnimatedAvatar] frame ${col}: ${opaquePx}/${CELL * CELL} opaque px`)
          }
          frames.push(frame)
        } catch (err) {
          frameFailures++
          console.warn(`[AnimatedAvatar] Frame ${col} compositing failed, using blank fallback:`, err)
          const blank = document.createElement('canvas')
          blank.width = CELL
          blank.height = CELL
          frames.push(blank)
        }
      }

      // Check cancellation ONE MORE TIME after the loop.
      if (compositeInstanceId !== compositeIdRef.current) {
        console.warn(`[AnimatedAvatar] buildFrames aborted after full loop: compositeId mismatch`)
        return
      }

      // If EVERY frame failed, let the parent know.
      if (frameFailures >= LPC_WALK_COLS) {
        onFramesError?.()
      }

      idleFramesRef.current = frames
      idleFramesReadyRef.current = true
      console.log(`[AnimatedAvatar] buildFrames done: ${frames.length} frames, idleReady=${idleFramesReadyRef.current}`)
      setLoaded(true)
    }

    setLoaded(false)
    idleFramesRef.current = []
    idleFramesReadyRef.current = false
    attackFramesRef.current = null
    pendingAttackRef.current = false
    buildFrames()

    return () => {
      // On cleanup, increment so in-flight buildFrames sees a mismatch and stops.
      compositeIdRef.current++
    }
  }, [configKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Canvas mount diagnostic ─────────────────────────────────────────────
  useEffect(() => {
    console.log(`[AnimatedAvatar] canvas mounted: ${canvasRef.current ? `${canvasRef.current.width}x${canvasRef.current.height}` : 'null'}`)
  }, [])

  // ── Phase 2: rAF animation loop (idle + attack) ──────────────────────────
  useEffect(() => {
    const rafInstanceId = ++rAFIdRef.current
    const canvas = canvasRef.current
    if (!canvas || !loaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    if (!idleFramesReadyRef.current) return

    console.log(`[AnimatedAvatar] rAF effect started, rafId=${rafInstanceId}, canvas=${canvas.width}x${canvas.height}, idleFrames=${idleFramesRef.current.length}`)

    // ── Reduced motion check ────────────────────────────────────────────────
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, CELL, CELL)
      ctx.drawImage(idleFramesRef.current[0], 0, 0)
      return
    }

    // ── Tab visibility tracking ─────────────────────────────────────────────
    isTabActiveRef.current = !document.hidden

    function handleVisibility() {
      const nowVisible = !document.hidden
      if (nowVisible && !isTabActiveRef.current && animStateRef.current === 'idle') {
        // Tab became visible — reset idle frame to prevent visual freeze
        // on a stale frame.  Do NOT touch lastAttackTimeRef — the attack
        // cooldown is only updated on actual trigger to maintain cadence.
        frameIndexRef.current = 0
      }
      isTabActiveRef.current = nowVisible
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // ── Reset animation state ───────────────────────────────────────────────
    animStateRef.current     = 'idle'
    frameIndexRef.current    = 0
    lastFrameTimeRef.current = 0
    // Seed the cooldown timer from mount so the first attack fires after
    // one full interval.  Never reset this except on actual attack trigger
    // — not on visibility changes, not on mount resets.
    lastAttackTimeRef.current = performance.now()
    hasInitializedRef.current  = false
    // idleFramesReadyRef is managed by the compositing effect — not reset here

    /** Advance one frame on the display canvas. */
    function drawFrame(state: 'idle' | 'attacking', idx: number) {
      if (!hasInitializedRef.current) {
        console.log(`[AnimatedAvatar] drawFrame first call: state=${state}, idx=${idx}`)
      }

      const src = state === 'attacking' && attackFramesRef.current
        ? attackFramesRef.current
        : idleFramesRef.current

      if (!src || idx >= src.length) return
      ctx!.clearRect(0, 0, CELL, CELL)
      ctx!.drawImage(src[idx], 0, 0)

      // Diagnostic bright pink block at top-right corner — visible if canvas draws at all.
      ctx!.fillStyle = '#ff00ff'
      ctx!.fillRect(56, 0, 8, 8)
      // Diagnostic: verify pixels were actually drawn.
      try {
        const id = ctx!.getImageData(0, 0, CELL, CELL)
        let opaquePx = 0
        for (let i = 3; i < id.data.length; i += 4) {
          if (id.data[i] > 0) opaquePx++
        }
        if (opaquePx === 0) {
          console.warn(`[AnimatedAvatar] drawFrame(${state}, ${idx}): canvas is still transparent after drawImage!`)
        }
      } catch (e) {
        /* canvas tainted — can't read pixels */
      }
    }

    /** Single unified rAF loop — handles both idle and attacking states. */
    function animate(time: number) {
      if (!isAnimationActive(rafInstanceId)) return
      const isVisible = isTabActiveRef.current

      // ── First call initialisation ─────────────────────────────────────────
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = time
        drawFrame('idle', 0)
        hasInitializedRef.current = true
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      // ── Auto-attack trigger ───────────────────────────────────────────────
      if (
        hasInitializedRef.current &&
        isVisible &&
        animStateRef.current === 'idle' &&
        autoAttack &&
        animationPreset &&
        time - lastAttackTimeRef.current >= autoAttackInterval
      ) {
        triggerAttack(ATTACK_ACTION[animationPreset], compositeIdRef.current)

        if (animStateRef.current !== 'idle') {
          drawFrame('attacking', 0)
        }
      }

      // ── Frame advancement ─────────────────────────────────────────────────
      const elapsed = time - lastFrameTimeRef.current

      // Separate `if` blocks — not `if`/`else` — because the auto-attack
      // trigger above may have synchronously mutated animStateRef.
      if (animStateRef.current === 'attacking') {
        // ── Hard safety timeout (visibility-guarded) ─────────────────────────
        // Only trigger if the tab is actually visible — rAF can pause for
        // >1.5s during tab backgrounding, mobile sleep, or CPU throttling.
        if (
          isVisible &&
          document.visibilityState === 'visible' &&
          elapsed >= LPC_ATTACK_INTERVAL_MS * 10
        ) {
          animStateRef.current  = 'idle'
          frameIndexRef.current = 0
          lastFrameTimeRef.current  = time
          drawFrame('idle', 0)
        } else if (elapsed >= LPC_ATTACK_INTERVAL_MS) {
          frameIndexRef.current++
            if (frameIndexRef.current >= LPC_WALK_COLS) {
              // Attack burst complete → return to idle.
              if (rafInstanceId !== rAFIdRef.current) return
              animStateRef.current  = 'idle'
            frameIndexRef.current = 0
            lastFrameTimeRef.current  = time
            drawFrame('idle', 0)
          } else {
            lastFrameTimeRef.current = time
            drawFrame('attacking', frameIndexRef.current)
          }
        }
      }
      if (animStateRef.current === 'idle') {
        if (elapsed >= LPC_IDLE_INTERVAL_MS) {
          frameIndexRef.current =
            (frameIndexRef.current + 1) % idleFramesRef.current.length
          lastFrameTimeRef.current = time
          drawFrame('idle', frameIndexRef.current)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <canvas
      ref={canvasRef}
      width={CELL}
      height={CELL}
      className={className}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        // Dark background to avoid a white flash before the first frame draws.
        background: '#0a0f1e',
        // @ts-expect-error — fallback for older Edge / IE.
        msInterpolationMode: 'nearest-neighbor',
      }}
    />
  )
}
