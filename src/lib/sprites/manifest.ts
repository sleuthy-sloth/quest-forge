/**
 * Sprite manifest — canonical source for all sprite asset paths.
 *
 * Every URL is resolved through NEXT_PUBLIC_SPRITE_BASE_URL so that:
 *   - In production, sprites are served from Supabase Storage.
 *   - In local dev without the env var set, paths fall back to /sprites
 *     (Next.js serves public/ at the root, so local PNGs still work).
 *
 * Never hardcode /sprites/<path> in components — always use spriteUrl() or
 * the named exports below.
 */

const BASE =
  (process.env.NEXT_PUBLIC_SPRITE_BASE_URL ?? '/sprites').replace(/\/$/, '')

/** Returns the full URL for a sprite asset path. */
export function spriteUrl(assetPath: string): string {
  return `${BASE}/${assetPath.replace(/^\//, '')}`
}

// ---------------------------------------------------------------------------
// Body sprites
// ---------------------------------------------------------------------------

export const BODIES = {
  male_walk:      spriteUrl('bodies/male_walkcycle.png'),
  male_slash:     spriteUrl('bodies/male_slash.png'),
  male_spellcast: spriteUrl('bodies/male_spellcast.png'),
  male_hurt:      spriteUrl('bodies/male_hurt.png'),
  male_pants:     spriteUrl('bodies/male_pants.png'),

  female_walk:      spriteUrl('bodies/female_walkcycle.png'),
  female_slash:     spriteUrl('bodies/female_slash.png'),
  female_spellcast: spriteUrl('bodies/female_spellcast.png'),
  female_hurt:      spriteUrl('bodies/female_hurt.png'),
} as const

// ---------------------------------------------------------------------------
// Hair sprites
// ---------------------------------------------------------------------------

export const HAIR_STYLES = [
  'afro',
  'balding',
  'bangs_bun',
  'bob',
  'bob_side_part',
  'braid',
  'braid2',
  'buzzcut',
  'cornrows',
  'cowlick',
  'cowlick_tall',
  'curly_long',
  'curly_short',
  'curtains',
  'curtains_long',
  'dreadlocks_long',
  'dreadlocks_short',
  'flat_top_fade',
  'flat_top_straight',
  'half_up',
  'halfmessy',
  'high_and_tight',
  'high_ponytail',
  'idol',
  'lob',
  'long_band',
  'long_center_part',
  'long_messy',
  'long_messy2',
  'long_tied',
  'messy3',
  'mop',
  'natural',
  'part2',
  'pigtails',
  'pigtails_bangs',
  'sara',
  'spiked',
  'spiked2',
  'spiked_beehive',
  'spiked_liberty',
  'spiked_liberty2',
  'spiked_porcupine',
  'twists_fade',
  'twists_straight',
] as const

export type HairStyle = (typeof HAIR_STYLES)[number]
export type HairVariant = 'male' | 'female'

/** Returns the URL for a hair sprite (style + male/female variant). */
export function hairUrl(style: HairStyle, variant: HairVariant): string {
  return spriteUrl(`hair/hair/${style}/${variant}.png`)
}

// ---------------------------------------------------------------------------
// Clothing sprites
// ---------------------------------------------------------------------------

export const CLOTHING = {
  torso: {
    plate_male:      spriteUrl('clothing/torso/armour/plate/male'),
    plate_female:    spriteUrl('clothing/torso/armour/plate/female'),
    leather_male:    spriteUrl('clothing/torso/armour/leather/male'),
    leather_female:  spriteUrl('clothing/torso/armour/leather/female'),
    legion_male:     spriteUrl('clothing/torso/armour/legion/male'),
    legion_female:   spriteUrl('clothing/torso/armour/legion/female'),
    chainmail_male:  spriteUrl('clothing/torso/chainmail/male'),
    chainmail_female: spriteUrl('clothing/torso/chainmail/female'),
  },
  legs: {
    plate_male:   spriteUrl('clothing/legs/armour/plate/male'),
    plate_female: spriteUrl('clothing/legs/armour/plate/female'),
  },
  feet: {
    boots_male:    spriteUrl('clothing/feet/boots/male'),
    boots_female:  spriteUrl('clothing/feet/boots/female'),
    shoes_male:    spriteUrl('clothing/feet/shoes/male'),
    shoes_female:  spriteUrl('clothing/feet/shoes/female'),
    sandals_male:  spriteUrl('clothing/feet/sandals/male'),
    sandals_female: spriteUrl('clothing/feet/sandals/female'),
  },
} as const

// ---------------------------------------------------------------------------
// Weapon sprites
// ---------------------------------------------------------------------------

export const WEAPONS = {
  slash_male:     spriteUrl('weapons/male/slash'),
  thrust_male:    spriteUrl('weapons/male/thrust'),
  bigslash_male:  spriteUrl('weapons/male/bigslash'),
  shield_male:    spriteUrl('weapons/male/shield'),
  slash_female:   spriteUrl('weapons/female/slash'),
  thrust_female:  spriteUrl('weapons/female/thrust'),
  bigslash_female: spriteUrl('weapons/female/bigslash'),
  shield_female:  spriteUrl('weapons/female/shield'),
} as const

// ---------------------------------------------------------------------------
// Boss sprites
// ---------------------------------------------------------------------------

export const BOSSES = {
  dragon:      spriteUrl('bosses/dragon'),
  small_dragon: spriteUrl('bosses/small_dragon'),
  medusa:      spriteUrl('bosses/medusa'),
  lizard:      spriteUrl('bosses/lizard'),
  jinn:        spriteUrl('bosses/jinn_animation'),
  demon:       spriteUrl('bosses/demon'),
} as const

export type BossKey = keyof typeof BOSSES
