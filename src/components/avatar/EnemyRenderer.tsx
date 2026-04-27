'use client'

import { useState, useId } from 'react'
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
 * ambient glow, nameplate, and loading skeleton.
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
 * **Loading skeleton:**
 * - While idle frames are being composited, a tinted pulse overlay
 *   sits on top of the dark canvas to indicate activity.
 * - Disappears automatically when `AnimatedAvatar` signals readiness
 *   via the `onFramesReady` callback.
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
  const skeletonClass = `er-sk-${uid}`
  const skeletonKeyframe = `er-sk-pulse-${uid}`

  const [loading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)

  // ── Fallback: colored silhouette ──────────────────────────────────────────
  if (errored) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: size,
            height: size,
            background: `linear-gradient(135deg, ${enemy.glowColor}25, ${enemy.glowColor}08)`,
            border: `2px solid ${enemy.glowColor}50`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
          aria-label={`${enemy.name} — sprite unavailable`}
        >
          {/* Stylized figure silhouette */}
          <svg
            width={Math.round(size * 0.55)}
            height={Math.round(size * 0.65)}
            viewBox="0 0 40 50"
            fill="none"
            aria-hidden="true"
          >
            {/* Head */}
            <ellipse cx="20" cy="10" rx="8" ry="9" fill={enemy.glowColor} opacity={0.35} />
            {/* Body */}
            <path
              d="M12 24 C12 18, 16 22, 20 22 C24 22, 28 18, 28 24 L30 44 C30 48, 10 48, 10 44 Z"
              fill={enemy.glowColor}
              opacity={0.3}
            />
          </svg>
        </div>
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

      {/* ── Animated sprite with loading skeleton ── */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <style>{`
          @keyframes ${skeletonKeyframe} {
            0%, 100% { opacity: 0.25; }
            50%      { opacity: 0.55; }
          }
          @media (prefers-reduced-motion: reduce) {
            .${skeletonClass} {
              animation: none !important;
              opacity: 0.2 !important;
            }
          }
        `}</style>

        <AnimatedAvatar
          config={enemy.avatar}
          size={size}
          autoAttack={autoAttack}
          autoAttackInterval={autoAttackInterval}
          animationPreset={animationPreset}
          className={className}
          onFramesReady={() => setLoading(false)}
          onFramesError={() => {
            setLoading(false)
            setErrored(true)
          }}
        />

        {loading && (
          <div
            className={skeletonClass}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '2px',
              background: `linear-gradient(135deg, ${enemy.glowColor}20 0%, ${enemy.glowColor}10 50%, transparent 100%)`,
              animation: `${skeletonKeyframe} 1.5s ease-in-out infinite`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

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
