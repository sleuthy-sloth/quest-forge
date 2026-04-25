/**
 * Reward Shop type definitions.
 * Paired with supabase/migrations/005_reward_shop.sql.
 *
 * When you regenerate the main Database type via `supabase gen types`,
 * these tables will appear in src/types/database.ts automatically.
 */

export interface RewardRow {
  id: string
  household_id: string
  title: string
  description: string
  cost: number
  icon_type: string
  reward_type?: string
  created_at: string
}

export interface RewardInsert {
  id?: string
  household_id: string
  title: string
  description?: string
  cost: number
  icon_type?: string
  created_at?: string
}

export interface PlayerInventoryRow {
  id: string
  player_id: string
  reward_id: string
  is_used: boolean
  acquired_at: string
}

export interface PlayerInventoryInsert {
  id?: string
  player_id: string
  reward_id: string
  is_used?: boolean
  acquired_at?: string
}

export interface RedemptionRow {
  id: string
  household_id: string
  player_id: string
  reward_id: string
  status: 'pending' | 'approved' | 'redeemed'
  created_at: string
  approved_at: string | null
}

export interface RedemptionInsert {
  id?: string
  household_id: string
  player_id: string
  reward_id: string
  status?: 'pending' | 'approved' | 'redeemed'
  created_at?: string
  approved_at?: string | null
}

export interface QuestRow {
  id: string
  household_id: string
  created_by: string
  title: string
  description: string
  xp_reward: number
  gold_reward: number
  assigned_to: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  is_boss: boolean
  boss_health: number | null
  boss_current_health: number | null
  boss_sprite: string | null
  is_active: boolean
  created_at: string
}

export interface QuestInsert {
  id?: string
  household_id: string
  created_by: string
  title: string
  description?: string
  xp_reward: number
  gold_reward?: number
  assigned_to?: string | null
  difficulty?: 'easy' | 'medium' | 'hard'
  is_boss?: boolean
  boss_health?: number | null
  boss_current_health?: number | null
  boss_sprite?: string | null
  is_active?: boolean
  created_at?: string
}

/**
 * Shop-specific constants and helpers.
 */

export const ICON_TYPES = ['chest', 'potion', 'scroll', 'gem', 'key', 'star', 'shield', 'sword'] as const
export type IconType = (typeof ICON_TYPES)[number]

/** Unicode pixel-art-like icons per icon_type (fallback when no sprite). */
export const ICON_GLYPHS: Record<string, string> = {
  chest:  '📦',
  potion: '🧪',
  scroll: '📜',
  gem:    '💎',
  key:    '🔑',
  star:   '⭐',
  shield: '🛡',
  sword:  '⚔',
}
