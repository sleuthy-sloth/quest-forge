import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

async function verifyGm() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401, profile: null, supabase: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, household_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') {
    return { error: 'Forbidden: Only GMs can perform household management', status: 403, profile: null, supabase: null }
  }

  return { error: null, status: null, profile, supabase }
}

export async function POST(request: Request) {
  const { error, status, profile } = await verifyGm()
  if (error) return NextResponse.json({ error }, { status: status! })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { action } = body
  const admin = getAdminClient()
  const householdId = profile!.household_id

  if (action === 'reset_progress') {
    // Find all player IDs in this household
    const { data: players } = await admin
      .from('profiles')
      .select('id')
      .eq('household_id', householdId)
      .eq('role', 'player')

    const playerIds = players?.map(p => p.id) || []
    
    // 1. Delete all completions and logs for these players
    if (playerIds.length > 0) {
      await admin.from('chore_completions').delete().in('player_id', playerIds)
      await admin.from('edu_completions').delete().in('player_id', playerIds)
      await admin.from('purchases').delete().in('player_id', playerIds)
      await admin.from('redemptions').delete().in('player_id', playerIds)
      
      // 2. Reset player stats
      await admin.from('profiles')
        .update({ 
          xp_total: 0, 
          xp_available: 0, 
          gold: 0, 
          level: 1,
          avatar_config: {} as any, // Reset to empty object instead of null if it's Json
          story_chapter: 1
        })
        .in('id', playerIds)
    }

    // 3. Delete story progress for the household
    await admin.from('story_progress').delete().eq('household_id', householdId)

    // 4. Reset household story chapters: Restore HP and lock status
    const { data: chapters } = await admin
      .from('story_chapters')
      .select('id, boss_hp')
      .eq('household_id', householdId)

    if (chapters && chapters.length > 0) {
      for (const ch of chapters) {
        await admin.from('story_chapters')
          .update({
            boss_current_hp: ch.boss_hp,
            is_unlocked: false,
            rewards_claimed: false
          })
          .eq('id', ch.id)
      }
    }
    
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function DELETE(request: Request) {
  const { error, status, profile } = await verifyGm()
  if (error) return NextResponse.json({ error }, { status: status! })

  const { searchParams } = new URL(request.url)
  const targetGmId = searchParams.get('gmId')

  if (!targetGmId) return NextResponse.json({ error: 'GM ID required' }, { status: 400 })

  // Can't delete yourself
  if (targetGmId === profile!.id) {
    return NextResponse.json({ error: 'You cannot delete your own account here.' }, { status: 400 })
  }

  // Verify target is in the same household and is a GM
  const admin = getAdminClient()
  const { data: target } = await admin
    .from('profiles')
    .select('id')
    .eq('id', targetGmId)
    .eq('household_id', profile!.household_id)
    .eq('role', 'gm')
    .single()

  if (!target) {
    return NextResponse.json({ error: 'GM not found in your household' }, { status: 404 })
  }

  // Delete the GM
  const { error: deleteError } = await admin.auth.admin.deleteUser(targetGmId)

  if (deleteError) {
    console.error('[household DELETE] failed:', deleteError)
    return NextResponse.json({ error: 'Could not delete GM account.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
