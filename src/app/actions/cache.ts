'use server'

import { revalidatePath } from 'next/cache'

/**
 * Force Next.js to drop its router cache and server cache for the entire
 * /play layout and all its sub-pages (like /play/profile).
 * Call this from the client after a DB mutation (like finishing a quiz)
 * to ensure the user sees fresh XP/Gold/Stats when they navigate.
 */
export async function revalidatePlayCache() {
  revalidatePath('/play', 'layout')
}
