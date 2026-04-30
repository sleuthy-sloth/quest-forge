import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit } from '../rate-limiter'

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset module state by unmocking
  })

  it('allows first request from an IP', () => {
    const result = checkRateLimit('127.0.0.1', 5, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.current).toBe(1)
    expect(result.limit).toBe(5)
    expect(result.retryAfterSeconds).toBe(0)
  })

  it('allows requests within the limit', () => {
    const ip = '192.168.1.1'
    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(ip, 5, 60_000)
      expect(result.allowed).toBe(true)
      expect(result.current).toBe(i + 1)
    }
  })

  it('blocks requests exceeding the limit', () => {
    const ip = '10.0.0.1'
    // Use limit of 2
    expect(checkRateLimit(ip, 2, 60_000).allowed).toBe(true)
    expect(checkRateLimit(ip, 2, 60_000).allowed).toBe(true)
    // Third request should be blocked
    const result = checkRateLimit(ip, 2, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.current).toBe(2)
    expect(result.limit).toBe(2)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('tracks different IPs independently', () => {
    const ip1 = checkRateLimit('ip-a', 1, 60_000)
    expect(ip1.allowed).toBe(true)

    const ip2 = checkRateLimit('ip-b', 1, 60_000)
    expect(ip2.allowed).toBe(true)

    // ip-a should now be blocked
    expect(checkRateLimit('ip-a', 1, 60_000).allowed).toBe(false)

    // ip-b should now be blocked too
    expect(checkRateLimit('ip-b', 1, 60_000).allowed).toBe(false)

    // New IP should be allowed
    expect(checkRateLimit('ip-c', 1, 60_000).allowed).toBe(true)
  })

  it('provides retryAfterSeconds with a sensible value', () => {
    const ip = '10.0.0.2'
    checkRateLimit(ip, 1, 60_000) // first
    const result = checkRateLimit(ip, 1, 60_000) // blocked
    expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(1)
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(61)
  })

  it('respects different limit values', () => {
    const ip = '10.0.0.3'
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(ip, 10, 60_000)
      if (i < 10) {
        expect(result.allowed).toBe(true)
      } else {
        expect(result.allowed).toBe(false)
      }
    }
  })
})