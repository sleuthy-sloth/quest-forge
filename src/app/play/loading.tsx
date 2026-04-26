export default function PlayLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
      }}
    >
      {/* Animated ember */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,120,40,0.4), transparent)',
          animation: 'pulse 1.2s ease-in-out infinite',
        }}
      />

      {/* Skeleton panels */}
      <div
        className="qf-ornate-panel"
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            width: '50%',
            height: 16,
            background: 'rgba(240,230,200,0.06)',
            borderRadius: 2,
          }}
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: `${90 - i * 20}%`,
              height: 12,
              background: 'rgba(240,230,200,0.04)',
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50%      { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
