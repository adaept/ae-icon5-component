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

// Stencil's vdom sets `src`/`color` on <ion-icon> as element *properties* (not attributes), so read them
// as properties; `name`/`aria-*`/`class` are attributes.
type IonIconProps = { src?: string; color?: string }
const ionProps = (el: Element) => el as unknown as IonIconProps

describe('ae-icon5-component — icon attributes', () => {
  it('applies aesize as a class and color as the ion-icon color attribute', async () => {
    const { root } = await render(<ae-icon5-component name="football" aesize="ae64" color="primary" />)
    const icon = root.shadowRoot.querySelector('ion-icon')
    expect(icon.classList.contains('ae64')).toBe(true)
    expect(ionProps(icon).color).toBe('primary')
  })

  it('uses `src` (not `name`) for adaept="adaept"', async () => {
    const { root } = await render(<ae-icon5-component adaept="adaept" src="assets/aeicons/ae.svg" />)
    const icon = root.shadowRoot.querySelector('ion-icon')
    expect(ionProps(icon).src).toBe('assets/aeicons/ae.svg')
    expect(icon.getAttribute('name')).toBeNull()
  })

  it('renders the six-copy ae logo showcase for adaept="aelogos"', async () => {
    const { root } = await render(<ae-icon5-component adaept="aelogos" src="x" />)
    const icons = root.shadowRoot.querySelectorAll('ion-icon')
    expect(icons.length).toBe(6)
    expect(ionProps(icons[0]).src).toBe('assets/aeicons/ae-logo.svg') // the genuinely two-tone copy
    expect(ionProps(icons[1]).src).toBe('assets/aeicons/ae.svg') // single-color mono mark
  })

  it('renders the collapsible panel + form for adaept="mydataform"', async () => {
    const { root } = await render(<ae-icon5-component adaept="mydataform" aetitle="My panel" />)
    expect(root.shadowRoot.querySelector('#aeheader span').textContent).toBe('My panel')
    expect(root.shadowRoot.querySelector('form')).not.toBeNull()
  })
})

describe('ae-icon5-component — accessibility', () => {
  it('labels the icon with `arialabel` when set', async () => {
    const { root } = await render(<ae-icon5-component name="football" arialabel="a ball" />)
    expect(root.shadowRoot.querySelector('ion-icon').getAttribute('aria-label')).toBe('a ball')
  })

  it('falls back to `name` for the aria-label', async () => {
    const { root } = await render(<ae-icon5-component name="football" />)
    expect(root.shadowRoot.querySelector('ion-icon').getAttribute('aria-label')).toBe('football')
  })

  it('marks a `decorative` src icon aria-hidden with no aria-label', async () => {
    const { root } = await render(<ae-icon5-component adaept="adaept" src="assets/aeicons/ae.svg" decorative />)
    const icon = root.shadowRoot.querySelector('ion-icon')
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    expect(icon.getAttribute('aria-label')).toBeNull()
  })

  it('labels a non-decorative src icon', async () => {
    const { root } = await render(<ae-icon5-component adaept="adaept" src="assets/aeicons/ae.svg" arialabel="ae mark" />)
    const icon = root.shadowRoot.querySelector('ion-icon')
    expect(icon.getAttribute('aria-label')).toBe('ae mark')
    expect(icon.getAttribute('aria-hidden')).toBeNull()
  })
})

describe('ae-icon5-component — hover rotation (aerotatedeg)', () => {
  it('sets --ae-hover-rotate-deg to 180deg by default', async () => {
    const { root } = await render(<ae-icon5-component name="football" />)
    expect(root.style.getPropertyValue('--ae-hover-rotate-deg')).toBe('180deg')
  })

  it('uses a custom aerotatedeg and follows later changes', async () => {
    const { root, waitForChanges } = await render(<ae-icon5-component name="football" aerotatedeg={90} />)
    expect(root.style.getPropertyValue('--ae-hover-rotate-deg')).toBe('90deg')
    ;(root as unknown as HTMLAeIcon5ComponentElement).aerotatedeg = 45
    await waitForChanges()
    expect(root.style.getPropertyValue('--ae-hover-rotate-deg')).toBe('45deg')
  })
})
