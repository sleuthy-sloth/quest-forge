/**
 * Encounter system types for the LPC-based avatar enemy system.
 *
 * Enemies are rendered using the existing LPC avatar compositor pipeline
 * (AvatarConfig → compositeAvatar), not the separate BossSprite system.
 * This means every enemy is just a set of 13 sprite layer choices
 * composed from the same SPRITE_MANIFEST assets used by player avatars.
 */

import type { AvatarConfig } from '@/types/avatar'

/**
 * Configuration for a single enemy encounter.
 *
 * Enemies are defined at build time in src/lore/enemies.json and matched
 * to academy subjects via `id` (which corresponds to the game slug).
 *
 * The `avatar` field is a standard AvatarConfig (body, eyes, hair, shirt,
 * weapon, etc.) — exactly the same shape as a player's avatar_config,
 * allowing the existing sprite compositor to render enemies unchanged.
 */
export interface EncounterConfig {
  /** Stable identifier, matches the game slug (e.g. "math-arena"). */
  id: string

  /** Display name shown on the encounter card (e.g. "Abyssal Calculator"). */
  name: string

  /**
   * Full LPC avatar configuration for this enemy.
   * Composed from SPRITE_MANIFEST assets — the same layers and IDs used
   * for player character creation and rendering.
   */
  avatar: AvatarConfig

  /**
   * CSS color used for the ambient glow effect behind the enemy sprite.
   * Should harmonise with the game's accent colour.
   * Example: "#c43a00"
   */
  glowColor: string
}
