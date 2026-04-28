'use client'

import { useEffect, useRef } from 'react'
import { initAudio } from '@/lib/audio'

/**
 * Mount once in the root layout. Listens for the first user interaction
 * (click, touch, keydown) to unlock the Web Audio API context (required by
 * browsers to comply with autoplay policies). After the first gesture the
 * listener is removed.
 */
export default function AudioInit() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return

    function onInteraction() {
      if (initialized.current) return
      try {
        initAudio()
        // Only mark as initialized AFTER the engine successfully sets up.
        // This way, if initAudio() throws (e.g. AudioContext creation failure),
        // the guard doesn't permanently block retry on the next interaction.
        initialized.current = true
      } catch (err) {
        console.warn('[AudioInit] initAudio failed, will retry on next interaction:', err)
        return
      }
      document.removeEventListener('click', onInteraction)
      document.removeEventListener('touchstart', onInteraction)
      document.removeEventListener('keydown', onInteraction)
    }

    document.addEventListener('click', onInteraction, { once: true })
    document.addEventListener('touchstart', onInteraction, { once: true })
    document.addEventListener('keydown', onInteraction, { once: true })

    return () => {
      document.removeEventListener('click', onInteraction)
      document.removeEventListener('touchstart', onInteraction)
      document.removeEventListener('keydown', onInteraction)
    }
  }, [])

  return null
}
