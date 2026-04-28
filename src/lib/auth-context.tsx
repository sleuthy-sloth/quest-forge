'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  household_id: string
  display_name: string
  username: string
  role: 'gm' | 'player'
  level: number
  xp_total: number
  xp_available: number
  gold: number
}

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, household_id, display_name, username, role, level, xp_total, xp_available, gold')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('[AuthContext] Profile fetch error:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('[AuthContext] Profile fetch exception:', err)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    
    // 1. Get initial session immediately
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const initialUser = session?.user ?? null
        setUser(initialUser)
        if (initialUser) {
          await fetchProfile(initialUser.id)
        }
      } catch (err) {
        console.error('[AuthContext] Initial auth error:', err)
      } finally {
        setLoading(false)
      }
    }
    initAuth()

    // 2. Listen for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        
        // Only trigger profile fetch if the user actually changed
        // (Prevents loops if onAuthStateChange fires on every token refresh)
        setUser(prev => {
          if (prev?.id === currentUser?.id) return prev
          
          if (currentUser) {
            fetchProfile(currentUser.id).finally(() => setLoading(false))
          } else {
            setProfile(null)
            setLoading(false)
          }
          return currentUser
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
