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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (typeof window === 'undefined') {
      // SSR/prerender without env vars: return a stub. Method calls become
      // no-ops; await on them yields harmless empty results so React trees
      // can render to HTML during `next build`.
      return makeStubClient() as unknown as SupabaseClient
    }
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
