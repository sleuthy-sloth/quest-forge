'use client'

import SpriteCanvas from './SpriteCanvas'
import type { AvatarConfig } from '@/types/avatar'

interface Props {
  /**
   * The avatar_config from the profiles table (stored as jsonb).
   * Accepts the raw Supabase return type (Record<string, unknown>) as well as
   * the typed AvatarConfig — this avoids needing a cast at every call site.
   */
  avatarConfig: AvatarConfig | Record<string, unknown> | null | undefined
  /**
   * Output size in CSS pixels. The underlying canvas is always 64×64 and
   * scaled by CSS. Must be an integer multiple of 64 for crisp pixel art.
   * Defaults to 64 (1×).
   */
  size?: number
  className?: string
}

/**
 * Fallback config shown when a player has no avatar_config saved yet.
 * Uses an anonymous hooded figure look so the placeholder is still
 * recognisable as a character silhouette.
 */
const DEFAULT_CONFIG: AvatarConfig = {
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

/**
 * Lightweight wrapper that accepts the raw database value for avatar_config
 * and passes it to SpriteCanvas. Falls back to DEFAULT_CONFIG when the
 * profile has no avatar set yet.
 *
 * Use this component everywhere an avatar portrait is needed (player home,
 * profile screen, leaderboard, etc.).
 */
export default function AvatarPreview({ avatarConfig, size = 64, className }: Props) {
  const config = (avatarConfig as AvatarConfig | null) ?? DEFAULT_CONFIG
  return <SpriteCanvas config={config} size={size} className={className} />
}
