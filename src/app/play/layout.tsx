import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PhoneShell } from '@/components/qf'
import { signOut } from '@/app/actions/auth'

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
    .select('role, gold, avatar_class, households(name)')
    .eq('id', user.id)
    .single<{
      role: 'gm' | 'player'
      gold: number | null
      avatar_class: string | null
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

  const householdName = Array.isArray(profile.households)
    ? profile.households[0]?.name
    : profile.households?.name

  return (
    <PhoneShell
      statusbarTitle={householdName || 'Hearthhold'}
      goldDisplay={profile.gold ?? 0}
      avatarClass={profile.avatar_class}
    >
      {children}
    </PhoneShell>
  )
}
