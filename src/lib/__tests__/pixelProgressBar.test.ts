// src/lib/__tests__/pixelProgressBar.test.ts
// Tests pure value clamping logic — no DOM required

import { describe, it, expect } from 'vitest'

// Mirror the clamping formula from PixelProgressBar
function clamp(value: number, max: number): number {
  return max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
}

describe('PixelProgressBar value clamping', () => {
  it('returns 0 when value is 0', () => {
    expect(clamp(0, 100)).toBe(0)
  })

  it('returns 100 when value equals max', () => {
    expect(clamp(100, 100)).toBe(100)
  })

  it('returns 100 when value exceeds max', () => {
    expect(clamp(150, 100)).toBe(100)
  })

  it('returns 0 when max is 0 (avoids div-by-zero)', () => {
    expect(clamp(50, 0)).toBe(0)
  })

  it('computes intermediate percentage correctly', () => {
    expect(clamp(25, 100)).toBe(25)
    expect(clamp(78, 100)).toBe(78)
  })

  it('returns 0 for negative value', () => {
    expect(clamp(-10, 100)).toBe(0)
  })
})
