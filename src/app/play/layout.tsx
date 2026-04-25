import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlayShell } from '@/components/play/PlayShell'
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
    .select('role, display_name, level, avatar_class')
    .eq('id', user.id)
    .single()

  // Do NOT redirect to /login directly — the middleware would loop an authenticated
  // user straight back to /play. Call signOut() to clear the session first.
  if (!profile) {
    await signOut()
    redirect('/login') // unreachable; satisfies TypeScript narrowing
  }
  if (profile.role !== 'player') redirect('/dashboard')

  return (
    <PlayShell
      displayName={profile.display_name}
      level={profile.level ?? 1}
      avatarClass={profile.avatar_class ?? null}
    >
      {children}
    </PlayShell>
  )
}
