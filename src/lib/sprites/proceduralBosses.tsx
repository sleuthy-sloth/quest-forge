// src/lib/sprites/proceduralBosses.tsx

import React from 'react'
import { motion } from 'framer-motion'
import type { BossPalette } from './palette'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProceduralBossProps {
  palette: BossPalette
  size: number
  glowColor: string
  hpPct?: number
}

export type ProceduralBossComponent = React.FC<ProceduralBossProps>

// ── Helpers ────────────────────────────────────────────────────────────────

interface ImageBossProps extends ProceduralBossProps {
  src: string
  filterId: string
}

const ImageBoss: React.FC<ImageBossProps> = ({ src, size, glowColor, filterId, hpPct = 100 }) => {
  const isInjured = hpPct < 50
  const isCritical = hpPct < 25

  return (
    <svg width={size} height={size} viewBox="0 0 256 256" style={{ overflow: 'visible' }}>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -6" result="colorGlow" />
          <feComposite in="SourceGraphic" in2="colorGlow" operator="over" />
        </filter>
        
        {/* Desaturation/Injury filter */}
        <filter id={`${filterId}-injury`}>
          <feColorMatrix type="matrix" values="
            0.6 0.3 0.1 0 0
            0.2 0.5 0.1 0 0
            0.1 0.2 0.3 0 0
            0 0 0 1 0" />
        </filter>
      </defs>

      <motion.g
        animate={{ 
          y: isCritical ? [0, -2, 0, 2, 0] : [0, -8, 2, 0], 
          scale: [1, 1.02, 0.99, 1],
          filter: isCritical 
            ? [`drop-shadow(0 0 12px ${glowColor})`, `drop-shadow(0 0 20px #ff0000)`, `drop-shadow(0 0 12px ${glowColor})`]
            : `drop-shadow(0 0 12px ${glowColor})`
        }}
        transition={{ 
          duration: isCritical ? 0.5 : 5, 
          repeat: Infinity, 
          ease: isCritical ? 'linear' : 'easeInOut' 
        }}
        style={{ transformOrigin: '128px 128px' }}
      >
        <image 
          href={src} x="0" y="0" width="256" height="256"
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            filter: `url(#${filterId}) ${isInjured ? `url(#${filterId}-injury) brightness(0.8) sepia(0.3) saturate(1.5) hue-rotate(-20deg)` : ''}`,
            opacity: isCritical ? 0.9 : 1
          }}
        />
        
        {/* Critical damage flicker overlay */}
        {isCritical && (
          <motion.rect
            x="0" y="0" width="256" height="256"
            fill="rgba(255, 0, 0, 0.15)"
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}
          />
        )}
      </motion.g>
    </svg>
  )
}


// ── 1. Grove-Guardian Automaton (Flagship Pixar-Fantasy Boss) ────────────────

const GroveGuardian: ProceduralBossComponent = (props) => (
  <ImageBoss {...props} src="/images/bosses/groveguardian.png" filterId="img-boss-grove" />
)


// ── 2. Treant (Organic Forest Guardian) ───────────────────────────────────

const ProceduralTreant: ProceduralBossComponent = (props) => (
  <ImageBoss {...props} src="/images/bosses/thornmaw.png" filterId="img-boss-treant" />
)


// ── 3. Giant (Boulder Construct) ──────────────────────────────────────────

const ProceduralGiant: ProceduralBossComponent = (props) => (
  <ImageBoss {...props} src="/images/bosses/grulk.png" filterId="img-boss-grulk" />
)


// ── 4. Flame (Living Ember) ───────────────────────────────────────────────

const ProceduralFlame: ProceduralBossComponent = (props) => (
  <ImageBoss {...props} src="/images/bosses/cindra.png" filterId="img-boss-cindra" />
)


// ── 5. Hollow King (Ethereal Wraith) ──────────────────────────────────────

const ProceduralHollowKing: ProceduralBossComponent = (props) => (
  <ImageBoss {...props} src="/images/bosses/hollowking.png" filterId="img-boss-hollow-king" />
)


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
