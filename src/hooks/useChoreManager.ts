'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Difficulty = 'easy' | 'medium' | 'hard' | 'epic'
export type Recurrence = 'once' | 'daily' | 'weekly' | 'monthly'

export interface ChoreInput {
  title: string
  description?: string
  xpReward: number
  goldReward: number
  difficulty: Difficulty
  recurrence: Recurrence
  assignedTo: string | null
  questFlavorText?: string
}

export interface ChoreResult {
  id: string
  title: string
  description: string | null
  xp_reward: number
  gold_reward: number
  assigned_to: string | null
  recurrence: Recurrence
  difficulty: Difficulty
  quest_flavor_text: string | null
  is_active: boolean
  created_at: string
}

export interface PlayerInfo {
  id: string
  displayName: string
  username: string
}

export interface UseChoreManagerResult {
  /** Household players available for assignment. */
  players: PlayerInfo[]
  /** Whether the players list is still loading. */
  loadingPlayers: boolean
  /** Whether a create/update is in flight. */
  submitting: boolean
  /** Any error from the last operation. */
  submitError: string | null
  /** Creates a new chore. Returns the created row on success. */
  createChore: (data: ChoreInput) => Promise<{ data: ChoreResult | null; error: string | null }>
  /** Updates an existing chore. */
  updateChore: (id: string, data: Partial<ChoreInput>) => Promise<{ error: string | null }>
  /** Clears the submit error. */
  clearError: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useChoreManager(
  householdId: string | null,
  userId: string | null,
): UseChoreManagerResult {
  const supabase = createClient()

  const [players, setPlayers] = useState<PlayerInfo[]>([])
  const [loadingPlayers, setLoadingPlayers] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── Fetch players ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!householdId) {
      setPlayers([])
      setLoadingPlayers(false)
      return
    }

    let cancelled = false
    setLoadingPlayers(true)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, username')
          .eq('household_id', householdId)
          .eq('role', 'player')
          .order('display_name', { ascending: true })
        if (cancelled) return
        if (error) {
          console.error('[useChoreManager] Failed to fetch players:', error.message)
          setPlayers([])
        } else {
          setPlayers(
            (data ?? []).map((p: any) => ({
              id: p.id,
              displayName: p.display_name,
              username: p.username,
            })),
          )
        }
      } catch (err: unknown) {
        if (cancelled) return
        console.error('[useChoreManager] Unexpected error fetching players:', err)
        setPlayers([])
      } finally {
        if (!cancelled) setLoadingPlayers(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [householdId, supabase])

  // ── Create chore ─────────────────────────────────────────────────────

  const createChore = useCallback(
    async (data: ChoreInput): Promise<{ data: ChoreResult | null; error: string | null }> => {
      if (!householdId || !userId) {
        return { data: null, error: 'Not authenticated.' }
      }

      setSubmitting(true)
      setSubmitError(null)

      const { data: row, error } = await supabase
        .from('chores')
        .insert({
          household_id: householdId,
          created_by: userId,
          title: data.title.trim(),
          description: (data.description ?? '').trim() || undefined,
          xp_reward: data.xpReward,
          gold_reward: data.goldReward,
          difficulty: data.difficulty as any,
          recurrence: data.recurrence as any,
          assigned_to: data.assignedTo || null,
          quest_flavor_text: (data.questFlavorText ?? '').trim() || undefined,
          is_active: true,
        })
        .select(
          'id, title, description, xp_reward, gold_reward, assigned_to, ' +
          'recurrence, difficulty, quest_flavor_text, is_active, created_at',
        )
        .single()

      if (error) {
        const msg = error.message.includes('violates')
          ? 'A quest with this title may already exist.'
          : 'Failed to create quest. Please try again.'
        setSubmitError(msg)
        setSubmitting(false)
        return { data: null, error: msg }
      }

      setSubmitting(false)
      return {
        data: {
          id: (row as any).id,
          title: (row as any).title,
          description: (row as any).description,
          xp_reward: (row as any).xp_reward,
          gold_reward: (row as any).gold_reward,
          assigned_to: (row as any).assigned_to,
          recurrence: (row as any).recurrence as Recurrence,
          difficulty: (row as any).difficulty as Difficulty,
          quest_flavor_text: (row as any).quest_flavor_text,
          is_active: (row as any).is_active,
          created_at: (row as any).created_at,
        },
        error: null,
      }
    },
    [householdId, userId, supabase],
  )

  // ── Update chore ─────────────────────────────────────────────────────

  const updateChore = useCallback(
    async (id: string, data: Partial<ChoreInput>): Promise<{ error: string | null }> => {
      if (!householdId) {
        return { error: 'Not authenticated.' }
      }

      setSubmitting(true)
      setSubmitError(null)

      const payload: Record<string, any> = {}
      if (data.title !== undefined) payload.title = data.title.trim()
      if (data.description !== undefined) payload.description = (data.description ?? '').trim() || undefined
      if (data.xpReward !== undefined) payload.xp_reward = data.xpReward
      if (data.goldReward !== undefined) payload.gold_reward = data.goldReward
      if (data.difficulty !== undefined) payload.difficulty = data.difficulty
      if (data.recurrence !== undefined) payload.recurrence = data.recurrence
      if (data.assignedTo !== undefined) payload.assigned_to = data.assignedTo || null
      if (data.questFlavorText !== undefined) payload.quest_flavor_text = (data.questFlavorText ?? '').trim() || undefined

      const { error } = await supabase
        .from('chores')
        .update(payload)
        .eq('id', id)
        .eq('household_id', householdId)

      setSubmitting(false)

      if (error) {
        setSubmitError(error.message)
        return { error: error.message }
      }

      return { error: null }
    },
    [householdId, supabase],
  )

  const clearError = useCallback(() => setSubmitError(null), [])

  return {
    players,
    loadingPlayers,
    submitting,
    submitError,
    createChore,
    updateChore,
    clearError,
  }
}
