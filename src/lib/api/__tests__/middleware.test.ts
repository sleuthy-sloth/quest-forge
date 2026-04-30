import { describe, it, expect } from 'vitest'
import { sanitizeBody } from '../middleware'

describe('sanitizeBody', () => {
  it('sanitizes specified string fields', () => {
    const body = { title: '<b>Hello</b>', description: 'Clean text' }
    const result = sanitizeBody(body, ['title', 'description'])
    expect(result.title).toBe('Hello')
    expect(result.description).toBe('Clean text')
  })

  it('leaves non-specified fields untouched', () => {
    const body = { title: 'Hello', xp_reward: 100 }
    const result = sanitizeBody(body, ['title'])
    expect(result.title).toBe('Hello')
    expect((result as any).xp_reward).toBe(100)
  })

  it('handles empty body', () => {
    const result = sanitizeBody({}, ['title'])
    expect(result).toEqual({})
  })

  it('strips HTML from nested objects', () => {
    const body = { nested: { title: '<script>alert(1)</script>Hello' } }
    const result = sanitizeBody(body, ['title'])
    expect((result.nested as any).title).toBe('alert(1)Hello')
  })

  it('handles arrays of objects', () => {
    const body = { items: [{ title: '<b>A</b>' }, { title: '<i>B</i>' }] }
    const result = sanitizeBody(body, ['title'])
    expect((result.items as any[])[0].title).toBe('A')
    expect((result.items as any[])[1].title).toBe('B')
  })
})