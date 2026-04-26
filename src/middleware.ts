import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/play']

// Routes only accessible when NOT authenticated.
// Note: /forgot-password and /reset-password are intentionally NOT listed
// here. /auth/callback establishes a recovery session before redirecting
// to /reset-password, so the user is authenticated by the time they
// submit a new password — gating those routes would break the flow.
const AUTH_ONLY_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, user, supabase } = await updateSession(request)

  // Env vars missing (supabase is null) → skip auth gating so public pages
  // render.  Protected routes will naturally 500 without a DB, but that's
  // better than every route crashing before it can even serve an error page.
  if (!supabase) return response

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  const isAuthOnly = AUTH_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // Unauthenticated user hitting a protected route → redirect to /login
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user hitting login/signup → redirect to their home
  if (isAuthOnly && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = profile?.role === 'gm' ? '/dashboard' : '/play'
    homeUrl.search = ''
    return NextResponse.redirect(homeUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public assets (sprites, audio, images)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sprites/|audio/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
