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

// ── 2. Treant (Organic Forest Guardian) ───────────────────────────────────

const ProceduralTreant: ProceduralBossComponent = ({ palette, size, glowColor }) => {
  const baseSize = 256
  return (
    <svg width={size} height={size} viewBox={`0 0 ${baseSize} ${baseSize}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="barkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.accent} />
          <stop offset="100%" stopColor={palette.primary} />
        </linearGradient>
        <filter id="barkDepth">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="1" dy="2" />
          <feComposite in="SourceGraphic" operator="over" />
        </filter>
      </defs>

      <motion.g
        animate={{ rotate: [-1, 1, -1], y: [0, -2, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: 'center bottom' }}
      >
        {/* Trunk */}
        <path
          d="M100 240 Q128 250 156 240 L140 100 Q128 90 116 100 Z"
          fill="url(#barkGradient)"
          filter="url(#barkDepth)"
        />
        {/* Branches */}
        <motion.path
          d="M116 120 Q80 100 60 130"
          stroke={palette.secondary}
          strokeWidth="8"
          strokeLinecap="round"
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ transformOrigin: '116px 120px' }}
        />
        <motion.path
          d="M140 120 Q176 100 196 130"
          stroke={palette.secondary}
          strokeWidth="8"
          strokeLinecap="round"
          animate={{ rotate: [5, -5, 5] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ transformOrigin: '140px 120px' }}
        />
        {/* Leafy Canopy */}
        <motion.circle
          cx="128" cy="80" r="50"
          fill={palette.accent}
          fillOpacity="0.8"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <circle cx="100" cy="100" r="30" fill={palette.secondary} fillOpacity="0.6" />
        <circle cx="156" cy="100" r="30" fill={palette.secondary} fillOpacity="0.6" />
        {/* Glowing Eyes */}
        <motion.circle
          cx="118" cy="140" r="4"
          fill="#fff"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
        />
        <motion.circle
          cx="138" cy="140" r="4"
          fill="#fff"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
        />
      </motion.g>
    </svg>
  )
}

// ── 3. Giant (Boulder Construct) ──────────────────────────────────────────

const ProceduralGiant: ProceduralBossComponent = ({ palette, size, glowColor }) => {
  const baseSize = 256
  return (
    <svg width={size} height={size} viewBox={`0 0 ${baseSize} ${baseSize}`} style={{ overflow: 'visible' }}>
      <defs>
        <filter id="rockShadow">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.5" />
        </filter>
        <radialGradient id="rockGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.accent} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <motion.g
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Legs */}
        <path d="M80 220 Q90 250 110 240 L120 220 Z" fill={palette.primary} />
        <path d="M176 220 Q166 250 146 240 L136 220 Z" fill={palette.primary} />

        {/* Torso */}
        <path
          d="M70 120 Q128 100 186 120 Q200 180 186 220 Q128 230 70 220 Q56 180 70 120"
          fill={palette.secondary}
          filter="url(#rockShadow)"
        />

        {/* Arms */}
        <motion.path
          d="M70 140 Q40 160 30 200"
          stroke={palette.primary}
          strokeWidth="15"
          strokeLinecap="round"
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ transformOrigin: '70px 140px' }}
        />
        <motion.path
          d="M186 140 Q216 160 226 200"
          stroke={palette.primary}
          strokeWidth="15"
          strokeLinecap="round"
          animate={{ rotate: [2, -2, 2] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ transformOrigin: '186px 140px' }}
        />

        {/* Head */}
        <path
          d="M100 110 Q128 80 156 110 L140 130 H116 Z"
          fill={palette.primary}
        />

        {/* Glowing Runes */}
        <motion.circle
          cx="128" cy="160" r="15"
          fill="url(#rockGlow)"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.g>
    </svg>
  )
}

// ── 4. Flame (Living Ember) ───────────────────────────────────────────────

const ProceduralFlame: ProceduralBossComponent = ({ palette, size, glowColor }) => {
  const baseSize = 256
  return (
    <svg width={size} height={size} viewBox={`0 0 ${baseSize} ${baseSize}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="flameCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="40%" stopColor={palette.accent} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <g style={{ filter: `blur(4px) drop-shadow(0 0 12px ${glowColor})` }}>
        {/* Multiple flame layers with offset animations */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d="M128 240 Q80 200 100 140 Q128 80 128 20 Q128 80 156 140 Q176 200 128 240"
            fill={i === 0 ? palette.primary : i === 1 ? palette.secondary : palette.accent}
            fillOpacity={0.4 + i * 0.2}
            animate={{
              scale: [1, 1.1, 0.9, 1],
              rotate: [i * 5 - 5, i * 5, i * 5 - 5],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
            style={{ transformOrigin: 'center bottom' }}
          />
        ))}
      </g>

      <motion.circle
        cx="128" cy="160" r="20"
        fill="url(#flameCore)"
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </svg>
  )
}

// ── 5. Hollow King (Ethereal Wraith) ──────────────────────────────────────

const ProceduralHollowKing: ProceduralBossComponent = ({ palette, size, glowColor }) => {
  const baseSize = 256
  return (
    <svg width={size} height={size} viewBox={`0 0 ${baseSize} ${baseSize}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="capeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.secondary} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      <motion.g
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Cape / Ghostly Body */}
        <motion.path
          d="M80 100 Q128 80 176 100 L200 240 Q128 260 56 240 Z"
          fill="url(#capeGradient)"
          animate={{ d: [
            "M80 100 Q128 80 176 100 L200 240 Q128 260 56 240 Z",
            "M80 100 Q128 80 176 100 L210 250 Q128 240 46 250 Z",
            "M80 100 Q128 80 176 100 L200 240 Q128 260 56 240 Z"
          ]}}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Head / Mask */}
        <g style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}>
          <path d="M100 80 Q128 50 156 80 L140 120 H116 Z" fill={palette.primary} />
          <motion.path
            d="M100 60 L128 20 L156 60"
            fill="none"
            stroke={palette.accent}
            strokeWidth="4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>

        {/* Glowing Eyes */}
        <motion.circle cx="118" cy="85" r="3" fill="#fff" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.circle cx="138" cy="85" r="3" fill="#fff" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.2 }} />
      </motion.g>
    </svg>
  )
}

// ── 6. Whispering Swarm (Animated Bee Swarm) ──────────────────────────────

const ProceduralWhisperingSwarm: ProceduralBossComponent = ({ palette, size, glowColor }) => {
  const baseSize = 256

  // 18 bees laid out in two concentric rings + a few loose ones
  const bees: { r: number; angle: number; speed: number; wobble: number; scale: number }[] = [
    // Inner ring (r ≈ 40)
    { r: 38, angle: 0,   speed: 7,  wobble: 0.8, scale: 1.0 },
    { r: 42, angle: 60,  speed: 8,  wobble: 1.1, scale: 0.9 },
    { r: 36, angle: 120, speed: 9,  wobble: 0.7, scale: 1.1 },
    { r: 40, angle: 180, speed: 7,  wobble: 1.0, scale: 0.95 },
    { r: 44, angle: 240, speed: 8,  wobble: 0.9, scale: 1.0 },
    { r: 38, angle: 300, speed: 9,  wobble: 1.2, scale: 0.85 },
    // Outer ring (r ≈ 72)
    { r: 70, angle: 20,  speed: 11, wobble: 1.3, scale: 0.8 },
    { r: 75, angle: 65,  speed: 12, wobble: 0.9, scale: 0.9 },
    { r: 68, angle: 110, speed: 10, wobble: 1.1, scale: 0.75 },
    { r: 73, angle: 155, speed: 13, wobble: 0.8, scale: 0.85 },
    { r: 71, angle: 200, speed: 11, wobble: 1.2, scale: 0.9 },
    { r: 76, angle: 245, speed: 12, wobble: 1.0, scale: 0.8 },
    { r: 69, angle: 290, speed: 10, wobble: 0.7, scale: 0.95 },
    { r: 74, angle: 335, speed: 13, wobble: 1.1, scale: 0.7 },
    // Loose stragglers
    { r: 54, angle: 35,  speed: 15, wobble: 1.5, scale: 0.65 },
    { r: 58, angle: 145, speed: 14, wobble: 1.3, scale: 0.7 },
    { r: 62, angle: 255, speed: 16, wobble: 1.4, scale: 0.6 },
    { r: 50, angle: 310, speed: 14, wobble: 1.2, scale: 0.75 },
  ]

  const cx = 128
  const cy = 128

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${baseSize} ${baseSize}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="swarmCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.accent} stopOpacity={0.55} />
          <stop offset="60%" stopColor={palette.secondary} stopOpacity={0.2} />
          <stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </radialGradient>

        <radialGradient id="swarmGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity={0.35} />
          <stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </radialGradient>

        <filter id="swarmBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient glow cloud */}
      <motion.ellipse
        cx={cx} cy={cy} rx={82} ry={70}
        fill="url(#swarmGlow)"
        animate={{ rx: [82, 90, 78, 82], ry: [70, 65, 74, 70] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Honey-amber core */}
      <motion.circle
        cx={cx} cy={cy} r={30}
        fill="url(#swarmCore)"
        animate={{ r: [28, 33, 27, 30], opacity: [0.7, 1, 0.6, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Whole swarm drifts gently */}
      <motion.g
        animate={{ y: [0, -6, 2, 0], x: [0, 3, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {bees.map((bee, i) => {
          const angleRad = (bee.angle * Math.PI) / 180
          const bx = cx + Math.cos(angleRad) * bee.r
          const by = cy + Math.sin(angleRad) * bee.r

          const bodyW = 10 * bee.scale
          const bodyH = 6 * bee.scale
          const wingW = 8 * bee.scale
          const wingH = 5 * bee.scale

          return (
            <motion.g
              key={i}
              // Each bee orbits the swarm center
              animate={{
                rotate: [0, 360],
                x: [0, Math.cos(angleRad + 1.5) * 4, 0, Math.cos(angleRad - 1.5) * 4, 0],
                y: [0, Math.sin(angleRad) * bee.wobble * 3, bee.wobble * -2, 0],
              }}
              transition={{
                rotate: { duration: bee.speed, repeat: Infinity, ease: 'linear' },
                x: { duration: bee.wobble * 1.2 + 0.8, repeat: Infinity, ease: 'easeInOut' },
                y: { duration: bee.wobble + 0.6, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              {/* Bee positioned at its ring position */}
              <g transform={`translate(${bx}, ${by})`}>
                {/* Wings */}
                <motion.ellipse
                  cx={-bodyW * 0.1} cy={-wingH * 0.9}
                  rx={wingW * 0.7} ry={wingH}
                  fill={palette.accent}
                  fillOpacity={0.45}
                  animate={{ ry: [wingH, wingH * 0.4, wingH] }}
                  transition={{ duration: 0.18, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 }}
                />
                <motion.ellipse
                  cx={bodyW * 0.1} cy={-wingH * 0.9}
                  rx={wingW * 0.7} ry={wingH}
                  fill={palette.accent}
                  fillOpacity={0.45}
                  animate={{ ry: [wingH, wingH * 0.4, wingH] }}
                  transition={{ duration: 0.18, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 + 0.09 }}
                />
                {/* Body */}
                <ellipse cx={0} cy={0} rx={bodyW * 0.5} ry={bodyH * 0.5} fill={palette.secondary} />
                {/* Stripes */}
                <rect
                  x={-bodyW * 0.25} y={-bodyH * 0.18}
                  width={bodyW * 0.2} height={bodyH * 0.36}
                  fill={palette.primary}
                  rx={1}
                />
                <rect
                  x={bodyW * 0.05} y={-bodyH * 0.18}
                  width={bodyW * 0.2} height={bodyH * 0.36}
                  fill={palette.primary}
                  rx={1}
                />
              </g>
            </motion.g>
          )
        })}
      </motion.g>

      {/* Central eye — the Queen's gaze */}
      <motion.circle
        cx={cx} cy={cy} r={5}
        fill={palette.accent}
        animate={{ opacity: [0.4, 1, 0.3, 0.9, 0.4], r: [4, 6, 4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
      />
    </svg>
  )
}

// ── Registry ─────────────────────────────────────────────────────────────────

export const PROCEDURAL_BOSS_REGISTRY: Record<string, ProceduralBossComponent> = {
  procedural_treant: ProceduralTreant,
  procedural_giant: ProceduralGiant,
  procedural_golem: ProceduralGiant, // Alias
  procedural_flame: ProceduralFlame,
  procedural_hollow_king: ProceduralHollowKing,
  procedural_automaton: GroveGuardian,
  procedural_whispering_swarm: ProceduralWhisperingSwarm,
}
