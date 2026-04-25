'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { playSfx } from '@/lib/audio'

interface RedemptionWithDetails {
  id: string
  status: string
  created_at: string
  approved_at: string | null
  player_id: string
  profiles: { display_name: string; username: string } | null
  rewards: { title: string; description: string } | null
}

export default function RedemptionDashboardPage() {
  const [redemptions, setRedemptions] = useState<RedemptionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<Set<string>>(new Set())
  const [celebrating, setCelebrating] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('household_id').eq('id', user.id).single()
      if (!profile) return

      const { data } = await supabase
        .from('redemptions')
        .select(`
          id, status, created_at, approved_at, player_id,
          profiles!player_id ( display_name, username ),
          rewards ( title, description )
        `)
        .eq('household_id', profile.household_id)
        .order('created_at', { ascending: false })

      setRedemptions((data ?? []) as unknown as RedemptionWithDetails[])
      setLoading(false)
    }
    init()
  }, [supabase])

  async function approve(id: string) {
    setProcessing(p => new Set(p).add(id))
    playSfx('click')

    const { error } = await supabase
      .from('redemptions')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setCelebrating(id)
      playSfx('victory')
      setRedemptions(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'approved', approved_at: new Date().toISOString() } : r),
      )
      setTimeout(() => setCelebrating(null), 1500)
    }

    setProcessing(p => { const n = new Set(p); n.delete(id); return n })
  }

  const pendingCount = redemptions.filter(r => r.status === 'pending').length

  return (
    <>
      <style suppressHydrationWarning>{`
        .rd-card {
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 3px;
          padding: 1rem 1.25rem;
          transition: border-color 0.2s;
        }
        .rd-card:hover {
          border-color: rgba(201,168,76,0.22);
        }
        .rd-card.pending {
          border-left: 3px solid rgba(232,160,32,0.6);
        }
        .rd-card.approved {
          border-left: 3px solid rgba(46,184,92,0.5);
        }
        .rd-btn {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          letter-spacing: 0.06em;
          border-radius: 2px;
          padding: 0.4rem 1rem;
          cursor: pointer;
          border: 1px solid;
          transition: all 0.15s;
        }
        .rd-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .rd-btn-approve {
          background: rgba(40,160,90,0.12);
          border-color: rgba(40,160,90,0.35);
          color: rgba(80,200,130,0.9);
        }
        .rd-btn-approve:hover:not(:disabled) { background: rgba(40,160,90,0.22); }
        @keyframes celebrate {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>

      <div className="dash-topbar">
        <span className="dash-page-title">🎁 Voucher Redemptions</span>
        {pendingCount > 0 && (
          <span className="font-pixel text-[0.42rem] px-2 py-1 rounded-sm" style={{
            background: 'rgba(232,160,32,0.12)',
            border: '1px solid rgba(232,160,32,0.3)',
            color: '#e8a020',
            imageRendering: 'pixelated',
          }}>
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="dash-content">
        {loading ? (
          <p className="text-center font-heading text-sm text-[#b09a6e]/40">Loading redemptions...</p>
        ) : redemptions.length === 0 ? (
          <div style={{
            padding: '4rem 2rem', textAlign: 'center',
            background: 'rgba(255,255,255,0.015)',
            border: '1px dashed rgba(201,168,76,0.1)', borderRadius: 3,
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.2 }}>🎁</div>
            <p className="font-heading text-sm text-[#b09a6e]/40">No vouchers have been redeemed yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {redemptions.map(r => {
              const isPending = r.status === 'pending'
              const isApproved = r.status === 'approved'
              const player = r.profiles
              const reward = r.rewards

              return (
                <div key={r.id} className={`rd-card ${isPending ? 'pending' : isApproved ? 'approved' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div>
                      <div className="font-heading text-sm font-semibold text-[#e8f0ff]">
                        {player?.display_name ?? 'Unknown Player'}
                      </div>
                      <div className="font-pixel text-[0.4rem] text-[#b09a6e]/50 mt-0.5" style={{ imageRendering: 'pixelated' }}>
                        {reward?.title ?? 'Unknown Reward'}
                      </div>
                      {reward?.description && (
                        <p className="font-body text-xs text-[#b09a6e]/40 mt-1 italic">{reward.description}</p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      {/* Status badge */}
                      {isPending && (
                        <span className="font-pixel text-[0.4rem] px-2 py-1 rounded-sm" style={{
                          background: 'rgba(232,160,32,0.12)',
                          border: '1px solid rgba(232,160,32,0.3)',
                          color: '#e8a020',
                        }}>
                          PENDING
                        </span>
                      )}
                      {isApproved && (
                        <span className="font-pixel text-[0.4rem] px-2 py-1 rounded-sm" style={{
                          background: 'rgba(46,184,92,0.12)',
                          border: '1px solid rgba(46,184,92,0.3)',
                          color: '#2eb85c',
                        }}>
                          APPROVED ✓
                        </span>
                      )}

                      {/* Approve button */}
                      {isPending && (
                        <button
                          className="rd-btn rd-btn-approve"
                          disabled={processing.has(r.id)}
                          onClick={() => approve(r.id)}
                        >
                          {processing.has(r.id) ? '...' : '✓ Approve'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Celebration animation */}
                  <AnimatePresence>
                    {celebrating === r.id && (
                      <motion.div
                        initial={{ opacity: 1, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="text-center text-4xl mt-2"
                        style={{ imageRendering: 'pixelated' }}
                      >
                        🎉
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
