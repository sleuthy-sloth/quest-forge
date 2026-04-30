import { describe, it, expect } from 'vitest'
import { checkBodySize, bodyLimitMiddleware, DEFAULT_MAX_BODY_SIZE, AI_MAX_BODY_SIZE } from '../body-limit'

describe('checkBodySize', () => {
  it('allows small body within limit', async () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Length': '100' },
      body: 'x'.repeat(100),
    })
    const result = await checkBodySize(req, DEFAULT_MAX_BODY_SIZE)
    expect(result.valid).toBe(true)
  })

  it('rejects body exceeding limit via Content-Length header', async () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Length': '200000' },
    })
    const result = await checkBodySize(req, 100_000)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('too large')
  })

  it('allows body within AI limit', async () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Length': '5000' },
      body: 'x'.repeat(5000),
    })
    const result = await checkBodySize(req, AI_MAX_BODY_SIZE)
    expect(result.valid).toBe(true)
  })

  it('rejects body exceeding AI limit', async () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Length': '15000' },
    })
    const result = await checkBodySize(req, AI_MAX_BODY_SIZE)
    expect(result.valid).toBe(false)
  })

  it('returns valid for very small payloads', async () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      body: JSON.stringify({ title: 'hello' }),
    })
    const result = await checkBodySize(req, 100_000)
    expect(result.valid).toBe(true)
  })
})

describe('bodyLimitMiddleware', () => {
  it('returns null for valid body', async () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Length': '100' },
    })
    expect(await bodyLimitMiddleware(req)).toBeNull()
  })

  it('returns Response (413) for oversized body', async () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Length': '200000' },
    })
    const result = await bodyLimitMiddleware(req, 1000)
    expect(result).toBeInstanceOf(Response)
    expect(result!.status).toBe(413)
  })
})