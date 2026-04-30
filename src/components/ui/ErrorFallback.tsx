'use client'

import { useEffect } from 'react'

export type ErrorTheme = 'play' | 'dashboard' | 'auth'

interface ErrorFallbackProps {
  error: Error & { digest?: string }
  reset: () => void
  theme?: ErrorTheme
  /** Custom title (defaults to theme-appropriate) */
  title?: string
  /** Custom message (defaults to theme-appropriate) */
  message?: string
}

const THEME_CONFIG: Record<ErrorTheme, {
  icon: string
  defaultTitle: string
  defaultMessage: string
  bgColor: string
  accentColor: string
  btnGradient: string
  btnBorder: string
}> = {
  play: {
    icon: '⚔',
    defaultTitle: 'The Path Wavers…',
    defaultMessage: 'A disturbance in the Emberlight has interrupted your journey. The way forward will reopen shortly.',
    bgColor: '#0a0a12',
    accentColor: '#c9a84c',
    btnGradient: 'linear-gradient(135deg, #c43a00, #8b1e00)',
    btnBorder: '1px solid rgba(196,58,0,0.5)',
  },
  dashboard: {
    icon: '⚠',
    defaultTitle: 'A Scroll Has Been Misplaced',
    defaultMessage: 'A disturbance in the archives has been noted. Our scribes have logged the incident.',
    bgColor: '#0a0b0f',
    accentColor: '#e05555',
    btnGradient: 'linear-gradient(135deg, #c43a00, #8b1e00)',
    btnBorder: '1px solid rgba(196,58,0,0.5)',
  },
  auth: {
    icon: '🔮',
    defaultTitle: 'The Gateway Flickers',
    defaultMessage: 'The path ahead is momentarily obscured. Please try again.',
    bgColor: '#0a0a12',
    accentColor: '#9b30ff',
    btnGradient: 'linear-gradient(135deg, #7b1fa2, #4a0072)',
    btnBorder: '1px solid rgba(155,48,255,0.5)',
  },
}

export default function ErrorFallback({
  error,
  reset,
  theme = 'play',
  title,
  message,
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error(`[ErrorFallback:${theme}]`, error)
  }, [error, theme])

  const config = THEME_CONFIG[theme]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: config.bgColor,
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
      <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>{config.icon}</div>
      <h2
        style={{
          fontFamily: 'var(--font-heading, serif)',
          fontSize: '1.2rem',
          color: config.accentColor,
          margin: 0,
        }}
      >
        {title ?? config.defaultTitle}
      </h2>
      <p
        style={{
          color: '#7a6a44',
          fontSize: '0.85rem',
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        {message ?? config.defaultMessage}
      </p>
      {error.digest && (
        <p style={{ color: '#5a4a3a', fontSize: '0.65rem', fontFamily: 'monospace' }}>
          Ref: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        style={{
          fontFamily: 'var(--font-pixel, monospace)',
          fontSize: '0.65rem',
          color: '#f0e6c8',
          background: config.btnGradient,
          border: config.btnBorder,
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