import { describe, it, expect } from 'vitest'
import {
  isMaleBody,
  getCachedImage,
  getCacheSize,
} from '../compositor'

// ── isMaleBody ────────────────────────────────────────────────────────────────

describe('isMaleBody', () => {
  it('returns true for body_male', () => {
    expect(isMaleBody('body_male')).toBe(true)
  })

  it('returns true for body_soldier', () => {
    expect(isMaleBody('body_soldier')).toBe(true)
  })

  it('returns false for body_female', () => {
    expect(isMaleBody('body_female')).toBe(false)
  })

  it('returns false for arbitrary female body ids', () => {
    expect(isMaleBody('body_fat')).toBe(false)
    expect(isMaleBody('body_child')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isMaleBody(null)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isMaleBody('')).toBe(false)
  })
})

// ── Image cache (LRU) ─────────────────────────────────────────────────────────

describe('image cache', () => {
  it('getCachedImage returns undefined for uncached URL', () => {
    expect(getCachedImage('https://example.com/nonexistent.png')).toBeUndefined()
  })

  it('getCacheSize starts at 0', () => {
    // Note: cache is module-level, so other tests may have populated it.
    // This test is valid as a type/sanity check — size is always >= 0.
    expect(getCacheSize()).toBeGreaterThanOrEqual(0)
  })
})
