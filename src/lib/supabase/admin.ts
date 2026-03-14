import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Service-role Supabase admin client.
 *
 * SECURITY: This client bypasses Row-Level Security.
 * - ONLY use in server-side code (Route Handlers, Server Actions).
 * - NEVER import this in 'use client' components or expose to the browser.
 * - Used exclusively for privileged operations such as creating child accounts.
 */
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'The admin client must only be used server-side.'
    )
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      // Disable session persistence — admin client is stateless
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export a lazily-instantiated singleton to avoid creating a new client
// on every function call while still enforcing server-only instantiation.
let _adminClient: ReturnType<typeof createAdminClient> | null = null

export function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createAdminClient()
  }
  return _adminClient
}
