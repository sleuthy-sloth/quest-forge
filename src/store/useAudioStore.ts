import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BgmTrack } from '@/lib/audio'

interface AudioState {
  isMuted: boolean
  currentBgm: BgmTrack | null
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  setBgm: (track: BgmTrack | null) => void
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      isMuted: false,
      currentBgm: null,

      toggleMute: () =>
        set((state) => ({ isMuted: !state.isMuted })),

      setMuted: (muted: boolean) =>
        set({ isMuted: muted }),

      setBgm: (track: BgmTrack | null) =>
        set({ currentBgm: track }),
    }),
    {
      name: 'qf_audio_muted',
      // Persist only the user's mute preference; currentBgm is volatile.
      partialize: (state) => ({ isMuted: state.isMuted }),
    }
  )
)
