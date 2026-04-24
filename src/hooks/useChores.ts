'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PendingCompletion {
  completionId: string
  choreId: string
  playerId: string
  playerName: string
  choreTitle: string
  choreDescription: string
  questFlavorText: string | null
  xpReward: number
  goldReward: number
  difficulty: string
  completedAt: string
}

interface SubmitChoreResult {
  id: string
  chore_id: string
  player_id: string
  household_id: string
  completed_at: string
  verified: boolean
  xp_awarded: number
  gold_awarded: number
}

export interface UseChoresResult {
  /** All pending (unverified) chore completions with joined chore + player data. */
  pendingCompletions: PendingCompletion[]
  /** True during the initial fetch. */
  loading: boolean
  /** Human-readable error, or null when OK. */
  error: string | null
  /** IDs of completions currently being approved or rejected. */
  processingIds: Set<string>
  /** Refresh the pending list from the database. */
  refresh: () => Promise<void>
  /** Player-facing: mark a chore as completed. */
  submitChore: (
    choreId: string,
    householdId: string,
    playerId: string,
    xpReward: number,
    goldReward: number,
  ) => Promise<{ data: SubmitChoreResult | null; error: string | null }>
  /**
   * GM-facing: approve (verified=true) or reject (delete) a completion.
   *
   * - Approve sets verified=true, xp_awarded, gold_awarded.
   *   The DB trigger `handle_chore_verified` fires on the UPDATE and
   *   awards XP + gold to the player, deals boss damage, and records
   *   story contribution.
   * - Reject deletes the completion row — the player can resubmit.
   *
   * Returns the outcome so the caller can display feedback (xpAwarded
   * is only meaningful on approve).
   */
  verifyChore: (
    completionId: string,
    approved: boolean,
  ) => Promise<{ error: string | null; xpAwarded: number; goldAwarded: number }>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useChores(householdId: string | null): UseChoresResult {
  const supabase = createClient()

  const [pendingCompletions, setPendingCompletions] = useState<PendingCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const mountedRef = useRef(true)
  useEffect(() => { return () => { mountedRef.current = false } }, [])

  // ── Fetch pending completions ────────────────────────────────────────────

  const fetchPending = useCallback(async () => {
    if (!householdId) return

    setError(null)
    // Only show loading on initial fetch — refreshes are silent
    if (pendingCompletions.length === 0) setLoading(true)

    try {
      const { data, error: fetchError } = await supabase
        .from('chore_completions')
        .select(
          'id, chore_id, player_id, completed_at, ' +
          'xp_awarded, gold_awarded, difficulty, ' +
          'chores (title, description, quest_flavor_text, xp_reward, gold_reward, difficulty), ' +
          'profiles (display_name)',
        )
        .eq('household_id', householdId)
        .eq('verified', false)
        .order('completed_at', { ascending: false })

      if (fetchError) {
        if (mountedRef.current) setError('Failed to load pending completions')
        return
      }

      const mapped: PendingCompletion[] = (data ?? []).map((row: any) => ({
        completionId: row.id,
        choreId: row.chore_id,
        playerId: row.player_id,
        playerName: row.profiles?.display_name ?? 'Unknown',
        choreTitle: row.chores?.title ?? 'Unknown',
        choreDescription: row.chores?.description ?? '',
        questFlavorText: row.chores?.quest_flavor_text ?? null,
        xpReward: row.xp_awarded || row.chores?.xp_reward || 0,
        goldReward: row.gold_awarded || row.chores?.gold_reward || 0,
        difficulty: row.chores?.difficulty ?? 'easy',
        completedAt: row.completed_at,
      }))

      if (mountedRef.current) {
        setPendingCompletions(mapped)
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
    // pendingCompletions.length is intentionally omitted — including it
    // would recreate the Realtime channel on every list change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [householdId, supabase])

  // ── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!householdId) {
      setPendingCompletions([])
      setLoading(false)
      return
    }
    fetchPending()
  }, [householdId, fetchPending])

  // ── Realtime subscription ────────────────────────────────────────────────

  useEffect(() => {
    if (!householdId) return

    const channel = supabase
      .channel(`chore-completions-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chore_completions',
          filter: `household_id=eq.${householdId}`,
        },
        () => { if (mountedRef.current) fetchPending() },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chore_completions',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (!mountedRef.current) return
          // Optimistically remove verified completions
          if ((payload.new as any).verified && !(payload.old as any).verified) {
            setPendingCompletions(prev =>
              prev.filter(c => c.completionId !== (payload.new as any).id),
            )
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chore_completions',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (!mountedRef.current) return
          setPendingCompletions(prev =>
            prev.filter(c => c.completionId !== (payload.old as any).id),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, supabase, fetchPending])

  // ── Submit chore (player-facing) ─────────────────────────────────────────

  const submitChore = useCallback(
    async (
      choreId: string,
      hhId: string,
      playerId: string,
      xpReward: number,
      goldReward: number,
    ): Promise<{ data: SubmitChoreResult | null; error: string | null }> => {
      const { data, error: insertError } = await supabase
        .from('chore_completions')
        .insert({
          chore_id: choreId,
          player_id: playerId,
          household_id: hhId,
          xp_awarded: xpReward,
          gold_awarded: goldReward,
        })
        .select('id, chore_id, player_id, household_id, completed_at, verified, xp_awarded, gold_awarded')
        .single()

      if (insertError) return { data: null, error: insertError.message }
      return { data: data as SubmitChoreResult, error: null }
    },
    [supabase],
  )

  // ── Verify / reject chore (GM-facing) ────────────────────────────────────

  const verifyChore = useCallback(
    async (
      completionId: string,
      approved: boolean,
    ): Promise<{ error: string | null; xpAwarded: number; goldAwarded: number }> => {
      // Prevent double-click on this specific row
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.add(completionId)
        return next
      })

      // Optimistic removal — the row disappears instantly
      setPendingCompletions(prev =>
        prev.filter(c => c.completionId !== completionId),
      )

      try {
        if (approved) {
          // Look up the completion + chore data to get xp/gold rewards
          const { data: completion, error: fetchErr } = await supabase
            .from('chore_completions')
            .select('id, chores (xp_reward, gold_reward)')
            .eq('id', completionId)
            .eq('household_id', householdId ?? '')
            .eq('verified', false)
            .single()

          if (fetchErr || !completion) {
            // Re-insert into pending on failure
            if (mountedRef.current) fetchPending()
            return { error: fetchErr?.message ?? 'Completion not found or already verified.', xpAwarded: 0, goldAwarded: 0 }
          }

          const chore = (completion as any).chores as { xp_reward: number; gold_reward: number } | null
          const xpAwarded = chore?.xp_reward ?? 0
          const goldAwarded = chore?.gold_reward ?? 0

          const { error: updateErr } = await supabase
            .from('chore_completions')
            .update({
              verified: true,
              verified_at: new Date().toISOString(),
              xp_awarded: xpAwarded,
              gold_awarded: goldAwarded,
            })
            .eq('id', completionId)
            .eq('household_id', householdId ?? '')
            .eq('verified', false)

          if (updateErr) {
            if (mountedRef.current) fetchPending()
            return { error: updateErr.message, xpAwarded: 0, goldAwarded: 0 }
          }

          return { error: null, xpAwarded, goldAwarded }
        } else {
          // Reject: delete the row
          const { error: deleteErr } = await supabase
            .from('chore_completions')
            .delete()
            .eq('id', completionId)
            .eq('household_id', householdId ?? '')

          if (deleteErr) {
            if (mountedRef.current) fetchPending()
            return { error: deleteErr.message, xpAwarded: 0, goldAwarded: 0 }
          }

          return { error: null, xpAwarded: 0, goldAwarded: 0 }
        }
      } finally {
        setProcessingIds(prev => {
          const next = new Set(prev)
          next.delete(completionId)
          return next
        })
      }
    },
    [householdId, supabase, fetchPending],
  )

  return {
    pendingCompletions,
    loading,
    error,
    processingIds,
    refresh: fetchPending,
    submitChore,
    verifyChore,
  }
}
