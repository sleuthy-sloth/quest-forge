import { Howl, Howler } from 'howler'

// ── Types ─────────────────────────────────────────────────────
export type BgmTrack = 'hub' | 'academy' | 'boss'
export type SfxName  = 'victory' | 'coin' | 'attack' | 'click' | 'purchase'

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
  victory:  'sfx_victory.mp3',
  coin:     'sfx_coin.mp3',
  attack:   'sfx_attack.mp3',
  click:    'sfx_click.mp3',
  purchase: 'sfx_purchase.mp3',
}

// ── Singleton state ───────────────────────────────────────────
let unlocked = false
let currentBgm: BgmTrack | null = null
let currentBgmId: number | null = null
let bgmInstances: Record<BgmTrack, Howl | null> = { hub: null, academy: null, boss: null }
let sfxInstances: Record<SfxName, Howl | null> = { victory: null, coin: null, attack: null, click: null, purchase: null }
let globalMuted = false

// ── Procedural audio fallback ─────────────────────────────────
// Generates simple ambient tones when MP3 files are unavailable.
// Uses Web Audio API oscillator nodes with light LFO modulation
// for a pleasant background hum.

let audioCtx: AudioContext | null = null
let procBgmNodes: Record<BgmTrack, { gain: GainNode; osc: OscillatorNode } | null> = {
  hub: null, academy: null, boss: null,
}
let procBgmPlaying: BgmTrack | null = null

/** Mappings from BgmTrack to oscillator + gain parameters for procedural fallback */
const PROC_BGM_PARAMS: Record<BgmTrack, { freq: number; type: OscillatorType; gain: number }> = {
  hub:    { freq: 110, type: 'sine',     gain: 0.08 },
  academy: { freq: 130, type: 'triangle', gain: 0.06 },
  boss:   { freq: 82,  type: 'sawtooth', gain: 0.05 },
}

function startProceduralBgm(track: BgmTrack): void {
  if (!audioCtx) return
  if (procBgmPlaying === track) return

  // Stop previous
  stopProceduralBgm()

  const params = PROC_BGM_PARAMS[track]
  const ctx = audioCtx

  // Master gain for this track
  const masterGain = ctx.createGain()
  masterGain.gain.value = globalMuted ? 0 : params.gain
  masterGain.connect(ctx.destination)

  // Oscillator
  const osc = ctx.createOscillator()
  osc.type = params.type
  osc.frequency.value = params.freq
  osc.connect(masterGain)

  // LFO for gentle modulation
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.3 // slow pulse
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = params.freq * 0.02 // slight pitch wobble
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)
  lfo.start()

  // Second harmonic for warmth
  const harmGain = ctx.createGain()
  harmGain.gain.value = params.gain * 0.3
  harmGain.connect(ctx.destination)
  const harm = ctx.createOscillator()
  harm.type = 'sine'
  harm.frequency.value = params.freq * 2
  harm.connect(harmGain)

  osc.start()
  harm.start()

  procBgmNodes[track] = { gain: masterGain, osc }
  procBgmPlaying = track
}

function stopProceduralBgm(): void {
  if (procBgmPlaying && procBgmNodes[procBgmPlaying]) {
    const node = procBgmNodes[procBgmPlaying]
    if (node) {
      try { node.osc.stop() } catch { /* already stopped */ }
      try { node.gain.disconnect() } catch { /* already disconnected */ }
    }
    procBgmNodes[procBgmPlaying] = null
  }
  procBgmPlaying = null
}

// ── SFX throttle ──────────────────────────────────────────────
const SFX_THROTTLE_MS = 50
const sfxLastPlayed = new Map<SfxName, number>()

// ── AudioContext unlock (must be called from a user gesture) ───
export function initAudio(): void {
  if (unlocked) return
  unlocked = true

  // Create AudioContext for procedural fallback
  try {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  } catch {
    // Web Audio API not available — no audio at all
  }

  // Resume audio when the tab regains focus. Mobile browsers commonly
  // suspend the AudioContext + pause Howl playback when the tab is
  // backgrounded; without this listener the BGM stays silent after the
  // user comes back.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => { /* ignore */ })
      }
      if (currentBgm && currentBgmId !== null) {
        const inst = bgmInstances[currentBgm]
        if (inst && !inst.playing(currentBgmId)) {
          try { inst.play(currentBgmId) } catch { /* ignore */ }
        }
      }
    })
  }

  // Pre-create all Howl instances
  for (const track of Object.keys(BGM_FILES) as BgmTrack[]) {
    bgmInstances[track] = new Howl({
      src: [audioUrl(BGM_FILES[track])],
      loop: true,
      volume: 0,
      html5: true,
      preload: true,
      onloaderror: (_id: number, err: unknown) => {
        console.warn(`[audio] MP3 unavailable for "${track}":`, err)
        // MP3 unavailable — mark as null so future playBgm calls fall
        // through to the procedural oscillator fallback.
        bgmInstances[track] = null
        // If this MP3 was the currently active BGM, transition to the
        // procedural fallback immediately so the player doesn't hear
        // silence.
        if (currentBgm === track) {
          stopProceduralBgm()
          startProceduralBgm(track)
        }
      },
      onplayerror: (_id: number, err: unknown) => {
        // Browser autoplay blocked or device couldn't play. Use the
        // procedural oscillator instead so the player still gets ambient
        // sound.
        console.warn(`[audio] play error for "${track}":`, err)
        if (currentBgm === track) {
          startProceduralBgm(track)
        }
      },
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
}

// ── BGM control ────────────────────────────────────────────────
const CROSSFADE_DURATION = 1500 // ms

export function playBgm(track: BgmTrack): void {
  // Auto-initialize if first call happens before any user interaction
  if (!unlocked) {
    initAudio()
  }

  const howl = bgmInstances[track]

  if (howl) {
    // ── Howl path (MP3 available) ──
    if (currentBgm === track && howl.playing()) return

    // Fade out current Howl
    if (currentBgmId !== null) {
      const prev = bgmInstances[currentBgm!]
      if (prev) {
        prev.fade(prev.volume(), 0, CROSSFADE_DURATION)
        const prevId = currentBgmId
        setTimeout(() => { if (prev.playing()) prev.pause(prevId) }, CROSSFADE_DURATION + 50)
      }
    }

    // Fade in next Howl
    const targetVolume = globalMuted ? 0 : 0.5
    const id = howl.play()
    howl.volume(0, id)
    howl.fade(0, targetVolume, CROSSFADE_DURATION, id)

    currentBgm = track
    currentBgmId = id

    // Also stop procedural if it was playing
    stopProceduralBgm()
  } else {
    // ── Procedural fallback path (no MP3) ──
    if (procBgmPlaying === track) return

    // Fade out current Howl (if any) — quick fade
    if (currentBgmId !== null) {
      const prev = bgmInstances[currentBgm!]
      if (prev) {
        prev.fade(prev.volume(), 0, 200)
        setTimeout(() => prev.pause(), 300)
      }
      currentBgm = null
      currentBgmId = null
    }

    stopProceduralBgm()
    startProceduralBgm(track)
    currentBgm = track
    currentBgmId = null
  }
}

export function stopBgm(): void {
  // Stop Howl BGM
  if (currentBgmId !== null && currentBgm) {
    const inst = bgmInstances[currentBgm]
    if (inst) {
      inst.fade(inst.volume(), 0, 500)
      setTimeout(() => inst.stop(), 600)
    }
  }

  // Stop procedural BGM
  stopProceduralBgm()

  currentBgm = null
  currentBgmId = null
}

// ── SFX control ────────────────────────────────────────────────
export function playSfx(name: SfxName): void {
  const inst = sfxInstances[name]
  if (!inst) return
  if (globalMuted) return

  const now = performance.now()
  const last = sfxLastPlayed.get(name) ?? 0
  if (now - last < SFX_THROTTLE_MS) return
  sfxLastPlayed.set(name, now)

  inst.play()
}

// ── Global mute ────────────────────────────────────────────────
export function setAudioMuted(muted: boolean): void {
  globalMuted = muted
  Howler.mute(muted)

  // Sync procedural BGM volume
  if (procBgmPlaying && procBgmNodes[procBgmPlaying]) {
    const node = procBgmNodes[procBgmPlaying]
    if (node) {
      node.gain.gain.value = muted ? 0 : PROC_BGM_PARAMS[procBgmPlaying].gain
    }
  }

  // Sync Howl BGM volume
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
  stopProceduralBgm()
  unlocked = false
  currentBgm = null
  currentBgmId = null
  bgmInstances = { hub: null, academy: null, boss: null }
  sfxInstances = { victory: null, coin: null, attack: null, click: null, purchase: null }
  globalMuted = false
  if (audioCtx) {
    audioCtx.close().catch(() => {})
    audioCtx = null
  }
}
