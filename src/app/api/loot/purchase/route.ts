import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const Schema = z.object({
  itemId: z.string().uuid('itemId must be a valid UUID'),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = Schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { itemId } = result.data

  // Delegate the entire purchase (affordability check + deduction + insert) to
  // a single Postgres transaction via RPC. This eliminates the TOCTOU window
  // and ensures the rollback is handled atomically by the DB.
  const { data, error } = await supabase
    .rpc('purchase_loot_item', {
      p_player_id: user.id,
      p_item_id:   itemId,
    })

  if (error) {
    console.error('[purchase] rpc error:', error)
    return NextResponse.json({ error: 'Purchase failed. Please try again.' }, { status: 500 })
  }

  const result2 = data as {
    error?: string
    purchaseId?: string
    newXpAvailable?: number
    newGold?: number
  }

  if (result2.error) {
    const status =
      result2.error === 'Insufficient funds'     ? 402 :
      result2.error === 'Profile not found'       ? 404 :
      result2.error.includes('not found')         ? 404 : 400
    return NextResponse.json({ error: result2.error }, { status })
  }

  return NextResponse.json({
    purchaseId:     result2.purchaseId,
    newXpAvailable: result2.newXpAvailable,
    newGold:        result2.newGold,
  })
}
