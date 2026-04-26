'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        fontFamily: 'var(--font-body, serif)',
      }}
    >
      <div style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.5rem' }}>⚠</div>
      <h2
        style={{
          fontFamily: 'var(--font-heading, serif)',
          fontSize: '1.1rem',
          color: '#e05555',
          margin: '0 0 0.5rem',
        }}
      >
        A Scroll Has Been Misplaced
      </h2>
      <p style={{ color: '#7a6a44', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto 1rem' }}>
        The Game Master&apos;s dashboard encountered an error.
        This has been noted in the logs.
      </p>
      <button
        onClick={reset}
        style={{
          fontFamily: 'var(--font-pixel, monospace)',
          fontSize: '0.6rem',
          color: '#f0e6c8',
          background: 'linear-gradient(135deg, #c43a00, #8b1e00)',
          border: '1px solid rgba(196,58,0,0.5)',
          borderRadius: 3,
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        RETRY
      </button>
    </div>
  )
}
