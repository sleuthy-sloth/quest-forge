/**
 * Avatar system types for the LPC paper-doll character system.
 *
 * Layer stack (bottom to top):
 *   1. body        — base body (skin tone + body type)
 *   2. eyes        — eye color overlay
 *   3. hair_rear   — long hair behind body (rendered as part of hair style)
 *   4. pants       — leg clothing
 *   5. shirt       — torso clothing or armour
 *   6. boots       — footwear
 *   7. hands       — gloves
 *   8. belt        — waist accessory
 *   9. cape        — back/cape accessory
 *  10. helmet      — head armour or hat
 *  11. hair_front  — hair front layer (rendered as part of hair style)
 *  12. weapon      — held weapon
 *  13. shield      — off-hand shield
 */

// ---------------------------------------------------------------------------
// Core layer types
// ---------------------------------------------------------------------------

/** The ordered set of avatar layer keys. */
export type AvatarLayerCategory =
  | 'body'
  | 'eyes'
  | 'hair'
  | 'pants'
  | 'shirt'
  | 'boots'
  | 'hands'
  | 'belt'
  | 'cape'
  | 'helmet'
  | 'weapon'
  | 'shield'

/** A single layer slot in an avatar config. */
export interface SpriteLayer {
  /** Sprite identifier referencing SPRITE_MANIFEST, or null for no layer. */
  id: string | null
  /** Optional hex color for tinting (e.g. "#8B4513"). Null uses the sprite's default palette. */
  color?: string | null
}

/** The full avatar configuration stored in profiles.avatar_config. */
export interface AvatarConfig {
  body: SpriteLayer
  eyes: SpriteLayer
  hair: SpriteLayer
  pants: SpriteLayer
  shirt: SpriteLayer
  boots: SpriteLayer
  hands: SpriteLayer
  belt: SpriteLayer
  cape: SpriteLayer
  helmet: SpriteLayer
  weapon: SpriteLayer
  shield: SpriteLayer
}

// ---------------------------------------------------------------------------
// Sprite manifest entry
// ---------------------------------------------------------------------------

/**
 * Whether a sprite sheet has gender-split variants, or is universal.
 * 'female' | 'male' — the sprite only exists for that body type.
 * 'universal' — one sheet works for all body types.
 */
export type BodyType = 'female' | 'male' | 'universal'

/**
 * A single entry in the SPRITE_MANIFEST.
 * Describes one style option for a character layer.
 */
export interface SpriteEntry {
  /** Stable unique ID used in AvatarConfig (e.g. "boots_brown"). */
  id: string
  /** Human-readable label shown in the character creator UI. */
  displayName: string
  /** Which avatar layer category this entry belongs to. */
  category: AvatarLayerCategory
  /**
   * Path to the representative sprite sheet, relative to /public.
   * For color-variant sprites this is a template — use `{color}` as
   * a placeholder, e.g. "/sprites/clothing/feet/boots/female/{color}.png".
   * For gender-split sprites, this is the female (or universal) path.
   */
  path: string
  /**
   * Path to the male variant sheet when the sprite is gender-split.
   * Omitted for universal sprites or female-only items.
   */
  pathMale?: string
  /**
   * Available color names when path contains a `{color}` placeholder.
   * Each name corresponds to a PNG file (e.g. "brown" → "brown.png").
   */
  colorVariants?: readonly string[]
  /** Body type applicability. Defaults to 'universal' when omitted. */
  bodyType?: BodyType
}

// ---------------------------------------------------------------------------
// Convenience type for the full manifest shape
// ---------------------------------------------------------------------------

export type SpriteManifest = Record<AvatarLayerCategory, Record<string, SpriteEntry>>
