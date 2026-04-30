import { describe, it, expect } from 'vitest'
import { validateOrigin, csrfMiddleware } from '../csrf'

describe('validateOrigin', () => {
  function makeRequest(origin?: string, referer?: string): Request {
    const headers: Record<string, string> = {}
    if (origin) headers['origin'] = origin
    if (referer) headers['referer'] = referer
    return new Request('http://localhost:3000/api/test', { headers })
  }

  it('allows requests with no origin or referer (direct API calls)', () => {
    const req = makeRequest()
    expect(validateOrigin(req).valid).toBe(true)
  })

  it('allows localhost origin in development', () => {
    const req = makeRequest('http://localhost:3000')
    expect(validateOrigin(req).valid).toBe(true)
  })

  it('allows localhost 127.0.0.1 origin', () => {
    const req = makeRequest('http://127.0.0.1:3000')
    expect(validateOrigin(req).valid).toBe(true)
  })

  it('blocks unknown origins', () => {
    const req = makeRequest('https://evil-site.com')
    expect(validateOrigin(req).valid).toBe(false)
  })

  it('blocks suspicious origins', () => {
    const req = makeRequest('https://not-your-app.com')
    expect(validateOrigin(req).valid).toBe(false)
  })

  it('allows production origin matching request URL', () => {
    const req = new Request('https://questforge.vercel.app/api/test', {
      headers: { origin: 'https://questforge.vercel.app' },
    })
    expect(validateOrigin(req).valid).toBe(true)
  })

  it('falls back to Referer when Origin is missing', () => {
    const req = makeRequest(undefined, 'http://localhost:3000/some-page')
    expect(validateOrigin(req).valid).toBe(true)
  })

  it('blocks invalid Referer', () => {
    const req = makeRequest(undefined, 'https://evil-site.com/some-page')
    expect(validateOrigin(req).valid).toBe(false)
  })
})

describe('csrfMiddleware', () => {
  it('returns null for GET requests (no check)', () => {
    const req = new Request('http://localhost:3000/api/test')
    expect(csrfMiddleware(req, 'GET')).toBeNull()
  })

  it('returns Response for POST with invalid origin', () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { origin: 'https://evil-site.com' },
    })
    const result = csrfMiddleware(req)
    expect(result).toBeInstanceOf(Response)
    expect(result!.status).toBe(403)
  })

  it('returns null for POST with valid origin', () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    })
    expect(csrfMiddleware(req)).toBeNull()
  })
})