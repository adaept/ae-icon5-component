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
      serviceWorker: null,
      // Demo-only: ion-icon's runtime SVG fetch (for any icon name outside the bundled
      // manifest — registerDefaultIcons) requests `/svg/<name>.svg` off the site root, not
      // `/build/svg/` where Stencil already copies ionicons' assetsDirs output. ion-icon is
      // auto-bundled by Stencil from ionicons' own collection metadata whenever `<ion-icon>`
      // appears in JSX — a separate compiled artifact from whatever we `import` from the
      // `ionicons` package in TS, so its resourcesUrl can't be reconfigured from component
      // code (setAssetPath there has no effect on it). Simplest fix: serve the same SVGs at
      // the path it's actually requesting them from.
      copy: [{ src: '../node_modules/ionicons/dist/ionicons/svg', dest: 'svg' }]
    }
  ]
}
