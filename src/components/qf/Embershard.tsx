import { embershardState } from '@/lib/xp'

interface EmbershardProps {
  level?: number
  size?: number
}

const SHARD_COLORS: Record<string, string> = {
  'Dim Ember': '#ff8c3a',
  'Steady Flame': '#ffae42',
  'Bright Blaze': '#ffcc33',
  'Radiant Core': '#ffffff',
  'Emberstorm': '#ff4d4d',
  'Living Light': '#d4b0ff',
  'Hearthfire': '#c9a84c',
}

export function Embershard({ level = 1, size = 16 }: EmbershardProps) {
  const state = embershardState(level)
  const color = SHARD_COLORS[state] || '#ff8c3a'
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ filter: `drop-shadow(0 0 ${size / 4}px ${color}80)` }}
      aria-hidden="true"
    >
      <polygon points="8,1 14,6 11,15 5,15 2,6" fill={color} stroke="#fff8e7" strokeWidth="0.5" />
      <polygon points="8,1 11,6 8,8 5,6" fill="#fff8e7" opacity="0.6" />
      {level >= 16 && (
        <circle cx="8" cy="8" r="2" fill="#fff" opacity="0.8">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}

export default Embershard
