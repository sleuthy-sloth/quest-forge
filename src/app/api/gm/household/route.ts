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

  if (action === 'reset_player') {
    const { playerId } = body
    if (!playerId) return NextResponse.json({ error: 'Player ID required' }, { status: 400 })

    // Verify player is in the same household
    const { data: target } = await admin
      .from('profiles')
      .select('id')
      .eq('id', playerId)
      .eq('household_id', householdId)
      .eq('role', 'player')
      .single()

    if (!target) return NextResponse.json({ error: 'Player not found in your household' }, { status: 404 })

    // Reset this specific player
    await admin.from('chore_completions').delete().eq('player_id', playerId)
    await admin.from('edu_completions').delete().eq('player_id', playerId)
    await admin.from('purchases').delete().eq('player_id', playerId)
    await admin.from('redemptions').delete().eq('player_id', playerId)
    await admin.from('profiles')
      .update({ 
        xp_total: 0, 
        xp_available: 0, 
        gold: 0, 
        level: 1,
        avatar_config: {} as any,
        story_chapter: 1
      })
      .eq('id', playerId)

    return NextResponse.json({ success: true })
  }

  if (action === 'reset_story') {
    // 1. Delete story progress for the household
    await admin.from('story_progress').delete().eq('household_id', householdId)

    // 2. Reset household story chapters: Restore HP and lock status
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
    // Also reset story_chapter on all profiles in household
    await admin.from('profiles').update({ story_chapter: 1 }).eq('household_id', householdId)

    return NextResponse.json({ success: true })
  }

  if (action === 'reset_progress') {
    // Full wipe (Players + Story)
    // Find all player IDs in this household
    const { data: players } = await admin
      .from('profiles')
      .select('id')
      .eq('household_id', householdId)
      .eq('role', 'player')

    const playerIds = players?.map(p => p.id) || []
    
    if (playerIds.length > 0) {
      await admin.from('chore_completions').delete().in('player_id', playerIds)
      await admin.from('edu_completions').delete().in('player_id', playerIds)
      await admin.from('purchases').delete().in('player_id', playerIds)
      await admin.from('redemptions').delete().in('player_id', playerIds)
      await admin.from('profiles')
        .update({ 
          xp_total: 0, 
          xp_available: 0, 
          gold: 0, 
          level: 1,
          avatar_config: {} as any,
          story_chapter: 1
        })
        .in('id', playerIds)
    }

    await admin.from('story_progress').delete().eq('household_id', householdId)

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
  const targetPlayerId = searchParams.get('playerId')

  const admin = getAdminClient()
  const householdId = profile!.household_id

  if (targetGmId) {
    if (targetGmId === profile!.id) {
      return NextResponse.json({ error: 'You cannot delete your own account here.' }, { status: 400 })
    }

    const { data: target } = await admin
      .from('profiles')
      .select('id')
      .eq('id', targetGmId)
      .eq('household_id', householdId)
      .eq('role', 'gm')
      .single()

    if (!target) return NextResponse.json({ error: 'GM not found in your household' }, { status: 404 })

    const { error: deleteError } = await admin.auth.admin.deleteUser(targetGmId)
    if (deleteError) return NextResponse.json({ error: 'Could not delete GM account.' }, { status: 500 })
    
    return NextResponse.json({ success: true })
  }

  if (targetPlayerId) {
    const { data: target } = await admin
      .from('profiles')
      .select('id')
      .eq('id', targetPlayerId)
      .eq('household_id', householdId)
      .eq('role', 'player')
      .single()

    if (!target) return NextResponse.json({ error: 'Player profile not found in your household' }, { status: 404 })

    const { error: deleteError } = await admin.auth.admin.deleteUser(targetPlayerId)
    if (deleteError) return NextResponse.json({ error: 'Could not delete player account.' }, { status: 500 })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'GM ID or Player ID required' }, { status: 400 })
}
