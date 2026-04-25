'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { QuestRow } from '@/types/shop'

const SPRITE_MAP: Record<string, string> = {
  demon: '👹',
  dragon: '🐉',
  slime: '🟢',
}

const DIFF_COLORS: Record<string, string> = {
  easy: '#2eb85c',
  medium: '#4d8aff',
  hard: '#b060e0',
}

export default function QuestListPage() {
  const [quests, setQuests] = useState<QuestRow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: profile } = await supabase
        .from('profiles').select('household_id').eq('id', user.id).single()
      if (!profile) { setLoading(false); return }

      const { data } = await supabase
        .from('quests')
        .select('*')
        .eq('household_id', profile.household_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setQuests((data ?? []) as unknown as QuestRow[])
      setLoading(false)
    }
    load()
  }, [supabase])

  return (
    <>
      <div className="dash-topbar">
        <span className="dash-page-title">⚔ Active Quests</span>
        <Link
          href="/dashboard/quests/new"
          className="text-[0.65rem] font-heading tracking-wider text-[#c9a84c]/80 hover:text-[#c9a84c] uppercase transition-colors px-3 py-1.5 border border-[#c9a84c]/30 rounded-sm"
        >
          + New Quest
        </Link>
      </div>

      <div className="dash-content">
        {loading ? (
          <p className="text-center font-heading text-sm text-[#b09a6e]/40">Loading quests...</p>
        ) : quests.length === 0 ? (
          <div style={{
            padding: '4rem 2rem', textAlign: 'center',
            background: 'rgba(255,255,255,0.015)',
            border: '1px dashed rgba(201,168,76,0.1)', borderRadius: 3,
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.2 }}>⚔</div>
            <p className="font-heading text-sm text-[#b09a6e]/60 mb-4">No active quests</p>
            <Link
              href="/dashboard/quests/new"
              className="font-heading text-xs text-[#c9a84c]/70 hover:text-[#c9a84c] uppercase tracking-wider border border-[#c9a84c]/30 px-4 py-2 rounded-sm transition-colors"
            >
              Forge a New Quest
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {quests.map(q => {
              const diffColor = DIFF_COLORS[q.difficulty] ?? '#4d8aff'
              const bossHpPct = q.is_boss && q.boss_health && q.boss_current_health != null
                ? Math.round((q.boss_current_health / q.boss_health) * 100)
                : null

              return (
                <div key={q.id} style={{
                  background: 'rgba(255,255,255,0.022)',
                  border: '1px solid rgba(201,168,76,0.1)',
                  borderRadius: 3, padding: '0.85rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                  {/* Boss emoji or difficulty dot */}
                  <div className="text-2xl [image-rendering:pixelated]">
                    {q.is_boss && q.boss_sprite ? SPRITE_MAP[q.boss_sprite] ?? '👹' : '✦'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="font-heading text-sm font-semibold text-[#e8f0ff]">{q.title}</span>
                      <span className="font-pixel text-[0.4rem] px-1.5 py-0.5 rounded-sm" style={{
                        background: `${diffColor}18`, border: `1px solid ${diffColor}44`, color: diffColor,
                      }}>
                        {q.difficulty}
                      </span>
                      {q.is_boss && (
                        <span className="font-pixel text-[0.4rem] px-1.5 py-0.5 rounded-sm" style={{
                          background: 'rgba(200,60,60,0.12)', border: '1px solid rgba(200,60,60,0.3)', color: '#e06868',
                        }}>
                          BOSS
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-pixel text-[0.4rem] text-[#c9a84c]/70">+{q.xp_reward} xp</span>
                      {q.gold_reward > 0 && (
                        <span className="font-pixel text-[0.4rem] text-[#f0c84c]/70">+{q.gold_reward} gp</span>
                      )}
                      {q.assigned_to && <span className="font-body text-xs text-[#b09a6e]/50">⚔ assigned</span>}
                    </div>
                    {bossHpPct != null && (
                      <div className="mt-2">
                        <div className="h-2 bg-[#0a0614] rounded-sm border border-[#5a3a1a]/40 overflow-hidden">
                          <div className="h-full rounded-sm transition-all duration-500" style={{
                            width: `${bossHpPct}%`,
                            background: bossHpPct > 60 ? '#2eb85c' : bossHpPct > 30 ? '#e8a020' : '#e84040',
                          }} />
                        </div>
                        <span className="font-pixel text-[0.35rem] text-[#b09a6e]/40 mt-0.5 block">
                          {q.boss_current_health}/{q.boss_health} HP
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
