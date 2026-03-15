'use client'

import React, { useRef, useState } from 'react'
import BossSprite, { type BossSpriteConfig, type BossSpriteHandle } from '@/components/boss/BossSprite'
import BossHPBar from '@/components/boss/BossHPBar'

const WEEK1_CONFIG: BossSpriteConfig = {
  base_sprite: 'demon',
  palette:     'hollow_dark',
  scale:       2,
  particles:   ['ember_float', 'shadow_tendril'],
  frame:       'frame_epic',
  glow_color:  '#4a0080',
}

const MAX_HP = 300

export default function BossPage() {
  const spriteRef = useRef<BossSpriteHandle>(null)
  const [currentHp, setCurrentHp] = useState(MAX_HP)
  const [defeated, setDefeated] = useState(false)
  const [spriteKey, setSpriteKey] = useState(0)

  function handleDamage() {
    if (defeated) return
    const damage = Math.floor(Math.random() * 30) + 10
    const next = Math.max(0, currentHp - damage)
    setCurrentHp(next)
    spriteRef.current?.takeDamage()
    if (next === 0) {
      setDefeated(true)
      setTimeout(() => spriteRef.current?.defeat(), 300)
    }
  }

  function handleReset() {
    setCurrentHp(MAX_HP)
    setDefeated(false)
    // Increment key to remount BossSprite and restart idle animation
    setSpriteKey((k) => k + 1)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a12',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      padding: '2rem',
      fontFamily: 'monospace',
    }}>
      <h1 style={{ color: '#9b30ff', fontSize: '1.4rem', margin: 0 }}>
        ⚔ Boss Battle — Week 1
      </h1>

      <BossHPBar
        currentHp={currentHp}
        maxHp={MAX_HP}
        bossName="Thornmaw, the Blighted Root"
      />

      {/* key forces remount on reset */}
      <BossSprite key={spriteKey} ref={spriteRef} config={WEEK1_CONFIG} />

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleDamage}
          disabled={defeated}
          style={{
            padding: '0.6rem 1.4rem',
            background: defeated ? '#333' : '#4a0080',
            color: defeated ? '#666' : '#fff',
            border: 'none',
            cursor: defeated ? 'not-allowed' : 'pointer',
            fontFamily: 'monospace',
            fontSize: '1rem',
          }}
        >
          ⚔ Strike! ({currentHp} HP left)
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '0.6rem 1.4rem',
            background: '#1a1a2e',
            color: '#9b30ff',
            border: '1px solid #4a0080',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '1rem',
          }}
        >
          ↺ Reset
        </button>
      </div>

      {defeated && (
        <div style={{ color: '#9b30ff', fontSize: '1.2rem', textAlign: 'center' }}>
          ✦ Thornmaw has been defeated! ✦
          <br />
          <span style={{ fontSize: '0.85rem', color: '#666' }}>
            The Emberbearers&apos; combined Emberlight purifies the roots.
          </span>
        </div>
      )}

      <details style={{ color: '#444', fontSize: '0.7rem', maxWidth: 480 }}>
        <summary style={{ cursor: 'pointer', color: '#666' }}>Boss config</summary>
        <pre style={{ color: '#555', marginTop: '0.5rem' }}>
          {JSON.stringify(WEEK1_CONFIG, null, 2)}
        </pre>
      </details>
    </div>
  )
}
