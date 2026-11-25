// Guards the component's public CSS contract (modernization-plan §4/§4.1). Hover rings, shapes and the
// `aetype` presets are pure CSS, and Stencil's mock DOM doesn't evaluate selectors/cascade — so this reads
// the stylesheet source and asserts the hooks consumers depend on still exist. It catches an accidental
// rename/removal; it does NOT prove the rendering (that's the Puppeteer smoke + the demo).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(__dirname, '../src/components/ae-icon5-component/ae-icon5-component.css'), 'utf8')

describe('component CSS contract', () => {
  it.each(['square', 'pentagon', 'rotate'])('defines the aetype="%s" hover preset', (preset) => {
    expect(css).toContain(`:host([aetype="${preset}"])`)
  })

  it.each([
    '--ae-hover-ring-color',
    '--ae-hover-ring-width',
    '--ae-hover-radius',
    '--ae-hover-scale',
    '--ae-hover-bg',
    '--ae-hover-clip-path',
    '--ae-hover-inset',
    '--ae-hover-rotate-deg'
  ])('exposes the themeable custom property %s', (prop) => {
    expect(css).toContain(prop)
  })

  it('defaults the ring color to --ae-color (not a hardcoded red)', () => {
    expect(css).toMatch(/--ae-hover-ring-color:\s*var\(--ae-color/)
    expect(css).not.toMatch(/box-shadow:\s*inset 0 0 0 2px red/)
  })

  it('keeps --ionicon-stroke-width overridable from the host page (CF-12)', () => {
    expect(css).toMatch(/--ionicon-stroke-width:\s*var\(--ae-icon-stroke-width/)
  })
})
