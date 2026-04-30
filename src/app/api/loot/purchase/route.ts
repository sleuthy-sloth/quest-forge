import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withApiMiddleware } from '@/lib/api/middleware'

const Schema = z.object({
  itemId: z.string().uuid('itemId must be a valid UUID'),
})

export async function POST(req: NextRequest) {
  const err = await withApiMiddleware(req, { rateLimit: { maxRequests: 20 }, csrf: true })
  if (err) return err

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = Schema.safeParse(body)
  if (!result.success) {
    const issue = result.error.issues[0]
    const field = issue.path.join('.')
    const friendly = field
      ? `${field}: ${issue.message}`
      : issue.message
    return NextResponse.json({ error: friendly }, { status: 400 })
  }

  const { itemId } = result.data

  // Delegate the entire purchase (affordability check + deduction + insert) to
  // a single Postgres transaction via RPC. This eliminates the TOCTOU window
  // and ensures the rollback is handled atomically by the DB.
  const { data, error } = await supabase
    .rpc('purchase_reward', {
      p_player_id: user.id,
      p_reward_id: itemId,
    })

  if (error) {
    console.error('[purchase] rpc error:', error)
    return NextResponse.json({ error: 'Purchase failed. Please try again.' }, { status: 500 })
  }

  const resData = data as {
    error?: string
    redemptionId?: string
    newXpAvailable?: number
    newGold?: number
  }

  if (resData.error) {
    const status =
      resData.error === 'Insufficient funds'     ? 402 :
      resData.error === 'Profile not found'       ? 404 :
      resData.error.includes('not found')         ? 404 : 400
    return NextResponse.json({ error: resData.error }, { status })
  }

  return NextResponse.json({
    redemptionId:   resData.redemptionId,
    newXpAvailable: resData.newXpAvailable,
    newGold:        resData.newGold,
  })
}
