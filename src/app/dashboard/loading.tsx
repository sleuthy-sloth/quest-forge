export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Skeleton heading */}
      <div>
        <div
          style={{
            width: 120,
            height: 10,
            background: 'rgba(201,168,76,0.1)',
            borderRadius: 2,
            marginBottom: 8,
          }}
        />
        <div
          style={{
            width: 260,
            height: 28,
            background: 'rgba(240,230,200,0.06)',
            borderRadius: 3,
          }}
        />
        <div
          style={{
            width: 200,
            height: 14,
            background: 'rgba(240,230,200,0.04)',
            borderRadius: 2,
            marginTop: 6,
          }}
        />
      </div>

      {/* Skeleton stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="qf-ornate-panel"
            style={{
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                width: '60%',
                height: 8,
                background: 'rgba(240,230,200,0.06)',
                borderRadius: 2,
              }}
            />
            <div
              style={{
                width: '40%',
                height: 22,
                background: 'rgba(240,230,200,0.08)',
                borderRadius: 3,
              }}
            />
            <div
              style={{
                width: '70%',
                height: 8,
                background: 'rgba(240,230,200,0.04)',
                borderRadius: 2,
              }}
            />
          </div>
        ))}
      </div>

      {/* Skeleton two-column section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
        }}
      >
        <div
          className="qf-ornate-panel"
          style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '100%',
                height: 14,
                background: 'rgba(240,230,200,0.04)',
                borderRadius: 2,
              }}
            />
          ))}
        </div>
        <div
          className="qf-ornate-panel"
          style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: `${80 - i * 15}%`,
                height: 14,
                background: 'rgba(240,230,200,0.04)',
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
