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
}
