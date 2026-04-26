interface XPBarProps {
  pct?: number
  height?: number
}

export function XPBar({ pct = 50, height = 8 }: XPBarProps) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="qf-xp-bar" style={{ height }}>
      <div className="qf-xp-fill" style={{ width: clamped + '%' }} />
    </div>
  )
}

export default XPBar
