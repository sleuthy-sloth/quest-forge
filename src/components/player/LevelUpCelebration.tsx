'use client'

import { useState, useEffect } from 'react'
import CelebrationEffect from '@/components/games/CelebrationEffect'
import { playSfx } from '@/lib/audio'
import { LevelUpModal } from '@/components/qf/LevelUpModal'

interface LevelUpEvent {
  newLevel: number
  previousLevel: number
}

const MOTIVATIONAL_LINES = [
  "The Emberlight within you burns brighter.",
  "The Hollow felt that.",
  "Hearthhold stands a little safer tonight.",
  "Your legend grows across Embervale.",
  "The flame of courage is unyielding.",
]

export default function LevelUpCelebration({ 
  avatarClass 
}: { 
  avatarClass: string | null 
}) {
  const [active, setActive] = useState(false)
  const [level, setLevel] = useState(0)
  const [line, setLine] = useState("")

  useEffect(() => {
    function handleLevelUp(e: any) {
      const { newLevel } = e.detail as LevelUpEvent
      setLevel(newLevel)
      setLine(MOTIVATIONAL_LINES[Math.floor(Math.random() * MOTIVATIONAL_LINES.length)])
      setActive(true)
      playSfx('victory')
    }

    window.addEventListener('player:level-up', handleLevelUp)
    return () => window.removeEventListener('player:level-up', handleLevelUp)
  }, [])

  return (
    <>
      <LevelUpModal 
        level={level} 
        isOpen={active} 
        onClose={() => setActive(false)} 
        motivationalLine={line}
      />
      {active && <CelebrationEffect trigger={1} />}
    </>
  )
}
