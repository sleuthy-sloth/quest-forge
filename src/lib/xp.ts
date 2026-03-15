/**
 * XP & leveling utilities for Quest Forge.
 *
 * Level formula
 * ─────────────
 * The cost to advance from level N to level N+1 is 50 × (N + 1) XP.
 * Cumulative XP to reach level N:
 *   xpForLevel(N) = Σ 50k  for k = 2..N  =  50 × (N-1) × (N+2) / 2
 *
 * Spot-check:
 *   Level 1  →      0 XP
 *   Level 2  →    100 XP  (costs 100 to advance to 2)
 *   Level 5  →    700 XP
 *   Level 10 →  2,700 XP
 */

import { EMBERSHARD_LEVELS, type EmbershardName } from './constants'

/**
 * Total XP required to reach the given level.
 * Level 1 is the starting state (0 XP required).
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return (50 * (level - 1) * (level + 2)) / 2
}

/**
 * Current level derived from lifetime total XP.
 * Always returns at least 1.
 */
export function levelFromXP(totalXP: number): number {
  if (totalXP <= 0) return 1
  let level = 1
  while (xpForLevel(level + 1) <= totalXP) {
    level++
  }
  return level
}

/**
 * Progress percentage (0–100) toward the next level.
 * Returns 0 at the exact start of a level, 100 would mean just levelled up.
 */
export function xpProgressPercent(totalXP: number): number {
  const current = levelFromXP(totalXP)
  const currentXP = xpForLevel(current)
  const nextXP = xpForLevel(current + 1)
  return ((totalXP - currentXP) / (nextXP - currentXP)) * 100
}

/**
 * Human-readable Embershard state name for a given level.
 * Ranges: 1-5 Dim Ember, 6-10 Steady Flame, 11-15 Bright Blaze,
 *         16-20 Radiant Core, 21-25 Emberstorm, 26-30 Living Light, 31+ Hearthfire
 */
export function embershardState(level: number): EmbershardName {
  for (const { minLevel, name } of EMBERSHARD_LEVELS) {
    if (level >= minLevel) return name
  }
  return 'Dim Ember'
}
