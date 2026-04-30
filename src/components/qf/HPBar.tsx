interface HPBarProps {
  pct?: number
  label?: string
  value?: string
}

export function HPBar({ pct = 60, label = 'HP', value = '' }: HPBarProps) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span
          className="font-pixel"
          style={{ fontSize: 7, color: 'var(--qf-parchment-muted)', letterSpacing: '0.1em' }}
        >
          {label}
        </span>
        {value && (
          <span
            className="font-pixel"
            style={{ fontSize: 7, color: 'var(--qf-parchment-dim)' }}
          >
            {value}
          </span>
        )}
      </div>
      <div
        className="qf-hp-bar"
        role="meter"
        aria-label={value ? `${label}: ${value}` : label}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="qf-hp-fill" style={{ width: clamped + '%' }} />
      </div>
    </div>
  )
}

export default HPBar
