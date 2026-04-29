'use client'

import { useEffect } from 'react'
import { playBgm, stopBgm, initAudio } from '@/lib/audio'
import { usePathname } from 'next/navigation'

/**
 * AmbientSfx — A global manager that triggers contextual BGM/Ambient sounds
 * based on the current navigation path.
 */
export default function AmbientSfx() {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize audio system on first user interaction if not already done
    const handleInteraction = () => {
      initAudio()
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [])

  useEffect(() => {
    if (pathname.includes('/play/arena')) {
      playBgm('boss')
    } else if (pathname.includes('/play/academy')) {
      playBgm('academy')
    } else if (pathname.includes('/dashboard')) {
      playBgm('hub')
    } else if (pathname.includes('/play/tavern')) {
      playBgm('tavern')
    }

    // Optional: Stop BGM when leaving game views if desired
    // return () => stopBgm()
  }, [pathname])

  return null
}
