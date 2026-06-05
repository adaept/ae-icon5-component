import { newSpecPage } from '@stencil/core/testing'
import { AeIcon5 } from './ae-icon5-component'

describe('ae-icon5-component', () => {
  it('builds / is defined', () => {
    expect(new AeIcon5()).toBeTruthy()
  })

  it('renders an <ion-icon> when given a name', async () => {
    const page = await newSpecPage({
      components: [AeIcon5],
      html: '<ae-icon5-component name="football" aesize="ae48"></ae-icon5-component>'
    })
    const icon = page.root.shadowRoot.querySelector('ion-icon')
    expect(icon).not.toBeNull()
    expect(icon.getAttribute('name')).toBe('football')
  })

  it('renders nothing when no name/src/adaept is provided', async () => {
    const page = await newSpecPage({
      components: [AeIcon5],
      html: '<ae-icon5-component></ae-icon5-component>'
    })
    expect(page.root.shadowRoot.querySelector('ion-icon')).toBeNull()
  })
})
