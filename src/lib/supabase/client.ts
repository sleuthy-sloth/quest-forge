import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>

let cached: SupabaseClient | null = null

/**
 * Browser (client-side) Supabase client.
 *
 * On the client we always create a real client (and cache it). During
 * Next.js static page generation env vars may not be inlined yet — in
 * that narrow window we hand back a no-op proxy that lets prerender
 * complete without throwing. The real client, with real env vars, takes
 * over the moment hydration runs in the browser.
 */
export function createClient(): SupabaseClient {
  if (cached) return cached

  // During SSR (next build / prerender), always use a stub. The real
  // browser client is created on hydration where env vars are available
  // and the browser APIs (URL, cookies) are present.
  if (typeof window === 'undefined') {
    return makeStubClient() as unknown as SupabaseClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase client is misconfigured: NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.'
    )
  }

  cached = createBrowserClient<Database>(url, key)
  return cached
}

function makeStubClient() {
  const noop: () => Promise<{ data: null; error: null }> = () =>
    Promise.resolve({ data: null, error: null })

  const authStub = {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: noop,
    signOut: noop,
    updateUser: noop,
    resetPasswordForEmail: noop,
    exchangeCodeForSession: noop,
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => undefined } },
    }),
  }

  return new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      if (prop === 'auth') return authStub
      // .from(), .rpc(), etc. — return chainable no-ops.
      return () =>
        new Proxy(
          {},
          {
            get: () => () =>
              Promise.resolve({ data: null, error: null }),
          }
        )
    },
  })
}
