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

    function onQFNotification(e: CustomEvent<any>) {
      const { type, title, description } = e.detail
      
      let style = {
        fontFamily: 'var(--font-heading, Cinzel, serif)',
        fontSize: '0.85rem',
        background: 'linear-gradient(135deg, #1a1208, #0c0803)',
        border: '1px solid rgba(201,168,76,0.3)',
        color: '#f0e6c8',
      }

      if (type === 'chore:completed') {
        style.background = 'linear-gradient(135deg, #0d1a10, #061008)'
        style.border = '1px solid rgba(46,184,92,0.4)'
        style.color = '#a0eebb'
      } else if (type === 'story:update') {
        style.background = 'linear-gradient(135deg, #1e0a2e, #0f0620)'
        style.border = '1px solid rgba(155,48,255,0.4)'
        style.color = '#d4b0ff'
      }

      toast(title, {
        description,
        duration: 4000,
        position: 'top-right',
        style,
      })
    }

    window.addEventListener('player:level-up', onLevelUp as EventListener)
    window.addEventListener('qf:notification', onQFNotification as EventListener)
    
    return () => {
      window.removeEventListener('player:level-up', onLevelUp as EventListener)
      window.removeEventListener('qf:notification', onQFNotification as EventListener)
    }
  }, [])

  // No visual output — this component is purely a side-effect listener
  return null
}
