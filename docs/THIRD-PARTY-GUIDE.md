# Third-party guide — build your own icon component package

A bullet-proof, copy-pasteable procedure for creating your own Stencil icon-component package
modelled on [`@adaept/ae-icon5`](../README.md). This repo is the **reference implementation** —
every step points at the canonical file to copy. The condensed version is the
[README recipe](../README.md#build-your-own-icon-component-package-recipe).

Throughout, the running example uses these placeholders — substitute your own:

| Placeholder | Example | Where |
|---|---|---|
| package name | `@you/my-icons` | `package.json` `name` |
| Stencil namespace | `myicons` | `stencil.config.ts` |
| element tag | `<my-icon>` | `@Component({ tag })` |
| CSS prop prefix | `--mi-` | component CSS |

> **Maintainers:** keep this guide in sync with each release. The **Pinned toolchain** block below
> is machine-checked against `package.json` by `npm run check.guide`
> (`scripts/check-guide-pins.mjs`, wired into CI) — a drift fails the build. See the
> [Release checklist](#release-checklist-keep-in-sync) at the end.

## Prerequisites

- **Node 22+** (`node -v`). Use the same major in CI.
- npm 8+ (ships with Node 22).
- A GitHub repo, an npm account/org for the scope, and a Firebase project if you want the hosted demo.

## Pinned toolchain

These are the versions this package is built and tested against. **Do not edit the block below by
hand without matching `package.json`** (and vice-versa) — `npm run check.guide` enforces it.

<!-- toolchain-pins:start -->
- node: >=22
- @stencil/core: ^4.43.5
- ionicons: ^8.0.13
- typescript: ~5.9.3
- eslint: ^9.39.4
- typescript-eslint: ^8.60.1
- jest: ^29.7.0
- puppeteer: ^24.1.0
- vitest: ^4.1.8
<!-- toolchain-pins:end -->

---

## 1. Scaffold + pin the toolchain

```bash
npm init stencil@latest component my-icons
cd my-icons
```

Choose the **component** starter. It ships older dependencies, so align them to the pinned
toolchain above:

- In `package.json`, set the engine and replace the dependency blocks with the pinned versions
  (copy from this repo's [`package.json`](../package.json) — `dependencies` has just `ionicons`;
  `devDependencies` has Stencil, TypeScript, the ESLint 9 stack, Jest, Puppeteer, Vitest, jsdom):

  ```jsonc
  "engines": { "node": ">=22" },
  "dependencies": { "ionicons": "^8.0.13" },
  "devDependencies": {
    "@eslint/js": "^9.39.4", "@stencil/core": "^4.43.5", "@types/jest": "^29.5.14",
    "eslint": "^9.39.4", "globals": "^16.5.0", "jest": "^29.7.0", "jest-cli": "^29.7.0",
    "jsdom": "^26.1.0", "puppeteer": "^24.1.0", "typescript": "~5.9.3",
    "typescript-eslint": "^8.60.1", "vitest": "^4.1.8"
  }
  ```

- Switch to **ESLint 9 flat config**: delete `.eslintrc*` and add
  [`eslint.config.mjs`](../eslint.config.mjs) (it sets browser globals for `*.{ts,tsx}` and
  node+browser globals for `scripts/**` + `testing/**` tooling, and ignores generated files).

- `npm install`.

> **Pitfall — TypeScript target.** Keep `tsconfig.json` at `"target": "es2017"`. Bumping to
> `es2022` flips `useDefineForClassFields` to `true`, which **breaks Stencil's `@Prop`/`@State`
> decorators**. If you must raise the target, also set `"useDefineForClassFields": false`.

## 2. Output targets

Edit [`stencil.config.ts`](../stencil.config.ts):

```ts
import type { Config } from '@stencil/core'

export const config: Config = {
  namespace: 'myicons',
  outputTargets: [
    // Primary: tree-shakable custom elements; self-registers the tag on import.
    { type: 'dist-custom-elements', customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false, generateTypeDeclarations: true },
    // Back-compat: lazy loader (defineCustomElements) for current consumers.
    { type: 'dist' },
    // The showcase demo.
    { type: 'www', serviceWorker: null }
  ]
}
```

`dist-custom-elements` is what tree-shaking consumers import; `dist` is the lazy loader;
`www` is the demo you deploy. Keep `shadow: true` on the component (next step).

## 3. Component + themeable CSS

Model on [`src/components/ae-icon5-component/`](../src/components/ae-icon5-component). Minimum:

```tsx
import { Component, Prop, h } from '@stencil/core'
import 'ionicons'                                   // defines the <ion-icon> element
import { registerDefaultIcons } from '../../icons'  // step 4

@Component({ tag: 'my-icon', styleUrl: 'my-icon.css', shadow: true })
export class MyIcon {
  @Prop() name: string                       // ionicons icon name (kebab)
  @Prop() color: string                      // Ionic THEME color only
  @Prop() set: string = 'ionicons'           // source seam (step 4)

  private timer: ReturnType<typeof setInterval>
  connectedCallback() { /* start any timers here */ }
  disconnectedCallback() { clearInterval(this.timer) }   // never leak timers

  componentWillLoad() { registerDefaultIcons(this.set) }

  render() { return this.name ? <ion-icon name={this.name} color={this.color} /> : null }
}
```

Theme through **CSS custom properties** (they pierce the shadow boundary) — see
[`…/ae-icon5-component.css`](../src/components/ae-icon5-component/ae-icon5-component.css):

```css
:host {
  --mi-hover-ring-color: currentColor;  /* defaults */
  --mi-hover-ring-width: 2px;
  --mi-hover-radius: 50%;               /* 50% = circle, 0 = square */
  --mi-hover-scale: 1;                  /* 1 = no zoom */
}
ion-icon { color: var(--mi-color, currentColor); }   /* arbitrary color via --mi-color */
ion-icon:hover {
  box-shadow: inset 0 0 0 var(--mi-hover-ring-width) var(--mi-hover-ring-color);
  border-radius: var(--mi-hover-radius);
  transform: scale(var(--mi-hover-scale));
}
```

> **Two coloring paths, by design.** ionicons reflects the `color` attribute to a
> `:host(.ion-color){ color: var(--ion-color-base) !important }` rule **inside its own shadow
> DOM** and ships the 9 Ionic theme colors (`primary`…`dark`). So: **theme colors → `color=`**;
> **any other color → `--mi-color`** (a custom property the consumer sets). **Do not** bundle a
> big named-color palette in the component — those classes only work in the shadow scope and bloat
> every consumer (~1300 lines here, removed in v1.4.0).

> **Pitfall — timers.** Start intervals/timeouts in `connectedCallback` and clear them in
> `disconnectedCallback`. A timer started in the constructor and never cleared keeps Jest's
> process alive (the test run hangs).

## 4. Scoped icons (the important bit)

This is what lets consumers bundle only the icons they use (no runtime SVG fetch) and drop a
wholesale copy of the icon set. Model on [`src/icons/`](../src/icons).

**`src/icons/manifest.ts`** — map kebab `name` → **named** ES imports:

```ts
// NAMED imports only — `import * as` would bundle all ~1357 icons.
import { home, settings, search } from 'ionicons/icons'

export const defaultIcons: Record<string, string> = {
  home, settings, search   // keys are the kebab `name=` values
}
```

**`src/icons/index.ts`** — register on load + expose helpers for consumers:

```ts
export { addIcons } from 'ionicons'
export { defaultIcons } from './manifest'

import { addIcons } from 'ionicons'
import { defaultIcons } from './manifest'

let registered = false
export function registerDefaultIcons(_set = 'ionicons') {
  if (registered) return; registered = true
  addIcons(defaultIcons)
}
export function registerIcons(icons: Record<string, string>) { addIcons(icons) }
```

Consumers then bundle their own:

```ts
import { registerIcons } from '@you/my-icons'
import { home, settings } from 'ionicons/icons'
registerIcons({ home, settings })   // bundled, no runtime fetch
```

- **Export from the package root.** Add [`src/index.ts`](../src/index.ts) re-exporting the icon
  utils, and point `package.json` `types` → `dist/types/index.d.ts` (step 8). The utils get
  inlined into the component bundle, so there is **no** `dist/components/icons` subpath — the
  root export is the stable one.
- **Source seam (future-proofing).** Add a tiny [`src/icons/sources.ts`](../src/icons/sources.ts)
  with an `IconSource` interface + a `set` prop (default your one source). Even with a single
  source, this lets you add others (e.g. Iconify) later **without** an API break.

> **Pitfall — tree-shaking.** Never `import * as icons from 'ionicons/icons'`; always destructure
> named exports. Verify with `npm run build` then check the published size in step 8.

## 5. Build stamp + demo

Copy [`scripts/gen-build-stamp.mjs`](../scripts/gen-build-stamp.mjs). It writes
`src/assets/build-stamp.js` (a `window.MY_BUILD_STAMP = {…}`) with the git sha/branch/time and the
**version triple** `iconset/Stencil/component` (read from the installed packages + `package.json`):

- Wire it into npm hooks so it regenerates on every build/dev run:
  ```jsonc
  "scripts": {
    "gen.stamp": "node scripts/gen-build-stamp.mjs",
    "prebuild":  "node scripts/gen-build-stamp.mjs",
    "prestart":  "node scripts/gen-build-stamp.mjs"
  }
  ```
- Load it in the demo `src/index.html` and render a footer (see this repo's
  [`src/index.html`](../src/index.html) — the `aeBuildStamp` / `aeVersionTriple` elements).
- **Gitignore the generated file:** add `src/assets/build-stamp.js` to `.gitignore` (it's
  demo-only and regenerated each build).

## 6. Tests + a rename guard

- **Spec tests (Stencil/Jest)** — `*.spec.ts` next to the component, using `newSpecPage`. See
  [`…/ae-icon5-component.spec.ts`](../src/components/ae-icon5-component/ae-icon5-component.spec.ts)
  and [`src/icons/icons.spec.ts`](../src/icons/icons.spec.ts). Run with `npm test`
  (`stencil test --spec --e2e`).
- **Vitest POC** — copy [`vitest.config.ts`](../vitest.config.ts) (scoped to `test/**/*.vitest.ts`,
  `environment: 'jsdom'`, `globals: true`) and a [`test/*.vitest.ts`](../test/vitest-poc.vitest.ts).
  Run with `npm run test.unit`.
- **Puppeteer smoke** — copy [`testing/smoke.mjs`](../testing/smoke.mjs); it self-serves `./www`
  (or hits `BASE_URL`) and asserts the element renders + no page errors. Run with `npm run smoke`.
- **Rename guard** — copy [`scripts/check-icon-manifest.mjs`](../scripts/check-icon-manifest.mjs)
  (`npm run check.icons`): validates every manifest `name` against the **installed** ionicons
  (svg set + ES export), so a renamed icon fails the build instead of silently 404-ing.

```jsonc
"scripts": {
  "test": "stencil test --spec --e2e",
  "test.unit": "vitest run",
  "smoke": "node testing/smoke.mjs",
  "check.icons": "node scripts/check-icon-manifest.mjs"
}
```

> **Pitfall — runner collision.** Keep Vitest files **out of `src/`** and named `*.vitest.ts`.
> `stencil test` runs Jest over `*.spec.ts` / `*.e2e.ts`; the naming + `test/` location keep the
> two runners from picking up each other's files. The full Jest→Vitest migration can come later.

## 7. CI + release

Copy [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) and
[`release.yml`](../.github/workflows/release.yml).

- **CI** (push/PR): `npm ci` → `lint` → `check.icons` (→ `check.guide` if you keep a guide) →
  `build` → `npm test` (Jest) → `test.unit` (Vitest) → `smoke`. Puppeteer needs
  `--no-sandbox` on the runner — `smoke.mjs` adds it when `CI` is set.
- **Release** (on a `v*` tag): build + test → `npm publish --provenance` → deploy `www/` to
  Firebase → smoke the deployed URL → GitHub Release.
- Add repo **secrets** before tagging: `NPM_TOKEN` (npm automation token) and
  `FIREBASE_SERVICE_ACCOUNT` (a service-account JSON for your Firebase project). For
  `--provenance`, the release job needs `permissions: { id-token: write, contents: write }`.

## 8. Package hygiene (don't ship the demo to consumers)

In `package.json`:

- **Entry fields** — point them at what Stencil 4 actually emits, and remove stale ones:
  ```jsonc
  "main": "dist/index.cjs.js",
  "module": "dist/index.js",
  "unpkg": "dist/myicons/myicons.esm.js",
  "types": "dist/types/index.d.ts",
  "customElements": "dist/components/index.js"
  ```
  > **Pitfall.** The old Stencil layout's `es2015`/`es2017` → `dist/esm/index.mjs` no longer
  > exists under Stencil 4 — delete those fields (they point at a missing file).

- **`files` — ship `dist/` but negate the demo/runtime assets** so consumers don't get them:
  ```jsonc
  "files": [
    "dist/",
    "!dist/myicons/svg", "!dist/myicons/svg/**",            // the icon-set SVG copy (runtime-fetch fallback)
    "!dist/collection/assets", "!dist/collection/assets/**" // demo assets + the generated build-stamp
  ]
  ```
  (Negation works inside the `dist/` whitelist; an `.npmignore` does **not** — npm's `files`
  directory whitelist overrides it.)

- **`"prepublishOnly": "npm run build"`** so a manual publish can't ship a stale `dist`.
- **`homepage`** → your deployed demo URL.

**Verify before every publish:**

```bash
npm publish --dry-run    # inspect the file list + size
```

Confirm the tarball has **no** icon-set SVGs and **no** `build-stamp.js` leak, and that the entry
files resolve. (Here this trimmed the package from 360 kB / 1418 files to ~127 kB / 48 files.)

## 9. Publish

```bash
# bump "version" in package.json, commit, then:
git tag vX.Y.Z
git push origin vX.Y.Z      # release.yml publishes npm + deploys the demo + cuts the Release
```

For a local/manual publish instead: `npm publish --access public` (the `prepublishOnly` build runs
first).

---

## Release checklist (keep in sync)

On every release, update this guide alongside `package.json`:

- [ ] Bump the **[Pinned toolchain](#pinned-toolchain)** block to match `package.json`
      (`npm run check.guide` enforces this in CI).
- [ ] Re-verify each step's commands/snippets against the current toolchain.
- [ ] Re-run `npm run check.guide` locally before tagging.
