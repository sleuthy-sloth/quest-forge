'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import type { LevelUpEvent } from '@/hooks/usePlayer'

/**
 * Listens for game-level events dispatched as CustomEvents on `window`
 * and presents them as Sonner toast notifications.
 *
 * Events:
 *   player:level-up    — fires from usePlayer’s Realtime subscription
 *                         when the profile level increases.
 *
 * Mount once in the root layout — it survives unmount cleanly.
 */
export default function ToastListener() {
  useEffect(() => {
    function onLevelUp(e: CustomEvent<LevelUpEvent>) {
      const { newLevel, previousLevel } = e.detail
      toast.success(
        `Level Up! You reached Level ${newLevel}`,
        {
          description: `From Lv. ${previousLevel} → Lv. ${newLevel}`,
          duration: 5000,
          position: 'top-center',
          style: {
            fontFamily: 'var(--font-heading, Cinzel, serif)',
            fontSize: '0.85rem',
            background: 'linear-gradient(135deg, #1a0a2e, #0f0620)',
            border: '1px solid rgba(155,48,255,0.5)',
            color: '#d4b0ff',
          },
        },
      )
    }

    window.addEventListener('player:level-up', onLevelUp as EventListener)
    return () => window.removeEventListener('player:level-up', onLevelUp as EventListener)
  }, [])

  // No visual output — this component is purely a side-effect listener
  return null
}
