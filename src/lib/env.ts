import { z } from 'zod'

/**
 * Runtime environment variable validation.
 * Fails fast at startup with a clear message if critical env vars are missing.
 */

const envSchema = z.object({
  // ── Supabase (public) ──────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // ── Supabase (server-side) ─────────────────────────────────
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // ── AI Provider ────────────────────────────────────────────
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),

  // ── Sprite Assets ──────────────────────────────────────────
  NEXT_PUBLIC_SPRITE_BASE_URL: z.string().url('NEXT_PUBLIC_SPRITE_BASE_URL must be a valid URL').optional(),
})

/**
 * Parsed and validated environment variables.
 * Access via `env.NEXT_PUBLIC_SUPABASE_URL`, etc.
 * Throws on startup (with a descriptive message) if any required vars are missing.
 */
export const env = (() => {
  try {
    return envSchema.parse(process.env)
  } catch (err) {
    if (err instanceof z.ZodError) {
      const missing = err.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n')

      // Only throw if we're actually on the server (not during prerendering)
      if (typeof window === 'undefined') {
        console.error(
          `\n❌ Environment variable validation failed:\n${missing}\n\n` +
          `Check your .env.local file and ensure all required variables are set.\n`
        )
      }

      // Return partial env with empty strings for missing vars so the app
      // doesn't crash during static generation (pages that need env will fail
      // gracefully with a meaningful error).
      const partial: Record<string, string> = {}
      for (const key of Object.keys(process.env)) {
        partial[key] = process.env[key] ?? ''
      }
      return partial as z.infer<typeof envSchema>
    }
    throw err
  }
})()

/**
 * Check if the AI provider is configured. Returns true if OPENROUTER_API_KEY is set.
 */
export function isAiConfigured(): boolean {
  return !!env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY.length > 0
}