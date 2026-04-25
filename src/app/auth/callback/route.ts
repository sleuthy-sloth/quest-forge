import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /auth/callback
 *
 * Exchanges a Supabase PKCE recovery/verification code for a session,
 * then redirects to the `next` path (default: /dashboard). On any
 * failure, sends the user back to /login with an error flag so the
 * login page can surface a clear message.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
    console.error('[auth/callback] exchangeCodeForSession failed:', {
      message: error.message,
      status: error.status,
      name: error.name,
    })
  } else {
    console.error('[auth/callback] missing code param', { url: request.url })
  }

  return NextResponse.redirect(`${origin}/login?error=recovery_link_invalid`)
}
