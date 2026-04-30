// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import PixelButton from '../PixelButton'

// Use renderToString for server-side rendering in tests,
// then parse the output to verify structure.
function render(Component: React.FC<any>, props: Record<string, any>): string {
  return renderToString(React.createElement(Component, props))
}

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('PixelButton', () => {
  it('renders children text', () => {
    const html = render(PixelButton, { children: 'Click me' })
    expect(html).toContain('Click me')
  })

  it('renders as a <button> element', () => {
    const html = render(PixelButton, { children: 'Test' })
    expect(html).toContain('<button')
    expect(html).toContain('</button>')
  })

  it('applies the px-btn class', () => {
    const html = render(PixelButton, { children: 'Test' })
    expect(html).toContain('px-btn')
  })

  it('renders disabled when disabled prop is set', () => {
    const html = render(PixelButton, { children: 'Test', disabled: true })
    // In SSR, disabled is rendered as a boolean attribute
    expect(html).toContain('disabled=""')
  })

  it('sets CSS custom properties for border-image', () => {
    const html = render(PixelButton, { children: 'Test', variant: 'danger' })
    expect(html).toContain('--spr')
    expect(html).toContain('--slice')
  })

  it('renders without crashing with all variants', () => {
    for (const variant of ['primary', 'secondary', 'danger', 'success'] as const) {
      const html = render(PixelButton, { children: 'Test', variant })
      expect(html).toContain('Test')
    }
  })

  it('renders without crashing with all sizes', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const html = render(PixelButton, { children: 'Test', size })
      expect(html).toContain('Test')
    }
  })

  it('forwards additional HTML button props', () => {
    const html = render(PixelButton, {
      children: 'Test',
      'aria-label': 'custom label',
      type: 'submit',
    })
    expect(html).toContain('aria-label="custom label"')
    expect(html).toContain('type="submit"')
  })
})
