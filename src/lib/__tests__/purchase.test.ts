import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.fn()
const mockRpc = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
  })),
}))

// Import is hoisted below vi.mock by vitest, so the mock is active.
import { POST } from '@/app/api/loot/purchase/route'

function createRequest(body: unknown): NextRequest {
  return {
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers({ 'content-type': 'application/json' }),
  } as unknown as NextRequest
}

function createInvalidRequest(): NextRequest {
  return {
    json: vi.fn().mockRejectedValue(new Error('Bad JSON')),
    headers: new Headers({ 'content-type': 'application/json' }),
  } as unknown as NextRequest
}

beforeEach(() => {
  mockGetUser.mockReset()
  mockRpc.mockReset()
})

// ── Auth guards ─────────────────────────────────────────────────────────────

describe('POST /api/loot/purchase — auth', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const req = createRequest({ itemId: '550e8400-e29b-41d4-a716-446655440000' })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })
})

// ── Input validation ────────────────────────────────────────────────────────

describe('POST /api/loot/purchase — validation', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-abc-123' } },
    })
  })

  it('returns 400 for invalid JSON body', async () => {
    const req = createInvalidRequest()
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Invalid request body.')
  })

  it('returns 400 when itemId is missing', async () => {
    const req = createRequest({})
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBeDefined()
  })

  it('returns 400 for non-UUID itemId', async () => {
    const req = createRequest({ itemId: 'not-a-uuid' })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('itemId')
  })
})

// ── Purchase outcomes ───────────────────────────────────────────────────────

describe('POST /api/loot/purchase — outcomes', () => {
  const validItemId = '550e8400-e29b-41d4-a716-446655440000'

  beforeEach(() => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-abc-123' } },
    })
  })

  it('returns 500 on RPC error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: new Error('DB connection failed'),
    })

    const req = createRequest({ itemId: validItemId })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toContain('Purchase failed')
  })

  it('returns 402 for insufficient funds', async () => {
    mockRpc.mockResolvedValue({
      data: { error: 'Insufficient funds' },
      error: null,
    })

    const req = createRequest({ itemId: validItemId })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(402)
    expect(json.error).toBe('Insufficient funds')
  })

  it('returns 404 when profile not found', async () => {
    mockRpc.mockResolvedValue({
      data: { error: 'Profile not found' },
      error: null,
    })

    const req = createRequest({ itemId: validItemId })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toBe('Profile not found')
  })

  it('returns 404 when item is unavailable', async () => {
    mockRpc.mockResolvedValue({
      data: { error: 'Item not found or unavailable' },
      error: null,
    })

    const req = createRequest({ itemId: validItemId })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toContain('not found')
  })

  it('returns 200 with purchaseId and balances on success', async () => {
    mockRpc.mockResolvedValue({
      data: {
        redemptionId: 'redemption-uuid-999',
        newXpAvailable: 350,
        newGold: 120,
      },
      error: null,
    })

    const req = createRequest({ itemId: validItemId })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.redemptionId).toBe('redemption-uuid-999')
    expect(json.newXpAvailable).toBe(350)
    expect(json.newGold).toBe(120)
  })

  it('passes user id and item id to the purchase RPC', async () => {
    mockRpc.mockResolvedValue({
      data: { redemptionId: 'r-uuid' },
      error: null,
    })

    const req = createRequest({ itemId: validItemId })
    await POST(req)

    expect(mockRpc).toHaveBeenCalledWith('purchase_reward', {
      p_player_id: 'user-abc-123',
      p_reward_id: validItemId,
    })
  })
})
