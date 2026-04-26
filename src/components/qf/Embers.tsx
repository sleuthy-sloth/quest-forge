'use client'

import { useMemo } from 'react'

interface EmbersProps {
  count?: number
}

interface EmberSpec {
  id: string
  left: number
  drift: string
  duration: number
  delay: number
  size: number
}

/**
 * Floating ember particles. Generated client-side because the random
 * positions/timings would otherwise cause hydration mismatches.
 */
export function Embers({ count = 18 }: EmbersProps) {
  const specs = useMemo<EmberSpec[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const left     = Math.random() * 100
      const duration = 8 + Math.random() * 8
      return {
        id: `ember-${i}-${Math.round(left)}-${Math.round(duration * 10)}`,
        left,
        drift:    Math.random() * 60 - 30 + 'px',
        duration,
        delay:    -(Math.random() * 16),
        size:     2 + Math.random() * 2,
      }
    })
  }, [count])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
      aria-hidden="true"
    >
      {specs.map((s) => (
        <div
          key={s.id}
          className="qf-ember"
          style={{
            left: s.left + '%',
            width: s.size,
            height: s.size,
            animationDuration: s.duration + 's',
            animationDelay: s.delay + 's',
            ['--qf-drift' as string]: s.drift,
          }}
        />
      ))}
    </div>
  )
}

export default Embers
