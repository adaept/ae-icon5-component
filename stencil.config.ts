import type { Config } from '@stencil/core'

export const config: Config = {
  namespace: 'aeicon5',
  outputTargets: [
    // Primary (D1): tree-shakable custom elements — what aedh targets in ★A2.
    // `auto-define-custom-elements` self-registers the tag on import.
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      generateTypeDeclarations: true
    },
    // Back-compat (D1): lazy loader — keeps aedh's current main.ts registration
    // working through one transition cycle. Remove in a later major.
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ]
}
