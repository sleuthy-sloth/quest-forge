/**
 * Academy shared constants — extracted from src/app/play/academy/page.tsx
 * to enable reuse by encounter cards and future components.
 *
 * This is the single source of truth for the game catalog and age-tier logic.
 */

import type { AnimationPreset } from '@/lib/constants/lpc-animations'

// ── Game catalog ──────────────────────────────────────────────────────────────

export const GAMES = [
  {
    slug:    'math-arena',
    name:    'Math Arena',
    icon:    'sword' as const,
    tagline: 'Test your numbers in battle',
    accent:  '#c43a00',
  },
  {
    slug:    'word-forge',
    name:    'Word Forge',
    icon:    'hammer' as const,
    tagline: 'Forge words from molten letters',
    accent:  '#1a5c9e',
  },
  {
    slug:    'science-labyrinth',
    name:    'Science Labyrinth',
    icon:    'flask' as const,
    tagline: 'Navigate the maze of knowledge',
    accent:  '#1e8a4a',
  },
  {
    slug:    'reading-tome',
    name:    'Reading Tome',
    icon:    'scroll' as const,
    tagline: 'Journey through enchanted stories',
    accent:  '#c9a84c',
  },
  {
    slug:    'history-scroll',
    name:    'History Scroll',
    icon:    'scroll' as const,
    tagline: 'Unravel the tales of ages past',
    accent:  '#9e6a1a',
  },
  {
    slug:    'vocab-duel',
    name:    'Vocab Duel',
    icon:    'book' as const,
    tagline: 'Master the language of power',
    accent:  '#7a1a9e',
  },
  {
    slug:    'logic-gate',
    name:    'Logic Gate',
    icon:    'circuit' as const,
    tagline: 'Unlock the puzzles of the mind',
    accent:  '#1e8ab8',
  },
] as const

/** Inferred element type of the GAMES array — used in GameCard and EncounterCard props. */
export type GameEntry = (typeof GAMES)[number]

// ── Tier helpers ──────────────────────────────────────────────────────────────

export type AgeTier = 'junior' | 'senior'

export function deriveTier(age: number | null): AgeTier {
  return age != null && age >= 11 ? 'senior' : 'junior'
}

export const XP_RANGE: Record<AgeTier, string> = {
  junior: '20–30 XP',
  senior: '30–50 XP',
}

export const TIER_LABEL: Record<AgeTier, string> = {
  junior: '✦ JUNIOR',
  senior: '✦ SENIOR',
}

// ── Animation preset mapping ──────────────────────────────────────────────────

/**
 * Maps a player's narrative class (avatar_class) to the LPC animation preset
 * that determines the attack animation (slash / thrust / cast).
 *
 * Used by BattleArena to decide which attack animation to play when the
 * player answers a question correctly.
 */
export const CLASS_TO_PRESET: Record<string, AnimationPreset> = {
  blazewarden: 'warrior',
  lorescribe:  'mage',
  shadowstep:  'rogue',
  hearthkeeper:'scholar',
  stormcaller: 'mage',
  ironvow:     'warrior',
}

/**
 * Derive the LPC animation preset from a player's avatar_class.
 * Falls back to `'warrior'` for unknown or null classes.
 */
export function derivePlayerPreset(avatarClass: string | null | undefined): AnimationPreset {
  return CLASS_TO_PRESET[avatarClass ?? ''] ?? 'warrior'
}

/**
 * Maps an academy subject name to the corresponding enemy preset slug.
 * Used by QuizInterface to select the correct EncounterConfig.
 */
export const SUBJECT_TO_SLUG: Record<string, string> = {
  reading:    'reading-tome',
  vocabulary: 'vocab-duel',
  history:    'history-scroll',
  logic:      'logic-gate',
  math:       'math-arena',
  word:       'word-forge',
  science:    'science-labyrinth',
}

// ── Enemy animation preset mapping ────────────────────────────────────────────

/**
 * Maps each game slug to the animation preset for its enemy.
 * Determines the attack action (slash / thrust / cast) used by the
 * enemy's AnimatedAvatar during battle.
 *
 * Previously defined inline in EncounterCard; extracted here as the
 * single source of truth so game components can reference it too.
 *
 * | Slug                | Preset    | Attack  | Enemy theme                 |
 * |---------------------|-----------|---------|-----------------------------|
 * | math-arena          | warrior   | slash   | Armored, longsword          |
 * | word-forge          | warrior   | slash   | Leather, sword              |
 * | science-labyrinth   | scholar   | slash   | Hood, spear                 |
 * | reading-tome        | mage      | cast    | Robes, spellcaster          |
 * | history-scroll      | warrior   | slash   | Sword, tattered cape        |
 * | vocab-duel          | mage      | cast    | Robes, crown, spellcaster   |
 * | logic-gate          | warrior   | slash   | Plate, sword + shield       |
 */
export const SLUG_PRESET: Record<string, AnimationPreset> = {
  'math-arena':        'warrior',
  'word-forge':        'warrior',
  'science-labyrinth': 'scholar',
  'reading-tome':      'mage',
  'history-scroll':    'warrior',
  'vocab-duel':        'mage',
  'logic-gate':        'warrior',
}
