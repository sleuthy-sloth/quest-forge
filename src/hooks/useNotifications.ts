'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface NotificationEvent {
  type: 'chore:assigned' | 'chore:completed' | 'story:update'
  title: string
  description?: string
  data?: any
}

export function useNotifications(userId: string | null, householdId: string | null, role: 'gm' | 'player' | null) {
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !householdId || !role) return

    const channel = supabase
      .channel(`household-notifications-${householdId}`)
      // 1. New Chore Assigned
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chores',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const chore = payload.new
          // Players only get notified if it's assigned to them or unassigned
          if (role === 'player') {
            if (chore.assigned_to && chore.assigned_to !== userId) return
          }
          
          window.dispatchEvent(
            new CustomEvent('qf:notification', {
              detail: {
                type: 'chore:assigned',
                title: 'New Deed Issued!',
                description: chore.title,
                data: chore,
              },
            })
          )
        }
      )
      // 2. Chore Completed (Mainly for GMs to approve)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chore_completions',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const completion = payload.new
          
          // GMs get notified of all completions
          if (role === 'gm') {
            window.dispatchEvent(
              new CustomEvent('qf:notification', {
                detail: {
                  type: 'chore:completed',
                  title: 'Deed Completed!',
                  description: 'An Emberbearer has finished a task.',
                  data: completion,
                },
              })
            )
          }
        }
      )
      // 3. Story / Boss Update
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'story_chapters',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const oldChapter = payload.old
          const newChapter = payload.new

          // Case A: Chapter unlocked
          if (!oldChapter.is_unlocked && newChapter.is_unlocked) {
            window.dispatchEvent(
              new CustomEvent('qf:notification', {
                detail: {
                  type: 'story:update',
                  title: 'Chronicle Updated!',
                  description: `Chapter Unlocked: ${newChapter.title}`,
                  data: newChapter,
                },
              })
            )
          }
          // Case B: Boss HP changed (only if it's currently active)
          else if (
            newChapter.boss_current_hp !== oldChapter.boss_current_hp &&
            newChapter.boss_current_hp !== null
          ) {
            // We don't want to spam for every single point, but maybe for significant changes or just once
            // For now, let's just dispatch it and let the listener decide
            window.dispatchEvent(
              new CustomEvent('qf:notification', {
                detail: {
                  type: 'story:update',
                  title: 'Boss Under Attack!',
                  description: `${newChapter.boss_name} took damage!`,
                  data: newChapter,
                },
              })
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, householdId, role])
}
