'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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

interface VerifyChoreResult {
  id: string
}

export function useChores() {
  const supabase = createClient()

  const submitChore = useCallback(
    async (
      choreId: string,
      householdId: string,
      playerId: string,
      xpReward: number,
      goldReward: number
    ): Promise<{ data: SubmitChoreResult | null; error: string | null }> => {
      const { data, error } = await supabase
        .from('chore_completions')
        .insert({
          chore_id:     choreId,
          player_id:    playerId,
          household_id:  householdId,
          xp_awarded:   xpReward,
          gold_awarded: goldReward,
        })
        .select('id, chore_id, player_id, household_id, completed_at, verified, xp_awarded, gold_awarded')
        .single()

      if (error) return { data: null, error: error.message }
      return { data: data as SubmitChoreResult, error: null }
    },
    [supabase]
  )

  const verifyChore = useCallback(
    async (
      completionId: string,
      householdId: string
    ): Promise<{ data: VerifyChoreResult | null; xpAwarded: number; goldAwarded: number; error: string | null }> => {
      const { data: completion, error: fetchError } = await supabase
        .from('chore_completions')
        .select('id, chores (xp_reward, gold_reward)')
        .eq('id', completionId)
        .eq('household_id', householdId)
        .eq('verified', false)
        .single()

      if (fetchError || !completion) {
        return { data: null, xpAwarded: 0, goldAwarded: 0, error: fetchError?.message ?? 'Completion not found or already verified.' }
      }

      const chore = completion.chores as { xp_reward: number; gold_reward: number } | null
      const xpAwarded   = chore?.xp_reward   ?? 0
      const goldAwarded = chore?.gold_reward ?? 0

      const { data: updated, error: updateError } = await supabase
        .from('chore_completions')
        .update({
          verified:     true,
          verified_at:  new Date().toISOString(),
          xp_awarded:   xpAwarded,
          gold_awarded: goldAwarded,
        })
        .eq('id', completionId)
        .eq('household_id', householdId)
        .eq('verified', false)
        .select('id')
        .single()

      if (updateError || !updated) {
        return { data: null, xpAwarded: 0, goldAwarded: 0, error: updateError?.message ?? 'Failed to verify chore.' }
      }

      return { data: updated as VerifyChoreResult, xpAwarded, goldAwarded, error: null }
    },
    [supabase]
  )

  return { submitChore, verifyChore }
}