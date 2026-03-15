/**
 * Boss battle utilities for Quest Forge.
 *
 * The DB trigger `handle_chore_verified` automatically deals damage when a
 * chore completion is approved, and `handle_edu_completed` does the same for
 * edu challenges. These utilities are for reading boss state and for cases
 * that need direct damage (e.g., special game events).
 */

import type { Database } from '@/types/database'
import { createClient } from '@/lib/supabase/server'

type StoryChapterRow = Database['public']['Tables']['story_chapters']['Row']

export interface Boss {
  id: string
  householdId: string
  weekNumber: number
  chapterNumber: number
  title: string
  bossName: string | null
  bossDescription: string | null
  bossHp: number
  bossCurrentHp: number
  bossDefeated: boolean
  bossSprite: Database['public']['Tables']['story_chapters']['Row']['boss_sprite_config']
}

function rowToBoss(row: StoryChapterRow): Boss {
  return {
    id:              row.id,
    householdId:     row.household_id,
    weekNumber:      row.week_number,
    chapterNumber:   row.chapter_number,
    title:           row.title,
    bossName:        row.boss_name,
    bossDescription: row.boss_description,
    bossHp:          row.boss_hp,
    bossCurrentHp:   row.boss_current_hp,
    bossDefeated:    row.boss_current_hp === 0,
    bossSprite:      row.boss_sprite_config,
  }
}

/**
 * Scale base boss HP to the household's player count.
 *
 * formula: baseHP × (0.5 + 0.5 × playerCount)
 *
 * | Players | Multiplier |
 * |---------|-----------|
 * |    1    |    1.0×   |
 * |    2    |    1.5×   |
 * |    3    |    2.0×   |
 * |    4    |    2.5×   |
 * |    5    |    3.0×   |
 */
export function scaleBossHP(baseHP: number, playerCount: number): number {
  return Math.round(baseHP * (0.5 + 0.5 * playerCount))
}

/**
 * Fetch the active (not yet defeated) boss chapter for a household.
 * Returns null if no active boss exists.
 */
export async function getCurrentBoss(householdId: string): Promise<Boss | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('story_chapters')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_unlocked', false)
    .gt('boss_current_hp', 0)
    .order('week_number', { ascending: true })
    .order('chapter_number', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) return null
  return rowToBoss(data)
}

/**
 * Deal direct damage to a household's active boss.
 * Calls the `deal_boss_damage` Postgres RPC which atomically decrements HP.
 *
 * Returns the new HP and whether the boss was defeated.
 * Returns null if there is no active boss.
 */
export async function dealBossDamage(
  householdId: string,
  damage: number
): Promise<{ newHP: number; defeated: boolean } | null> {
  const supabase = await createClient()

  // Resolve the active chapter first (RPC requires a chapter ID)
  const boss = await getCurrentBoss(householdId)
  if (!boss) return null

  const { data: newHP, error } = await supabase
    .rpc('deal_boss_damage', {
      p_chapter_id: boss.id,
      p_damage:     damage,
    })

  if (error || newHP === null) {
    console.error('[boss] deal_boss_damage rpc error:', error)
    return null
  }

  return { newHP, defeated: newHP === 0 }
}
