/**
 * Reward Shop type definitions.
 * Schema created in migrations 006 (production_shop) and 007 (quests_and_redemptions).
 *
 * When you regenerate the main Database type via `supabase gen types`,
 * these tables will appear in src/types/database.ts automatically.
 */

export interface RewardRow {
  id: string
  household_id: string
  title: string
  description: string
  cost_gold: number
  cost_xp: number
  icon_type: string
  category: 'real_reward' | 'cosmetic' | 'power_up' | 'story_unlock'
  reward_type: 'digital' | 'real_world'
  sprite_icon: string | null
  metadata: any
  created_at: string
}

export interface RewardInsert {
  id?: string
  household_id: string
  created_by: string
  title: string
  description?: string
  cost_gold: number
  cost_xp?: number
  icon_type?: string
  category?: 'real_reward' | 'cosmetic' | 'power_up' | 'story_unlock'
  reward_type?: 'digital' | 'real_world'
  is_available?: boolean
  sprite_icon?: string | null
  metadata?: any
  created_at?: string
}

export interface PlayerInventoryRow {
  id: string
  player_id: string
  reward_id: string
  household_id: string
  created_at: string
}

export interface PlayerInventoryInsert {
  id?: string
  player_id: string
  reward_id: string
  household_id: string
  created_at?: string
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
  boss_hp: number | null
  boss_current_hp: number | null
  boss_sprite_config: any | null
  is_active: boolean
  is_unlocked: boolean
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
  boss_hp?: number | null
  boss_current_hp?: number | null
  boss_sprite_config?: any | null
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
