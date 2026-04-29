import { Howl, Howler } from 'howler'
import { useAudioStore } from '@/store/useAudioStore'

// ── Types ─────────────────────────────────────────────────────
export type BgmTrack = 'hub' | 'academy' | 'boss'
export type SfxName  = 'victory' | 'coin' | 'attack' | 'click'

// ── URL resolver ──────────────────────────────────────────────
const BASE = (process.env.NEXT_PUBLIC_SPRITE_BASE_URL ?? '/sprites').replace(/\/$/, '')

/**
 * Returns the URL for an audio asset.
 * @param filename The name of the file (e.g. 'bgm_hub.mp3')
 * @param mode The path resolution mode:
 *   - 'base': Uses NEXT_PUBLIC_SPRITE_BASE_URL/audio/
 *   - 'root': Uses /audio/ (local public folder)
 *   - 'sprites': Uses /sprites/audio/ (local legacy structure)
 */
function audioUrl(filename: string, mode: 'base' | 'root' | 'sprites' = 'root'): string {
  const clean = filename.replace(/^\//, '')
  if (mode === 'base') {
    // If BASE is just '/' (default when env var missing), mode='base' is redundant with 'sprites'
    // but we handle it gracefully here.
    const prefix = BASE === '/sprites' ? '/sprites' : BASE
    return `${prefix}/audio/${clean}`
  }
  if (mode === 'sprites') {
    return `/sprites/audio/${clean}`
  }
  return `/audio/${clean}`
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

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => { /* ignore */ })
  }

  // Stop previous
  stopProceduralBgm()

  const params = PROC_BGM_PARAMS[track]
  const ctx = audioCtx

  const masterGain = ctx.createGain()
  masterGain.gain.value = globalMuted ? 0 : params.gain
  masterGain.connect(ctx.destination)

  const osc = ctx.createOscillator()
  osc.type = params.type
  osc.frequency.value = params.freq
  osc.connect(masterGain)

  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.3
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = params.freq * 0.02
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)
  lfo.start()

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
    try { node.osc.stop() } catch { /* ignore */ }
    try { node.lfo.stop() } catch { /* ignore */ }
    try { node.harm.stop() } catch { /* ignore */ }
    try { node.osc.disconnect() } catch { /* ignore */ }
    try { node.lfo.disconnect() } catch { /* ignore */ }
    try { node.lfoGain.disconnect() } catch { /* ignore */ }
    try { node.harm.disconnect() } catch { /* ignore */ }
    try { node.harmGain.disconnect() } catch { /* ignore */ }
    try { node.gain.disconnect() } catch { /* ignore */ }
    procBgmNodes[procBgmPlaying] = null
  }
  procBgmPlaying = null
}

// ── Procedural SFX fallback ───────────────────────────────────
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
  osc.onended = () => { osc.disconnect(); gain.disconnect() }
}

const SFX_THROTTLE_MS = 50
const sfxLastPlayed = new Map<SfxName, number>()

// ── AudioContext unlock ────────────────────────────────────────
export function initAudio(): void {
  if (unlocked) return
  unlocked = true

  subscribeToStore()

  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioCtx.resume().catch(() => { /* ignore */ })
  } catch { /* Web Audio unavailable */ }

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
    const prev = bgmInstances[track]
    if (prev) {
      try { prev.unload() } catch { /* ignore */ }
    }
    bgmInstances[track] = new Howl({
      src: [
        audioUrl(BGM_FILES[track], 'base'),
        audioUrl(BGM_FILES[track], 'root'),
        audioUrl(BGM_FILES[track], 'sprites'),
      ],
      loop: true,
      volume: 0,
      html5: true,
      pool: 1,
      preload: true,
      onloaderror: (_id, err) => {
        const urls = [
          audioUrl(BGM_FILES[track], 'base'),
          audioUrl(BGM_FILES[track], 'root'),
          audioUrl(BGM_FILES[track], 'sprites'),
        ]
        console.warn(`[audio] BGM unavailable for "${track}". Attempted URLs:`, urls, 'Error:', err)
        bgmInstances[track] = null
        if (currentBgm === track) {
          stopProceduralBgm()
          startProceduralBgm(track)
        }
      },
      onplayerror: (_id, err) => {
        console.warn(`[audio] play error for "${track}":`, err)
        if (currentBgm === track) {
          startProceduralBgm(track)
        }
      },
    })
  }

  for (const name of Object.keys(SFX_FILES) as SfxName[]) {
    sfxInstances[name] = new Howl({
      src: [
        audioUrl(SFX_FILES[name], 'base'),
        audioUrl(SFX_FILES[name], 'root'),
        audioUrl(SFX_FILES[name], 'sprites'),
      ],
      loop: false,
      volume: 0.8,
      html5: false,
      preload: true,
      onloaderror: (_id, err) => {
        const urls = [
          audioUrl(SFX_FILES[name], 'base'),
          audioUrl(SFX_FILES[name], 'root'),
          audioUrl(SFX_FILES[name], 'sprites'),
        ]
        console.warn(`[audio] SFX unavailable for "${name}". Attempted URLs:`, urls, 'Error:', err)
        sfxInstances[name] = null
      },
    })
  }

  // If a BGM was requested BEFORE unlocking (while playing the hum),
  // restart it now so it transitions to the high-fidelity Howl instance.
  if (currentBgm) {
    const trackToResume = currentBgm
    currentBgm = null // Reset so playBgm triggers fresh
    playBgm(trackToResume)
  }
}

// ── BGM control ────────────────────────────────────────────────
const CROSSFADE_DURATION = 1500

export function playBgm(track: BgmTrack): void {
  if (!unlocked) {
    stopProceduralBgm()
    startProceduralBgm(track)
    currentBgm = track
    currentBgmId = null
    return
  }

  const howl = bgmInstances[track]

  if (howl) {
    if (currentBgm === track && howl.playing()) return

    // Fade out previous
    if (currentBgmId !== null) {
      const prev = bgmInstances[currentBgm!]
      if (prev) {
        prev.fade(prev.volume(), 0, CROSSFADE_DURATION)
        const prevId = currentBgmId
        setTimeout(() => { if (prev.playing()) prev.pause(prevId) }, CROSSFADE_DURATION + 50)
      }
    } else if (procBgmPlaying) {
      // Transition from procedural hum to high-fidelity music
      stopProceduralBgm()
    }

    const targetVolume = globalMuted ? 0 : 0.5
    const id = howl.play()
    howl.volume(0, id)
    howl.fade(0, targetVolume, CROSSFADE_DURATION, id)

    currentBgm = track
    currentBgmId = id
  } else {
    // Procedural fallback
    if (procBgmPlaying === track) return
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
  if (currentBgmId !== null && currentBgm) {
    const inst = bgmInstances[currentBgm]
    if (inst) {
      inst.fade(inst.volume(), 0, 500)
      setTimeout(() => inst.stop(), 600)
    }
  }
  stopProceduralBgm()
  currentBgm = null
  currentBgmId = null
}

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
    playProceduralSfx(name)
  }
}

export function setAudioMuted(muted: boolean): void {
  globalMuted = muted
  Howler.mute(muted)
  if (procBgmPlaying && procBgmNodes[procBgmPlaying]) {
    const node = procBgmNodes[procBgmPlaying]
    if (node) {
      node.gain.gain.value = muted ? 0 : PROC_BGM_PARAMS[procBgmPlaying].gain
    }
  }
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
