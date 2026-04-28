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
  0%   { transform: translateX(-48px) rotate(-35deg) scaleX(0.4); opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 0.9; }
  100% { transform: translateX(48px) rotate(-35deg) scaleX(1.1); opacity: 0; }
}
@keyframes ba-slash-left {
  0%   { transform: translateX(48px) rotate(35deg) scaleX(0.4); opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 0.9; }
  100% { transform: translateX(-48px) rotate(35deg) scaleX(1.1); opacity: 0; }
}
@keyframes ba-bolt-right {
  0%   { transform: translateX(-44px); opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 0.9; }
  100% { transform: translateX(44px); opacity: 0; }
}
@keyframes ba-bolt-left {
  0%   { transform: translateX(44px); opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 0.9; }
  100% { transform: translateX(-44px); opacity: 0; }
}
@keyframes ba-ring {
  0%   { transform: scale(0); opacity: 0.85; }
  100% { transform: scale(2.6); opacity: 0; }
}
@keyframes ba-spark-0 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(-18px,-22px); opacity:0; } }
@keyframes ba-spark-1 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(22px,-18px); opacity:0; } }
@keyframes ba-spark-2 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(18px,22px); opacity:0; } }
@keyframes ba-spark-3 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(-22px,18px); opacity:0; } }
@keyframes ba-spark-4 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(0px,-26px); opacity:0; } }
@keyframes ba-spark-5 { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(26px,0px); opacity:0; } }
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
                width: 36,
                height: 4,
                marginTop: -2,
                marginLeft: -18,
                background: `linear-gradient(90deg, transparent, ${color}, #fff, ${color}, transparent)`,
                borderRadius: 2,
                boxShadow: `0 0 8px 2px ${color}88`,
                animation: 'ba-slash-right 0.25s ease-out forwards',
                pointerEvents: 'none',
                zIndex: 20,
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
              left: isPlayer ? '70%' : '30%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            {/* Impact ring */}
            <div
              style={{
                position: 'absolute',
                width: 24,
                height: 24,
                marginTop: -12,
                marginLeft: -12,
                border: `2px solid ${color}`,
                borderRadius: '50%',
                boxShadow: `0 0 6px ${color}`,
                animation: 'ba-ring 0.35s ease-out forwards',
              }}
            />
            {/* Spark particles */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  marginTop: -2,
                  marginLeft: -2,
                  borderRadius: 1,
                  background: i % 2 === 0 ? color : '#fff',
                  boxShadow: `0 0 4px ${color}`,
                  animation: `ba-spark-${i} 0.37s ease-out forwards`,
                }}
              />
            ))}
          </div>
        )
      })}
    </>
  )
}
