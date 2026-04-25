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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name, household_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gm') redirect('/play')

  const { data: household } = await supabase
    .from('households')
    .select('name')
    .eq('id', profile.household_id)
    .single()

  return (
    <DashboardShell
      householdName={household?.name ?? ''}
      displayName={profile.display_name}
    >
      {children}
    </DashboardShell>
  )
}
