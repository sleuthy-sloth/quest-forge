'use client'

import { useState, useEffect, useId } from 'react'

// ---------------------------------------------------------------------------
// A lightweight, zero-dependency celebration burst triggered on quiz completion.
//
// Renders 16 gold/ember spark particles that expand outward and fade,
// plus an expanding ring pulse — all via CSS keyframes injected into a
// <style> tag (same pattern as BattleEffectsLayer).
//
// Props:
//   trigger — increment this number to replay the effect
//   className — optional wrapper class
// ---------------------------------------------------------------------------

export interface CelebrationHandle {
  burst: () => void
}

export default function CelebrationEffect({
  trigger,
  className,
}: {
  trigger: number
  className?: string
}) {
  const uid = useId().replace(/[:.]/g, '')
  const [key, setKey] = useState(0)

  // Replay the effect whenever `trigger` increments.
  useEffect(() => {
    setKey((k) => k + 1)
  }, [trigger])

  if (key === 0 && trigger === 0) return null

  return <CelebrationBurst key={key} uid={uid} className={className} />
}

// ---------------------------------------------------------------------------
// Internal: the actual burst animation
// ---------------------------------------------------------------------------

function CelebrationBurst({
  uid,
  className,
}: {
  uid: string
  className?: string
}) {
  const [alive, setAlive] = useState(true)

  // Auto-cleanup after the longest animation finishes.
  useEffect(() => {
    const timer = setTimeout(() => setAlive(false), 700)
    return () => clearTimeout(timer)
  }, [])

  if (!alive) return null

  const SPARK_COUNT = 16

  // Injected keyframes for this burst instance (scoped via uid to avoid
  // conflicts when multiple instances exist in the DOM).
  const keyframes = `
    @keyframes cel-ring-${uid} {
      0%   { transform: scale(0); opacity: 0.9; }
      60%  { opacity: 0.5; }
      100% { transform: scale(3); opacity: 0; }
    }
    @keyframes cel-spark-${uid} {
      0%   { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
    }
  `

  /** Staggered distances for a natural burst look */
  const sparkDistance = (i: number) => {
    const angle = (i / SPARK_COUNT) * 360
    const distance = 24 + (i % 5) * 6 // 24–48 px
    const rad = (angle * Math.PI) / 180
    return {
      '--dx': `${Math.cos(rad) * distance}px`,
      '--dy': `${Math.sin(rad) * distance}px`,
      animation: `cel-spark-${uid} 450ms ease-out both`,
      animationDelay: `${(i % 5) * 15}ms`,
    } as React.CSSProperties
  }

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style suppressHydrationWarning>{keyframes}</style>

      {/* Expanding ring */}
      <div
        style={{
          position: 'absolute',
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: '2px solid rgba(201, 168, 76, 0.8)',
          boxShadow: '0 0 6px rgba(255, 200, 50, 0.4)',
          animation: `cel-ring-${uid} 500ms ease-out forwards`,
        }}
      />

      {/* Spark particles */}
      {Array.from({ length: SPARK_COUNT }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: i % 3 === 0
              ? 'rgba(255, 215, 0, 0.9)'     // gold
              : i % 3 === 1
                ? 'rgba(255, 160, 40, 0.85)'    // amber
                : 'rgba(255, 240, 180, 0.7)',    // pale gold
            boxShadow: '0 0 4px rgba(255, 200, 50, 0.5)',
            ...sparkDistance(i),
          }}
        />
      ))}
    </div>
  )
}
