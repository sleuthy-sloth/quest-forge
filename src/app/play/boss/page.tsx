'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BossArena from '@/components/player/BossArena'

export default function BossPage() {
  const supabase = createClient()
  const [householdId, setHouseholdId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('household_id')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setHouseholdId(data.household_id)
        })
    })
  }, [supabase])

  return <BossArena householdId={householdId} />
}
