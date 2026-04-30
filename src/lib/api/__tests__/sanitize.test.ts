import { describe, it, expect } from 'vitest'
import { stripHtml, sanitizeText, sanitizeShortText } from '../sanitize'

describe('stripHtml', () => {
  it('removes simple HTML tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello')
  })

  it('removes nested HTML tags', () => {
    expect(stripHtml('<div><p><b>Nested</b></p></div>')).toBe('Nested')
  })

  it('strips script tags leaving content (stripHtml removes tags, not content)', () => {
    expect(stripHtml('<script>alert("xss")</script>')).toBe('alert("xss")')
  })

  it('strips all tags including event handlers', () => {
    expect(stripHtml('<div onclick="evil()">Click</div>')).toBe('Click')
  })

  it('strips anchor tags with javascript: URLs', () => {
    expect(stripHtml('<a href="javascript:alert(1)">Link</a>')).toBe('Link')
  })

  it('returns empty string for HTML-only input', () => {
    expect(stripHtml('<br/>')).toBe('')
  })

  it('preserves plain text without HTML', () => {
    expect(stripHtml('Hello, World!')).toBe('Hello, World!')
  })

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('')
  })

  it('removes data:text/html prefix when found (XSS defense)', () => {
    expect(stripHtml('data:text/html,<script>alert(1)</script>')).toBe(',alert(1)')
  })

  it('trims whitespace after stripping', () => {
    expect(stripHtml('  <p>Hello</p>  ')).toBe('Hello')
  })
})

describe('sanitizeText', () => {
  it('strips HTML and limits to maxLength', () => {
    const long = 'a'.repeat(6000)
    const result = sanitizeText(long, 5000)
    expect(result.length).toBe(5000)
  })

  it('preserves short text without HTML', () => {
    expect(sanitizeText('Hello, World!')).toBe('Hello, World!')
  })

  it('strips HTML from mixed content', () => {
    expect(sanitizeText('<b>Bold</b> and <i>italic</i>')).toBe('Bold and italic')
  })
})

describe('sanitizeShortText', () => {
  it('strips HTML', () => {
    expect(sanitizeShortText('<b>Title</b>')).toBe('Title')
  })

  it('normalizes multiple spaces to single', () => {
    expect(sanitizeShortText('Hello    World')).toBe('Hello World')
  })

  it('limits to 200 chars', () => {
    const long = 'a'.repeat(300)
    const result = sanitizeShortText(long)
    expect(result.length).toBe(200)
  })

  it('trims whitespace', () => {
    expect(sanitizeShortText('  hello  ')).toBe('hello')
  })
})