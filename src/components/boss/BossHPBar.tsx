'use client'

import React from 'react'

interface BossHPBarProps {
  currentHp: number
  maxHp: number
  bossName: string
}

const SEGMENT_COUNT = 20

export default function BossHPBar({ currentHp, maxHp, bossName }: BossHPBarProps) {
  const pct = maxHp > 0 ? Math.max(0, Math.min(1, currentHp / maxHp)) : 0
  const isLow = pct <= 0.25
  const isMid = pct > 0.25 && pct <= 0.5

  return (
    <div style={{ width: '100%', maxWidth: 440, fontFamily: 'monospace' }}>
      {isLow && (
        <style>{`@keyframes hp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      )}

      {/* Boss name */}
      <div style={{
        color: '#ff4444',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginBottom: '0.2rem',
        textShadow: '0 0 8px #cc0000',
      }}>
        ☠ {bossName}
      </div>

      {/* HP label */}
      <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
        HP: {currentHp} / {maxHp}
      </div>

      {/* Segmented pixel-art bar */}
      <div style={{
        display: 'flex',
        gap: 2,
        height: 16,
        background: '#111',
        border: '2px solid #333',
        padding: 2,
        imageRendering: 'pixelated',
      }}>
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
          const filled = pct > i / SEGMENT_COUNT

          let bg = 'transparent'
          if (filled) {
            if (isLow) bg = 'linear-gradient(90deg, #7f0000, #cc0000)'
            else if (isMid) bg = 'linear-gradient(90deg, #7f4000, #cc8800)'
            else bg = 'linear-gradient(90deg, #8b0000, #dd2222)'
          }

          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: bg,
                animation: isLow && filled ? 'hp-pulse 0.8s ease-in-out infinite' : undefined,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
