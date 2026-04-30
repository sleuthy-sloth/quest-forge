import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StoryDashboard } from '@/components/dashboard/StoryDashboard'

export const metadata = {
  title: 'Story Management | Quest Forge',
  description: 'Manage your household\'s weekly story progression and unlock chapters.',
}

export default async function StoryDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Server-side fetch for story summary stats
  const { data: chapters } = await supabase
    .from('story_chapters')
    .select('id, title, is_unlocked, week_number')
    .eq('household_id', profile.household_id)
    .order('week_number', { ascending: true })

  const unlockedCount = chapters?.filter(c => c.is_unlocked).length ?? 0
  const totalCount = chapters?.length ?? 0

  return (
    <div>
      {/* Server-rendered summary banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 20px',
        marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(26,20,12,0.8), rgba(18,14,8,0.8))',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: 4,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(201,168,76,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}>
          📖
        </div>
        <div style={{ flex: 1 }}>
          <div className="font-pixel" style={{ fontSize: 8, color: 'var(--qf-parchment-muted)', letterSpacing: '0.15em', marginBottom: 2 }}>
            CAMPAIGN PROGRESS
          </div>
          <div className="font-heading" style={{ fontSize: 15, color: 'var(--qf-parchment)' }}>
            {unlockedCount} of {totalCount} Chapters Unlocked
          </div>
        </div>
        <div style={{
          width: 120,
          height: 6,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 3,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div style={{
            width: totalCount > 0 ? `${(unlockedCount / totalCount) * 100}%` : '0%',
            height: '100%',
            background: 'linear-gradient(90deg, #c9a84c, #e8c84c)',
            borderRadius: 3,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      <StoryDashboard />
    </div>
  )
}