interface XPBarProps {
  pct?: number
  height?: number
}

export function XPBar({ pct = 50, height = 8 }: XPBarProps) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div
      className="qf-xp-bar"
      role="meter"
      aria-label="Experience points progress"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height }}
    >
      <div className="qf-xp-fill" style={{ width: clamped + '%' }} />
    </div>
  )
}

export default XPBar
