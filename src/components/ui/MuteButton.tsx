'use client'

import { useAudioStore } from '@/store/useAudioStore'
import { setAudioMuted, playSfx } from '@/lib/audio'

interface MuteButtonProps {
  /** Tailwind size classes for icon scale matching its container */
  size?: string
}

/**
 * Accessible mute/unmute toggle.
 * Syncs with both the Zustand store (for UI reactivity) and the Howler
 * singleton (for actual audio muting).
 *
 * Can be embedded in any nav shell (sidebar, mobile nav, etc.)
 */
export default function MuteButton({ size = 'text-base' }: MuteButtonProps) {
  const isMuted = useAudioStore((s) => s.isMuted)
  const toggleMute = useAudioStore((s) => s.toggleMute)

  function handleToggle() {
    toggleMute()
    const nextMuted = !isMuted
    setAudioMuted(nextMuted)
    if (!nextMuted) playSfx('click')
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`${size} transition-colors duration-150 cursor-pointer
        ${isMuted
          ? 'text-[#b09a6e]/35 hover:text-[#c9a84c]/65'
          : 'text-[#c9a84c] hover:text-[#e8c84c]'
        }`}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  )
}
