import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import bossesData from '@/lore/bosses.json'
import chaptersData from '@/lore/chapters.json'

type AdminClient = SupabaseClient<Database>

interface BossEntry {
  week: number
  arc: number
  name: string
  hp: number
  description: string
  weakness_flavor?: string
  defeat_narrative?: string
}

interface ChapterScaffold {
  week: number
  chapter: number
  title: string
  type: string
  scaffold: string
}

const bosses = (bossesData as { bosses: BossEntry[] }).bosses
const scaffolds = (chaptersData as { chapters: ChapterScaffold[] }).chapters

/**
 * Seed a household's story_chapters table with one row per week (52 total)
 * derived from src/lore/bosses.json. Where richer prose is available in
 * chapters.json (early weeks), prefer that for the chapter content.
 *
 * Idempotent at the call site: caller should check the household has zero
 * existing rows before invoking, otherwise this will produce duplicates.
 */
export async function seedStoryChaptersForHousehold(
  admin: AdminClient,
  householdId: string,
): Promise<void> {
  const rows = bosses.map((boss) => {
    const richScaffold = scaffolds.find(
      (c) => c.week === boss.week && c.type !== 'prologue',
    )
    const title = richScaffold?.title ?? boss.name

    return {
      household_id: householdId,
      week_number: boss.week,
      chapter_number: boss.arc,
      title,
      narrative_text: boss.defeat_narrative ?? boss.description,
      boss_name: boss.name,
      boss_description: boss.description,
      boss_hp: boss.hp,
      boss_current_hp: boss.hp,
      xp_threshold_to_unlock: Math.max(0, (boss.week - 1) * 250),
      is_unlocked: boss.week === 1,
      rewards_claimed: false,
    }
  })

  const { error } = await admin
    .from('story_chapters')
    .insert(rows as never)

  if (error) {
    throw new Error(
      `Failed to seed story chapters for household ${householdId}: ${error.message}`,
    )
  }
}
