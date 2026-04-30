// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { XPBar } from '../XPBar'

function render(props: { pct?: number; height?: number } = {}): string {
  return renderToString(React.createElement(XPBar, props))
}

describe('XPBar', () => {
  it('renders with default percentage (50%)', () => {
    const html = render()
    expect(html).toContain('qf-xp-bar')
    expect(html).toContain('qf-xp-fill')
    expect(html).toContain('width:50%')
  })

  it('renders with 0% width when pct is 0', () => {
    const html = render({ pct: 0 })
    expect(html).toContain('width:0%')
  })

  it('renders with 100% width when pct is 100', () => {
    const html = render({ pct: 100 })
    expect(html).toContain('width:100%')
  })

  it('clamps values below 0 to 0', () => {
    const html = render({ pct: -10 })
    expect(html).toContain('width:0%')
  })

  it('clamps values above 100 to 100', () => {
    const html = render({ pct: 150 })
    expect(html).toContain('width:100%')
  })

  it('sets custom height from props', () => {
    const html = render({ pct: 50, height: 12 })
    expect(html).toContain('height:12px')
  })

  it('renders with correct ARIA attributes', () => {
    const html = render({ pct: 75 })
    expect(html).toContain('role="meter"')
    expect(html).toContain('aria-valuenow="75"')
    expect(html).toContain('aria-valuemin="0"')
    expect(html).toContain('aria-valuemax="100"')
  })

  it('renders with qf-xp-bar and qf-xp-fill classes', () => {
    const html = render()
    expect(html).toContain('qf-xp-bar')
    expect(html).toContain('qf-xp-fill')
  })
})
