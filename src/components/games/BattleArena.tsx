'use client'

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import AnimatedAvatar from '@/components/avatar/AnimatedAvatar'
import type { EncounterConfig } from '@/types/encounter'
import type { AvatarConfig } from '@/types/avatar'
import type { AnimationPreset } from '@/lib/constants/lpc-animations'

// ── Props ─────────────────────────────────────────────────────────────────────

interface BattleArenaProps {
  /** Player's avatar config (from profile.avatar_config). */
  playerConfig: AvatarConfig

  /** Player's animation preset (derived from avatar_class). */
  playerPreset: AnimationPreset

  /** Player's display name. */
  playerDisplayName: string

  /** Full encounter config for the enemy (avatar, glowColor, name). */
  enemy: EncounterConfig

  /** Enemy's animation preset. */
  enemyPreset: AnimationPreset

  /** Current correct count (0–totalQuestions). */
  correctCount: number

  /** Current question index (0-based). */
  questionIndex: number

  /** Total questions in the quiz. Default 10. */
  totalQuestions?: number

  /** Source of the current question set for the badge. */
  questionSource?: 'ai' | 'db' | 'fallback' | null

  /**
   * Screen flash colour — set to 'green' on correct, 'red' on wrong.
   * Cleared by the parent after a timeout (typically 300–350ms).
   */
  screenFlash?: 'green' | 'red' | null

  /** Player avatar size in CSS pixels. Default 96. */
  playerSize?: number

  /** Enemy avatar size in CSS pixels. Default 96. */
  enemySize?: number

  /** Additional class name for the outer container. */
  className?: string
}

// ── Ref handle ────────────────────────────────────────────────────────────────

export interface BattleArenaHandle {
  /** Trigger the player's LPC attack animation (correct answer). */
  triggerPlayerAttack: () => void
  /** Trigger the enemy's LPC attack animation (wrong answer). */
  triggerEnemyAttack: () => void
}

// ── Responsive breakpoint hook ───────────────────────────────────────────────

const MOBILE_BP = '(max-width: 480px)'

/**
 * Returns `true` when the viewport is at or below 480 px wide.
 * Defaults to `false` (desktop) during SSR to avoid hydration mismatch.
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BP)
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Reusable battle arena layout for academy quiz games.
 *
 * Renders a player avatar (left) vs an enemy avatar (right) with
 * HP bars, score pips, a question counter, and screen flash overlay.
 *
 * **Attack synchronisation:**
 * - Correct answer  → parent calls `ref.triggerPlayerAttack()` →
 *   player `AnimatedAvatar` plays a slash/thrust/cast burst.
 * - Wrong answer    → parent calls `ref.triggerEnemyAttack()` →
 *   enemy `AnimatedAvatar` plays an attack burst.
 *
 * Attack triggers are independent from the component's `screenFlash`
 * prop — the parent manages both as needed.
 *
 * **Shake effects:**
 * When `screenFlash` changes, the receiving side plays a brief CSS
 * shake animation (player shakes on red, enemy shakes on green).
 *
 * **Reduced motion:**
 * Shake animations are suppressed under
 * `prefers-reduced-motion: reduce`.  Attack animations are already
 * suppressed inside `AnimatedAvatar`.
 */
const BattleArena = forwardRef<BattleArenaHandle, BattleArenaProps>(
  function BattleArena(
    {
      playerConfig,
      playerPreset,
      playerDisplayName,
      enemy,
      enemyPreset,
      correctCount,
      questionIndex,
      totalQuestions = 10,
      questionSource = null,
      screenFlash = null,
      playerSize = 96,
      enemySize = 96,
      className,
    },
    ref,
  ) {
    // ── Responsive sizing ────────────────────────────────────────────────────
    const isMobile = useIsMobile()
    const effectivePlayerSize = isMobile ? 64 : playerSize
    const effectiveEnemySize = isMobile ? 64 : enemySize

    // ── Attack trigger state ─────────────────────────────────────────────────
    // Each tick is incremented by 1 to fire one attack burst via the
    // `attackTrigger` prop on `AnimatedAvatar` (added in Phase 1).
    const [playerAttackTick, setPlayerAttackTick] = useState(0)
    const [enemyAttackTick, setEnemyAttackTick] = useState(0)

    // Expose trigger methods to the parent game component.
    useImperativeHandle(
      ref,
      () => ({
        triggerPlayerAttack: () => setPlayerAttackTick((t) => t + 1),
        triggerEnemyAttack: () => setEnemyAttackTick((t) => t + 1),
      }),
      [],
    )

    // ── Shake effects ─────────────────────────────────────────────────────────
    // When screenFlash changes, shake the receiving side briefly.
    const playerShakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const enemyShakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [playerShake, setPlayerShake] = useState(false)
    const [enemyShake, setEnemyShake] = useState(false)

    useEffect(() => {
      if (screenFlash === 'green') {
        // Player landed a correct hit → enemy shakes.
        if (enemyShakeTimer.current) clearTimeout(enemyShakeTimer.current)
        setEnemyShake(true)
        enemyShakeTimer.current = setTimeout(() => setEnemyShake(false), 400)
      } else if (screenFlash === 'red') {
        // Enemy got a hit in → player shakes.
        if (playerShakeTimer.current) clearTimeout(playerShakeTimer.current)
        setPlayerShake(true)
        playerShakeTimer.current = setTimeout(() => setPlayerShake(false), 400)
      }
      return () => {
        if (playerShakeTimer.current) clearTimeout(playerShakeTimer.current)
        if (enemyShakeTimer.current) clearTimeout(enemyShakeTimer.current)
      }
    }, [screenFlash]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Enemy HP percentage ──────────────────────────────────────────────────
    // Guard: totalQuestions must be > 0 to avoid division by zero.
    const enemyHpPct =
      totalQuestions > 0
        ? Math.max(0, ((totalQuestions - correctCount) / totalQuestions) * 100)
        : 0

    return (
      <>
        <style>{`
          @keyframes ba-shake {
            0%, 100% { transform: translateX(0); }
            20%      { transform: translateX(-4px); }
            40%      { transform: translateX(4px); }
            60%      { transform: translateX(-3px); }
            80%      { transform: translateX(3px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .ba-shake {
              animation: none !important;
            }
            .ba-flash {
              transition-duration: 0s !important;
            }
          }
        `}</style>

        <div
          className={className}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(180deg,#0d0f1c,#070910)',
            border: '1px solid rgba(196,58,0,0.2)',
            borderLeft: '3px solid #c43a00',
            borderRadius: '3px',
            padding: '10px',
            marginBottom: '12px',
            overflow: 'hidden',
          }}
        >
          {/* ── Flash overlay ── */}
          <div
            className="ba-flash"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                screenFlash === 'green'
                  ? 'rgba(46,184,92,0.25)'
                  : screenFlash === 'red'
                    ? 'rgba(224,85,85,0.25)'
                    : 'transparent',
              transition: 'background 0.1s',
              zIndex: 10,
            }}
          />

          {/* ── Left: Player ── */}
          <div
            className={playerShake ? 'ba-shake' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              flexShrink: 0,
            }}
          >
            <AnimatedAvatar
              config={playerConfig}
              size={effectivePlayerSize}
              animationPreset={playerPreset}
              attackTrigger={playerAttackTick}
            />
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '5px',
                color: '#c9a84c',
                maxWidth: effectivePlayerSize,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {playerDisplayName}
            </div>
            {/* Player HP bar — always full (cosmetic) */}
            <div
              style={{
                width: effectivePlayerSize,
                height: '5px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  borderRadius: '2px',
                  background:
                    screenFlash === 'red'
                      ? 'linear-gradient(90deg,#e05555,#ff7070)'
                      : 'linear-gradient(90deg,#2eb85c,#5aab6e)',
                  transition: 'background 0.3s',
                }}
              />
            </div>
          </div>

          {/* ── Center: VS + pips + counter ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: '#c43a00',
                  background: 'rgba(196,58,0,0.12)',
                  border: '1px solid rgba(196,58,0,0.3)',
                  borderRadius: '2px',
                  padding: '3px 6px',
                }}
              >
                VS
              </div>
              {questionSource && (
                <div
                  title={
                    questionSource === 'ai'
                      ? 'Questions generated by AI'
                      : questionSource === 'db'
                        ? 'Questions from the seeded library'
                        : 'Offline fallback questions'
                  }
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    color:
                      questionSource === 'ai'
                        ? '#7c4dff'
                        : questionSource === 'db'
                          ? '#2eb85c'
                          : '#7a6a44',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '2px',
                    padding: '2px 4px',
                    letterSpacing: '1px',
                  }}
                >
                  {questionSource.toUpperCase()}
                </div>
              )}
            </div>

            {/* Score pips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3px' }}>
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '1px',
                    background: i < correctCount ? '#c9a84c' : 'transparent',
                    border: `1px solid ${i < correctCount ? '#c9a84c' : 'rgba(201,168,76,0.3)'}`,
                  }}
                />
              ))}
            </div>

            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '5px',
                color: '#7a6a44',
              }}
            >
              Q{questionIndex + 1} / {totalQuestions}
            </div>
          </div>

          {/* ── Right: Enemy ── */}
          <div
            className={enemyShake ? 'ba-shake' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              flexShrink: 0,
            }}
          >
            <AnimatedAvatar
              config={enemy.avatar}
              size={effectiveEnemySize}
              animationPreset={enemyPreset}
              attackTrigger={enemyAttackTick}
            />
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '5px',
                color: enemy.glowColor,
                maxWidth: effectiveEnemySize,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {enemy.name}
            </div>
            {/* Enemy HP bar — depletes with correct answers */}
            <div
              style={{
                width: effectiveEnemySize,
                height: '5px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: '2px',
                  width: `${enemyHpPct}%`,
                  background: 'linear-gradient(90deg,#e05555,#ff7070)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </>
    )
  },
)

BattleArena.displayName = 'BattleArena'
export default BattleArena
