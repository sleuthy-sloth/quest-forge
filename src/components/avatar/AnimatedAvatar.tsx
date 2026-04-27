'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import type { AvatarConfig } from '@/types/avatar'
import { compositeAvatar, CELL } from '@/lib/sprites/compositor'
import {
  type AnimationPreset,
  ATTACK_ACTION,
  LPC_ACTION_DEFAULT_ROWS,
  LPC_WALK_COLS,
  LPC_WALK_DOWN_ROW,
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
  const cancelledRef            = useRef(false)
  const pendingAttackRef        = useRef(false)
  const isCompositingAttackRef  = useRef(false)
  /** Gates auto-attack until at least one idle frame has been rendered. */
  const hasInitializedRef       = useRef(false)

  // ── Strict Mode + lifecycle safety ─────────────────────────────────────────
  /** Incremented on each effect invocation to discard stale async completions. */
  const instanceIdRef           = useRef(0)
  /** Tracks whether the browser tab is visible (pauses auto-attack when hidden). */
  const isTabActiveRef          = useRef(true)
  /** Set to true only after ALL 6 idle frames have been composited. */
  const idleFramesReadyRef      = useRef(false)

  // ── Stale load status — triggers the rAF effect ──────────────────────────
  const [loaded, setLoaded] = useState(false)

  // Stable key so pre-composition re-runs only when the config shape changes.
  const configKey = useMemo(() => JSON.stringify(config), [config])

  // ── Unified liveness guard ─────────────────────────────────────────────────
  /**
   * Returns true if this component instance is still the active generation,
   * AND all required async asset hydration is complete.
   *
   * Unifies the three independent liveness systems into a single check:
   * 1. instanceIdRef  — Strict Mode mount safety (discards stale invocations)
   * 2. idleFramesReadyRef — idle frames fully composited (not mid-flight)
   *
   * Visibility is NOT included — the rAF loop should still tick when the tab
   * is hidden so it can catch up on resume.  Auto-attack and safety timeout
   * apply their own visibility gating inline.
   */
  const isAnimationActive = (instanceId: number) =>
    instanceIdRef.current === instanceId && idleFramesReadyRef.current

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
    instanceId: number,
  ) {
    if (isCompositingAttackRef.current) return
    isCompositingAttackRef.current = true

    try {
      const frames: HTMLCanvasElement[] = []

      for (let col = 0; col < LPC_WALK_COLS; col++) {
        if (cancelledRef.current || instanceId !== instanceIdRef.current) {
          pendingAttackRef.current = false
          return
        }

        const frame = await compositeAvatar(config, {
          frame: { col, row: resolveAttackRow(action) },
        })

        if (cancelledRef.current || instanceId !== instanceIdRef.current) {
          pendingAttackRef.current = false
          return
        }

        frames.push(frame)
      }

      attackFramesRef.current = frames

      // Guard: if component unmounted during async compositing, don't start.
      if (cancelledRef.current || instanceId !== instanceIdRef.current) {
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
    instanceId: number,
  ) {
    if (animStateRef.current !== 'idle') return
    if (pendingAttackRef.current) return
    if (isCompositingAttackRef.current) {
      // Already compositing — queue the transition for when frames are ready.
      pendingAttackRef.current = true
      return
    }
    if (instanceId !== instanceIdRef.current) return

    // Anchor the auto-attack timer to the trigger time (not completion time)
    // so that compositing delay doesn't shorten the idle gap between attacks.
    lastAttackTimeRef.current = performance.now()

    if (!attackFramesRef.current) {
      pendingAttackRef.current = true
      compositeAttackFrames(action, instanceId)
      return
    }

    startAttack()
  }

  // ── Phase 1: Pre-composite idle frames ──────────────────────────────────
  useEffect(() => {
    const instanceId = ++instanceIdRef.current
    cancelledRef.current = false
    idleFramesReadyRef.current = false

    async function buildFrames() {
      const frames: HTMLCanvasElement[] = []

      for (let col = 0; col < LPC_WALK_COLS; col++) {
        if (cancelledRef.current || instanceId !== instanceIdRef.current) return

        const frame = await compositeAvatar(config, {
          frame: { col, row: LPC_WALK_DOWN_ROW },
        })

        if (cancelledRef.current || instanceId !== instanceIdRef.current) return
        frames.push(frame)
      }

      if (cancelledRef.current || instanceId !== instanceIdRef.current) return
      idleFramesRef.current = frames
      idleFramesReadyRef.current = true
      setLoaded(true)
    }

    setLoaded(false)
    idleFramesRef.current = []
    idleFramesReadyRef.current = false
    attackFramesRef.current = null
    pendingAttackRef.current = false
    buildFrames()

    return () => {
      cancelledRef.current = true
    }
  }, [configKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Phase 2: rAF animation loop (idle + attack) ──────────────────────────
  useEffect(() => {
    const instanceId = ++instanceIdRef.current
    const canvas = canvasRef.current
    if (!canvas || !loaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    if (!idleFramesReadyRef.current) return

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
      const src = state === 'attacking' && attackFramesRef.current
        ? attackFramesRef.current
        : idleFramesRef.current

      if (!src || idx >= src.length) return
      ctx!.clearRect(0, 0, CELL, CELL)
      ctx!.drawImage(src[idx], 0, 0)
    }

    /** Single unified rAF loop — handles both idle and attacking states. */
    function animate(time: number) {
      if (cancelledRef.current || !isAnimationActive(instanceId)) return
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
        triggerAttack(ATTACK_ACTION[animationPreset], instanceId)

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
            if (instanceId !== instanceIdRef.current) return
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
      cancelledRef.current = true
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
