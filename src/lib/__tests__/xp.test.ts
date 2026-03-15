import { describe, it, expect } from 'vitest'
import { xpForLevel, levelFromXP, xpProgressPercent, embershardState } from '../xp'

// ── xpForLevel ────────────────────────────────────────────────────────────

describe('xpForLevel', () => {
  it('returns 0 for level 1 (starting state)', () => {
    expect(xpForLevel(1)).toBe(0)
  })

  it('returns 100 for level 2', () => {
    expect(xpForLevel(2)).toBe(100)
  })

  it('returns 250 for level 3', () => {
    expect(xpForLevel(3)).toBe(250)
  })

  it('returns 450 for level 4', () => {
    expect(xpForLevel(4)).toBe(450)
  })

  it('returns 700 for level 5', () => {
    expect(xpForLevel(5)).toBe(700)
  })

  it('returns 1000 for level 6 (Steady Flame threshold)', () => {
    expect(xpForLevel(6)).toBe(1000)
  })

  it('returns 2700 for level 10', () => {
    expect(xpForLevel(10)).toBe(2700)
  })

  // Each level costs 50 × (N+1) more than the previous.
  // Level 20 cumulative: Σ(50k, k=2..20) = 50 × (210 - 1) = 10450
  it('returns 10450 for level 20', () => {
    expect(xpForLevel(20)).toBe(10450)
  })

  it('returns 0 for level 0 (treated as level 1)', () => {
    expect(xpForLevel(0)).toBe(0)
  })

  it('thresholds increase monotonically', () => {
    for (let n = 1; n < 30; n++) {
      expect(xpForLevel(n + 1)).toBeGreaterThan(xpForLevel(n))
    }
  })
})

// ── levelFromXP ───────────────────────────────────────────────────────────

describe('levelFromXP', () => {
  it('returns 1 at 0 XP', () => {
    expect(levelFromXP(0)).toBe(1)
  })

  it('returns 1 just below level 2 threshold', () => {
    expect(levelFromXP(99)).toBe(1)
  })

  it('returns 2 at exactly 100 XP', () => {
    expect(levelFromXP(100)).toBe(2)
  })

  it('returns 2 just below level 3 threshold (249 XP)', () => {
    expect(levelFromXP(249)).toBe(2)
  })

  it('returns 3 at 250 XP', () => {
    expect(levelFromXP(250)).toBe(3)
  })

  it('returns 5 at 700 XP', () => {
    expect(levelFromXP(700)).toBe(5)
  })

  it('returns 10 at 2700 XP', () => {
    expect(levelFromXP(2700)).toBe(10)
  })

  it('returns 9 at 2699 XP', () => {
    expect(levelFromXP(2699)).toBe(9)
  })

  it('is consistent with xpForLevel (round-trip)', () => {
    for (const level of [1, 2, 5, 10, 15, 20]) {
      expect(levelFromXP(xpForLevel(level))).toBe(level)
    }
  })
})

// ── xpProgressPercent ────────────────────────────────────────────────────

describe('xpProgressPercent', () => {
  it('returns 0 at exact start of level 1', () => {
    expect(xpProgressPercent(0)).toBe(0)
  })

  it('returns 0 at exact start of level 2 (100 XP)', () => {
    expect(xpProgressPercent(100)).toBe(0)
  })

  it('returns 50% halfway through level 2 (100..250 range, mid = 175)', () => {
    expect(xpProgressPercent(175)).toBe(50)
  })

  it('returns a value between 0 and 100 for arbitrary XP', () => {
    const pct = xpProgressPercent(500)
    expect(pct).toBeGreaterThanOrEqual(0)
    expect(pct).toBeLessThan(100)
  })

  it('returns 0 at level thresholds (exact start of that level)', () => {
    expect(xpProgressPercent(xpForLevel(5))).toBe(0)
    expect(xpProgressPercent(xpForLevel(10))).toBe(0)
  })
})

// ── embershardState ───────────────────────────────────────────────────────

describe('embershardState', () => {
  it('returns "Dim Ember" for levels 1-5', () => {
    for (const level of [1, 2, 3, 4, 5]) {
      expect(embershardState(level)).toBe('Dim Ember')
    }
  })

  it('returns "Steady Flame" for levels 6-10', () => {
    for (const level of [6, 7, 10]) {
      expect(embershardState(level)).toBe('Steady Flame')
    }
  })

  it('returns "Bright Blaze" for levels 11-15', () => {
    for (const level of [11, 15]) {
      expect(embershardState(level)).toBe('Bright Blaze')
    }
  })

  it('returns "Radiant Core" for levels 16-20', () => {
    for (const level of [16, 20]) {
      expect(embershardState(level)).toBe('Radiant Core')
    }
  })

  it('returns "Emberstorm" for levels 21-25', () => {
    for (const level of [21, 25]) {
      expect(embershardState(level)).toBe('Emberstorm')
    }
  })

  it('returns "Living Light" for levels 26-30', () => {
    for (const level of [26, 30]) {
      expect(embershardState(level)).toBe('Living Light')
    }
  })

  it('returns "Hearthfire" for level 31 and above', () => {
    for (const level of [31, 50, 100]) {
      expect(embershardState(level)).toBe('Hearthfire')
    }
  })
})
