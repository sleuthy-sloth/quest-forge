'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export interface PlayerProfile {
  id: string
  household_id: string
  display_name: string
  username: string
  role: 'gm' | 'player'
  level: number
  xp_total: number
  xp_available: number
  gold: number
  avatar_class: string | null
  avatar_config: unknown
}

export interface LevelUpEvent {
  newLevel: number
  previousLevel: number
}

export function usePlayer(userId: string | null) {
  const supabase = createClient()
  const previousLevelRef = useRef<number | null>(null)
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, household_id, display_name, username, role, level, xp_total, xp_available, gold, avatar_class, avatar_config')
      .eq('id', uid)
      .single()
    return data as PlayerProfile | null
  }, [supabase])

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    let channel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const uid = userId as string
      setLoading(true)
      const data = await fetchProfile(uid)
      if (data) {
        previousLevelRef.current = data.level
        setProfile(data)
      }
      setLoading(false)

      channel = supabase
        .channel(`player-profile-${uid}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${uid}`,
          },
          async (payload) => {
            const updated = payload.new as Partial<PlayerProfile>
            setProfile(prev => prev ? { ...prev, ...updated } : null)

            if (
              previousLevelRef.current !== null &&
              updated.level !== undefined &&
              updated.level > previousLevelRef.current
            ) {
              const levelUpEvent: LevelUpEvent = {
                newLevel: updated.level,
                previousLevel: previousLevelRef.current,
              }
              previousLevelRef.current = updated.level
              if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(
                  new CustomEvent('player:level-up', { detail: levelUpEvent })
                )
              }
            } else if (updated.level !== undefined) {
              previousLevelRef.current = updated.level
            }
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId, supabase, fetchProfile])

  const refresh = useCallback(async () => {
    if (!userId) return
    const uid = userId as string
    const data = await fetchProfile(uid)
    if (data) {
      setProfile(data)
      previousLevelRef.current = data.level
    }
  }, [userId, fetchProfile])

  return { profile, loading, refresh }
}