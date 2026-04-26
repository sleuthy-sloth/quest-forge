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
 * Seed a household's story_chapters table with one row per week (53 total:
 * a week-0 prologue plus weeks 1–52 from bosses.json).
 *
 * Sets `content` (for display in StoryDashboard) and `sequence_order`
 * so chapters render in the correct order.
 *
 * Idempotent at the call site: caller should check the household has zero
 * existing rows before invoking, otherwise this will produce duplicates.
 */
export async function seedStoryChaptersForHousehold(
  admin: AdminClient,
  householdId: string,
): Promise<void> {
  const rows: Array<{
    household_id: string
    week_number: number
    chapter_number: number
    sequence_order: number
    title: string
    content: string | null
    narrative_text: string | null
    boss_name: string | null
    boss_description: string | null
    boss_hp: number
    boss_current_hp: number
    xp_threshold_to_unlock: number
    is_unlocked: boolean
    rewards_claimed: boolean
  }> = []

  // ── Week 0: Prologue ─────────────────────────────────────────────────────
  const prologue = scaffolds.find((c) => c.type === 'prologue')
  if (prologue) {
    rows.push({
      household_id: householdId,
      week_number: 0,
      chapter_number: 0,
      sequence_order: 0,
      title: prologue.title,
      content: prologue.scaffold,
      // narrative_text is NOT NULL — must always have a value
      narrative_text: prologue.scaffold,
      boss_name: null,
      boss_description: null,
      boss_hp: 0,
      boss_current_hp: 0,
      xp_threshold_to_unlock: 0,
      is_unlocked: true, // prologue starts unlocked
      rewards_claimed: false,
    })
  }

  // ── Weeks 1–52: Boss chapters ────────────────────────────────────────────
  for (const boss of bosses) {
    const richScaffold = scaffolds.find(
      (c) => c.week === boss.week && c.type !== 'prologue',
    )

    const title = richScaffold?.title ?? boss.name
    const content = richScaffold?.scaffold ??
      `${boss.description}\n\n${boss.weakness_flavor ?? ''}`

    rows.push({
      household_id: householdId,
      week_number: boss.week,
      chapter_number: boss.arc,
      sequence_order: boss.week,
      title,
      content: content.trim() || null,
      // narrative_text is NOT NULL — use defeat narrative (or fallback to description).
      // /api/story/generate overwrites this with AI content when boss is defeated.
      narrative_text: boss.defeat_narrative ?? boss.description,
      boss_name: boss.name,
      boss_description: boss.description,
      boss_hp: boss.hp,
      boss_current_hp: boss.hp,
      xp_threshold_to_unlock: Math.max(0, (boss.week - 1) * 250),
      is_unlocked: false,
      rewards_claimed: false,
    })
  }

  const { error } = await admin
    .from('story_chapters')
    .insert(rows as never)

  if (error) {
    throw new Error(
      `Failed to seed story chapters for household ${householdId}: ${error.message}`,
    )
  }
}
