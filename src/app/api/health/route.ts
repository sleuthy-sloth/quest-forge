import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/health
 *
 * Lightweight health-check endpoint for deploy verification.
 * Returns the status of critical service dependencies:
 *   - Supabase connectivity (via a trivial query)
 *   - AI provider config presence (OPENROUTER_API_KEY set)
 *   - Server timestamp
 *
 * This endpoint deliberately does NOT require authentication so that
 * external monitoring tools (Vercel, UptimeRobot, etc.) can reach it.
 */
export async function GET() {
  const checks: Record<string, string> = {}
  let allHealthy = true

  // ── 1. Supabase ──────────────────────────────────────────────────────
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('households').select('id', { count: 'exact', head: true }).limit(1)
    checks.supabase = error ? `unhealthy: ${error.message}` : 'healthy'
    if (error) allHealthy = false
  } catch (err) {
    checks.supabase = `error: ${err instanceof Error ? err.message : 'unknown'}`
    allHealthy = false
  }

  // ── 2. AI Provider ───────────────────────────────────────────────────
  const hasAiKey = !!process.env.OPENROUTER_API_KEY
  checks.openrouter = hasAiKey ? 'configured' : 'missing (AI generation disabled)'

  // ── 3. Build info ────────────────────────────────────────────────────
  const timestamp = new Date().toISOString()

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp,
      checks,
    },
    { status: allHealthy ? 200 : 503 },
  )
}
