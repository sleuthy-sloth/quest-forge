import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { seedStoryChaptersForHousehold } from '@/lib/story/seed-chapters'

/**
 * POST /api/admin/seed-story
 *
 * One-time backfill: populates story_chapters for the calling GM's household
 * from src/lore/bosses.json (52 weeks). Idempotent — refuses to seed when
 * existing chapters are present, so it's safe to call multiple times.
 *
 * Used by households that signed up before automatic seeding was added in
 * /api/auth/signup-gm. New households are seeded at signup and never need
 * this route.
 */
export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, household_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
  }

  if (profile.role !== 'gm') {
    return NextResponse.json({ error: 'Only Game Masters can run this.' }, { status: 403 })
  }

  let admin
  try {
    admin = getAdminClient()
  } catch {
    return NextResponse.json(
      { error: 'Server configuration error: admin client unavailable.' },
      { status: 500 },
    )
  }

  const { count, error: countError } = await admin
    .from('story_chapters')
    .select('id', { count: 'exact', head: true })
    .eq('household_id', profile.household_id)

  if (countError) {
    console.error('[seed-story] count failed:', countError)
    return NextResponse.json({ error: 'Could not check existing chapters.' }, { status: 500 })
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { skipped: true, existing: count, message: 'Story chapters already exist for this household.' },
      { status: 200 },
    )
  }

  try {
    await seedStoryChaptersForHousehold(admin, profile.household_id)
  } catch (err) {
    console.error('[seed-story] seed failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Seed failed.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, seeded: 52 }, { status: 201 })
}
