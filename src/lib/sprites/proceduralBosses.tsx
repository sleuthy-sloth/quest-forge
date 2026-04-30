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

// ── Helpers ────────────────────────────────────────────────────────────────

interface ImageBossProps extends ProceduralBossProps {
  src: string
  filterId: string
}

const ImageBoss: React.FC<ImageBossProps> = ({ src, size, glowColor, filterId }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" style={{ overflow: 'visible' }}>
    <defs>
      <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feColorMatrix in="blur" type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -6" result="colorGlow" />
        <feComposite in="SourceGraphic" in2="colorGlow" operator="over" />
      </filter>
    </defs>
    <motion.g
      animate={{ y: [0, -8, 2, 0], scale: [1, 1.02, 0.99, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '128px 128px' }}
    >
      <image href={src} x="0" y="0" width="256" height="256"
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: `url(#${filterId}) drop-shadow(0 0 12px ${glowColor})` }}
      />
    </motion.g>
  </svg>
)


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

const ProceduralTreant: ProceduralBossComponent = (props) => (
  <ImageBoss {...props} src="/images/bosses/thornmaw.png" filterId="img-boss-treant" />
)


// ── 3. Giant (Boulder Construct) ──────────────────────────────────────────

const ProceduralGiant: ProceduralBossComponent = ({ palette, size, glowColor }) => {
  const baseSize = 256
  return (
    <svg width={size} height={size} viewBox={`0 0 ${baseSize} ${baseSize}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="emberGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.accent} stopOpacity={0.8} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <motion.g
        animate={{ scaleY: [1, 1.02, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: 'center bottom' }}
      >
        {/* Massive Ash Body */}
        <path
          d="M60 240 Q128 250 196 240 L210 140 Q128 100 46 140 Z"
          fill={palette.primary}
          style={{ filter: 'brightness(0.7)' }}
        />
        {/* Chest Cavity / Hollow */}
        <path
          d="M110 160 Q128 150 146 160 L140 190 Q128 200 116 190 Z"
          fill="#1a1a1a"
        />
        {/* Dying Ember in Chest */}
        <motion.circle
          cx="128" cy="175" r="4"
          fill={palette.accent}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ filter: `drop-shadow(0 0 8px ${palette.accent})` }}
        />

        {/* Massive Arms */}
        <path d="M46 150 Q20 180 30 230" fill="none" stroke={palette.primary} strokeWidth="24" strokeLinecap="round" />
        <path d="M210 150 Q236 180 226 230" fill="none" stroke={palette.primary} strokeWidth="24" strokeLinecap="round" />

        {/* Head */}
        <g transform="translate(0, -10)">
          <path d="M100 110 Q128 80 156 110 L146 140 H110 Z" fill={palette.primary} />
          {/* Hollow Eye Sockets */}
          <circle cx="115" cy="115" r="6" fill="#000" />
          <circle cx="141" cy="115" r="6" fill="#000" />
          {/* Near-dead ember glow in eyes */}
          <motion.circle
            cx="115" cy="115" r="2"
            fill={palette.accent}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.circle
            cx="141" cy="115" r="2"
            fill={palette.accent}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          />
        </g>

        {/* Dead Leaves */}
        {[
          { x: 80, y: 160, r: 15 }, { x: 170, y: 180, r: -20 },
          { x: 100, y: 220, r: 45 }, { x: 150, y: 140, r: 10 }
        ].map((leaf, i) => (
          <path
            key={i}
            d="M0 0 Q4 -4 8 0 Q4 4 0 0"
            fill="#5c4033"
            transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.r}) scale(1.5)`}
            opacity="0.6"
          />
        ))}
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
        <radialGradient id="voidInterior" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a0a2a" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <filter id="flameBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Warm Outer Flames */}
      <motion.g
        animate={{ scale: [1, 1.05, 1], rotate: [-1, 1, -1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: 'center bottom' }}
      >
        <path
          d="M128 240 Q60 200 80 120 Q128 20 128 0 Q128 20 176 120 Q196 200 128 240"
          fill={palette.accent}
          filter="url(#flameBlur)"
          style={{ opacity: 0.8 }}
        />
        <path
          d="M128 230 Q70 190 90 120 Q128 40 128 20 Q128 40 166 120 Q186 190 128 230"
          fill={palette.secondary}
          filter="url(#flameBlur)"
          style={{ opacity: 0.6 }}
        />
      </motion.g>

      {/* Cold Void Interior - Feminine Silhouette */}
      <motion.path
        d="M128 220 Q100 210 110 160 Q128 150 146 160 Q156 210 128 220 M128 150 Q100 140 100 110 Q128 70 128 50 Q128 70 156 110 Q156 140 128 150"
        fill="url(#voidInterior)"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ transformOrigin: 'center bottom' }}
      />

      {/* Ice-Blue Eyes */}
      <motion.g>
        <motion.circle
          cx="115" cy="100" r="2.5"
          fill="#00ffff"
          animate={{ scaleY: [1, 0, 1] }}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 6 }}
          style={{ filter: 'drop-shadow(0 0 4px #00ffff)' }}
        />
        <motion.circle
          cx="141" cy="100" r="2.5"
          fill="#00ffff"
          animate={{ scaleY: [1, 0, 1] }}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 6, delay: 0.1 }}
          style={{ filter: 'drop-shadow(0 0 4px #00ffff)' }}
        />
      </motion.g>

      {/* False Smile */}
      <path
        d="M120 120 Q128 128 136 120"
        fill="none"
        stroke="#00ffff"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
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
        <linearGradient id="cloakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.secondary} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      <motion.g
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Billowing Cloak */}
        <motion.path
          d="M80 100 Q128 80 176 100 L210 250 Q128 260 46 250 Z"
          fill="url(#cloakGradient)"
          animate={{ d: [
            "M80 100 Q128 80 176 100 L210 250 Q128 260 46 250 Z",
            "M80 100 Q128 80 176 100 L220 240 Q128 270 36 240 Z",
            "M80 100 Q128 80 176 100 L210 250 Q128 260 46 250 Z"
          ]}}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Skull Face */}
        <g transform="translate(0, 10)">
          <path d="M100 80 Q128 50 156 80 L140 130 H116 Z" fill="#f0f0f0" />
          {/* Oval hollow eye sockets */}
          <motion.ellipse
            cx="118" cy="90" rx="4" ry="6"
            fill="#000"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.ellipse
            cx="138" cy="90" rx="4" ry="6"
            fill="#000"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          />
        </g>

        {/* Elaborate 5-spike Crown */}
        <path
          d="M100 70 L95 40 L108 65 L115 30 L123 65 L128 20 L133 65 L141 30 L148 65 L161 40 L156 70"
          fill={palette.accent}
          style={{ filter: `drop-shadow(0 0 8px ${palette.accent})` }}
        />

        {/* Skeletal Hands */}
        <motion.g
          animate={{ x: [-2, 2, -2], y: [0, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {/* Left Hand */}
          <path d="M60 160 Q40 170 50 190 M50 190 L40 200 M50 190 L50 205 M50 190 L60 200" stroke="#f0f0f0" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Right Hand */}
          <path d="M196 160 Q216 170 206 190 M206 190 L216 200 M206 190 L206 205 M206 190 L196 200" stroke="#f0f0f0" strokeWidth="2" strokeLinecap="round" fill="none" />
        </motion.g>
      </motion.g>
    </svg>
  )
}

// ── 6. Whispering Swarm (Animated Bee Swarm) ──────────────────────────────

const ProceduralWhisperingSwarm: ProceduralBossComponent = (props) => (
  <ImageBoss {...props} src="/images/bosses/whisperingswarm.png" filterId="img-boss-swarm" />
)


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
