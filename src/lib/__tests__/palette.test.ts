import { describe, it, expect } from 'vitest'
import { BOSS_PALETTES, BOSS_SPRITE_MANIFEST, swapPalette } from '../sprites/palette'

describe('BOSS_PALETTES', () => {
  it('has the four required palettes', () => {
    expect(BOSS_PALETTES).toHaveProperty('hollow_dark')
    expect(BOSS_PALETTES).toHaveProperty('ember_corrupt')
    expect(BOSS_PALETTES).toHaveProperty('frost_hollow')
    expect(BOSS_PALETTES).toHaveProperty('ash_gray')
  })

  it('each palette has primary, secondary, accent, glow hex strings', () => {
    for (const [key, palette] of Object.entries(BOSS_PALETTES)) {
      expect(palette.primary,   `${key}.primary`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(palette.secondary, `${key}.secondary`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(palette.accent,    `${key}.accent`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(palette.glow,      `${key}.glow`).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('BOSS_SPRITE_MANIFEST', () => {
  it('has folder-format entries for the six named bosses', () => {
    for (const key of ['demon', 'dragon', 'small_dragon', 'jinn', 'medusa', 'lizard']) {
      expect(BOSS_SPRITE_MANIFEST[key].format).toBe('folder')
    }
  })

  it('folder entries have idleFrames with 3 items', () => {
    expect(BOSS_SPRITE_MANIFEST.demon.idleFrames).toHaveLength(3)
    expect(BOSS_SPRITE_MANIFEST.demon.idleFrames![0]).toBe('Idle1.png')
  })

  it('has sheet-format entries for sheet sprites', () => {
    for (const key of ['bat', 'ghost', 'slime', 'eyeball', 'pumpking', 'bee', 'big_worm', 'snake']) {
      expect(BOSS_SPRITE_MANIFEST[key].format).toBe('sheet')
    }
  })

  it('sheet entries have cellW and cellH of 64', () => {
    expect(BOSS_SPRITE_MANIFEST.bat.cellW).toBe(64)
    expect(BOSS_SPRITE_MANIFEST.bat.cellH).toBe(64)
  })
})

describe('swapPalette', () => {
  const hollow = BOSS_PALETTES.hollow_dark

  // Helper: plain pixel buffer (structurally compatible with PixelBuffer)
  function buf(rgba: number[]): { data: Uint8ClampedArray; width: number; height: number } {
    return { data: new Uint8ClampedArray(rgba), width: 1, height: 1 }
  }

  it('leaves fully transparent pixels unchanged', () => {
    const output = swapPalette(buf([0, 0, 0, 0]), hollow)
    expect(output.data[3]).toBe(0)
  })

  it('maps a pure-white pixel to near the accent color', () => {
    const output = swapPalette(buf([255, 255, 255, 255]), hollow)
    // accent of hollow_dark is #9b30ff → r=155, g=48, b=255
    // toBeCloseTo with -1 precision = within ±5
    expect(output.data[0]).toBeCloseTo(155, -1)
    expect(output.data[1]).toBeCloseTo(48, -1)
    expect(output.data[2]).toBeCloseTo(255, -1)
    expect(output.data[3]).toBe(255)
  })

  it('maps a pure-black pixel to 0,0,0 (dark band t=0)', () => {
    const output = swapPalette(buf([0, 0, 0, 255]), hollow)
    expect(output.data[0]).toBe(0)
    expect(output.data[1]).toBe(0)
    expect(output.data[2]).toBe(0)
    expect(output.data[3]).toBe(255)
  })

  it('does not mutate the input data', () => {
    const input = buf([128, 128, 128, 255])
    const before = Array.from(input.data)
    swapPalette(input, hollow)
    expect(Array.from(input.data)).toEqual(before)
  })
})
