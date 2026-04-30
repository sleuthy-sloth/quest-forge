'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useQuestStore } from '@/store/useQuestStore'
import { playSfx } from '@/lib/audio'
import type { RewardRow } from '@/types/shop'
import { ICON_GLYPHS } from '@/types/shop'

interface ShopModalProps {
  open: boolean
  onClose: () => void
}

const STALL_COLORS = [
  'from-[#4a1a0a] via-[#2e1006] to-[#1a0a04]',
  'from-[#1a2e0a] via-[#0e1a06] to-[#0a1204]',
  'from-[#0a1a2e] via-[#061426] to-[#040a12]',
]

export default function ShopModal({ open, onClose }: ShopModalProps) {
  const householdId = useQuestStore((s) => s.householdId)
  const gold = useQuestStore((s) => s.gold)
  const playerId = useQuestStore((s) => s.playerId)
  const purchaseReward = useQuestStore((s) => s.purchaseReward)

  const [rewards, setRewards] = useState<RewardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hId = householdId
    if (!open || !hId) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('rewards')
        .select('id, household_id, title, description, cost_gold, cost_xp, icon_type, reward_type, created_at')
        .eq('household_id', hId)
        .order('cost_gold', { ascending: true })

      if (!cancelled) {
        if (err) {
          setError(err.message)
          setRewards([])
        } else {
          setRewards((data ?? []) as unknown as RewardRow[])
        }
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
     
  }, [open, householdId])

  async function handleBuy(rewardId: string) {
    playSfx('click')
    setBuyingId(rewardId)

    const { success, error: buyError } = await purchaseReward(rewardId)

    setBuyingId(null)
    if (success) {
      setRewards((prev) => prev.filter((r) => r.id !== rewardId))
    } else if (buyError) {
      setError(buyError)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="shop-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="shop-modal"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 top-12 z-50 flex flex-col
              mx-auto max-w-2xl bg-[#0a0614] border-4 border-[#5a3a1a]
              shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div
              className="relative flex items-center justify-between px-4 py-3
                border-b-4 border-[#5a3a1a] bg-[#1a0e04]"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r
                  from-[#c9a84c]/40 via-[#c9a84c]/10 to-[#c9a84c]/40"
              />
              <h2
                className="text-[#c9a84c] text-lg"
                style={{ fontFamily: 'var(--font-heading), serif' }}
              >
                The Ember Merchant
              </h2>
              <button
                onClick={() => { playSfx('click'); onClose() }}
                className="w-8 h-8 flex items-center justify-center font-mono
                  text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors
                  border border-[#c9a84c]/20 hover:border-[#c9a84c]/50"
                aria-label="Close shop"
              >
                ✕
              </button>
            </div>

            {/* Gold counter */}
            <div className="flex items-center gap-2 px-4 py-2
              border-b-2 border-[#5a3a1a]/50 bg-[#0e0a14]">
              <span className="font-mono text-[0.65rem] text-[#c9a84c]">
                Gold: {gold}
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" className="block [image-rendering:pixelated]" aria-hidden="true">
                <circle cx="7" cy="7" r="6" fill="#f0c84c" stroke="#000" strokeWidth="1.5" />
                <text x="7" y="10" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#000">G</text>
              </svg>
            </div>

            {/* Item grid */}
            <div className="flex-1 overflow-y-auto p-4 grid gap-3
              grid-cols-2 sm:grid-cols-3">
              {loading ? (
                <p className="col-span-full text-center text-[#b09a6e]/40 font-mono text-sm">
                  Loading wares...
                </p>
              ) : error ? (
                <p className="col-span-full text-center text-[#e05555]/60 font-mono text-sm">
                  {error}
                </p>
              ) : rewards.length === 0 ? (
                <p className="col-span-full text-center text-[#b09a6e]/40 font-mono text-sm">
                  No wares today. Check back later.
                </p>
              ) : (
                rewards.map((reward, i) => {
                  const canAfford = gold >= reward.cost_gold
                  const isBuying = buyingId === reward.id

                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                      whileHover={canAfford ? { scale: 1.02, rotateY: 2, rotateX: -2 } : {}}
                      className={`p-3 border-2 flex flex-col items-center text-center gap-2
                        bg-gradient-to-b ${STALL_COLORS[i % STALL_COLORS.length]}
                        ${canAfford
                          ? 'border-[#5a3a1a] hover:border-[#c9a84c]/60'
                          : 'border-[#3a2a1a]/50 grayscale-[0.7] opacity-60'
                        }
                        shadow-[4px_4px_0px_0px_rgba(0,0,0,0.6)]
                        [image-rendering:pixelated]`}
                      style={{ transformStyle: 'preserve-3d', perspective: 400 }}
                    >
                      {/* Icon */}
                      <span className="text-2xl leading-none select-none [image-rendering:pixelated]">
                        {ICON_GLYPHS[reward.icon_type] ?? '📦'}
                      </span>

                      {/* Title */}
                      <h3
                        className="text-[0.7rem] font-bold leading-tight text-[#d4b0ff]"
                        style={{ fontFamily: 'var(--font-heading), serif' }}
                      >
                        {reward.title}
                      </h3>

                      {/* Description */}
                      <p className="text-[0.55rem] text-[#b09a6e]/60 leading-tight">
                        {reward.description}
                      </p>

                      {/* Reward type badge */}
                      <span className={`font-pixel text-[0.35rem] px-1.5 py-0.5 rounded-sm uppercase ${
                        (reward as { reward_type?: string }).reward_type === 'real_world'
                          ? 'text-[#e8a020] bg-[#e8a020]/10 border border-[#e8a020]/20'
                          : 'text-[#4d8aff] bg-[#4d8aff]/10 border border-[#4d8aff]/20'
                      }`}>
                        {(reward as { reward_type?: string }).reward_type === 'real_world' ? '🎁 Real' : '💠 Digital'}
                      </span>

                      {/* Price + Buy */}
                      <div className="mt-auto w-full flex items-center justify-between">
                        <span
                          className={`font-mono text-[0.6rem] font-bold
                            ${canAfford ? 'text-[#f0c84c]' : 'text-[#a08060]/60'}`}
                        >
                          {reward.cost_gold}G
                        </span>
                        <button
                          onClick={() => handleBuy(reward.id)}
                          disabled={!canAfford || isBuying}
                          className={`px-2 py-0.5 text-[0.5rem] font-mono tracking-wider uppercase
                            border transition-colors [image-rendering:pixelated]
                            ${canAfford
                              ? 'border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10 active:scale-95'
                              : 'border-[#3a2a1a]/30 text-[#5a4a3a]/40 cursor-not-allowed'
                            }`}
                        >
                          {isBuying ? '...' : 'Buy'}
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
