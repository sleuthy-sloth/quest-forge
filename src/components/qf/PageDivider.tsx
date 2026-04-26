import type { ReactNode } from 'react'

interface PageDividerProps {
  children: ReactNode
  right?: ReactNode
}

/**
 * Section-rule divider — a small uppercase heading on the left, a thin
 * gold gradient rule that fills the rest, and an optional right slot
 * (usually a "Manage →" link or item count).
 */
export function PageDivider({ children, right }: PageDividerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
      }}
    >
      <h2
        className="qf-scribed"
        style={{
          fontSize: 11,
          margin: 0,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {children}
      </h2>
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            'linear-gradient(90deg, var(--qf-rule-strong), transparent)',
        }}
      />
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  )
}

export default PageDivider
