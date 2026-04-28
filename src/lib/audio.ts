import { Howl, Howler } from 'howler'
import { useAudioStore } from '@/store/useAudioStore'

// ── Types ─────────────────────────────────────────────────────
export type BgmTrack = 'hub' | 'academy' | 'boss'
export type SfxName  = 'victory' | 'coin' | 'attack' | 'click'

// ── URL resolver ──────────────────────────────────────────────
// Uses the same base URL as sprite assets — audio files now live under
// /sprites/audio/ alongside sprite subdirectories.  In production this
// resolves to Supabase Storage; locally it falls back to /sprites served
// from public/sprites/ via Next.js.
const BASE = (process.env.NEXT_PUBLIC_SPRITE_BASE_URL ?? '/sprites').replace(/\/$/, '')

function audioUrl(filename: string): string {
  return `/audio/${filename.replace(/^\//, '')}`
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
}

// ── Singleton state ───────────────────────────────────────────
let unlocked = false
let currentBgm: BgmTrack | null = null
let currentBgmId: number | null = null
let bgmInstances: Record<BgmTrack, Howl | null> = { hub: null, academy: null, boss: null }
let sfxInstances: Record<SfxName, Howl | null> = { victory: null, coin: null, attack: null, click: null }
let globalMuted = false

// ── Procedural audio fallback ─────────────────────────────────
// Generates simple ambient tones when MP3 files are unavailable.
// Uses Web Audio API oscillator nodes with light LFO modulation
// for a pleasant background hum.

let audioCtx: AudioContext | null = null

interface ProcBgmNodes {
  gain: GainNode
  osc: OscillatorNode
  lfo: OscillatorNode
  lfoGain: GainNode
  harm: OscillatorNode
  harmGain: GainNode
}
let procBgmNodes: Record<BgmTrack, ProcBgmNodes | null> = {
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

  // Resume context if suspended — browsers may still be in the suspended state
  // even after initAudio() if the user gesture window has closed. The oscillators
  // will start producing output as soon as resume() resolves.
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => { /* ignore */ })
  }

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

  procBgmNodes[track] = { gain: masterGain, osc, lfo, lfoGain, harm, harmGain }
  procBgmPlaying = track
}

function stopProceduralBgm(): void {
  if (procBgmPlaying && procBgmNodes[procBgmPlaying]) {
    const node = procBgmNodes[procBgmPlaying]!
    // Stop all oscillators.
    try { node.osc.stop() } catch { /* already stopped */ }
    try { node.lfo.stop() } catch { /* already stopped */ }
    try { node.harm.stop() } catch { /* already stopped */ }
    // Disconnect all nodes.
    try { node.osc.disconnect() } catch { /* already disconnected */ }
    try { node.lfo.disconnect() } catch { /* already disconnected */ }
    try { node.lfoGain.disconnect() } catch { /* already disconnected */ }
    try { node.harm.disconnect() } catch { /* already disconnected */ }
    try { node.harmGain.disconnect() } catch { /* already disconnected */ }
    try { node.gain.disconnect() } catch { /* already disconnected */ }
    procBgmNodes[procBgmPlaying] = null
  }
  procBgmPlaying = null
}

// ── Procedural SFX fallback ───────────────────────────────────
// Web Audio oscillator tones for when MP3 files fail to load.
const PROC_SFX_PARAMS: Record<SfxName, { freq: number; type: OscillatorType; duration: number; gain: number }> = {
  victory: { freq: 880, type: 'sine',     duration: 0.4, gain: 0.15 },
  coin:    { freq: 1320, type: 'triangle', duration: 0.12, gain: 0.1 },
  attack:  { freq: 220, type: 'sawtooth', duration: 0.1,  gain: 0.08 },
  click:   { freq: 660, type: 'square',   duration: 0.05, gain: 0.06 },
}

function playProceduralSfx(name: SfxName): void {
  if (!audioCtx || audioCtx.state === 'suspended') return
  const params = PROC_SFX_PARAMS[name]
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = params.type
  osc.frequency.value = params.freq
  gain.gain.setValueAtTime(params.gain, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + params.duration)
  // Clean up on completion.
  osc.onended = () => { osc.disconnect(); gain.disconnect() }
}

// ── SFX throttle ──────────────────────────────────────────────
const SFX_THROTTLE_MS = 50
const sfxLastPlayed = new Map<SfxName, number>()

// ── AudioContext unlock (must be called from a user gesture) ───
export function initAudio(): void {
  if (unlocked) return
  unlocked = true

  // Wire the Zustand store to the imperative engine.
  subscribeToStore()

  // Create AudioContext for procedural fallback
  try {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    // Browsers create AudioContext in a suspended state unless created inside a
    // user-gesture handler. Attempt an immediate resume — it succeeds when
    // called from a trusted gesture context (e.g. link click that triggered
    // navigation). The promise rejection is safe to ignore; the context will
    // be resumed again in startProceduralBgm if needed.
    audioCtx.resume().catch(() => { /* ignore */ })
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

  // Pre-create all Howl instances — unload any previous instances first
  // to avoid accumulating <audio> elements (which triggers the "pool
  // exhausted" warning in Howler).
  for (const track of Object.keys(BGM_FILES) as BgmTrack[]) {
    const prev = bgmInstances[track]
    if (prev) {
      try { prev.unload() } catch { /* already gone */ }
    }
    bgmInstances[track] = new Howl({
      src: [audioUrl(BGM_FILES[track])],
      loop: true,
      volume: 0,
      html5: true,
      pool: 1,
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
      onloaderror: (_id: number, err: unknown) => {
        console.warn(`[audio] SFX MP3 unavailable for "${name}":`, err)
        sfxInstances[name] = null
      },
    })
  }
}

// ── BGM control ────────────────────────────────────────────────
const CROSSFADE_DURATION = 1500 // ms

export function playBgm(track: BgmTrack): void {
  // If the user hasn't interacted yet, use the procedural oscillator
  // fallback — no Howl instances exist until initAudio() is called from
  // a user gesture, and we don't want to force-init here (browsers would
  // suspend the AudioContext anyway).
  if (!unlocked) {
    // Stop any previous procedural track silently.
    stopProceduralBgm()
    startProceduralBgm(track)
    currentBgm = track
    currentBgmId = null
    return
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
  if (globalMuted) return

  const now = performance.now()
  const last = sfxLastPlayed.get(name) ?? 0
  if (now - last < SFX_THROTTLE_MS) return
  sfxLastPlayed.set(name, now)

  const inst = sfxInstances[name]
  if (inst) {
    inst.play()
  } else {
    // No Howl instance (MP3 failed to load) → use procedural fallback.
    playProceduralSfx(name)
  }
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

// ── Zustand store bridge ───────────────────────────────────────
// Keeps the imperative audio engine in sync with the UI-facing Zustand store.
let didSubscribe = false

function subscribeToStore(): void {
  if (didSubscribe) return
  didSubscribe = true
  useAudioStore.subscribe((state, prev) => {
    if (state.isMuted !== prev.isMuted) {
      setAudioMuted(state.isMuted)
    }
    if (state.currentBgm !== prev.currentBgm) {
      if (state.currentBgm) playBgm(state.currentBgm)
      else stopBgm()
    }
  })
}

// ── Singleton reset (for testing) ──────────────────────────────
export function _reset(): void {
  stopProceduralBgm()
  unlocked = false
  didSubscribe = false
  currentBgm = null
  currentBgmId = null
  bgmInstances = { hub: null, academy: null, boss: null }
  sfxInstances = { victory: null, coin: null, attack: null, click: null }
  globalMuted = false
  if (audioCtx) {
    audioCtx.close().catch(() => {})
    audioCtx = null
  }
}
