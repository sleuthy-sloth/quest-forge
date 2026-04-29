'use client'

import { useState, useEffect, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type EffectSide = 'player' | 'enemy'
type EffectPhase = 'travel' | 'impact'

interface BattleEffect {
  id: number
  side: EffectSide
  phase: EffectPhase
}

interface Props {
  /** Increments each time the player lands an attack (correct answer). */
  playerAttackTick: number
  /** Increments each time the enemy lands an attack (wrong answer). */
  enemyAttackTick: number
  /** Enemy glow colour for theming enemy-side effects. */
  glowColor: string
}

// ── CSS keyframes injected once ───────────────────────────────────────────────

const KEYFRAMES = `
@keyframes ba-slash-right {
  0%   { transform: translateX(-60px) rotate(-15deg) scaleX(0.1); opacity: 0; }
  20%  { opacity: 1; transform: translateX(-30px) rotate(-15deg) scaleX(1.2); }
  100% { transform: translateX(60px) rotate(-15deg) scaleX(1.5); opacity: 0; }
}
@keyframes ba-slash-left {
  0%   { transform: translateX(60px) rotate(15deg) scaleX(0.1); opacity: 0; }
  20%  { opacity: 1; transform: translateX(30px) rotate(15deg) scaleX(1.2); }
  100% { transform: translateX(-60px) rotate(15deg) scaleX(1.5); opacity: 0; }
}
@keyframes ba-bolt-right {
  0%   { transform: translateX(-50px) scale(0.5); opacity: 0; }
  20%  { opacity: 1; transform: translateX(-30px) scale(1.1); }
  100% { transform: translateX(50px) scale(1.3); opacity: 0; }
}
@keyframes ba-bolt-left {
  0%   { transform: translateX(50px) scale(0.5); opacity: 0; }
  20%  { opacity: 1; transform: translateX(30px) scale(1.1); }
  100% { transform: translateX(-50px) scale(1.3); opacity: 0; }
}
@keyframes ba-impact-flare {
  0% { transform: scale(0.2); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}
@keyframes ba-spark-spread {
  0% { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ba-fx { display: none !important; }
}
`

// ── Component ─────────────────────────────────────────────────────────────────

let nextId = 1

export default function BattleEffectsLayer({ playerAttackTick, enemyAttackTick, glowColor }: Props) {
  const [effects, setEffects] = useState<BattleEffect[]>([])
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function addEffect(side: EffectSide) {
    const id = nextId++
    setEffects(prev => [...prev, { id, side, phase: 'travel' }])

    // Switch to impact phase after the projectile travels
    const t1 = setTimeout(() => {
      setEffects(prev => prev.map(e => e.id === id ? { ...e, phase: 'impact' } : e))
    }, 250)

    // Remove effect after impact animation completes
    const t2 = setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== id))
    }, 620)

    timersRef.current.push(t1, t2)
  }

  // Trigger player attack effect when tick increments
  const prevPlayerTick = useRef(playerAttackTick)
  useEffect(() => {
    if (playerAttackTick !== prevPlayerTick.current) {
      prevPlayerTick.current = playerAttackTick
      addEffect('player')
    }
  }) // intentionally no dependency array — runs every render to catch tick changes

  // Trigger enemy attack effect when tick increments
  const prevEnemyTick = useRef(enemyAttackTick)
  useEffect(() => {
    if (enemyAttackTick !== prevEnemyTick.current) {
      prevEnemyTick.current = enemyAttackTick
      addEffect('enemy')
    }
  })

  useEffect(() => {
    const timers = timersRef.current
    return () => { timers.forEach(clearTimeout) }
  }, [])

  if (effects.length === 0) return <style>{KEYFRAMES}</style>

  return (
    <>
      <style>{KEYFRAMES}</style>
      {effects.map(effect => {
        const isPlayer = effect.side === 'player'
        const color = isPlayer ? '#f9c846' : glowColor

        if (effect.phase === 'travel') {
          // Slash or bolt travelling across the arena
          return isPlayer ? (
            // Player attack: golden slash streak travelling right
            <div
              key={effect.id}
              className="ba-fx"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 60,
                height: 2,
                marginTop: -1,
                marginLeft: -30,
                background: `linear-gradient(90deg, transparent, ${color}, #fff, ${color}, transparent)`,
                borderRadius: 2,
                boxShadow: `0 0 10px 3px ${color}`,
                animation: 'ba-slash-right 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                pointerEvents: 'none',
                zIndex: 30,
              }}
            />
          ) : (
            // Enemy attack: coloured bolt travelling left
            <div
              key={effect.id}
              className="ba-fx"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 12,
                height: 12,
                marginTop: -6,
                marginLeft: -6,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 12px 4px ${color}99, 0 0 4px 1px #fff`,
                animation: 'ba-bolt-left 0.25s ease-out forwards',
                pointerEvents: 'none',
                zIndex: 20,
              }}
            />
          )
        }

        // Impact phase: ring + 6 spark particles
        return (
          <div
            key={effect.id}
            className="ba-fx"
            style={{
              position: 'absolute',
              top: '50%',
              left: isPlayer ? '75%' : '25%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 30,
            }}
          >
            {/* Impact flare */}
            <div
              style={{
                position: 'absolute',
                width: 40,
                height: 40,
                marginTop: -20,
                marginLeft: -20,
                background: `radial-gradient(circle, #fff 0%, ${color}aa 40%, transparent 70%)`,
                borderRadius: '50%',
                animation: 'ba-impact-flare 0.4s ease-out forwards',
              }}
            />
            {/* Spark particles */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2
              const distance = 25 + Math.random() * 15
              const tx = Math.cos(angle) * distance
              const ty = Math.sin(angle) * distance
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 3,
                    height: 3,
                    marginTop: -1.5,
                    marginLeft: -1.5,
                    borderRadius: '50%',
                    background: i % 2 === 0 ? color : '#fff',
                    boxShadow: `0 0 6px ${color}`,
                    // @ts-ignore
                    '--tx': `${tx}px`,
                    // @ts-ignore
                    '--ty': `${ty}px`,
                    animation: `ba-spark-spread 0.5s cubic-bezier(0, 0, 0.2, 1) forwards`,
                  } as any}
                />
              )
            })}
          </div>
        )
      })}
    </>
  )
}
