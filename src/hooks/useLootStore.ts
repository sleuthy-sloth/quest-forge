'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LootCategory = 'real_reward' | 'cosmetic' | 'power_up' | 'story_unlock'

export interface LootItem {
  id: string
  name: string
  description: string
  flavor_text: string
  cost_xp: number
  cost_gold: number
  category: LootCategory
  real_reward_description: string
  sprite_icon: string | null
}

export interface UseLootStoreResult {
  /** All available items in the household's store. */
  items: LootItem[]
  /** True during initial fetch. */
  loading: boolean
  /** Human-readable error, or null. */
  error: string | null
  /** Player's spendable XP. */
  xpAvailable: number
  /** Player's gold. */
  gold: number
  /** Whether a purchase is in progress. */
  purchasing: boolean
  /** Refreshes items and currency from the database. */
  refresh: () => Promise<void>
  /** Purchase an item. Optimistically deducts gold, then syncs via the API. */
  purchaseItem: (itemId: string) => Promise<{
    success: boolean
    error: string | null
    newXpAvailable: number
    newGold: number
  }>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLootStore(): UseLootStoreResult {
  const supabase = createClient()
  const mountedRef = useRef(true)

  const [items, setItems] = useState<LootItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [xpAvailable, setXpAvailable] = useState(0)
  const [gold, setGold] = useState(0)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => { return () => { mountedRef.current = false } }, [])

  // ── Refresh fetch ──────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('household_id, xp_available, gold')
        .eq('id', user.id)
        .single()
      if (!profile) {
        setLoading(false)
        return
      }

      setXpAvailable(profile.xp_available)
      setGold(profile.gold)

      const { data: itemData, error: itemErr } = await supabase
        .from('loot_store_items')
        .select(
          'id, name, description, flavor_text, cost_xp, cost_gold, ' +
          'category, real_reward_description, sprite_icon',
        )
        .eq('household_id', profile.household_id)
        .eq('is_available', true)
        .order('cost_xp', { ascending: true })

      if (itemErr) throw new Error(itemErr.message)

      if (mountedRef.current) {
        setItems((itemData as unknown as LootItem[]) ?? [])
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load store')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [supabase])

  // ── Initial load ───────────────────────────────────────────────────────

  useEffect(() => { refresh() }, [refresh])

  // ── Purchase ───────────────────────────────────────────────────────────

  const purchaseItem = useCallback(
    async (itemId: string) => {
      const item = items.find((i) => i.id === itemId)
      if (!item) return { success: false, error: 'Item not found.', newXpAvailable: xpAvailable, newGold: gold }

      // ── Optimistic deduction ──
      const prevXp = xpAvailable
      const prevGold = gold
      const newXp = xpAvailable - item.cost_xp
      const newG = gold - item.cost_gold
      setXpAvailable(newXp)
      setGold(newG)
      setPurchasing(true)

      try {
        const res = await fetch('/api/loot/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId }),
        })

        const data = (await res.json()) as {
          newXpAvailable?: number
          newGold?: number
          error?: string
        }

        if (!res.ok || data.error) {
          // Rollback optimistic update
          setXpAvailable(prevXp)
          setGold(prevGold)
          return {
            success: false,
            error: data.error ?? 'Purchase failed.',
            newXpAvailable: prevXp,
            newGold: prevGold,
          }
        }

        return {
          success: true,
          error: null,
          newXpAvailable: data.newXpAvailable ?? newXp,
          newGold: data.newGold ?? newG,
        }
      } catch {
        setXpAvailable(prevXp)
        setGold(prevGold)
        return {
          success: false,
          error: 'Network error. Please try again.',
          newXpAvailable: prevXp,
          newGold: prevGold,
        }
      } finally {
        if (mountedRef.current) setPurchasing(false)
      }
    },
    [items, xpAvailable, gold],
  )

  return { items, loading, error, xpAvailable, gold, purchasing, refresh, purchaseItem }
}
