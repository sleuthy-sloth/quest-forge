import { Howl } from 'howler'

// ── Types ─────────────────────────────────────────────────────
export type BgmTrack = 'hub' | 'academy' | 'boss'
export type SfxName  = 'victory' | 'coin' | 'attack' | 'click'

// ── URL resolver ──────────────────────────────────────────────
const BASE = (process.env.NEXT_PUBLIC_SPRITE_BASE_URL ?? '').replace(/\/$/, '')

function audioUrl(filename: string): string {
  return `${BASE}/audio/${filename}`
}

// ── Track configs ─────────────────────────────────────────────
const BGM_FILES: Record<BgmTrack, string> = {
  hub:    'bgm_hub.mp3',
  academy: 'bgm_academy.mp3',
  boss:   'bgm_boss.mp3',
}

const SFX_FILES: Record<SfxName, string> = {
  victory: 'sfx_victory.mp3',
  coin:    'sfx_coin.mp3',
  attack:  'sfx_attack.mp3',
  click:   'sfx_click.mp3',
}

// ── Singleton state ───────────────────────────────────────────
let unlocked = false
let currentBgm: BgmTrack | null = null
let currentBgmId: number | null = null
let bgmInstances: Record<BgmTrack, Howl | null> = { hub: null, academy: null, boss: null }
let sfxInstances: Record<SfxName, Howl | null> = { victory: null, coin: null, attack: null, click: null }
let masterGain: Howl | null = null
let globalMuted = false

// ── AudioContext unlock (must be called from a user gesture) ───
export function initAudio(): void {
  if (unlocked) return
  unlocked = true

  // Pre-create all Howl instances
  for (const track of Object.keys(BGM_FILES) as BgmTrack[]) {
    bgmInstances[track] = new Howl({
      src: [audioUrl(BGM_FILES[track])],
      loop: true,
      volume: 0,
      html5: true,
      preload: true,
    })
  }

  for (const name of Object.keys(SFX_FILES) as SfxName[]) {
    sfxInstances[name] = new Howl({
      src: [audioUrl(SFX_FILES[name])],
      loop: false,
      volume: 0.8,
      html5: false,
      preload: true,
    })
  }

  // Unlock the Web Audio API context (Howler does this internally on first play)
}

// ── BGM control ────────────────────────────────────────────────
const CROSSFADE_DURATION = 1500 // ms

export function playBgm(track: BgmTrack): void {
  const next = bgmInstances[track]
  if (!next) return

  if (currentBgm === track && next.playing()) return

  // Fade out current
  if (currentBgmId !== null) {
    const prev = bgmInstances[currentBgm!]
    if (prev) {
      prev.fade(prev.volume(), 0, CROSSFADE_DURATION)
      const prevId = currentBgmId
      setTimeout(() => { if (prev.playing()) prev.pause(prevId) }, CROSSFADE_DURATION + 50)
    }
  }

  // Fade in next
  const targetVolume = globalMuted ? 0 : 0.5
  const id = next.play()
  next.volume(0, id)
  next.fade(0, targetVolume, CROSSFADE_DURATION, id)

  currentBgm = track
  currentBgmId = id
}

export function stopBgm(): void {
  if (currentBgmId !== null && currentBgm) {
    const inst = bgmInstances[currentBgm]
    if (inst) {
      inst.fade(inst.volume(), 0, 500)
      setTimeout(() => inst.stop(), 600)
    }
  }
  currentBgm = null
  currentBgmId = null
}

// ── SFX control ────────────────────────────────────────────────
export function playSfx(name: SfxName): void {
  const inst = sfxInstances[name]
  if (!inst) return
  if (globalMuted) return
  inst.play()
}

// ── Global mute ────────────────────────────────────────────────
export function setAudioMuted(muted: boolean): void {
  globalMuted = muted
  Howler.mute(muted)

  // Also sync currently-playing BGM volume
  if (currentBgm && currentBgmId !== null) {
    const inst = bgmInstances[currentBgm]
    if (inst) {
      inst.volume(muted ? 0 : 0.5, currentBgmId)
    }
  }
}

export function isAudioMuted(): boolean {
  return globalMuted
}

// ── Singleton reset (for testing) ──────────────────────────────
export function _reset(): void {
  unlocked = false
  currentBgm = null
  currentBgmId = null
  bgmInstances = { hub: null, academy: null, boss: null }
  sfxInstances = { victory: null, coin: null, attack: null, click: null }
  globalMuted = false
}
