'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            background: '#0a0614',
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
          <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>✦</div>
          <h1
            style={{
              fontFamily: 'var(--font-heading, serif)',
              fontSize: '1.3rem',
              color: '#c9a84c',
              margin: 0,
            }}
          >
            The Emberlight Flickers…
          </h1>
          <p
            style={{
              color: '#7a6a44',
              fontSize: '0.85rem',
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            Something went wrong within the Chronicler&apos;s domain.
            The quest boards remain open — try again.
          </p>
          <button
            onClick={reset}
            style={{
              fontFamily: 'var(--font-pixel, monospace)',
              fontSize: '0.65rem',
              color: '#f0e6c8',
              background: 'linear-gradient(135deg, #c43a00, #8b1e00)',
              border: '1px solid rgba(196, 58, 0, 0.5)',
              borderRadius: 3,
              padding: '10px 20px',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            TRY AGAIN
          </button>
        </div>
      </body>
    </html>
  )
}
