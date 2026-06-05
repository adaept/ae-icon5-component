import { defaultIcons } from './manifest'
import { registerDefaultIcons, registerIcons, getIconSource, DEFAULT_ICON_SET } from './index'

describe('scoped-icon manifest (D2)', () => {
  it('default set is a non-empty kebab → SVG-data map', () => {
    const keys = Object.keys(defaultIcons)
    expect(keys.length).toBeGreaterThan(20)
    expect(defaultIcons.football).toContain('data:image/svg+xml')
  })

  it('every key is kebab-case', () => {
    for (const k of Object.keys(defaultIcons)) {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('includes the icons aedh depends on', () => {
    for (const n of ['football', 'basketball', 'baseball', 'tennisball', 'menu', 'add']) {
      expect(defaultIcons[n]).toBeTruthy()
    }
  })

  it('registration helpers do not throw', () => {
    expect(() => registerDefaultIcons()).not.toThrow()
    expect(() => registerIcons({ 'x-test': defaultIcons.football })).not.toThrow()
  })
})

describe('icon-source seam (D3)', () => {
  it('resolves the default source and falls back for unknown sets', () => {
    expect(getIconSource('ionicons').id).toBe('ionicons')
    expect(getIconSource(undefined).id).toBe(DEFAULT_ICON_SET)
    expect(getIconSource('iconify:mdi').id).toBe('ionicons') // not implemented → fallback
  })
})
