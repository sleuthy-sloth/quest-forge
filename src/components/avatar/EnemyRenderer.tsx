'use client'

import { useId } from 'react'
import AnimatedAvatar from './AnimatedAvatar'
import type { EncounterConfig } from '@/types/encounter'
import type { AnimationPreset } from '@/lib/constants/lpc-animations'

// ── Props ─────────────────────────────────────────────────────────────────────

interface EnemyRendererProps {
  /** Full encounter config for this enemy (avatar, glowColor, name). */
  enemy: EncounterConfig

  /** Animation preset determining attack style (slash/thrust/cast). */
  animationPreset: AnimationPreset

  /** Sprite size in CSS pixels. Default 128 (2× at 64px base). */
  size?: number

  /** Show a subtle ambient pulse glow behind the sprite. Default false. */
  showGlow?: boolean

  /** Show enemy name below the sprite. Default false. */
  showName?: boolean

  /** Enable periodic auto-attack bursts. Default true. */
  autoAttack?: boolean

  /** Milliseconds between auto-attack triggers. Default 8000. */
  autoAttackInterval?: number

  /** Additional class name for the AnimatedAvatar canvas element. */
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Reusable battle primitive that renders an enemy sprite with optional
 * ambient glow and nameplate.
 *
 * This is the domain-specific wrapper around `AnimatedAvatar` that
 * understands the `EncounterConfig` type.  It can be embedded in
 * card UIs (via `EncounterCard`), battle scenes, or any other context
 * that needs to display an animated enemy.
 *
 * **Glow animation:**
 * - A radial-gradient circle pulses subtly behind the avatar.
 * - Paused under `prefers-reduced-motion: reduce`.
 * - No hover effects (those are the embedding context's concern).
 *
 * **Nameplate:**
 * - Rendered below the avatar in pixel font when `showName` is true.
 */
export default function EnemyRenderer({
  enemy,
  animationPreset,
  size = 128,
  showGlow = false,
  showName = false,
  autoAttack = true,
  autoAttackInterval = 8000,
  className,
}: EnemyRendererProps) {
  const uid = useId().replace(/:/g, '')
  const glowClass = `er-glow-${uid}`
  const keyframeName = `er-pulse-${uid}`

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* ── Ambient glow ── */}
      {showGlow && (
        <>
          <style>{`
            @keyframes ${keyframeName} {
              0%, 100% { opacity: 0.15; transform: translate(-50%, -60%) scale(1); }
              50%      { opacity: 0.4;  transform: translate(-50%, -60%) scale(1.06); }
            }
            @media (prefers-reduced-motion: reduce) {
              .${glowClass} {
                animation: none !important;
                opacity: 0.25 !important;
              }
            }
          `}</style>
          <div
            className={glowClass}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: Math.round(size * 1.1),
              height: Math.round(size * 1.1),
              borderRadius: '50%',
              background: `radial-gradient(circle, ${enemy.glowColor}30, transparent 70%)`,
              pointerEvents: 'none',
              animation: `${keyframeName} 3s ease-in-out infinite`,
            }}
          />
        </>
      )}

      {/* ── Animated sprite ── */}
      <AnimatedAvatar
        config={enemy.avatar}
        size={size}
        autoAttack={autoAttack}
        autoAttackInterval={autoAttackInterval}
        animationPreset={animationPreset}
        className={className}
      />

      {/* ── Nameplate ── */}
      {showName && (
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: '#f0e6c8',
            textAlign: 'center',
            lineHeight: 1.4,
            marginTop: '4px',
          }}
        >
          {enemy.name}
        </div>
      )}
    </div>
  )
}
