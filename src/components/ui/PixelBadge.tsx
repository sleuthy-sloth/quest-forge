import React from 'react'

type BadgeVariant =
  | 'easy' | 'medium' | 'hard' | 'epic'
  | 'pending' | 'verified'
  | 'once' | 'daily' | 'weekly' | 'monthly'

interface BadgeStyle {
  color: string
  bg: string
  defaultLabel: string
}

const BADGE_MAP: Record<BadgeVariant, BadgeStyle> = {
  easy:     { color: '#2eb85c', bg: 'rgba(46,184,92,0.1)',   defaultLabel: 'EASY'       },
  medium:   { color: '#4d8aff', bg: 'rgba(77,138,255,0.1)',  defaultLabel: 'MEDIUM'     },
  hard:     { color: '#b060e0', bg: 'rgba(176,96,224,0.1)',  defaultLabel: 'HARD'       },
  epic:     { color: '#e86a20', bg: 'rgba(232,106,32,0.1)',  defaultLabel: 'EPIC'       },
  pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  defaultLabel: '⏳ PENDING' },
  verified: { color: '#2eb85c', bg: 'rgba(46,184,92,0.1)',   defaultLabel: '✓ VERIFIED' },
  once:     { color: '#6b5d44', bg: 'rgba(107,93,68,0.1)',   defaultLabel: '✦ ONCE'     },
  daily:    { color: '#c9a84c', bg: 'rgba(201,168,76,0.1)',  defaultLabel: '↻ DAILY'    },
  weekly:   { color: '#9b30ff', bg: 'rgba(155,48,255,0.1)',  defaultLabel: '◎ WEEKLY'   },
  monthly:  { color: '#60b0e0', bg: 'rgba(96,176,224,0.1)', defaultLabel: '◎ MONTHLY'  },
}

export interface PixelBadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  className?: string
}

export default function PixelBadge({ variant, children, className }: PixelBadgeProps) {
  const { color, bg, defaultLabel } = BADGE_MAP[variant]

  return (
    <span
      className={`px-badge${className ? ` ${className}` : ''}`}
      style={{ color, background: bg }}
    >
      {children ?? defaultLabel}
    </span>
  )
}
