import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { itemId?: string }
  if (!body.itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })

  // Fetch player profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, xp_available, gold')
    .eq('id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Fetch item — must belong to same household and be available
  const { data: item } = await supabase
    .from('loot_store_items')
    .select('id, name, cost_xp, cost_gold, is_available')
    .eq('id', body.itemId)
    .eq('household_id', profile.household_id)
    .single()
  if (!item || !item.is_available) {
    return NextResponse.json({ error: 'Item not found or unavailable' }, { status: 404 })
  }

  // Check affordability
  if (profile.xp_available < item.cost_xp || profile.gold < item.cost_gold) {
    return NextResponse.json({ error: 'Insufficient funds' }, { status: 402 })
  }

  // Deduct currencies — the .gte() guards prevent deducting below zero
  // in a concurrent scenario (TOCTOU mitigation)
  const { data: updated, error: updateErr } = await supabase
    .from('profiles')
    .update({
      xp_available: profile.xp_available - item.cost_xp,
      gold:         profile.gold         - item.cost_gold,
    })
    .eq('id', user.id)
    .gte('xp_available', item.cost_xp)
    .gte('gold',         item.cost_gold)
    .select('xp_available, gold')
    .single()

  if (updateErr || !updated) {
    return NextResponse.json({ error: 'Purchase failed — balance changed, please retry' }, { status: 409 })
  }

  // Create purchase record
  const { data: purchase, error: purchaseErr } = await supabase
    .from('purchases')
    .insert({
      item_id:      item.id,
      player_id:    user.id,
      household_id: profile.household_id,
    })
    .select('id, item_id, purchased_at, redeemed, redeemed_at')
    .single()

  if (purchaseErr || !purchase) {
    // Best-effort rollback: restore currencies
    await supabase
      .from('profiles')
      .update({ xp_available: profile.xp_available, gold: profile.gold })
      .eq('id', user.id)
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 })
  }

  return NextResponse.json({
    newXpAvailable: updated.xp_available,
    newGold:        updated.gold,
    purchase,
  })
}
