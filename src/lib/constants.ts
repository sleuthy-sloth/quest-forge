// Game balance constants for Quest Forge: The Emberlight Chronicles

// ── XP & Gold rewards by chore difficulty ────────────────────────────────

export const XP_BY_DIFFICULTY = {
  easy:   { min: 10,  max: 25  },
  medium: { min: 25,  max: 50  },
  hard:   { min: 50,  max: 100 },
  epic:   { min: 100, max: 200 },
} as const

export const GOLD_BY_DIFFICULTY = {
  easy:   { min: 0,  max: 0  },
  medium: { min: 0,  max: 5  },
  hard:   { min: 5,  max: 15 },
  epic:   { min: 10, max: 20 },
} as const

export type Difficulty = keyof typeof XP_BY_DIFFICULTY

// ── Embershard level ranges ───────────────────────────────────────────────
// Ordered descending so the first matching entry wins.

export const EMBERSHARD_LEVELS = [
  { minLevel: 31, name: 'Hearthfire'   },
  { minLevel: 26, name: 'Living Light' },
  { minLevel: 21, name: 'Emberstorm'   },
  { minLevel: 16, name: 'Radiant Core' },
  { minLevel: 11, name: 'Bright Blaze' },
  { minLevel: 6,  name: 'Steady Flame' },
  { minLevel: 1,  name: 'Dim Ember'    },
] as const

export type EmbershardName = typeof EMBERSHARD_LEVELS[number]['name']

// ── Boss HP defaults by story week range ─────────────────────────────────
// Base HP before player-count scaling.
// The first range whose maxWeek >= current week is used.

export const BOSS_BASE_HP = [
  { maxWeek: 4,  min: 300,  max: 500  },
  { maxWeek: 12, min: 450,  max: 700  },
  { maxWeek: 24, min: 550,  max: 800  },
  { maxWeek: 36, min: 650,  max: 900  },
  { maxWeek: 48, min: 750,  max: 1000 },
  { maxWeek: 52, min: 1000, max: 1500 },
] as const

// ── Edu-challenge XP ─────────────────────────────────────────────────────

/** Base XP per difficulty level (1-5). Perfect score adds 25% bonus. */
export const EDU_XP_BY_DIFFICULTY: Record<number, number> = {
  1: 20,
  2: 30,
  3: 40,
  4: 55,
  5: 75,
}

export const EDU_PERFECT_SCORE_MULTIPLIER = 1.25

// ── Miscellaneous rewards ────────────────────────────────────────────────

export const BOSS_DEFEAT_BONUS_XP = { min: 50, max: 150 }
export const WEEKLY_STREAK_BONUS_XP = 25
