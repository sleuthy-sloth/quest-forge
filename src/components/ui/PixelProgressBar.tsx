import React from 'react'

const FILL_GRADIENT = {
  xp:   'linear-gradient(90deg, #c95a00, #ff8c00, #ffc040)',
  hp:   'linear-gradient(90deg, #8b0000, #dd2222)',
  boss: 'linear-gradient(90deg, #7f0000, #cc0000)',
} as const

export interface PixelProgressBarProps {
  value: number
  max: number
  variant?: 'xp' | 'hp' | 'boss'
  label?: string
  showValue?: boolean
  className?: string
}

export default function PixelProgressBar({
  value,
  max,
  variant = 'xp',
  label,
  showValue = false,
  className,
}: PixelProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div className={className}>
      {label && <div className="px-progress-label">{label}</div>}
      <div className="px-progress-wrap">
        <div
          className="px-progress-fill"
          style={{ width: `${pct}%`, background: FILL_GRADIENT[variant] }}
        />
      </div>
      {showValue && (
        <div className="px-progress-value">
          {value.toLocaleString()} / {max.toLocaleString()}
        </div>
      )}
    </div>
  )
}
