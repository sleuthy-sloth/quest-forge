'use client'

export default function PlayError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        fontFamily: 'var(--font-body, serif)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>⚔</div>
      <h2
        style={{
          fontFamily: 'var(--font-heading, serif)',
          fontSize: '1.2rem',
          color: '#c9a84c',
          margin: 0,
        }}
      >
        The Path Wavers…
      </h2>
      <p
        style={{
          color: '#7a6a44',
          fontSize: '0.85rem',
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        A disturbance in the Emberlight has interrupted your journey.
        The way forward will reopen shortly.
      </p>
      <button
        onClick={reset}
        style={{
          fontFamily: 'var(--font-pixel, monospace)',
          fontSize: '0.65rem',
          color: '#f0e6c8',
          background: 'linear-gradient(135deg, #c43a00, #8b1e00)',
          border: '1px solid rgba(196,58,0,0.5)',
          borderRadius: 3,
          padding: '10px 20px',
          cursor: 'pointer',
          marginTop: '0.5rem',
        }}
      >
        RETRY
      </button>
    </div>
  )
}
