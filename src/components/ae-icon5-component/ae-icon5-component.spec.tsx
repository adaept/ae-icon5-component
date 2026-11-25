import { render, h, describe, it, expect } from '@stencil/vitest'

// Runs against the built lazy loader (see vitest-setup.ts). The old `new AeIcon5()` smoke test is
// dropped: decorators aren't compiled under plain Vitest, and the render tests below cover it.
describe('ae-icon5-component', () => {
  it('renders an <ion-icon> when given a name', async () => {
    const { root } = await render(<ae-icon5-component name="football" aesize="ae48" />)
    const icon = root.shadowRoot.querySelector('ion-icon')
    expect(icon).not.toBeNull()
    expect(icon.getAttribute('name')).toBe('football')
  })

  it('renders nothing when no name/src/adaept is provided', async () => {
    const { root } = await render(<ae-icon5-component />)
    expect(root.shadowRoot.querySelector('ion-icon')).toBeNull()
  })
})
