import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { playSfx } from '@/lib/audio'
import { xpForLevel } from '@/lib/xp'

// ── Types ──────────────────────────────────────────────────────

export interface ChapterRow {
  id: string
  title: string
  narrative_text: string
  week_number: number
  is_unlocked: boolean
  household_id: string
}

export interface QuestState {
  // ── Multi-tenant context ──────────────────────────────────
  householdId: string | null
  playerId: string | null

  // ── RPG metrics ──────────────────────────────────────────
  xp: number
  xpAvailable: number
  gold: number
  health: number
  maxHealth: number
  level: number

  // ── Story data ───────────────────────────────────────────
  chapters: ChapterRow[]
  chaptersLoading: boolean

  // ── Actions ──────────────────────────────────────────────

  hydrate: (data: {
    householdId: string
    playerId: string
    xpTotal: number
    xpAvailable: number
    gold: number
    level: number
    health?: number
    maxHealth?: number
  }) => void

  completeTask: (xpReward: number, goldReward: number) => void

  takeDamage: (amount: number) => void

  heal: (amount?: number) => void

  /**
   * Create a household + GM profile for the current user.
   * Safe to call from client components (uses anon key + RLS).
   *
   * Design notes (avoids the chicken-and-egg trap):
   *   1. Uses .select() WITHOUT .single() — the RLS policy on
   *      households_select uses `OR created_by = auth.uid()`
   *      so the SELECT returns the row even before the profile
   *      exists (see migration 008).
   *   2. If the profile already exists for this user, returns
   *      false (guard against double-creation).
   */
  createHousehold: (householdName: string, displayName: string) => Promise<boolean>

  /**
   * Buy a digital reward. Full real flow:
   *   1. Check local gold >= cost
   *   2. Optimistic deduction + coin SFX
   *   3. UPDATE profiles SET gold = gold - cost (server validates balance)
   *   4. INSERT INTO player_inventory
   *   5. Rollback store.gold on failure
   *   6. playSfx('purchase') on success
   */
  buyReward: (rewardId: string, cost: number) => Promise<boolean>

  /**
   * Redeem a real-world voucher. Creates a row in redemptions table.
   */
  redeemVoucher: (rewardId: string, cost: number) => Promise<boolean>

  /** Parent-only: set is_unlocked = true on a chapter. */
  unlockChapter: (chapterId: string) => Promise<boolean>

  /** Fetch all unlocked chapters for this household, ordered by week_number. */
  fetchStoryData: () => Promise<ChapterRow[]>

}

// ── Defaults ───────────────────────────────────────────────────

const DEFAULT_MAX_HEALTH = 100

// ── Store ──────────────────────────────────────────────────────

export const useQuestStore = create<QuestState>((set, get) => ({
  householdId: null,
  playerId: null,
  xp: 0,
  xpAvailable: 0,
  gold: 0,
  health: DEFAULT_MAX_HEALTH,
  maxHealth: DEFAULT_MAX_HEALTH,
  level: 1,
  chapters: [],
  chaptersLoading: false,

  // ── Actions ──────────────────────────────────────────────

  hydrate(data) {
    set({
      householdId: data.householdId,
      playerId: data.playerId,
      xp: data.xpTotal,
      xpAvailable: data.xpAvailable,
      gold: data.gold,
      level: data.level,
      health: data.health ?? data.maxHealth ?? DEFAULT_MAX_HEALTH,
      maxHealth: data.maxHealth ?? DEFAULT_MAX_HEALTH,
    })
  },

  completeTask(xpReward, goldReward) {
    const state = get()
    const newXp = state.xp + xpReward

    let newLevel = state.level
    while (newLevel < 100 && newXp >= xpForLevel(newLevel + 1)) {
      newLevel++
    }

    const leveledUp = newLevel > state.level

    set({
      xp: newXp,
      xpAvailable: state.xpAvailable + xpReward,
      gold: state.gold + goldReward,
      level: newLevel,
    })

    playSfx('coin')
    if (leveledUp) playSfx('victory')
  },

  createHousehold: async (householdName, displayName) => {
    const supabase = createClient()

    // Guard: check if user already has a profile (prevents double-creation)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) return false

    // Insert household — use .select() WITHOUT .single() to avoid the
    // "0 rows returned" trap (migration 008's RLS fix handles this).
    const { data: households, error: householdError } = await supabase
      .from('households')
      .insert({ name: householdName, created_by: user.id })
      .select('id')

    if (householdError || !households || households.length === 0) {
      return false
    }

    const householdId = households[0].id

    // Insert GM profile
    const username = `gm_${user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')}_${Date.now().toString(36)}`

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        household_id: householdId,
        display_name: displayName,
        username,
        role: 'gm',
      })

    if (profileError) {
      // Clean up orphan household
      await supabase.from('households').delete().eq('id', householdId)
      return false
    }

    // Hydrate store
    set({
      householdId,
      playerId: user.id,
      gold: 0,
      xp: 0,
      xpAvailable: 0,
      level: 1,
      health: DEFAULT_MAX_HEALTH,
      maxHealth: DEFAULT_MAX_HEALTH,
    })

    playSfx('coin')
    return true
  },

  takeDamage(amount) {
    const state = get()
    set({ health: Math.max(0, state.health - amount) })
    playSfx('attack')
  },

  heal(amount) {
    const state = get()
    const max = state.maxHealth
    set({ health: amount === undefined ? max : Math.min(max, state.health + amount) })
  },

  buyReward: async (rewardId, cost) => {
    const { gold: currentGold, playerId, householdId } = get()
    if (currentGold < cost || !playerId || !householdId) return false

    const previousGold = currentGold
    set({ gold: currentGold - cost })
    playSfx('coin')

    const supabase = createClient()

    // Step 1: deduct gold server-side (the CHECK constraint on profiles.gold
    // provides an additional safety net in the DB).
    const { error: goldError } = await supabase.rpc('deduct_gold', {
      p_player_id: playerId,
      p_amount: cost,
    })

    if (goldError) {
      // Fallback: direct UPDATE if the RPC doesn't exist yet
      const { error: directError } = await supabase
        .from('profiles')
        .update({ gold: currentGold - cost })
        .eq('id', playerId)
        .eq('gold', currentGold) // optimistic lock — only deduct if gold hasn't changed

      if (directError) {
        set({ gold: previousGold })
        return false
      }
    }

    // Step 2: insert into player_inventory
    const { error: insertError } = await supabase
      .from('player_inventory')
      .insert({
        player_id: playerId,
        reward_id: rewardId,
        household_id: householdId,
      })

    if (insertError) {
      // Rollback gold
      await supabase
        .from('profiles')
        .update({ gold: previousGold })
        .eq('id', playerId)

      set({ gold: previousGold })
      return false
    }

    playSfx('purchase')
    return true
  },

  redeemVoucher: async (rewardId, cost) => {
    const { gold: currentGold, playerId, householdId } = get()
    if (currentGold < cost || !playerId || !householdId) return false

    const previousGold = currentGold
    set({ gold: currentGold - cost })
    playSfx('coin')

    const supabase = createClient()

    // Deduct gold
    const { error: goldError } = await supabase.rpc('deduct_gold', {
      p_player_id: playerId,
      p_amount: cost,
    })

    if (goldError) {
      const { error: directError } = await supabase
        .from('profiles')
        .update({ gold: currentGold - cost })
        .eq('id', playerId)

      if (directError) {
        set({ gold: previousGold })
        return false
      }
    }

    // Insert redemption
    const { error: insertError } = await supabase
      .from('redemptions')
      .insert({
        player_id: playerId,
        reward_id: rewardId,
        household_id: householdId,
        status: 'pending',
      })

    if (insertError) {
      await supabase.from('profiles').update({ gold: previousGold }).eq('id', playerId)
      set({ gold: previousGold })
      return false
    }

    playSfx('purchase')
    return true
  },

  unlockChapter: async (chapterId) => {
    const { householdId } = get()
    if (!householdId) return false

    const supabase = createClient()
    const { error } = await supabase
      .from('story_chapters')
      .update({ is_unlocked: true })
      .eq('id', chapterId)
      .eq('household_id', householdId)

    if (error) return false

    // Update local cache
    set((s) => ({
      chapters: s.chapters.map((c) =>
        c.id === chapterId ? { ...c, is_unlocked: true } : c,
      ),
    }))

    return true
  },

  fetchStoryData: async () => {
    const { householdId } = get()
    if (!householdId) {
      set({ chapters: [], chaptersLoading: false })
      return []
    }

    set({ chaptersLoading: true })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('story_chapters')
      .select('id, title, narrative_text, week_number, is_unlocked, household_id')
      .eq('household_id', householdId)
      .eq('is_unlocked', true)
      .order('week_number', { ascending: true })

    const chapters = (error || !data) ? [] : data as unknown as ChapterRow[]
    set({ chapters, chaptersLoading: false })
    return chapters
  },

}))
