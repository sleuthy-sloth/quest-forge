import { create } from 'zustand'
import type { BgmTrack } from '@/lib/audio'

interface AudioState {
  isMuted: boolean
  currentBgm: BgmTrack | null
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  setBgm: (track: BgmTrack | null) => void
}

export const useAudioStore = create<AudioState>((set) => ({
  isMuted: false,
  currentBgm: null,

  toggleMute: () =>
    set((state) => {
      const next = !state.isMuted
      return { isMuted: next }
    }),

  setMuted: (muted: boolean) =>
    set({ isMuted: muted }),

  setBgm: (track: BgmTrack | null) =>
    set({ currentBgm: track }),
}))
