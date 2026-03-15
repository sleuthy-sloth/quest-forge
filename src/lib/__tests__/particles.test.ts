import { describe, it, expect } from 'vitest'
import { PARTICLE_DEFS, PARTICLE_CSS_KEYFRAMES } from '../sprites/particles'

describe('PARTICLE_CSS_KEYFRAMES', () => {
  it('is a non-empty string containing @keyframes', () => {
    expect(typeof PARTICLE_CSS_KEYFRAMES).toBe('string')
    expect(PARTICLE_CSS_KEYFRAMES).toContain('@keyframes')
  })

  it('defines all four animation names', () => {
    expect(PARTICLE_CSS_KEYFRAMES).toContain('ember-float')
    expect(PARTICLE_CSS_KEYFRAMES).toContain('shadow-tendril')
    expect(PARTICLE_CSS_KEYFRAMES).toContain('glow-pulse')
    expect(PARTICLE_CSS_KEYFRAMES).toContain('dark-aura')
  })
})

describe('PARTICLE_DEFS', () => {
  it('has the four required particle types', () => {
    expect(PARTICLE_DEFS).toHaveProperty('ember_float')
    expect(PARTICLE_DEFS).toHaveProperty('shadow_tendril')
    expect(PARTICLE_DEFS).toHaveProperty('glow_pulse')
    expect(PARTICLE_DEFS).toHaveProperty('dark_aura')
  })

  it('each particle def has count > 0', () => {
    for (const [key, def] of Object.entries(PARTICLE_DEFS)) {
      expect(def.count, `${key}.count`).toBeGreaterThan(0)
    }
  })

  it('each particle def has a style function', () => {
    for (const [key, def] of Object.entries(PARTICLE_DEFS)) {
      expect(typeof def.style, `${key}.style`).toBe('function')
    }
  })

  it('style functions return objects with position: absolute', () => {
    for (const [key, def] of Object.entries(PARTICLE_DEFS)) {
      const style = def.style(0, def.count)
      expect(style.position, `${key} style.position`).toBe('absolute')
    }
  })

  it('style functions produce consistent output (no Math.random)', () => {
    for (const [key, def] of Object.entries(PARTICLE_DEFS)) {
      const a = def.style(0, def.count)
      const b = def.style(0, def.count)
      expect(JSON.stringify(a), `${key} style is deterministic`).toBe(JSON.stringify(b))
    }
  })

  it('ember_float has count 8', () => {
    expect(PARTICLE_DEFS.ember_float.count).toBe(8)
  })

  it('glow_pulse has count 1', () => {
    expect(PARTICLE_DEFS.glow_pulse.count).toBe(1)
  })
})
