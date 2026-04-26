import type { ReactNode } from 'react'

interface PageHeaderProps {
  kicker?: string
  title: string
  sub?: string
  right?: ReactNode
}

/**
 * Standard per-page header used inside the GM shell or any QF surface.
 * Replaces the legacy `.dash-topbar` chrome — the GMShell already owns
 * the global topbar (brand + family + GM avatar), so pages render
 * their own kicker/title here.
 */
export function PageHeader({ kicker, title, sub, right }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {kicker && (
          <div
            className="font-pixel"
            style={{
              fontSize: 7,
              color: 'var(--qf-gold-400)',
              letterSpacing: '0.2em',
              marginBottom: 4,
            }}
          >
            {kicker}
          </div>
        )}
        <h1
          className="font-heading"
          style={{
            fontSize: 28,
            margin: 0,
            color: 'var(--qf-parchment)',
            fontWeight: 700,
            letterSpacing: '0.03em',
          }}
        >
          {title}
        </h1>
        {sub && (
          <p
            style={{
              color: 'var(--qf-parchment-dim)',
              fontStyle: 'italic',
              margin: '4px 0 0',
              fontSize: 13,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  )
}

export default PageHeader
