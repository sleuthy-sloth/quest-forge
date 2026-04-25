import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile + household in a single PostgREST round-trip via the
  // foreign-key relation rather than two sequential SELECTs.
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

  return (
    <DashboardShell
      householdName={householdName}
      displayName={profile.display_name}
    >
      {children}
    </DashboardShell>
  )
}
