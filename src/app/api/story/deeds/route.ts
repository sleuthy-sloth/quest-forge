import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const householdId = searchParams.get('household_id')
  const week = parseInt(searchParams.get('week') ?? '0')

  if (!householdId) {
    return NextResponse.json({ error: 'Missing household_id' }, { status: 400 })
  }

  const supabase = await createClient()

  // 1. Get household creation date
  const { data: household } = await supabase
    .from('households')
    .select('created_at')
    .eq('id', householdId)
    .single()

  if (!household) {
    return NextResponse.json({ error: 'Household not found' }, { status: 404 })
  }

  const startDate = new Date(household.created_at)
  
  // Week 1 starts at created_at
  // Week W starts at created_at + (W-1) * 7 days
  const weekStart = new Date(startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Handle Prologue (week 0) or pre-start deeds
  // If week is 0, let's just show everything before Week 1
  const effectiveStart = week === 0 ? new Date(0) : weekStart
  const effectiveEnd = week === 0 ? startDate : weekEnd

  // 2. Fetch completions
  const { data: completions, error } = await supabase
    .from('chore_completions')
    .select(`
      completed_at,
      profiles ( display_name ),
      chores ( title )
    `)
    .eq('household_id', householdId)
    .gte('completed_at', effectiveStart.toISOString())
    .lt('completed_at', effectiveEnd.toISOString())
    .order('completed_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const deeds = (completions ?? []).map(c => ({
    playerName: (c.profiles as any)?.display_name ?? 'Unknown Hero',
    choreTitle: (c.chores as any)?.title ?? 'A mysterious deed',
  }))

  return NextResponse.json({ deeds })
}
