/**
 * LPC sprite animation row constants.
 *
 * Standard LPC Universal sprite sheets use this row layout:
 *   Rows  0–3: Spell cast (up, left, right, down)
 *   Rows  4–7: Thrust     (up, left, right, down)
 *   Rows  8–11: Walk cycle (up, left, right, down)
 *   Rows 12–15: Slash     (up, left, right, down)
 *   Rows 16–19: Shoot     (up, left, right, down)
 *   Rows 20–23: Hurt      (up, left, right, down)
 *
 * Each action row has 6 columns (frames) per direction.
 * Walk-only sheets (4 rows) use row 2 for the down-facing direction.
 *
 * These constants are consumed by AnimatedAvatar and EncounterCard
 * to select the correct sprite sheet row for each animation state.
 */

/** Full LPC sheet: walk-down row (row 10 = 4th row of walk group). */
export const LPC_WALK_DOWN_ROW = 10

/** Walk-only sheet (4 rows): walk-down row (row 2). */
export const LPC_WALK_DOWN_ROW_SHORT = 2

/** Number of walk cycle columns (frames) in a standard LPC row. */
export const LPC_WALK_COLS = 6

/** Milliseconds between idle animation frames. Matches BossSprite timing. */
export const LPC_IDLE_INTERVAL_MS = 400

// ── Attack animation constants ────────────────────────────────────────────────

/**
 * Named animation presets used by AnimatedAvatar.
 * Each preset maps to an attack action type.
 */
export type AnimationPreset = 'warrior' | 'mage' | 'rogue' | 'scholar'

/**
 * Maps an animation preset to its corresponding LPC attack action type.
 *
 * The action type determines which sprite sheet row is used during
 * attack animation bursts. The actual row number is resolved at
 * runtime by resolveAttackRow() inside AnimatedAvatar.
 */
export const ATTACK_ACTION: Record<AnimationPreset, 'slash' | 'thrust' | 'cast'> = {
  warrior: 'slash',
  mage: 'cast',
  rogue: 'thrust',
  scholar: 'slash',
}

/**
 * Default LPC sprite sheet rows for each attack action type.
 *
 * These are the **camera-facing (south/down)** rows within each
 * 4-direction action group.  The direction order within a group is
 * North (offset 0), West (1), South (2 — camera-facing), East (3).
 *
 * Walk-down is row 10 (walk group starts at 8, offset +2 = 10),
 * which confirms this layout.
 *
 * No ``satisfies``, no per-layer validation — the compositor handles
 * out-of-bounds rows gracefully.
 */
export const LPC_ACTION_DEFAULT_ROWS: Record<string, number> = {
  slash:  14,   // rows 12–15 → camera-facing at 12 + 2
  thrust:  6,   // rows  4–7  → camera-facing at  4 + 2
  cast:    2,   // rows  0–3  → camera-facing at  0 + 2
}

/** Milliseconds between attack animation frames (faster than idle). */
export const LPC_ATTACK_INTERVAL_MS = 150

/** Milliseconds between automatic attack triggers. */
export const LPC_AUTO_ATTACK_MS = 8000
