interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
}

export function StatCard({ label, value, sub, accent = 'var(--qf-gold-300)' }: StatCardProps) {
  return (
    <div className="qf-ornate-panel" style={{ padding: 16 }}>
      <div
        className="font-pixel"
        style={{
          fontSize: 7,
          color: 'var(--qf-parchment-muted)',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </div>
      <div
        className="font-heading"
        style={{
          fontSize: 28,
          color: accent,
          marginTop: 6,
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--qf-parchment-dim)',
            fontStyle: 'italic',
            marginTop: 2,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

export default StatCard
