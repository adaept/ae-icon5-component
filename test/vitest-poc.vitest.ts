// Vitest harness POC (modernization-plan D4) — proves the Vitest runner is wired
// (jsdom DOM + project ESM resolution). Component specs now also run on Vitest via
// @stencil/vitest (plan §10.1); this stays as the pure-unit `unit` project baseline.
// Pure data import only (manifest pulls `ionicons/icons` SVG strings — no Stencil
// runtime / no `ionicons` main element registration).
import { defaultIcons } from '../src/icons/manifest'

describe('vitest harness (POC)', () => {
  it('runs unit tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('has a jsdom DOM environment', () => {
    const el = document.createElement('div')
    el.textContent = 'ok'
    expect(el.textContent).toBe('ok')
  })

  it('resolves project ESM — scoped-icon manifest', () => {
    expect(Object.keys(defaultIcons).length).toBeGreaterThan(20)
    expect(defaultIcons.football).toContain('data:image/svg+xml')
  })
})
