'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BossSpriteConfig } from '@/components/boss/BossSprite'
import type { Database } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StoryChapter = Database['public']['Tables']['story_chapters']['Row']

export interface BossState {
  chapterId: string
  weekNumber: number
  chapterNumber: number
  title: string
  narrativeText: string
  boss: {
    name: string
    description: string | null
    maxHp: number
    currentHp: number
    spriteConfig: BossSpriteConfig
  } | null
  isUnlocked: boolean
  rewardsClaimed: boolean
}

// ---------------------------------------------------------------------------
// Fallback config when DB row has no boss_sprite_config
// ---------------------------------------------------------------------------

const DEFAULT_BOSS_CONFIG: BossSpriteConfig = {
  base_sprite: 'demon',
  palette: 'hollow_dark',
  scale: 2,
  particles: ['ember_float', 'shadow_tendril'],
  frame: 'frame_epic',
  glow_color: '#4a0080',
}

// ---------------------------------------------------------------------------
// Transform a raw story_chapters row into BossState
// ---------------------------------------------------------------------------

function formatChapter(row: StoryChapter): BossState {
  return {
    chapterId: row.id,
    weekNumber: row.week_number,
    chapterNumber: row.chapter_number,
    title: row.title,
    narrativeText: row.narrative_text,
    boss: row.boss_name
      ? {
          name: row.boss_name,
          description: row.boss_description,
          maxHp: row.boss_hp,
          currentHp: row.boss_current_hp,
          spriteConfig: (row.boss_sprite_config as unknown as BossSpriteConfig) ?? DEFAULT_BOSS_CONFIG,
        }
      : null,
    isUnlocked: row.is_unlocked,
    rewardsClaimed: row.rewards_claimed,
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBoss(householdId: string | null) {
  const supabase = createClient()
  const [bossState, setBossState] = useState<BossState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  // ── Fetch latest chapter ───────────────────────────────────────────────

  const refresh = useCallback(async () => {
    if (!householdId) {
      if (mountedRef.current) {
        setBossState(null)
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
        .eq('is_unlocked', false)
        .order('week_number', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (err) throw new Error(err.message)

      if (mountedRef.current) {
        setBossState(data ? formatChapter(data) : null)
        setLoading(false)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load boss')
        setLoading(false)
      }
    }
  }, [householdId, supabase])

  // ── Initial fetch ──────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true
    refresh()
    return () => { mountedRef.current = false }
  }, [refresh])

  // ── Realtime subscription ──────────────────────────────────────────────

  useEffect(() => {
    if (!householdId) return

    const channel = supabase
      .channel(`boss-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'story_chapters',
          filter: `household_id=eq.${householdId}`,
        },
          (payload) => {
          if (!mountedRef.current) return
          const updated = payload.new as StoryChapter
          setBossState(prev => {
            if (!prev || prev.chapterId !== updated.id) return prev
            return formatChapter(updated)
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, supabase])

  return { bossState, loading, error, refresh }
}
