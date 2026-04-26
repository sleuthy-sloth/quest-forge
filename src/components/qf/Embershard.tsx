interface EmbershardProps {
  size?: number
  color?: string
}

export function Embershard({ size = 16, color = '#ff8c3a' }: EmbershardProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      aria-hidden="true"
    >
      <polygon points="8,1 14,6 11,15 5,15 2,6" fill={color} stroke="#fff8e7" strokeWidth="0.5" />
      <polygon points="8,1 11,6 8,8 5,6" fill="#fff8e7" opacity="0.6" />
    </svg>
  )
}

export default Embershard
