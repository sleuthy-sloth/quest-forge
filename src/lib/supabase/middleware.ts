import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the user's auth session and propagates updated cookies.
 * Must be called on every request via src/middleware.ts.
 *
 * Returns both the response (with refreshed cookies) and the authenticated
 * user so the root middleware can make routing decisions without a second
 * round-trip to Supabase.
 */
export async function updateSession(request: NextRequest) {
  // Start with a passthrough response; cookies will be written onto it below.
  let response = NextResponse.next({ request })

  // If the required env vars are missing (e.g. not yet set in Vercel), bail
  // early instead of crashing every route with "Invalid supabaseUrl".
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return { response, user: null, supabase: null }
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Write refreshed tokens onto both the request and response so that
          // downstream Server Components see the updated session.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT with the Supabase Auth server and
  // triggers a token refresh if the access token is expired.
  // Never rely on getSession() here — it only reads from the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user, supabase }
}
