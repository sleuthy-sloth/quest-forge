import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuestsClient from '@/components/quests/QuestsClient'

export default async function QuestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, avatar_config')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <QuestsClient
      userId={user.id}
      householdId={profile.household_id as string}
      initialAvatarConfig={profile.avatar_config as Record<string, unknown> | null}
    />
  )
}
