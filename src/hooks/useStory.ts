'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BossSpriteConfig } from '@/components/boss/BossSprite'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoryChapter {
  id: string
  title: string
  narrative_text: string
  week_number: number
  chapter_number: number
  is_unlocked: boolean
  household_id: string
  content_image_url?: string
  content?: string
  boss_name?: string | null
  boss_description?: string | null
  boss_hp?: number
  boss_current_hp?: number
  boss_sprite_config?: BossSpriteConfig | null
}

export interface BossInfo {
  chapterId: string
  weekNumber: number
  name: string
  description: string | null
  maxHp: number
  currentHp: number
  spriteConfig: BossSpriteConfig
  isUnlocked: boolean
}

export interface UseStoryResult {
  /** All chapters for the current household, ordered by week_number. */
  chapters: StoryChapter[]
  /** The currently active boss (if any) — the first locked chapter with a boss. */
  activeBoss: BossInfo | null
  /** True during initial data fetch. */
  loading: boolean
  /** Error message, or null. */
  error: string | null
  /** Force-refresh all story data from the server. */
  refresh: () => Promise<void>
  /** Regenerate a chapter's narrative text via AI. */
  regenerateNarrative: (chapterId: string) => Promise<string | null>
  /** Advance to the next story week (GM-only). Unlocks the next chapter. */
  advanceWeek: () => Promise<{ success: boolean; error?: string }>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BOSS_CONFIG: BossSpriteConfig = {
  base_sprite: 'procedural_treant',
  palette: 'blight_hollow',
  scale: 2,
  particles: ['blight_spore', 'root_crawl', 'dark_aura'],
  frame: 'frame_epic',
  glow_color: '#6a1fa8',
}

function formatChapters(data: unknown[]): StoryChapter[] {
  return (data as StoryChapter[]) ?? []
}

function getActiveBoss(chapters: StoryChapter[]): BossInfo | null {
  const bossChapter = chapters
    .filter(ch => !ch.is_unlocked && ch.boss_name && (ch.boss_current_hp ?? 0) > 0)
    .sort((a, b) => a.week_number - b.week_number)[0]

  if (!bossChapter) return null

  return {
    chapterId: bossChapter.id,
    weekNumber: bossChapter.week_number,
    name: bossChapter.boss_name!,
    description: bossChapter.boss_description ?? null,
    maxHp: bossChapter.boss_hp ?? 100,
    currentHp: bossChapter.boss_current_hp ?? 100,
    spriteConfig: (bossChapter.boss_sprite_config as unknown as BossSpriteConfig) ?? DEFAULT_BOSS_CONFIG,
    isUnlocked: bossChapter.is_unlocked,
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useStory(householdId: string | null): UseStoryResult {
  const supabase = createClient()
  const mountedRef = useRef(true)

  const [chapters, setChapters] = useState<StoryChapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Derived: compute active boss from chapters ──────────────────────────
  const activeBoss = getActiveBoss(chapters)

  // ── Fetch all story data ────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!householdId) {
      if (mountedRef.current) {
        setChapters([])
        setLoading(false)
        setError(null)
      }
      return
    }

    if (mountedRef.current) setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('story_chapters')
        .select('*')
        .eq('household_id', householdId)
        .order('week_number', { ascending: true })

      if (err) throw new Error(err.message)

      if (mountedRef.current) {
        setChapters(formatChapters(data ?? []))
        setLoading(false)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load story data')
        setLoading(false)
      }
    }
  }, [householdId, supabase])

  // ── Initial fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true
    refresh()
    return () => { mountedRef.current = false }
  }, [refresh])

  // ── Realtime subscription for chapter updates ───────────────────────────
  useEffect(() => {
    if (!householdId) return

    const channel = supabase
      .channel(`story-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_chapters',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          // Refresh on any change to story_chapters for this household
          refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, supabase, refresh])

  // ── Regenerate narrative ────────────────────────────────────────────────
  const regenerateNarrative = useCallback(async (chapterId: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/story/generate-opening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId }),
      })
      const data = await res.json()
      if (data.narrative) {
        await refresh()
        return data.narrative
      }
      return null
    } catch {
      return null
    }
  }, [refresh])

  // ── Advance to next week ────────────────────────────────────────────────
  const advanceWeek = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/story/advance-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error ?? 'Failed to advance week' }
      }
      await refresh()
      return { success: true }
    } catch {
      return { success: false, error: 'Network error during week advancement' }
    }
  }, [refresh])

  return {
    chapters,
    activeBoss,
    loading,
    error,
    refresh,
    regenerateNarrative,
    advanceWeek,
  }
}