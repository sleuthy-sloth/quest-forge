import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GMShell } from '@/components/qf'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Profile + household name + active boss in one round-trip-ish chunk.
  // The boss preview powers the sidebar widget; an empty result just hides it.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name, household_id, households(name)')
    .eq('id', user.id)
    .single<{
      role: 'gm' | 'player'
      display_name: string
      household_id: string
      households: { name: string } | { name: string }[] | null
    }>()

  if (!profile || profile.role !== 'gm') redirect('/play')

  const householdName = Array.isArray(profile.households)
    ? profile.households[0]?.name ?? ''
    : profile.households?.name ?? ''

  // Active boss — is_unlocked=false while the battle is in progress.
  const { data: boss } = await supabase
    .from('story_chapters')
    .select('boss_name, boss_hp, boss_current_hp')
    .eq('household_id', profile.household_id)
    .eq('is_unlocked', false)
    .gt('boss_current_hp', 0)
    .order('week_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const weeklyBoss = boss && boss.boss_name
    ? {
        name: boss.boss_name,
        current: boss.boss_current_hp ?? boss.boss_hp ?? 0,
        max: boss.boss_hp ?? 1,
        hpPct: Math.round(((boss.boss_current_hp ?? boss.boss_hp) / (boss.boss_hp || 1)) * 100),
      }
    : null

  return (
    <GMShell
      householdName={householdName}
      displayName={profile.display_name}
      weeklyBoss={weeklyBoss}
    >
      {children}
    </GMShell>
  )
}
