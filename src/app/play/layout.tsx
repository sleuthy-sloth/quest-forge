import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlayShell } from '@/components/play/PlayShell'
import { signOut } from '@/app/actions/auth'
import LevelUpCelebration from '@/components/player/LevelUpCelebration'

export default async function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, gold, display_name, level, avatar_class, household_id, households(name)')
    .eq('id', user.id)
    .single<{
      id: string
      display_name: string
      level: number
      role: 'gm' | 'player'
      gold: number | null
      avatar_class: string | null
      household_id: string
      households: { name: string } | { name: string }[] | null
    }>()

  // Do NOT redirect to /login directly — the middleware would loop an
  // authenticated user straight back to /play. Sign out first to clear
  // the session.
  if (!profile) {
    await signOut()
    redirect('/login') // unreachable; satisfies TypeScript narrowing
  }
  if (profile.role !== 'player') redirect('/dashboard')

  return (
    <PlayShell
      displayName={profile.display_name || 'Hero'}
      level={profile.level || 1}
      gold={profile.gold || 0}
      avatarClass={profile.avatar_class}
      userId={profile.id}
      householdId={profile.household_id}
      role={profile.role}
    >
      {children}
      <Suspense fallback={null}>
        <LevelUpCelebration avatarClass={profile.avatar_class} />
      </Suspense>
    </PlayShell>
  )
}
