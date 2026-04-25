import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * GET /auth/callback
 *
 * Exchanges a Supabase PKCE recovery/verification code for a session.
 * Cookies are written directly onto the redirect response so they reach
 * the browser — using cookieStore.set() would attach them to the current
 * request's implicit response, which is discarded when we return a new
 * NextResponse.redirect().
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  if (code) {
    const redirectResponse = NextResponse.redirect(`${origin}${safeNext}`)

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirectResponse
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
