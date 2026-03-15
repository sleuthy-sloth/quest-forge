// src/app/dashboard/approvals/error.tsx
'use client'

import { useEffect } from 'react'

export default function ApprovalsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ApprovalQueue] Error:', error)
  }, [error])

  return (
    <div style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      background: 'rgba(220,60,60,0.04)',
      border: '1px solid rgba(220,60,60,0.15)',
      borderRadius: 3,
      margin: '2rem auto',
      maxWidth: 480,
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.4 }}>⚠</div>
      <p style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '0.82rem',
        color: 'rgba(230,110,90,0.85)',
        marginBottom: '1.25rem',
        letterSpacing: '0.04em',
      }}>
        The Approval Queue encountered an error.
      </p>
      <button
        onClick={reset}
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.72rem',
          color: 'rgba(201,168,76,0.8)',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 2,
          padding: '0.5rem 1.25rem',
          cursor: 'pointer',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Try Again
      </button>
    </div>
  )
}
