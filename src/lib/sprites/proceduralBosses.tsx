// src/lib/sprites/proceduralBosses.tsx

import React from 'react'
import { motion } from 'framer-motion'
import type { BossPalette } from './palette'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProceduralBossProps {
  palette: BossPalette
  size: number
  glowColor: string
}

export type ProceduralBossComponent = React.FC<ProceduralBossProps>

// ── 1. Grove-Guardian Automaton (Flagship Pixar-Fantasy Boss) ────────────────

const GroveGuardian: ProceduralBossComponent = ({ palette, size, glowColor }) => {
  const baseSize = 256
  const scale = size / baseSize

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${baseSize} ${baseSize}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Shading Gradients */}
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.accent} stopOpacity={0.2} />
          <stop offset="50%" stopColor={palette.secondary} />
          <stop offset="100%" stopColor={palette.primary} />
        </linearGradient>

        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="40%" stopColor={palette.accent} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* Filters for Depth and Glow */}
        <filter id="softDepth" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feOffset in="blur" dx="2" dy="4" result="offsetBlur" />
          <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
        </filter>

        <filter id="glowEffect">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Animation: Breathing (Subtle Vertical Oscillation) */}
      <motion.g
        animate={{
          y: [0, -4, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: 'center bottom' }}
      >
        {/* Legs / Base */}
        <g filter="url(#softDepth)">
          <path d="M80 230 Q128 210 176 230 L160 250 H96 Z" fill={palette.primary} />
          <circle cx="96" cy="240" r="12" fill={palette.secondary} />
          <circle cx="160" cy="240" r="12" fill={palette.secondary} />
        </g>

        {/* Main Body Torso */}
        <g filter="url(#softDepth)">
          <path
            d="M60 140 Q128 120 196 140 Q210 180 196 220 Q128 240 60 220 Q46 180 60 140"
            fill="url(#bodyGradient)"
            stroke={palette.secondary}
            strokeWidth="2"
          />
          {/* Internal Gears (Decorative) */}
          <motion.path
            d="M128 180 L132 170 L128 160 L124 170 Z"
            fill={palette.secondary}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: '128px 180px' }}
          />
        </g>

        {/* Core Glow */}
        <motion.circle
          cx="128"
          cy="180"
          r="25"
          fill="url(#eyeGlow)"
          animate={{ opacity: [0.6, 1, 0.6], r: [23, 26, 23] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Arms (Modular Construct) */}
        <motion.g
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: '70px 150px' }}
        >
          {/* Left Arm */}
          <path d="M70 150 L30 140 Q10 130 20 110" fill="none" stroke={palette.secondary} strokeWidth="12" strokeLinecap="round" />
          <circle cx="20" cy="110" r="15" fill={palette.primary} filter="url(#softDepth)" />
          <circle cx="20" cy="110" r="6" fill={palette.accent} />
        </motion.g>

        <motion.g
          animate={{ rotate: [2, -2, 2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: '186px 150px' }}
        >
          {/* Right Arm / Shield */}
          <path d="M186 150 L226 140 Q246 130 236 110" fill="none" stroke={palette.secondary} strokeWidth="12" strokeLinecap="round" />
          <rect x="220" y="80" width="30" height="60" rx="4" fill={palette.primary} filter="url(#softDepth)" />
          <motion.rect
            x="225" y="85" width="20" height="50" rx="2"
            fill={palette.accent}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.g>

        {/* Head */}
        <motion.g
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M80 135 Q128 100 176 135 Q160 155 128 155 Q96 155 80 135"
            fill={palette.secondary}
            stroke={palette.primary}
            strokeWidth="2"
            filter="url(#softDepth)"
          />
          {/* Eyes / Lens Cluster */}
          <circle cx="100" cy="130" r="8" fill={palette.primary} />
          <circle cx="156" cy="130" r="8" fill={palette.primary} />
          <motion.circle
            cx="128"
            cy="125"
            r="12"
            fill="url(#eyeGlow)"
            animate={{ r: [11, 13, 11] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Top Gear */}
          <motion.path
            d="M110 100 Q128 85 146 100 L140 110 H116 Z"
            fill={palette.primary}
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: '128px 110px' }}
          />
        </motion.g>
      </motion.g>
    </svg>
  )
}

// ── 2. Placeholder SVG Components for existing types ────────────────────────

const BasicSVGPlaceholder: React.FC<{ palette: BossPalette; size: number; name: string }> = ({ palette, size, name }) => (
  <svg width={size} height={size} viewBox="0 0 256 256">
    <rect x="64" y="64" width="128" height="128" fill={palette.primary} rx="20" />
    <text x="128" y="140" textAnchor="middle" fill={palette.accent} fontSize="12" fontFamily="monospace">
      {name} (SVG)
    </text>
    <motion.circle
      cx="128" cy="128" r="40"
      stroke={palette.accent} strokeWidth="4" fill="none"
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </svg>
)

const ProceduralTreant: ProceduralBossComponent = (props) => <BasicSVGPlaceholder {...props} name="Treant" />
const ProceduralGiant: ProceduralBossComponent = (props) => <BasicSVGPlaceholder {...props} name="Giant" />
const ProceduralGolem: ProceduralBossComponent = (props) => <BasicSVGPlaceholder {...props} name="Golem" />
const ProceduralFlame: ProceduralBossComponent = (props) => <BasicSVGPlaceholder {...props} name="Flame" />
const ProceduralHollowKing: ProceduralBossComponent = (props) => <BasicSVGPlaceholder {...props} name="Hollow King" />

// ── Registry ─────────────────────────────────────────────────────────────────

export const PROCEDURAL_BOSS_REGISTRY: Record<string, ProceduralBossComponent> = {
  procedural_treant: ProceduralTreant,
  procedural_giant: ProceduralGiant,
  procedural_golem: ProceduralGolem,
  procedural_flame: ProceduralFlame,
  procedural_hollow_king: ProceduralHollowKing,
  procedural_automaton: GroveGuardian,
}
