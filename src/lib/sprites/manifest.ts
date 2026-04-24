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
 *
 * SPRITE_MANIFEST is the typed catalog used by the character creator UI.
 * It groups entries by AvatarLayerCategory. Color-variant entries use a
 * {color} placeholder in `path`; the compositor resolves the final URL.
 */

import type { SpriteEntry, SpriteManifest } from '@/types/avatar'

const BASE =
  (process.env.NEXT_PUBLIC_SPRITE_BASE_URL ?? '/sprites').replace(/\/$/, '')

/** Returns the full URL for a sprite asset path. */
export function spriteUrl(assetPath: string): string {
  return `${BASE}/${assetPath.replace(/^\//, '')}`
}

// ---------------------------------------------------------------------------
// Shared color variant lists
// ---------------------------------------------------------------------------

/** Standard palette used by most clothing items. */
const STANDARD_COLORS = [
  'black', 'bluegray', 'blue', 'brown', 'charcoal', 'forest', 'gray',
  'green', 'lavender', 'leather', 'maroon', 'navy', 'orange', 'pink',
  'purple', 'red', 'rose', 'sky', 'slate', 'tan', 'teal', 'walnut',
  'white', 'yellow',
] as const

/** Metal tones used by plate and heavier armour. */
const METAL_COLORS = [
  'brass', 'bronze', 'ceramic', 'copper', 'gold', 'iron', 'silver', 'steel',
] as const

// ---------------------------------------------------------------------------
// Typed SPRITE_MANIFEST
// ---------------------------------------------------------------------------

/**
 * Typed manifest of all character creator sprite options.
 * Organized by AvatarLayerCategory. Import this in components that need
 * to enumerate options for a given layer.
 */
export const SPRITE_MANIFEST = {

  // -------------------------------------------------------------------------
  // body
  // -------------------------------------------------------------------------
  body: {
    body_female: {
      id: 'body_female',
      displayName: 'Body (Female)',
      category: 'body',
      path: 'bodies/female_walkcycle.png',
      bodyType: 'female',
    },
    body_male: {
      id: 'body_male',
      displayName: 'Body (Male)',
      category: 'body',
      path: 'bodies/male_walkcycle.png',
      bodyType: 'male',
    },
    body_princess: {
      id: 'body_princess',
      displayName: 'Body (Princess)',
      category: 'body',
      path: 'bodies/princess.png',
      bodyType: 'female',
    },
    body_soldier: {
      id: 'body_soldier',
      displayName: 'Body (Soldier)',
      category: 'body',
      path: 'bodies/soldier.png',
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // eyes
  // -------------------------------------------------------------------------
  eyes: {
    eyes_blue: {
      id: 'eyes_blue',
      displayName: 'Blue Eyes',
      category: 'eyes',
      path: 'eyes/human/blue.png',
      bodyType: 'universal',
    },
    eyes_brown: {
      id: 'eyes_brown',
      displayName: 'Brown Eyes',
      category: 'eyes',
      path: 'eyes/human/brown.png',
      bodyType: 'universal',
    },
    eyes_gray: {
      id: 'eyes_gray',
      displayName: 'Gray Eyes',
      category: 'eyes',
      path: 'eyes/human/gray.png',
      bodyType: 'universal',
    },
    eyes_green: {
      id: 'eyes_green',
      displayName: 'Green Eyes',
      category: 'eyes',
      path: 'eyes/human/green.png',
      bodyType: 'universal',
    },
    eyes_orange: {
      id: 'eyes_orange',
      displayName: 'Orange Eyes',
      category: 'eyes',
      path: 'eyes/human/orange.png',
      bodyType: 'universal',
    },
    eyes_purple: {
      id: 'eyes_purple',
      displayName: 'Purple Eyes',
      category: 'eyes',
      path: 'eyes/human/purple.png',
      bodyType: 'universal',
    },
    eyes_red: {
      id: 'eyes_red',
      displayName: 'Red Eyes',
      category: 'eyes',
      path: 'eyes/human/red.png',
      bodyType: 'universal',
    },
    eyes_yellow: {
      id: 'eyes_yellow',
      displayName: 'Yellow Eyes',
      category: 'eyes',
      path: 'eyes/human/yellow.png',
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // hair
  // -------------------------------------------------------------------------
  hair: {
    afro: {
      id: 'afro',
      displayName: 'Afro',
      category: 'hair',
      path: 'hair/hair/afro/female.png',
      pathMale: 'hair/hair/afro/male.png',
      bodyType: 'universal',
    },
    balding: {
      id: 'balding',
      displayName: 'Balding',
      category: 'hair',
      path: 'hair/hair/balding/female.png',
      pathMale: 'hair/hair/balding/male.png',
      bodyType: 'universal',
    },
    bangs_bun: {
      id: 'bangs_bun',
      displayName: 'Bangs Bun',
      category: 'hair',
      path: 'hair/hair/bangs_bun/female.png',
      pathMale: 'hair/hair/bangs_bun/male.png',
      bodyType: 'universal',
    },
    bob: {
      id: 'bob',
      displayName: 'Bob',
      category: 'hair',
      path: 'hair/hair/bob/female.png',
      pathMale: 'hair/hair/bob/male.png',
      bodyType: 'universal',
    },
    bob_side_part: {
      id: 'bob_side_part',
      displayName: 'Bob (Side Part)',
      category: 'hair',
      path: 'hair/hair/bob_side_part/female.png',
      pathMale: 'hair/hair/bob_side_part/male.png',
      bodyType: 'universal',
    },
    braid: {
      id: 'braid',
      displayName: 'Braid',
      category: 'hair',
      path: 'hair/hair/braid/female.png',
      pathMale: 'hair/hair/braid/male.png',
      bodyType: 'universal',
    },
    braid2: {
      id: 'braid2',
      displayName: 'Braid (Alt)',
      category: 'hair',
      path: 'hair/hair/braid2/female.png',
      pathMale: 'hair/hair/braid2/male.png',
      bodyType: 'universal',
    },
    buzzcut: {
      id: 'buzzcut',
      displayName: 'Buzzcut',
      category: 'hair',
      path: 'hair/hair/buzzcut/female.png',
      pathMale: 'hair/hair/buzzcut/male.png',
      bodyType: 'universal',
    },
    cornrows: {
      id: 'cornrows',
      displayName: 'Cornrows',
      category: 'hair',
      path: 'hair/hair/cornrows/female.png',
      pathMale: 'hair/hair/cornrows/male.png',
      bodyType: 'universal',
    },
    cowlick: {
      id: 'cowlick',
      displayName: 'Cowlick',
      category: 'hair',
      path: 'hair/hair/cowlick/female.png',
      pathMale: 'hair/hair/cowlick/male.png',
      bodyType: 'universal',
    },
    cowlick_tall: {
      id: 'cowlick_tall',
      displayName: 'Cowlick (Tall)',
      category: 'hair',
      path: 'hair/hair/cowlick_tall/female.png',
      pathMale: 'hair/hair/cowlick_tall/male.png',
      bodyType: 'universal',
    },
    curly_long: {
      id: 'curly_long',
      displayName: 'Curly (Long)',
      category: 'hair',
      path: 'hair/hair/curly_long/female.png',
      pathMale: 'hair/hair/curly_long/male.png',
      bodyType: 'universal',
    },
    curly_short: {
      id: 'curly_short',
      displayName: 'Curly (Short)',
      category: 'hair',
      path: 'hair/hair/curly_short/female.png',
      pathMale: 'hair/hair/curly_short/male.png',
      bodyType: 'universal',
    },
    curtains: {
      id: 'curtains',
      displayName: 'Curtains',
      category: 'hair',
      path: 'hair/hair/curtains/female.png',
      pathMale: 'hair/hair/curtains/male.png',
      bodyType: 'universal',
    },
    curtains_long: {
      id: 'curtains_long',
      displayName: 'Curtains (Long)',
      category: 'hair',
      path: 'hair/hair/curtains_long/female.png',
      pathMale: 'hair/hair/curtains_long/male.png',
      bodyType: 'universal',
    },
    dreadlocks_long: {
      id: 'dreadlocks_long',
      displayName: 'Dreadlocks (Long)',
      category: 'hair',
      path: 'hair/hair/dreadlocks_long/female.png',
      pathMale: 'hair/hair/dreadlocks_long/male.png',
      bodyType: 'universal',
    },
    dreadlocks_short: {
      id: 'dreadlocks_short',
      displayName: 'Dreadlocks (Short)',
      category: 'hair',
      path: 'hair/hair/dreadlocks_short/female.png',
      pathMale: 'hair/hair/dreadlocks_short/male.png',
      bodyType: 'universal',
    },
    flat_top_fade: {
      id: 'flat_top_fade',
      displayName: 'Flat Top Fade',
      category: 'hair',
      path: 'hair/hair/flat_top_fade/female.png',
      pathMale: 'hair/hair/flat_top_fade/male.png',
      bodyType: 'universal',
    },
    flat_top_straight: {
      id: 'flat_top_straight',
      displayName: 'Flat Top Straight',
      category: 'hair',
      path: 'hair/hair/flat_top_straight/female.png',
      pathMale: 'hair/hair/flat_top_straight/male.png',
      bodyType: 'universal',
    },
    half_up: {
      id: 'half_up',
      displayName: 'Half Up',
      category: 'hair',
      path: 'hair/hair/half_up/female.png',
      pathMale: 'hair/hair/half_up/male.png',
      bodyType: 'universal',
    },
    halfmessy: {
      id: 'halfmessy',
      displayName: 'Half Messy',
      category: 'hair',
      path: 'hair/hair/halfmessy/female.png',
      pathMale: 'hair/hair/halfmessy/male.png',
      bodyType: 'universal',
    },
    high_and_tight: {
      id: 'high_and_tight',
      displayName: 'High & Tight',
      category: 'hair',
      path: 'hair/hair/high_and_tight/female.png',
      pathMale: 'hair/hair/high_and_tight/male.png',
      bodyType: 'universal',
    },
    high_ponytail: {
      id: 'high_ponytail',
      displayName: 'High Ponytail',
      category: 'hair',
      path: 'hair/hair/high_ponytail/female.png',
      pathMale: 'hair/hair/high_ponytail/male.png',
      bodyType: 'universal',
    },
    idol: {
      id: 'idol',
      displayName: 'Idol',
      category: 'hair',
      path: 'hair/hair/idol/female.png',
      pathMale: 'hair/hair/idol/male.png',
      bodyType: 'universal',
    },
    lob: {
      id: 'lob',
      displayName: 'Lob',
      category: 'hair',
      path: 'hair/hair/lob/female.png',
      pathMale: 'hair/hair/lob/male.png',
      bodyType: 'universal',
    },
    long_band: {
      id: 'long_band',
      displayName: 'Long with Band',
      category: 'hair',
      path: 'hair/hair/long_band/female.png',
      pathMale: 'hair/hair/long_band/male.png',
      bodyType: 'universal',
    },
    long_center_part: {
      id: 'long_center_part',
      displayName: 'Long Center Part',
      category: 'hair',
      path: 'hair/hair/long_center_part/female.png',
      pathMale: 'hair/hair/long_center_part/male.png',
      bodyType: 'universal',
    },
    long_messy: {
      id: 'long_messy',
      displayName: 'Long Messy',
      category: 'hair',
      path: 'hair/hair/long_messy/female.png',
      pathMale: 'hair/hair/long_messy/male.png',
      bodyType: 'universal',
    },
    long_messy2: {
      id: 'long_messy2',
      displayName: 'Long Messy (Alt)',
      category: 'hair',
      path: 'hair/hair/long_messy2/female.png',
      pathMale: 'hair/hair/long_messy2/male.png',
      bodyType: 'universal',
    },
    long_tied: {
      id: 'long_tied',
      displayName: 'Long Tied',
      category: 'hair',
      path: 'hair/hair/long_tied/female.png',
      pathMale: 'hair/hair/long_tied/male.png',
      bodyType: 'universal',
    },
    messy3: {
      id: 'messy3',
      displayName: 'Messy',
      category: 'hair',
      path: 'hair/hair/messy3/female.png',
      pathMale: 'hair/hair/messy3/male.png',
      bodyType: 'universal',
    },
    mop: {
      id: 'mop',
      displayName: 'Mop',
      category: 'hair',
      path: 'hair/hair/mop/female.png',
      pathMale: 'hair/hair/mop/male.png',
      bodyType: 'universal',
    },
    natural: {
      id: 'natural',
      displayName: 'Natural',
      category: 'hair',
      path: 'hair/hair/natural/female.png',
      pathMale: 'hair/hair/natural/male.png',
      bodyType: 'universal',
    },
    part2: {
      id: 'part2',
      displayName: 'Side Part',
      category: 'hair',
      path: 'hair/hair/part2/female.png',
      pathMale: 'hair/hair/part2/male.png',
      bodyType: 'universal',
    },
    pigtails: {
      id: 'pigtails',
      displayName: 'Pigtails',
      category: 'hair',
      path: 'hair/hair/pigtails/female.png',
      pathMale: 'hair/hair/pigtails/male.png',
      bodyType: 'universal',
    },
    pigtails_bangs: {
      id: 'pigtails_bangs',
      displayName: 'Pigtails with Bangs',
      category: 'hair',
      path: 'hair/hair/pigtails_bangs/female.png',
      pathMale: 'hair/hair/pigtails_bangs/male.png',
      bodyType: 'universal',
    },
    sara: {
      id: 'sara',
      displayName: 'Sara',
      category: 'hair',
      path: 'hair/hair/sara/female.png',
      pathMale: 'hair/hair/sara/male.png',
      bodyType: 'universal',
    },
    spiked: {
      id: 'spiked',
      displayName: 'Spiked',
      category: 'hair',
      path: 'hair/hair/spiked/female.png',
      pathMale: 'hair/hair/spiked/male.png',
      bodyType: 'universal',
    },
    spiked2: {
      id: 'spiked2',
      displayName: 'Spiked (Alt)',
      category: 'hair',
      path: 'hair/hair/spiked2/female.png',
      pathMale: 'hair/hair/spiked2/male.png',
      bodyType: 'universal',
    },
    spiked_beehive: {
      id: 'spiked_beehive',
      displayName: 'Beehive Spiked',
      category: 'hair',
      path: 'hair/hair/spiked_beehive/female.png',
      pathMale: 'hair/hair/spiked_beehive/male.png',
      bodyType: 'universal',
    },
    spiked_liberty: {
      id: 'spiked_liberty',
      displayName: 'Liberty Spikes',
      category: 'hair',
      path: 'hair/hair/spiked_liberty/female.png',
      pathMale: 'hair/hair/spiked_liberty/male.png',
      bodyType: 'universal',
    },
    spiked_liberty2: {
      id: 'spiked_liberty2',
      displayName: 'Liberty Spikes (Alt)',
      category: 'hair',
      path: 'hair/hair/spiked_liberty2/female.png',
      pathMale: 'hair/hair/spiked_liberty2/male.png',
      bodyType: 'universal',
    },
    spiked_porcupine: {
      id: 'spiked_porcupine',
      displayName: 'Porcupine Spikes',
      category: 'hair',
      path: 'hair/hair/spiked_porcupine/female.png',
      pathMale: 'hair/hair/spiked_porcupine/male.png',
      bodyType: 'universal',
    },
    twists_fade: {
      id: 'twists_fade',
      displayName: 'Twists Fade',
      category: 'hair',
      path: 'hair/hair/twists_fade/female.png',
      pathMale: 'hair/hair/twists_fade/male.png',
      bodyType: 'universal',
    },
    twists_straight: {
      id: 'twists_straight',
      displayName: 'Twists Straight',
      category: 'hair',
      path: 'hair/hair/twists_straight/female.png',
      pathMale: 'hair/hair/twists_straight/male.png',
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // pants
  // -------------------------------------------------------------------------
  pants: {
    pants: {
      id: 'pants',
      displayName: 'Pants',
      category: 'pants',
      path: 'clothing/legs/pants/female/{color}.png',
      pathMale: 'clothing/legs/pants/teen/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    leggings: {
      id: 'leggings',
      displayName: 'Leggings',
      category: 'pants',
      path: 'clothing/legs/leggings/female/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'female',
    },
    skirt_plain: {
      id: 'skirt_plain',
      displayName: 'Skirt (Plain)',
      category: 'pants',
      path: 'clothing/legs/skirts/plain/female/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'female',
    },
    skirt_slit: {
      id: 'skirt_slit',
      displayName: 'Skirt (Slit)',
      category: 'pants',
      path: 'clothing/legs/skirts/slit/female/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'female',
    },
    skirt_straight: {
      id: 'skirt_straight',
      displayName: 'Skirt (Straight)',
      category: 'pants',
      path: 'clothing/legs/skirts/straight/female/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'female',
    },
    skirt_overskirt: {
      id: 'skirt_overskirt',
      displayName: 'Overskirt',
      category: 'pants',
      path: 'clothing/legs/skirts/overskirt/female/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'female',
    },
    plate_legs: {
      id: 'plate_legs',
      displayName: 'Plate Legguards',
      category: 'pants',
      path: 'clothing/legs/armour/plate/female/{color}.png',
      pathMale: 'clothing/legs/armour/plate/male/{color}.png',
      colorVariants: METAL_COLORS,
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // shirt
  // -------------------------------------------------------------------------
  shirt: {
    blouse: {
      id: 'blouse',
      displayName: 'Blouse',
      category: 'shirt',
      path: 'clothing/torso/clothes/blouse/female/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'female',
    },
    blouse_longsleeve: {
      id: 'blouse_longsleeve',
      displayName: 'Blouse (Long Sleeve)',
      category: 'shirt',
      path: 'clothing/torso/clothes/blouse_longsleeve/female/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'female',
    },
    longsleeve: {
      id: 'longsleeve',
      displayName: 'Long Sleeve Shirt',
      category: 'shirt',
      path: 'clothing/torso/clothes/longsleeve/female/{color}.png',
      pathMale: 'clothing/torso/clothes/longsleeve/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    shortsleeve: {
      id: 'shortsleeve',
      displayName: 'Short Sleeve Shirt',
      category: 'shirt',
      path: 'clothing/torso/clothes/shortsleeve/female/{color}.png',
      pathMale: 'clothing/torso/clothes/shortsleeve/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    tunic: {
      id: 'tunic',
      displayName: 'Tunic',
      category: 'shirt',
      path: 'clothing/torso/clothes/tunic/female/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'female',
    },
    tabard: {
      id: 'tabard',
      displayName: 'Tabard',
      category: 'shirt',
      path: 'clothing/torso/jacket/tabard/female/{color}.png',
      pathMale: 'clothing/torso/jacket/tabard/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    leather_armour: {
      id: 'leather_armour',
      displayName: 'Leather Armour',
      category: 'shirt',
      path: 'clothing/torso/armour/leather/female/{color}.png',
      pathMale: 'clothing/torso/armour/leather/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    plate_armour: {
      id: 'plate_armour',
      displayName: 'Plate Armour',
      category: 'shirt',
      path: 'clothing/torso/armour/plate/female/{color}.png',
      pathMale: 'clothing/torso/armour/plate/male/{color}.png',
      colorVariants: METAL_COLORS,
      bodyType: 'universal',
    },
    legion_armour: {
      id: 'legion_armour',
      displayName: 'Legion Armour',
      category: 'shirt',
      path: 'clothing/torso/armour/legion/female/{color}.png',
      pathMale: 'clothing/torso/armour/legion/male/{color}.png',
      colorVariants: METAL_COLORS,
      bodyType: 'universal',
    },
    chainmail: {
      id: 'chainmail',
      displayName: 'Chainmail',
      category: 'shirt',
      path: 'clothing/torso/chainmail/female/{color}.png',
      pathMale: 'clothing/torso/chainmail/male/{color}.png',
      colorVariants: ['gray'] as const,
      bodyType: 'universal',
    },
    apron: {
      id: 'apron',
      displayName: 'Apron',
      category: 'shirt',
      path: 'clothing/torso/aprons/apron/female/{color}.png',
      pathMale: 'clothing/torso/aprons/apron/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    overalls: {
      id: 'overalls',
      displayName: 'Overalls',
      category: 'shirt',
      path: 'clothing/torso/aprons/overalls/female/{color}.png',
      pathMale: 'clothing/torso/aprons/overalls/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // boots
  // -------------------------------------------------------------------------
  boots: {
    boots: {
      id: 'boots',
      displayName: 'Boots',
      category: 'boots',
      path: 'clothing/feet/boots/female/{color}.png',
      pathMale: 'clothing/feet/boots/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    shoes: {
      id: 'shoes',
      displayName: 'Shoes',
      category: 'boots',
      path: 'clothing/feet/shoes/female/{color}.png',
      pathMale: 'clothing/feet/shoes/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    sandals: {
      id: 'sandals',
      displayName: 'Sandals',
      category: 'boots',
      path: 'clothing/feet/sandals/female/{color}.png',
      pathMale: 'clothing/feet/sandals/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    slippers: {
      id: 'slippers',
      displayName: 'Slippers',
      category: 'boots',
      path: 'clothing/feet/slippers/female/{color}.png',
      pathMale: 'clothing/feet/slippers/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    ghillies: {
      id: 'ghillies',
      displayName: 'Ghillie Shoes',
      category: 'boots',
      path: 'clothing/feet/ghillies/female/{color}.png',
      pathMale: 'clothing/feet/ghillies/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    plate_boots: {
      id: 'plate_boots',
      displayName: 'Plate Sabatons',
      category: 'boots',
      path: 'clothing/feet/armour/plate/female/{color}.png',
      pathMale: 'clothing/feet/armour/plate/male/{color}.png',
      colorVariants: METAL_COLORS,
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // hands  (no dedicated hand/glove sprites found in current asset set)
  // -------------------------------------------------------------------------
  hands: {} satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // belt  (no dedicated belt sprites found in current asset set)
  // -------------------------------------------------------------------------
  belt: {} satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // cape
  // -------------------------------------------------------------------------
  cape: {
    solid: {
      id: 'solid',
      displayName: 'Solid Cape',
      category: 'cape',
      path: 'cape/solid/female/{color}.png',
      pathMale: 'cape/solid/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    tattered: {
      id: 'tattered',
      displayName: 'Tattered Cape',
      category: 'cape',
      path: 'cape/tattered/female/{color}.png',
      pathMale: 'cape/tattered/male/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // helmet
  // -------------------------------------------------------------------------
  helmet: {
    hood: {
      id: 'hood',
      displayName: 'Hood',
      category: 'helmet',
      path: 'helmet/hood/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    bandana: {
      id: 'bandana',
      displayName: 'Bandana',
      category: 'helmet',
      path: 'helmet/bandana/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
    crown: {
      id: 'crown',
      displayName: 'Crown',
      category: 'helmet',
      path: 'helmet/crown/gold.png',
      bodyType: 'universal',
    },
    leather_cap: {
      id: 'leather_cap',
      displayName: 'Leather Cap',
      category: 'helmet',
      path: 'helmet/leather_cap/{color}.png',
      colorVariants: STANDARD_COLORS,
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // weapon  (weapon animation sheets — 1.png–4.png per action)
  // -------------------------------------------------------------------------
  weapon: {
    sword: {
      id: 'sword',
      displayName: 'Sword',
      category: 'weapon',
      path: 'weapons/female/slash/1.png',
      pathMale: 'weapons/male/slash/1.png',
      bodyType: 'universal',
    },
    longsword: {
      id: 'longsword',
      displayName: 'Longsword',
      category: 'weapon',
      path: 'weapons/female/bigslash/1.png',
      pathMale: 'weapons/male/bigslash/1.png',
      bodyType: 'universal',
    },
    spear: {
      id: 'spear',
      displayName: 'Spear',
      category: 'weapon',
      path: 'weapons/female/thrust/1.png',
      pathMale: 'weapons/male/thrust/1.png',
      bodyType: 'universal',
    },
    bow: {
      id: 'bow',
      displayName: 'Bow',
      category: 'weapon',
      path: 'weapons/female/shoot/1.png',
      pathMale: 'weapons/male/shoot/1.png',
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

  // -------------------------------------------------------------------------
  // shield
  // -------------------------------------------------------------------------
  shield: {
    shield_round: {
      id: 'shield_round',
      displayName: 'Round Shield',
      category: 'shield',
      path: 'weapons/female/shield/1.png',
      pathMale: 'weapons/male/shield/1.png',
      bodyType: 'universal',
    },
    shield_kite: {
      id: 'shield_kite',
      displayName: 'Kite Shield',
      category: 'shield',
      path: 'weapons/female/shield/2.png',
      pathMale: 'weapons/male/shield/2.png',
      bodyType: 'universal',
    },
  } satisfies Record<string, SpriteEntry>,

} satisfies SpriteManifest

// ---------------------------------------------------------------------------
// Legacy exports — preserved for backward compatibility with existing code
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

export const CLOTHING = {
  torso: {
    plate_male:       spriteUrl('clothing/torso/armour/plate/male'),
    plate_female:     spriteUrl('clothing/torso/armour/plate/female'),
    leather_male:     spriteUrl('clothing/torso/armour/leather/male'),
    leather_female:   spriteUrl('clothing/torso/armour/leather/female'),
    legion_male:      spriteUrl('clothing/torso/armour/legion/male'),
    legion_female:    spriteUrl('clothing/torso/armour/legion/female'),
    chainmail_male:   spriteUrl('clothing/torso/chainmail/male'),
    chainmail_female: spriteUrl('clothing/torso/chainmail/female'),
  },
  legs: {
    plate_male:   spriteUrl('clothing/legs/armour/plate/male'),
    plate_female: spriteUrl('clothing/legs/armour/plate/female'),
  },
  feet: {
    boots_male:     spriteUrl('clothing/feet/boots/male'),
    boots_female:   spriteUrl('clothing/feet/boots/female'),
    shoes_male:     spriteUrl('clothing/feet/shoes/male'),
    shoes_female:   spriteUrl('clothing/feet/shoes/female'),
    sandals_male:   spriteUrl('clothing/feet/sandals/male'),
    sandals_female: spriteUrl('clothing/feet/sandals/female'),
  },
} as const

export const WEAPONS = {
  slash_male:      spriteUrl('weapons/male/slash'),
  thrust_male:     spriteUrl('weapons/male/thrust'),
  bigslash_male:   spriteUrl('weapons/male/bigslash'),
  shield_male:     spriteUrl('weapons/male/shield'),
  slash_female:    spriteUrl('weapons/female/slash'),
  thrust_female:   spriteUrl('weapons/female/thrust'),
  bigslash_female: spriteUrl('weapons/female/bigslash'),
  shield_female:   spriteUrl('weapons/female/shield'),
} as const
