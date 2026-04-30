import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withApiMiddleware } from '@/lib/api/middleware'

/**
 * POST /api/auth/signout
 *
 * Signs the current user out and redirects to /login.
 * POST-only to prevent CSRF sign-out attacks via <img> or link prefetch.
 * Prefer the signOut() server action (src/app/actions/auth.ts) for in-app use.
 */
export async function POST(request: NextRequest) {
  const err = await withApiMiddleware(request, { rateLimit: { maxRequests: 10 }, csrf: true })
  if (err) return err

  const supabase = await createClient()
  await supabase.auth.signOut()
  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}
