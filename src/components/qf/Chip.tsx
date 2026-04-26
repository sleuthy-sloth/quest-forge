import type { ReactNode, CSSProperties } from 'react'

interface ChipProps {
  children: ReactNode
  color?: string
  bg?: string
  style?: CSSProperties
}

export function Chip({ children, color = 'var(--qf-gold-400)', bg, style }: ChipProps) {
  return (
    <span className="qf-chip" style={{ color, background: bg || 'transparent', ...style }}>
      {children}
    </span>
  )
}

export default Chip
