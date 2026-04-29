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
  {
    slug:    'general-knowledge',
    name:    'General Knowledge',
    icon:    'globe' as const,
    tagline: 'The world is wider than you know',
    accent:  '#9e1a7a',
  },
  {
    slug:    'life-skills',
    name:    'Life Skills',
    icon:    'heart' as const,
    tagline: 'Master the art of living well',
    accent:  '#9e8a1a',
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
  general_knowledge: 'general-knowledge',
  life_skills: 'life-skills',
}

// ── Teacher roster ────────────────────────────────────────────────────────────

export type TeacherStatus = 'defeated' | 'current' | 'available' | 'locked'

export interface TeacherDef {
  slug:     string
  subject:  string
  name:     string
  title:    string
  tagline:  string
  glow:     string
  level:    number
  portrait?: string
}

export const TEACHERS: TeacherDef[] = [
  {
    slug:    'math-arena',
    subject: 'Math Arena',
    name:    'Master Numerus',
    title:   'Headmaster of Reckoning',
    tagline: 'The shapes will not deceive you twice.',
    glow:    '#c43a00',
    level:   7,
    portrait: '/images/portraits/math-arena.png',
  },
  {
    slug:    'word-forge',
    subject: 'Word Forge',
    name:    'Loremaster Vex',
    title:   'Smith of Syllables',
    tagline: 'Hammer the letters until they speak.',
    glow:    '#1a5c9e',
    level:   6,
    portrait: '/images/portraits/word-forge.png',
  },
  {
    slug:    'science-labyrinth',
    subject: 'Science Labyrinth',
    name:    'Doctor Mortia',
    title:   'Keeper of the Reagents',
    tagline: 'Curiosity without rigor is a vine that strangles.',
    glow:    '#1e8a4a',
    level:   8,
    portrait: '/images/portraits/science-labyrinth.png',
  },
  {
    slug:    'reading-tome',
    subject: 'Reading Tome',
    name:    'Madam Whisper',
    title:   'Steward of the Chronicle',
    tagline: 'Words are doors. Open the next.',
    glow:    '#c9a84c',
    level:   9,
    portrait: '/images/portraits/reading-tome.png',
  },
  {
    slug:    'history-scroll',
    subject: 'History Scroll',
    name:    'Chronologue Helix',
    title:   'Mistress of the Ages',
    tagline: 'The past is alive — and it remembers you.',
    glow:    '#9e6a1a',
    level:   9,
    portrait: '/images/portraits/history-scroll.png',
  },
  {
    slug:    'vocab-duel',
    subject: 'Vocab Duel',
    name:    'Hexweaver Vyrm',
    title:   'Crowned in Syllables',
    tagline: 'Speak well — or your last word will be your last.',
    glow:    '#7a1a9e',
    level:   10,
    portrait: '/images/portraits/vocab-duel.png',
  },
  {
    slug:    'logic-gate',
    subject: 'Logic Gate',
    name:    'Sentinel Quorum',
    title:   'The Gatekeeper of Reason',
    tagline: 'Each step proves the one before it.',
    glow:    '#1e8ab8',
    level:   11,
    portrait: '/images/portraits/logic-gate.png',
  },
  {
    slug:    'general-knowledge',
    subject: 'General Knowledge',
    name:    'Master of All',
    title:   'The Universal Scholar',
    tagline: 'The world is a book, and those who do not travel read only a page.',
    glow:    '#9e1a7a',
    level:   12,
    portrait: '/images/portraits/general-knowledge.png',
  },
  {
    slug:    'life-skills',
    subject: 'Life Skills',
    name:    'Nurturer Lea',
    title:   'The Guardian of Growth',
    tagline: 'Kindness is the strongest armor.',
    glow:    '#9e8a1a',
    level:   5,
    portrait: '/images/portraits/life-skills.png',
  },
]

export const TEACHER_BY_SLUG: Record<string, TeacherDef> = Object.fromEntries(
  TEACHERS.map(t => [t.slug, t])
)

export const TEACHER_STATUS_STYLE: Record<TeacherStatus, { color: string; label: string; dim: number }> = {
  defeated:  { color: '#5aab6e',  label: '✓ DEFEATED',    dim: 0.55 },
  current:   { color: '#ff8c3a', label: '◆ NOW DUELING', dim: 1    },
  available: { color: '#f9c846', label: '◇ ENTER DUEL',  dim: 0.95 },
  locked:    { color: '#6b5d44', label: '✕ SEALED',      dim: 0.4  },
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
  'general-knowledge': 'scholar',
  'life-skills':       'scholar',
}
