import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuizInterface from '@/components/games/QuizInterface'

export default async function LogicGatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('age, avatar_config, household_id, display_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0f1e 0%, #040812 100%)',
        paddingBottom: '32px',
      }}
    >
      <QuizInterface
        userId={user.id}
        householdId={profile.household_id}
        subject="logic"
        avatarConfig={profile.avatar_config as Record<string, unknown> | null}
        displayName={profile.display_name}
      />
    </div>
  )
}
