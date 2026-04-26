import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc,
  })),
}))

// Imports are hoisted below vi.mock by vitest, so the mock is active.
import { canMakeRequest, incrementUsage, getUsageToday } from '../ai/rate-limiter'

const DAILY_LIMIT = 1_400

beforeEach(() => {
  mockRpc.mockReset()
})

// ── canMakeRequest ──────────────────────────────────────────────────────────

describe('canMakeRequest', () => {
  it('returns true when usage is below the limit', async () => {
    mockRpc.mockResolvedValue({ data: 500, error: null })
    await expect(canMakeRequest()).resolves.toBe(true)
  })

  it('returns true when usage is exactly at the safety margin (1399)', async () => {
    mockRpc.mockResolvedValue({ data: DAILY_LIMIT - 1, error: null })
    await expect(canMakeRequest()).resolves.toBe(true)
  })

  it('returns false when usage reaches the limit', async () => {
    mockRpc.mockResolvedValue({ data: DAILY_LIMIT, error: null })
    await expect(canMakeRequest()).resolves.toBe(false)
  })

  it('returns false when usage exceeds the limit', async () => {
    mockRpc.mockResolvedValue({ data: 1500, error: null })
    await expect(canMakeRequest()).resolves.toBe(false)
  })

  it('returns false on RPC error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('DB error') })
    await expect(canMakeRequest()).resolves.toBe(false)
  })

  it('returns false when RPC throws an exception', async () => {
    mockRpc.mockRejectedValue(new Error('Network failure'))
    await expect(canMakeRequest()).resolves.toBe(false)
  })

  it('passes today date to the RPC', async () => {
    mockRpc.mockResolvedValue({ data: 0, error: null })
    const today = new Date().toISOString().slice(0, 10)
    await canMakeRequest()
    expect(mockRpc).toHaveBeenCalledWith('get_api_usage_today', { p_date: today })
  })
})

// ── incrementUsage ──────────────────────────────────────────────────────────

describe('incrementUsage', () => {
  it('returns the new count from RPC', async () => {
    mockRpc.mockResolvedValue({ data: 42, error: null })
    await expect(incrementUsage()).resolves.toBe(42)
  })

  it('returns 0 on RPC error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('Write conflict') })
    await expect(incrementUsage()).resolves.toBe(0)
  })

  it('passes today date to the RPC', async () => {
    mockRpc.mockResolvedValue({ data: 1, error: null })
    const today = new Date().toISOString().slice(0, 10)
    await incrementUsage()
    expect(mockRpc).toHaveBeenCalledWith('increment_api_usage', { p_date: today })
  })
})

// ── getUsageToday ──────────────────────────────────────────────────────────

describe('getUsageToday', () => {
  it('returns the count from RPC', async () => {
    mockRpc.mockResolvedValue({ data: 7, error: null })
    await expect(getUsageToday()).resolves.toBe(7)
  })

  it('returns 0 when RPC returns null data', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    await expect(getUsageToday()).resolves.toBe(0)
  })

  it('returns 0 on exception', async () => {
    mockRpc.mockRejectedValue(new Error('DB down'))
    await expect(getUsageToday()).resolves.toBe(0)
  })
})
