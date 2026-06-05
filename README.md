# @adaept/ae-icon5

A small [Stencil](https://stenciljs.com/) web component that renders
[ionicons](https://ionic.io/ionicons) (and adaept logo/ambigram SVGs) as
`<ae-icon5-component>`. Shadow DOM, themeable via CSS custom properties.

- **npm:** `@adaept/ae-icon5` · **element:** `<ae-icon5-component>` · **demo:** https://aeicon5.web.app
- Built on ionicons 8 / Stencil 4.

---

## Install

```bash
npm i @adaept/ae-icon5
```

## Register the element

There are two builds. Pick one.

**1. Custom elements (tree-shakable — recommended).** Imports only what you use and
self-registers the tag:

```js
import '@adaept/ae-icon5/dist/components';   // defines <ae-icon5-component>
```

**2. Lazy loader (back-compat).** Registers the component lazily at runtime:

```js
import { defineCustomElements } from '@adaept/ae-icon5/dist/loader';
defineCustomElements();
```

Then use it anywhere in HTML:

```html
<ae-icon5-component name="football" aesize="ae48"></ae-icon5-component>
```

> `name` is an ionicons icon name. ionicons fetches the SVG at runtime, so the icon set
> must be available to the host app (a build-time icon manifest is planned — see the
> modernization plan §5).

---

## How it works

`<ae-icon5-component>` renders an inner `<ion-icon>` inside its **shadow DOM**. Because the
inner icon is encapsulated, you style it through **CSS custom properties**, which pierce the
shadow boundary — no `::part` needed for the common cases.

### Sizing — `aesize`

Use `aesize="aeNN"` where `NN` is the pixel size (multiples of 8, `ae16`…`ae128`, plus
`ae192`…`ae1024`):

```html
<ae-icon5-component name="rocket" aesize="ae64"></ae-icon5-component>
```

Stroke-width variants for outline icons use `aeswNN` (`aesw32`…`aesw80`):

```html
<ae-icon5-component name="football-outline" aesize="aesw48"></ae-icon5-component>
```

### Coloring icons

There are **two** ways to color an icon, by design:

| You want… | Use | Example |
|---|---|---|
| an **Ionic theme color** | the `color` attribute (`primary`, `secondary`, `tertiary`, `success`, `warning`, `danger`, `light`, `medium`, `dark`) | `color="success"` |
| **any other color** (hex, `rgb()`, CSS named color, a var) | the `--ae-color` custom property | `style="--ae-color: mediumvioletred"` |

```html
<!-- theme color (resolved by ionicons) -->
<ae-icon5-component name="checkmark" color="success" aesize="ae32"></ae-icon5-component>

<!-- any CSS color via the custom property -->
<ae-icon5-component name="heart" style="--ae-color: #ed2939" aesize="ae32"></ae-icon5-component>
<ae-icon5-component name="leaf" style="--ae-color: seagreen" aesize="ae32"></ae-icon5-component>
```

You can also set `--ae-color` from a stylesheet to theme many icons at once:

```css
ae-icon5-component { --ae-color: rebeccapurple; }
```

`--ae-color` falls back to `--color` (default `pink`) when unset.

> **Migration note (v1.4.0):** earlier versions bundled ~100 named-web-color classes
> (`color="mediumvioletred"`, `color="papayawhip"`, …) **inside** the component. Those were
> demo-only and have been **removed from the shipped component** to keep it lean. Ionic theme
> colors via `color=` are unchanged; for everything else use `--ae-color`. The demo
> (`src/index.html`) shows the pattern.

### Themeable hover

Hovering an icon draws a ring. It is fully configurable through CSS custom properties
(defaults shown). The old hardcoded red square ring is gone:

```css
ae-icon5-component {
  --ae-hover-ring-color: currentColor; /* ring color  (default: the icon's color) */
  --ae-hover-ring-width: 2px;          /* ring thickness                          */
  --ae-hover-radius: 50%;              /* shape: 50% = circle, 0 = square         */
  --ae-hover-scale: 1;                 /* zoom on hover: 1 = none, e.g. 1.5        */
  --ae-hover-bg: transparent;          /* fill behind the icon on hover           */
}
```

Example — a thick blue square that zooms slightly on hover:

```css
ae-icon5-component.fancy {
  --ae-hover-ring-color: #1e90ff;
  --ae-hover-ring-width: 4px;
  --ae-hover-radius: 0;
  --ae-hover-scale: 1.2;
}
```

### Props (current)

| Prop | Type | Notes |
|---|---|---|
| `name` | string | ionicons icon name (e.g. `football`, `add-circle-outline`) |
| `aesize` | string | size class, `aeNN` / `aeswNN` |
| `color` | string | Ionic **theme** color only (use `--ae-color` for others) |
| `src` | string | URL to an SVG (used with `adaept`) |
| `adaept` | string | render mode: `aelogos`, `namigram`, `mydataform`/`mydatapanel`, `adaept` |
| `arialabel` | string | accessibility label / demo click hooks |
| `aetype` | string | WIP (round) |

---

## Icon sources & scoped icons

By default `<ion-icon name="…">` fetches its SVG from ionicons **at runtime**. To avoid
that network fetch (and to let host apps drop a wholesale copy of all ionicons SVGs), this
component ships a small **build-time manifest** that registers a curated default set from
ionicons' ES modules via `addIcons` — bundled, no fetch.

- **Default set** — a curated list (`src/icons/manifest.ts`, ~34 icons: the sport balls,
  common app/menu/fab icons). These render from bundled data. Any name **not** in the set
  still falls back to ionicons' runtime fetch, so large galleries keep working.
- **Register your own** — bundle exactly the icons your app uses (this is how a host app
  drops the full ionicons SVG copy):

  ```js
  import { registerIcons } from '@adaept/ae-icon5';      // icon utilities (package root)
  import { home, settings, search } from 'ionicons/icons';

  registerIcons({ home, settings, search }); // kebab name → SVG data, bundled
  ```

  `registerIcons` is a thin wrapper over ionicons' `addIcons` (also re-exported), so
  `import { addIcons } from 'ionicons'` works identically if you prefer.

- **Why ES imports?** Named imports from `ionicons/icons` are tree-shaken to just what you
  register, and if ionicons **renames or removes** an icon, your build fails on the missing
  export instead of silently rendering a blank (a runtime 404). The bundled manifest is
  guarded in CI:

  ```bash
  npm run check.icons   # validates every manifest name against the installed ionicons
  ```

### Icon `set` (source) — `set`

The `set` prop selects the icon source. Only `ionicons` is implemented this cycle (the
default); it is the seam for adding providers such as Iconify later **without** API changes:

```html
<ae-icon5-component name="football" set="ionicons"></ae-icon5-component>
```

> **Roadmap:** Iconify (`set="iconify:mdi"`, …) is planned for ≈ v1.5.0 (modernization plan
> §6 / D3). Unknown sets fall back to `ionicons`.

---

## Demo

The showcase in `www/` is deployed to **https://aeicon5.web.app**. It is built separately
from the published component and carries a **build stamp** in the footer:

```
8.0.13/4.43.5/1.4.0 · 75124fa@master · built 2026-06-05T…Z
```

— the **version triple** `ionicons/Stencil/component` plus the git sha, branch and build
time. It is generated by `scripts/gen-build-stamp.mjs` (run automatically via the `prebuild`
/ `prestart` npm hooks) into `src/assets/build-stamp.js`, which is **demo-only** and never
imported by the published component.

---

## Develop

```bash
npm start          # Stencil dev server (watch + serve) at the demo
npm run build      # build dist + dist-custom-elements + www
npm run lint       # ESLint 9 flat config
```

**Local dev against aedh without publishing** — use `npm pack` (not `npm link`):

```bash
npm pack                                   # → adaept-ae-icon5-<version>.tgz
# in aedh:
npm i ../ae-icon5-component/adaept-ae-icon5-<version>.tgz
```

## Test

```bash
npm test           # component specs — Stencil/Jest (newSpecPage)
npm run test.unit  # Vitest POC (pure unit, jsdom) — the Vitest baseline
npm run smoke      # Puppeteer smoke: self-serves ./www, asserts it renders
npm run check.icons # validate the scoped-icon manifest vs installed ionicons
```

- **Specs** stay on Stencil's built-in **Jest** (`*.spec.ts`); the full Jest → Vitest
  crossover is deferred to sync with aedh (plan §12 / D4).
- **Smoke** runs against the local `www` by default; set `BASE_URL` to hit the deployed
  demo: `BASE_URL=https://aeicon5.web.app npm run smoke`.

## CI / Release

- **`.github/workflows/ci.yml`** — on push/PR to `master`: install → lint → `check.icons`
  → build → spec tests → Vitest → smoke the built demo.
- **`.github/workflows/release.yml`** — on a `v*` tag: build + test → `npm publish`
  (`--provenance`, needs `NPM_TOKEN`) → deploy `www/` to the **aeicon5** Firebase site
  (needs `FIREBASE_SERVICE_ACCOUNT`) → smoke the deployed demo → GitHub Release.

To cut a release: bump `version` in `package.json`, then

```bash
git tag v1.4.0 && git push origin v1.4.0
```

The demo's version triple (`ionicons/Stencil/component`) and git# stamp update automatically
from the installed versions + git on each build.

### Firebase (manual deploy)

```bash
npm i -g firebase-tools   # one-time
firebase login            # one-time
npm run build             # produce www/
firebase deploy           # → https://aeicon5.web.app  (project: aeicon5)
```

## License

MIT © adaept
