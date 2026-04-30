import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { derivePlayerPreset } from '@/lib/constants/academy'

const QuizInterface = dynamic(() => import('@/components/games/QuizInterface'), {
  loading: () => <div className="min-h-[80vh] flex items-center justify-center text-[#c9a84c]/40 font-pixel text-xs tracking-widest animate-pulse">Opening the tome...</div>,
  ssr: true,
})

export default async function ReadingTomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('age, avatar_class, avatar_config, household_id, display_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (!profile.avatar_class) redirect('/play/create-character')

  const playerPreset = derivePlayerPreset(profile.avatar_class)

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
        subject="reading"
        avatarConfig={profile.avatar_config as Record<string, unknown> | null}
        displayName={profile.display_name}
        playerPreset={playerPreset}
      />
    </div>
  )
}
