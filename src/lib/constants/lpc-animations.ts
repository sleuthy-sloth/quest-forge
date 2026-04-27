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
