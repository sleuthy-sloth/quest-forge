type PixelIconId =
  | 'sword'
  | 'hammer'
  | 'flask'
  | 'scroll'
  | 'star'
  | 'circuit'
  | 'gamepad'
  | 'crown'
  | 'lightning'
  | 'book'
  | 'chest'
  | 'photo'
  | 'check'
  | 'shard'

interface PixelIconProps {
  id: PixelIconId
  size?: number
  color?: string
}

export function PixelIcon({ id, size = 20, color = 'var(--qf-gold-300)' }: PixelIconProps) {
  const s = { width: size, height: size, display: 'block' as const, imageRendering: 'pixelated' as const }

  switch (id) {
    case 'sword':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <polygon points="8,1 9,2 9,10 8,11 7,10 7,2" fill={color} />
          <rect x="5" y="9" width="6" height="2" fill={color} />
          <rect x="7" y="11" width="2" height="4" fill={color} opacity="0.5" />
        </svg>
      )
    case 'hammer':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2" y="3" width="8" height="5" rx="1" fill={color} />
          <rect x="8" y="5" width="5" height="2" fill={color} opacity="0.7" />
          <rect x="9" y="7" width="2" height="5" fill={color} opacity="0.5" />
        </svg>
      )
    case 'flask':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <rect x="6" y="1" width="4" height="5" fill={color} opacity="0.5" />
          <rect x="5" y="2" width="6" height="1" fill={color} />
          <polygon points="5,6 11,6 14,14 2,14" fill={color} opacity="0.7" />
          <polygon points="7,9 9,9 10,12 6,12" fill="rgba(255,255,255,0.3)" />
        </svg>
      )
    case 'scroll':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <rect x="3" y="2" width="10" height="12" rx="1" fill={color} opacity="0.25" />
          <rect x="3" y="2" width="10" height="12" rx="1" stroke={color} strokeWidth="1" fill="none" />
          <rect x="5" y="5" width="6" height="1" fill={color} />
          <rect x="5" y="7" width="6" height="1" fill={color} />
          <rect x="5" y="9" width="4" height="1" fill={color} />
          <rect x="1" y="3" width="2" height="10" rx="1" fill={color} />
          <rect x="13" y="3" width="2" height="10" rx="1" fill={color} />
        </svg>
      )
    case 'star':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <polygon
            points="8,1 10,6 15,6.5 11,10 12.5,15 8,12 3.5,15 5,10 1,6.5 6,6"
            fill={color}
          />
        </svg>
      )
    case 'circuit':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1" y="7" width="3" height="2" fill={color} />
          <rect x="4" y="7" width="2" height="2" fill={color} opacity="0.45" />
          <rect x="6" y="4" width="2" height="8" fill={color} />
          <rect x="8" y="7" width="2" height="2" fill={color} opacity="0.45" />
          <rect x="10" y="3" width="2" height="10" fill={color} />
          <rect x="12" y="7" width="4" height="2" fill={color} />
          <circle cx="2" cy="8" r="1" fill="var(--qf-bg-void)" />
          <circle cx="14" cy="8" r="1" fill="var(--qf-bg-void)" />
        </svg>
      )
    case 'gamepad':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1" y="4" width="14" height="9" rx="3" fill={color} opacity="0.3" />
          <rect x="1" y="4" width="14" height="9" rx="3" stroke={color} strokeWidth="1" fill="none" />
          <rect x="3" y="7" width="1" height="3" fill={color} />
          <rect x="2" y="8" width="3" height="1" fill={color} />
          <circle cx="11" cy="7" r="1" fill={color} />
          <circle cx="13" cy="9" r="1" fill={color} />
        </svg>
      )
    case 'crown':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <polygon points="1,13 3,6 8,10 13,6 15,13" fill={color} opacity="0.7" />
          <rect x="1" y="13" width="14" height="2" fill={color} />
          <circle cx="3" cy="6" r="1.5" fill={color} />
          <circle cx="8" cy="10" r="1.5" fill={color} />
          <circle cx="13" cy="6" r="1.5" fill={color} />
        </svg>
      )
    case 'lightning':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <polygon points="9,1 4,9 8,9 7,15 12,7 8,7" fill={color} />
        </svg>
      )
    case 'book':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2" y="2" width="12" height="12" rx="1" fill={color} opacity="0.15" />
          <rect x="2" y="2" width="12" height="12" rx="1" stroke={color} strokeWidth="1" fill="none" />
          <rect x="8" y="2" width="1" height="12" fill={color} opacity="0.3" />
          <rect x="4" y="5" width="3" height="1" fill={color} />
          <rect x="4" y="7" width="3" height="1" fill={color} />
          <rect x="10" y="5" width="2" height="1" fill={color} />
          <rect x="10" y="7" width="2" height="1" fill={color} />
        </svg>
      )
    case 'chest':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1" y="7" width="14" height="8" rx="1" fill={color} opacity="0.35" />
          <rect x="1" y="7" width="14" height="8" rx="1" stroke={color} strokeWidth="1" fill="none" />
          <rect x="1" y="5" width="14" height="4" rx="1" fill={color} opacity="0.55" />
          <rect x="1" y="5" width="14" height="4" rx="1" stroke={color} strokeWidth="1" fill="none" />
          <rect x="6" y="9" width="4" height="3" rx="1" fill={color} />
        </svg>
      )
    case 'photo':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1" y="3" width="14" height="11" rx="1" fill={color} opacity="0.2" />
          <rect x="1" y="3" width="14" height="11" rx="1" stroke={color} strokeWidth="1" fill="none" />
          <circle cx="8" cy="8.5" r="3" stroke={color} strokeWidth="1" fill="none" />
          <circle cx="8" cy="8.5" r="1.5" fill={color} opacity="0.6" />
          <rect x="5" y="2" width="6" height="2" rx="1" fill={color} />
        </svg>
      )
    case 'check':
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <polyline
            points="2,8 6,12 14,4"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="square"
          />
        </svg>
      )
    case 'shard':
      return (
        <svg
          style={{ ...s, filter: `drop-shadow(0 0 3px ${color})` }}
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <polygon
            points="8,1 14,6 11,15 5,15 2,6"
            fill={color}
            stroke="#fff8e7"
            strokeWidth="0.5"
          />
          <polygon points="8,1 11,6 8,8 5,6" fill="#fff8e7" opacity="0.5" />
        </svg>
      )
    default:
      return (
        <svg style={s} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6" fill={color} />
        </svg>
      )
  }
}

export default PixelIcon
