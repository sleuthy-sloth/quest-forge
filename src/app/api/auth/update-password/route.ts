import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withApiMiddleware } from '@/lib/api/middleware'

const Schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
})

/**
 * POST /api/auth/update-password
 *
 * Server-side password update for the recovery flow. The client (on a
 * possibly slow mobile network) just fires a single short fetch; the
 * actual call to Supabase happens from Vercel's network where it is
 * fast and reliable.
 */
export async function POST(request: Request) {
  const err = await withApiMiddleware(request, { rateLimit: { maxRequests: 5 }, csrf: true })
  if (err) return err

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = Schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('[update-password] no active session:', userError)
    return NextResponse.json(
      { error: 'Your recovery session has expired. Request a new recovery link.' },
      { status: 401 }
    )
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: result.data.password,
  })

  if (updateError) {
    console.error('[update-password] updateUser failed:', updateError)
    const status =
      typeof updateError.status === 'number' && updateError.status >= 400
        ? updateError.status
        : 500
    return NextResponse.json(
      { error: updateError.message || 'Could not update password.' },
      { status }
    )
  }

  return NextResponse.json({ success: true })
}
