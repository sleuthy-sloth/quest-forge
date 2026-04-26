'use server'

import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

/**
 * Server action: saves avatar_config and avatar_class to the player's profile.
 * Uses the server-side session (cookie-based) so the auth token is always
 * present, and returns an explicit error if 0 rows are updated (e.g. if RLS
 * silently denies the update).
 */
export async function saveCharacter(
  avatarConfig: Json,
  avatarClass: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated — please log in again.' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_config: avatarConfig, avatar_class: avatarClass })
    .eq('id', user.id)
    .select('id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) {
    return {
      error: 'Profile save failed: permission denied. Try signing out and back in.',
    }
  }

  return {}
}
