// src/lib/sprites/particles.ts

import type { CSSProperties } from 'react'

export interface ParticleDef {
  /** Number of particle elements to render */
  count: number
  /** CSS @keyframes animation name used by this particle */
  keyframes: string
  /**
   * Returns CSS styles for particle element at index `i` of `total`.
   * MUST be deterministic — no Math.random().
   */
  style: (i: number, total: number) => CSSProperties
}

/** CSS @keyframes declarations for all particle animations. Inject once into a <style> tag. */
export const PARTICLE_CSS_KEYFRAMES = `
@keyframes ember-float {
  0%   { transform: translateY(0) scale(1); opacity: 0.9; }
  50%  { transform: translateY(-30px) scale(0.8) translateX(8px); opacity: 0.6; }
  100% { transform: translateY(-60px) scale(0.4) translateX(-4px); opacity: 0; }
}
@keyframes shadow-tendril {
  0%   { transform: scaleY(1) scaleX(1); opacity: 0.7; }
  50%  { transform: scaleY(1.4) scaleX(0.7); opacity: 0.4; }
  100% { transform: scaleY(0.6) scaleX(1.2); opacity: 0.7; }
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50%       { opacity: 0.8; transform: scale(1.15); }
}
@keyframes dark-aura {
  0%   { transform: rotate(0deg) scale(1); opacity: 0.5; }
  33%  { transform: rotate(120deg) scale(1.1); opacity: 0.3; }
  66%  { transform: rotate(240deg) scale(0.9); opacity: 0.6; }
  100% { transform: rotate(360deg) scale(1); opacity: 0.5; }
}
@keyframes spark-burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}
@keyframes lightning-arc {
  0%, 100% { opacity: 0; transform: scaleX(0); }
  10%, 90% { opacity: 1; transform: scaleX(1); }
  20%, 40%, 60%, 80% { opacity: 0.4; }
  30%, 50%, 70%       { opacity: 1; }
}
@keyframes ash-fall {
  0%   { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
  20%  { opacity: 0.6; }
  100% { transform: translateY(120px) translateX(15px) rotate(360deg); opacity: 0; }
}
`

export const PARTICLE_DEFS: Record<string, ParticleDef> = {
  ember_float: {
    count: 8,
    keyframes: 'ember-float',
    style: (i) => ({
      position: 'absolute',
      width:  `${4 + (i % 3) * 2}px`,
      height: `${4 + (i % 3) * 2}px`,
      borderRadius: '50%',
      backgroundColor: i % 2 === 0 ? '#ff4500' : '#ff8c00',
      left:   `${10 + (i * 73) % 80}%`,
      bottom: `${5  + (i * 31) % 40}%`,
      animation: `ember-float ${(1.5 + (i * 30) % 120 / 100).toFixed(2)}s ease-in infinite`,
      animationDelay: `${((i * 25) % 150 / 100).toFixed(2)}s`,
      pointerEvents: 'none',
    }),
  },

  shadow_tendril: {
    count: 5,
    keyframes: 'shadow-tendril',
    style: (i) => ({
      position: 'absolute',
      width:  `${3 + (i % 2) * 2}px`,
      height: `${20 + (i * 7) % 20}px`,
      borderRadius: '2px',
      backgroundColor: '#1a0a2e',
      left:   `${15 + (i * 61) % 70}%`,
      bottom: `${(i * 17) % 15}%`,
      animation: `shadow-tendril ${(2 + (i * 40) % 100 / 100).toFixed(2)}s ease-in-out infinite`,
      animationDelay: `${((i * 50) % 200 / 100).toFixed(2)}s`,
      pointerEvents: 'none',
    }),
  },

  glow_pulse: {
    count: 1,
    keyframes: 'glow-pulse',
    style: () => ({
      position: 'absolute',
      inset: '-10px',
      borderRadius: '50%',
      background: 'radial-gradient(ellipse, rgba(74,0,128,0.3) 0%, transparent 70%)',
      animation: 'glow-pulse 2s ease-in-out infinite',
      pointerEvents: 'none',
    }),
  },

  dark_aura: {
    count: 3,
    keyframes: 'dark-aura',
    style: (i) => ({
      position: 'absolute',
      inset: `${-5 + i * 8}px`,
      borderRadius: '40% 60% 50% 70%',
      border: `1px solid rgba(74,0,128,${(0.3 - i * 0.08).toFixed(2)})`,
      animation: `dark-aura ${(3 + i * 0.7).toFixed(1)}s linear infinite`,
      animationDelay: `${(i * 0.4).toFixed(1)}s`,
      pointerEvents: 'none',
    }),
  },

  spark_burst: {
    count: 6,
    keyframes: 'spark-burst',
    style: (i) => {
      const angle = (i / 6) * Math.PI * 2
      const dist = 40 + (i % 3) * 20
      return {
        position: 'absolute',
        width: '4px',
        height: '4px',
        backgroundColor: '#ffd700',
        borderRadius: '50%',
        boxShadow: '0 0 8px #ff4500',
        left: '50%',
        top: '50%',
        '--tx': `${Math.cos(angle) * dist}px`,
        '--ty': `${Math.sin(angle) * dist}px`,
        animation: 'spark-burst 0.6s ease-out forwards',
        pointerEvents: 'none',
      } as any
    },
  },

  lightning_arc: {
    count: 2,
    keyframes: 'lightning-arc',
    style: (i) => ({
      position: 'absolute',
      width: '100%',
      height: '2px',
      background: 'linear-gradient(90deg, transparent, #fff 50%, transparent)',
      boxShadow: '0 0 10px #ffcc00',
      left: 0,
      top: `${30 + i * 40}%`,
      transformOrigin: 'center',
      animation: 'lightning-arc 2s linear infinite',
      animationDelay: `${i * 0.5}s`,
      pointerEvents: 'none',
    }),
  },

  ash_fall: {
    count: 4,
    keyframes: 'ash-fall',
    style: (i) => ({
      position: 'absolute',
      width: '6px',
      height: '6px',
      backgroundColor: '#333',
      borderRadius: '1px',
      left: `${10 + i * 25}%`,
      top: '-20px',
      animation: `ash-fall ${(2.5 + (i % 2)).toFixed(1)}s linear infinite`,
      animationDelay: `${i * 0.7}s`,
      pointerEvents: 'none',
    }),
  },
}
