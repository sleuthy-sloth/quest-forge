import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlayShell } from '@/components/play/PlayShell'

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
    .select('role, display_name, level')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role !== 'player') redirect('/dashboard')

  return (
    <PlayShell displayName={profile.display_name} level={profile.level ?? 1}>
      {children}
    </PlayShell>
  )
}
