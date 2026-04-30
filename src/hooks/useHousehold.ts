'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HouseholdInfo {
  id: string
  name: string
}

export interface UseHouseholdResult {
  /** The current user's household ID, or null if not loaded / unavailable. */
  householdId: string | null
  /** The current user's household name, or null. */
  householdName: string | null
  /** True during initial fetch. */
  loading: boolean
  /** Human-readable error, or null. */
  error: string | null
  /** Force-refresh household data from the server. */
  refresh: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetch and subscribe to the current user's household data.
 *
 * Centralizes household_id resolution so individual hooks and components
 * don't need to query the profile table themselves.
 *
 * Usage:
 *   const { householdId, householdName, loading } = useHousehold()
 */
export function useHousehold(): UseHouseholdResult {
  const supabase = createClient()
  const mountedRef = useRef(true)

  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [householdName, setHouseholdName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch ───────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!mountedRef.current) return
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (mountedRef.current) {
          setHouseholdId(null)
          setHouseholdName(null)
          setLoading(false)
        }
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('household_id, households(name)')
        .eq('id', user.id)
        .single<{
          household_id: string
          households: { name: string } | { name: string }[] | null
        }>()

      if (!profile) {
        if (mountedRef.current) {
          setHouseholdId(null)
          setHouseholdName(null)
          setLoading(false)
        }
        return
      }

      const name = Array.isArray(profile.households)
        ? profile.households[0]?.name ?? null
        : profile.households?.name ?? null

      if (mountedRef.current) {
        setHouseholdId(profile.household_id)
        setHouseholdName(name)
        setLoading(false)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load household')
        setLoading(false)
      }
    }
  }, [supabase])

  // ── Initial fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true
    refresh()
    return () => { mountedRef.current = false }
  }, [refresh])

  return { householdId, householdName, loading, error, refresh }
}