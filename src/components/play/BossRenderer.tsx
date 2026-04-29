'use client'

import React, { useMemo } from 'react'

interface BossRendererProps {
  /** The boss type (e.g., 'treant', 'giant', 'golem') */
  type: string
  /** Current HP for visual feedback (e.g., flickering when low) */
  currentHp: number
  /** Max HP */
  maxHp: number
  /** Seed or config for procedural variations */
  config?: any
  /** Size of the container */
  size?: number
  /** Whether the boss is taking damage */
  isHurt?: boolean
}

/**
 * BossRenderer — A high-fidelity React SVG component for procedural bosses.
 * Replaces legacy Canvas 2D rendering with animation-driven SVGs.
 */
export default function BossRenderer({
  type,
  currentHp,
  maxHp,
  config,
  size = 400,
  isHurt = false,
}: BossRendererProps) {
  const hpPercent = (currentHp / maxHp) * 100
  const isLow = hpPercent < 25

  // ── Procedural geometry ───────────────────────────────────────────────────
  // We use useMemo to avoid re-calculating points on every animation frame
  const geom = useMemo(() => {
    const seed = config?.seed ?? 123
    // Simple pseudo-random helper
    const rnd = (s: number) => Math.sin(s * 12.9898) * 43758.5453 % 1

    return {
      wobbleSpeed: 2 + rnd(seed) * 2,
      scale: 0.9 + rnd(seed + 1) * 0.2,
      color: config?.color ?? 'var(--qf-ember-primary, #c0390a)',
      accent: config?.accent ?? 'var(--qf-ember-accent, #ff8c00)',
    }
  }, [config])

  // ── Render Logic ──────────────────────────────────────────────────────────
  
  // Treant-like boss
  const renderTreant = () => (
    <g transform={`scale(${geom.scale})`}>
      {/* Trunk */}
      <path
        d="M160,350 Q200,380 240,350 L260,200 Q200,180 140,200 Z"
        fill="#3d1a00"
        stroke="#1a0d00"
        strokeWidth="4"
      />
      {/* Foliage / Body */}
      <circle cx="200" cy="180" r="100" fill={geom.color} opacity="0.9" />
      <circle cx="140" cy="150" r="70" fill={geom.color} opacity="0.8" />
      <circle cx="260" cy="150" r="70" fill={geom.color} opacity="0.8" />
      {/* Eyes */}
      <g className="boss-eyes">
        <circle cx="170" cy="180" r="8" fill="#fff" />
        <circle cx="230" cy="180" r="8" fill="#fff" />
        <circle cx="170" cy="180" r="3" fill="#000" />
        <circle cx="230" cy="180" r="3" fill="#000" />
      </g>
    </g>
  )

  // Giant/Golem-like boss
  const renderGiant = () => (
    <g transform={`scale(${geom.scale})`}>
      {/* Torso */}
      <rect x="140" y="160" width="120" height="140" rx="10" fill={geom.color} stroke="#000" strokeWidth="4" />
      {/* Head */}
      <rect x="170" y="100" width="60" height="60" rx="5" fill={geom.color} stroke="#000" strokeWidth="4" />
      {/* Arms */}
      <rect x="100" y="170" width="40" height="100" rx="5" fill={geom.color} stroke="#000" strokeWidth="4" />
      <rect x="260" y="170" width="40" height="100" rx="5" fill={geom.color} stroke="#000" strokeWidth="4" />
      {/* Eyes */}
      <rect x="180" y="120" width="10" height="10" fill={geom.accent} />
      <rect x="210" y="120" width="10" height="10" fill={geom.accent} />
    </g>
  )

  return (
    <div 
      className={`boss-renderer-container ${isHurt ? 'is-hurt' : ''} ${isLow ? 'is-low' : ''}`}
      style={{ width: size, height: size, position: 'relative' }}
    >
      <style>{`
        .boss-renderer-container {
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
          transition: transform 0.1s ease-out;
        }
        .boss-renderer-container.is-hurt {
          animation: boss-shake 0.2s infinite;
          filter: brightness(2) saturate(2) drop-shadow(0 0 30px #ff0000);
        }
        .boss-renderer-container.is-low {
          animation: boss-pulse 2s infinite ease-in-out;
        }
        @keyframes boss-shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-5px, 5px); }
          50% { transform: translate(5px, -5px); }
          75% { transform: translate(-5px, -5px); }
        }
        @keyframes boss-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .boss-main-group {
          animation: boss-idle ${geom.wobbleSpeed}s infinite ease-in-out;
          transform-origin: bottom center;
        }
        @keyframes boss-idle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        .boss-eyes {
          animation: boss-blink 4s infinite;
        }
        @keyframes boss-blink {
          0%, 95%, 100% { transform: scaleY(1); }
          97% { transform: scaleY(0.1); }
        }
      `}</style>
      
      <svg
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="boss-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <g className="boss-main-group">
          {type.includes('treant') && renderTreant()}
          {type.includes('giant') && renderGiant()}
          {type.includes('golem') && renderGiant()}
          {/* Fallback to simple flame for unknown types */}
          {!['treant', 'giant', 'golem'].some(t => type.includes(t)) && (
            <g transform="translate(200, 200)">
              <circle r="80" fill={geom.color} filter="url(#boss-glow)" />
              <circle r="40" fill={geom.accent} />
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}
