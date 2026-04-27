/**
 * Academy shared constants — extracted from src/app/play/academy/page.tsx
 * to enable reuse by encounter cards and future components.
 *
 * This is the single source of truth for the game catalog and age-tier logic.
 */

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
