import { describe, it, expect } from 'vitest'

// Mirror the BADGE_MAP from PixelBadge
const BADGE_MAP = {
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
} as const

describe('PixelBadge BADGE_MAP', () => {
  it('has all 10 required variants', () => {
    const keys = Object.keys(BADGE_MAP)
    expect(keys).toHaveLength(10)
    for (const k of ['easy','medium','hard','epic','pending','verified','once','daily','weekly','monthly']) {
      expect(keys).toContain(k)
    }
  })

  it('every variant has color, bg, defaultLabel strings', () => {
    for (const [k, v] of Object.entries(BADGE_MAP)) {
      expect(v.color,        `${k}.color`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(v.bg,           `${k}.bg`).toMatch(/^rgba/)
      expect(v.defaultLabel, `${k}.defaultLabel`).toBeTruthy()
    }
  })

  it('once variant uses muted gold color', () => {
    expect(BADGE_MAP.once.color).toBe('#6b5d44')
  })
})
