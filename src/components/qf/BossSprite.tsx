interface BossSpriteProps {
  name?: string
  scale?: number
  glow?: boolean
}

const BOSS_PALETTE: Record<string, { core: string; halo: string }> = {
  eyeball:  { core: '#a83c1a', halo: '#ff6010' },
  pumpking: { core: '#e8a020', halo: '#ff8c3a' },
  ghost:    { core: '#6890d4', halo: '#9fd0ff' },
  slime:    { core: '#5aab6e', halo: '#8ad0a0' },
  flower:   { core: '#b070d4', halo: '#ff6010' },
}

/**
 * Boss sprite placeholder. Draws a stylized SVG silhouette in the boss's
 * palette — used until real LPC sprite sheets are available in /public.
 */
export function BossSprite({ name = 'eyeball', scale = 2, glow = true }: BossSpriteProps) {
  const palette = BOSS_PALETTE[name] ?? BOSS_PALETTE.eyeball
  const px = 64 * scale
  const filter = glow ? `drop-shadow(0 0 ${4 * scale}px ${palette.halo})` : 'none'

  return (
    <div
      style={{
        width: px,
        height: px,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter,
      }}
      aria-hidden="true"
    >
      <svg width={px} height={px} viewBox="0 0 64 64" style={{ imageRendering: 'pixelated' }}>
        {name === 'eyeball' && (
          <>
            <circle cx="32" cy="34" r="22" fill={palette.core} />
            <circle cx="32" cy="32" r="14" fill="#fff8e7" />
            <circle cx="32" cy="32" r="7" fill="#0a0b0f" />
            <circle cx="29" cy="29" r="2" fill="#fff8e7" opacity="0.8" />
          </>
        )}
        {name === 'pumpking' && (
          <>
            <rect x="28" y="6" width="8" height="8" fill="#3a2810" />
            <ellipse cx="32" cy="36" rx="22" ry="20" fill={palette.core} />
            <polygon points="22,32 28,28 26,38" fill="#0a0b0f" />
            <polygon points="42,32 36,28 38,38" fill="#0a0b0f" />
            <polygon points="22,46 28,42 36,42 42,46 38,50 26,50" fill="#0a0b0f" />
          </>
        )}
        {name === 'ghost' && (
          <>
            <path d="M14 22 Q14 8 32 8 Q50 8 50 22 L50 52 L42 46 L36 52 L28 46 L22 52 L14 46 Z" fill={palette.core} opacity="0.85" />
            <circle cx="26" cy="28" r="3" fill="#0a0b0f" />
            <circle cx="38" cy="28" r="3" fill="#0a0b0f" />
          </>
        )}
        {name === 'slime' && (
          <>
            <ellipse cx="32" cy="44" rx="22" ry="14" fill={palette.core} />
            <ellipse cx="32" cy="28" rx="18" ry="14" fill={palette.core} opacity="0.85" />
            <circle cx="26" cy="30" r="2" fill="#0a0b0f" />
            <circle cx="38" cy="30" r="2" fill="#0a0b0f" />
            <ellipse cx="26" cy="22" rx="3" ry="2" fill="#fff8e7" opacity="0.5" />
          </>
        )}
        {name === 'flower' && (
          <>
            <rect x="30" y="40" width="4" height="18" fill="#3a6a4a" />
            <ellipse cx="20" cy="32" rx="10" ry="8" fill={palette.core} />
            <ellipse cx="44" cy="32" rx="10" ry="8" fill={palette.core} />
            <ellipse cx="32" cy="22" rx="10" ry="8" fill={palette.core} />
            <ellipse cx="32" cy="42" rx="10" ry="8" fill={palette.core} />
            <circle cx="32" cy="32" r="8" fill="#0a0b0f" />
            <polygon points="28,30 30,34 34,34 36,30 32,28" fill="#fff8e7" opacity="0.5" />
          </>
        )}
      </svg>
    </div>
  )
}

export default BossSprite
