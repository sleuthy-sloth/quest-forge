/**
 * Enemy encounter presets for the Academy battle-selection hall.
 *
 * Each enemy is defined as an EncounterConfig containing a full AvatarConfig
 * composed from existing SPRITE_MANIFEST assets — the same layers and IDs
 * used by player character creation. This allows the existing LPC avatar
 * compositor to render enemies with no modifications.
 *
 * Key design decisions:
 * - All sprite IDs are validated against SPRITE_MANIFEST at review time.
 * - Body types (female/male/universal) are paired with matching head sprites
 *   so the compositor's body-type filter doesn't skip layers.
 * - Weapon/shield are omitted for magic-focused enemies (scribes, hexweavers)
 *   — they use hand gestures / spells thematically.
 * - Word Forge uses `sword` since no hammer weapon sprite exists in the
 *   current sprite asset set (only sword, longsword, spear, bow).
 * - `chainmail` only accepts `color: 'gray'` (its sole color variant).
 * - `crown` has no color variants (single gold PNG) → `color: null`.
 * - Eye sprites have color baked into the PNG → `color: null`.
 * - `hands` and `belt` categories are empty → always `{ id: null }`.
 */

import type { EncounterConfig } from '@/types/encounter'
import type { AvatarConfig } from '@/types/avatar'

/**
 * Default avatar config shown when a player has no avatar_config saved yet.
 * Renders a generic character silhouette with basic clothing and hair
 * so the placeholder is still recognisable. Matches the fallback in
 * AvatarPreview.
 */
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  body:   { id: 'body_female', color: null },
  head:   { id: 'human_female', color: null },
  eyes:   { id: 'eyes_blue', color: '#3a6a9a' },
  hair:   { id: 'bob', color: '#3d2200' },
  pants:  { id: 'pants', color: 'brown' },
  shirt:  { id: 'longsleeve', color: 'navy' },
  boots:  { id: 'boots', color: 'brown' },
  hands:  { id: null },
  belt:   { id: null },
  cape:   { id: null },
  helmet: { id: null },
  weapon: { id: null },
  shield: { id: null },
}

// ── Layer shorthand helpers ───────────────────────────────────────────────────

const NO_LAYER = { id: null } as const
const NO_SHIELD = { id: null } as const
const NO_HANDS  = { id: null } as const
const NO_BELT   = { id: null } as const

/** Wraps a SpriteLayer id + optional color into the AvatarConfig shape. */
function L(
  id: string,
  color: string | null = null,
): { id: string; color: string | null } {
  return { id, color }
}

// ── Enemy presets ─────────────────────────────────────────────────────────────

export const ENEMY_PRESETS: Record<string, EncounterConfig> = {

  // ── Math Arena ────────────────────────────────────────────────────────────
  'math-arena': {
    id: 'math-arena',
    name: 'Abyssal Calculator',
    glowColor: '#c43a00',
    avatar: {
      body:   L('body_soldier'),
      head:   L('human_male'),
      eyes:   L('eyes_red'),
      hair:   L('spiked', '#1a1a1a'),
      pants:  L('plate_legs', 'iron'),
      shirt:  L('plate_armour', 'iron'),
      boots:  L('plate_boots', 'iron'),
      hands:  NO_HANDS,
      belt:   NO_BELT,
      cape:   NO_LAYER,
      helmet: NO_LAYER,
      weapon: L('longsword'),
      shield: L('shield_round'),
    } satisfies AvatarConfig,
  },

  // ── Word Forge ─────────────────────────────────────────────────────────────
  'word-forge': {
    id: 'word-forge',
    name: 'Rune Smith',
    glowColor: '#1a5c9e',
    avatar: {
      body:   L('body_female'),
      head:   L('human_female'),
      eyes:   L('eyes_orange'),
      hair:   L('long_messy', '#cc5500'),
      pants:  L('pants', 'brown'),
      shirt:  L('leather_armour', 'leather'),
      boots:  L('boots', 'brown'),
      hands:  NO_HANDS,
      belt:   NO_BELT,
      cape:   NO_LAYER,
      helmet: NO_LAYER,
      weapon: L('sword'),
      shield: NO_SHIELD,
    } satisfies AvatarConfig,
  },

  // ── Science Labyrinth ──────────────────────────────────────────────────────
  'science-labyrinth': {
    id: 'science-labyrinth',
    name: 'Alchemical Horror',
    glowColor: '#1e8a4a',
    avatar: {
      body:   L('body_male'),
      head:   L('human_male'),
      eyes:   L('eyes_green'),
      hair:   L('curtains_long', '#1a3a1a'),
      pants:  L('pants', 'forest'),
      shirt:  L('chainmail', 'gray'),
      boots:  L('boots', 'charcoal'),
      hands:  NO_HANDS,
      belt:   NO_BELT,
      cape:   NO_LAYER,
      helmet: L('hood', 'forest'),
      weapon: L('spear'),
      shield: NO_SHIELD,
    } satisfies AvatarConfig,
  },

  // ── Reading Tome ───────────────────────────────────────────────────────────
  'reading-tome': {
    id: 'reading-tome',
    name: 'Eldritch Scribe',
    glowColor: '#c9a84c',
    avatar: {
      body:   L('body_female'),
      head:   L('human_female'),
      eyes:   L('eyes_purple'),
      hair:   L('long_center_part', '#2a1a4a'),
      pants:  L('pants', 'purple'),
      shirt:  L('longsleeve', 'purple'),
      boots:  L('slippers', 'purple'),
      hands:  NO_HANDS,
      belt:   NO_BELT,
      cape:   L('solid', 'purple'),
      helmet: L('hood', 'purple'),
      weapon: NO_LAYER,
      shield: NO_SHIELD,
    } satisfies AvatarConfig,
  },

  // ── History Scroll ─────────────────────────────────────────────────────────
  'history-scroll': {
    id: 'history-scroll',
    name: 'Time Shade',
    glowColor: '#9e6a1a',
    avatar: {
      body:   L('body_male'),
      head:   L('human_male'),
      eyes:   L('eyes_gray'),
      hair:   L('long_messy2', '#555555'),
      pants:  L('pants', 'slate'),
      shirt:  L('shortsleeve', 'charcoal'),
      boots:  L('sandals', 'walnut'),
      hands:  NO_HANDS,
      belt:   NO_BELT,
      cape:   L('tattered', 'charcoal'),
      helmet: L('bandana', 'charcoal'),
      weapon: L('sword'),
      shield: NO_SHIELD,
    } satisfies AvatarConfig,
  },

  // ── Vocab Duel ─────────────────────────────────────────────────────────────
  'vocab-duel': {
    id: 'vocab-duel',
    name: 'Hexweaver',
    glowColor: '#7a1a9e',
    avatar: {
      body:   L('body_female'),
      head:   L('human_female'),
      eyes:   L('eyes_yellow'),
      hair:   L('braid', '#7a1a9e'),
      pants:  L('pants', 'navy'),
      shirt:  L('longsleeve', 'lavender'),
      boots:  L('shoes', 'navy'),
      hands:  NO_HANDS,
      belt:   NO_BELT,
      cape:   L('solid', 'purple'),
      helmet: L('crown'),
      weapon: NO_LAYER,
      shield: NO_SHIELD,
    } satisfies AvatarConfig,
  },

  // ── Logic Gate ─────────────────────────────────────────────────────────────
  'logic-gate': {
    id: 'logic-gate',
    name: 'Construct Sentinel',
    glowColor: '#1e8ab8',
    avatar: {
      body:   L('body_soldier'),
      head:   L('human_male'),
      eyes:   L('eyes_blue'),
      hair:   L('buzzcut', '#556677'),
      pants:  L('plate_legs', 'steel'),
      shirt:  L('plate_armour', 'steel'),
      boots:  L('plate_boots', 'steel'),
      hands:  NO_HANDS,
      belt:   NO_BELT,
      cape:   NO_LAYER,
      helmet: L('leather_cap', 'slate'),
      weapon: L('sword'),
      shield: L('shield_round'),
    } satisfies AvatarConfig,
  },
} as const
