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
npm run check.guide # validate docs/THIRD-PARTY-GUIDE.md pins vs package.json
```

- **Specs** stay on Stencil's built-in **Jest** (`*.spec.ts`); the full Jest → Vitest
  crossover is deferred to sync with aedh (plan §12 / D4).
- **Smoke** runs against the local `www` by default; set `BASE_URL` to hit the deployed
  demo: `BASE_URL=https://aeicon5.web.app npm run smoke`.

## CI / Release

- **`.github/workflows/ci.yml`** — on push/PR to `master`: install → lint → `check.icons`
  → build → spec tests → Vitest → smoke the built demo.
- **`.github/workflows/release.yml`** — on a `v*` tag: build + test → `npm publish` via
  **Trusted Publishing (OIDC, no token)** → deploy `www/` to the **aeicon5** Firebase site
  (needs `FIREBASE_SERVICE_ACCOUNT`) → smoke the deployed demo → GitHub Release.

### Release runbook (maintainer — adaept)

Step-by-step for publishing a new version. The tag does the work; the one-time setup below
(an npm **trusted publisher** + one Firebase secret) is done **once**. _(This runbook is
adaept-specific — scope `@adaept`, package `@adaept/ae-icon5`, Firebase project `aeicon5`. A
generalized version for other authors is a TODO — see review CF-11.)_

#### One-time setup (do once, ~10 min)

This package publishes with **npm Trusted Publishing (OIDC)** — GitHub Actions authenticates to
npm directly, so there is **no npm token to create, store, rotate, or expire**. You configure it
**once** on npm, plus one Firebase secret.

**On npm — register the trusted publisher** _(no token):_

> **`@adaept` is an npm _user account_, not an organization.** The scope belongs to the npm user
> **`adaept`** (email `peterennis@yahoo.com`) — confirm with `npm owner ls @adaept/ae-icon5`. **Do
> not create an organization** (npm may nudge you to; you can't create an org named `adaept` because
> your user already owns the scope).

1. Sign in at <https://www.npmjs.com> **as the user `adaept`** (not `peterennis`). Forgot the
   password? Reset it via the `peterennis@yahoo.com` email.
2. On the **`@adaept/ae-icon5` package settings**, add a **GitHub Actions trusted publisher**. (npm
   places this under the package's *Settings → Trusted Publisher*; follow
   [npm's trusted-publishing docs](https://docs.npmjs.com/trusted-publishers) for the exact
   click-path, which npm changes.) Enter:
   | Field | Value |
   |---|---|
   | Organization / owner | `adaept` _(the GitHub org that owns the repo)_ |
   | Repository | `ae-icon5-component` |
   | Workflow filename | `release.yml` |
   | Environment | _(leave blank — the workflow uses none)_ |
3. Save. No token, no expiry. _(Provenance is then emitted automatically.)_

**On Firebase — service-account key for the demo deploy:**

4. <https://console.firebase.google.com> → project **`aeicon5`** → ⚙ **Project settings** →
   **Service accounts** → **Generate new private key** → download the JSON file.

**On the GitHub repo — store the one secret you still need:**

5. Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - **`FIREBASE_SERVICE_ACCOUNT`** = the **entire contents** of the JSON from step 4 (open it, copy
     everything, paste as the value). _(No `NPM_TOKEN` — trusted publishing replaces it.)_

> **Baked into `release.yml`:** the job has `permissions: id-token: write` and upgrades CI to
> **npm ≥ 11.5.1** (Node 22 ships npm 10, which predates OIDC publishing).

#### Each release (repeat)

1. Make sure `master` is green (the CI badge / Actions tab).
2. Bump **`version`** in `package.json` (e.g. `1.4.0` → `1.4.1`); commit and push:
   ```bash
   git add package.json && git commit -m "chore: v1.4.1" && git push
   ```
   _(The demo's `ionicons/Stencil/component` triple + git# stamp update themselves on build.)_
3. Tag it and push the tag — **this triggers the release**:
   ```bash
   git tag -a v1.4.1 -m "v1.4.1" && git push origin v1.4.1
   ```
4. Watch **Actions → Release**. It builds + tests, then `npm publish`, deploys the demo, smoke-tests
   it, and creates a GitHub Release.

#### Verify

```bash
npm view @adaept/ae-icon5 version     # → the new version
```
…and open <https://aeicon5.web.app> (footer shows the new triple) and the repo's **Releases** tab.

#### If the Release run fails

- **At "Publish to npm"** → the **trusted publisher** on npm must match this repo exactly: owner
  `adaept`, repo `ae-icon5-component`, workflow `release.yml`. Also confirm the job kept
  `permissions: id-token: write` and npm is **≥ 11.5.1**. Fix, then **Actions → the failed run →
  "Re-run failed jobs"** (no need to re-tag).
- **At "Deploy to Firebase"** → check `FIREBASE_SERVICE_ACCOUNT`, then re-run.
- A re-run reuses the **workflow file as of the tagged commit**. If you changed the code **or
  `release.yml` itself** (e.g. the OIDC switch), a re-run won't pick it up — **move the tag** to the
  new commit: `git tag -d vX.Y.Z && git push origin :vX.Y.Z` then re-tag on the new commit and push.

#### Token fallback (only if OIDC can't be used)

Trusted publishing is preferred. If you must use a token instead: create a **Granular Access
Token** on npm (Access Tokens → Generate New Token; **Read and write**, scoped to
`@adaept/ae-icon5`) — note it **expires (≈90-day max)**, so you'll rotate it — store it as the
**`NPM_TOKEN`** secret, and in `release.yml` give the publish step
`env: { NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} }` and add `--provenance` back to the command.

#### Manual fallback (no CI)

```bash
npm login                       # interactive; needs your npm 2FA
npm publish --access public     # prepublishOnly builds dist first
npm i -g firebase-tools && firebase login
npm run build && firebase deploy   # → https://aeicon5.web.app  (project: aeicon5)
```

## Build your own icon component package (recipe)

A bullet-proof, reproducible procedure to create a package like this one — a Stencil web
component that wraps an icon set, ships tree-shakable + lazy builds, themeable styling, a
build-stamped demo, and a publish/deploy pipeline. Each step names the **canonical file in
this repo** to copy from. A fuller, version-pinned procedural guide lives at
[`docs/THIRD-PARTY-GUIDE.md`](docs/THIRD-PARTY-GUIDE.md) (its pins are CI-checked against
`package.json` via `npm run check.guide`).

> **Pinned toolchain** (keep these in sync): Node **22**, `@stencil/core` **^4.43**,
> `ionicons` **^8**, `typescript` **~5.9**, `eslint` **9** flat + `typescript-eslint` **8**,
> `jest` **29**, `puppeteer` **24**, `vitest` **4** + `jsdom`.

**1. Scaffold + pin the toolchain.**
- `npm init stencil@latest component my-icons` (choose the *component* starter), then `cd my-icons`.
- Set `"engines": { "node": ">=22" }` and pin the versions above in `package.json`
  (copy the `dependencies` / `devDependencies` blocks from this repo's [`package.json`](package.json)).
- `npm install`.

**2. Output targets** — edit [`stencil.config.ts`](stencil.config.ts):
- `dist-custom-elements` with `customElementsExportBehavior: 'auto-define-custom-elements'` (primary, tree-shakable),
- `dist` (lazy loader, back-compat), and `www` (demo). Keep `shadow: true` on the component.

**3. Component + themeable CSS** — model on
[`src/components/ae-icon5-component/`](src/components/ae-icon5-component):
- Render an inner `<ion-icon>`; forward `name`/`color`.
- Theme through **CSS custom properties** (they pierce shadow DOM): a `--xx-color` for arbitrary
  colors (theme colors stay on the `color=` attribute) and `--xx-hover-*` for the hover ring.
  **Do not** bundle a big named-color palette in the component (it bloats every consumer).
- Start timers in `connectedCallback` and clear them in `disconnectedCallback` (never in the constructor).

**4. Scoped icons (the important bit)** — model on [`src/icons/`](src/icons):
- `manifest.ts` maps kebab `name` → **named ES imports** from `ionicons/icons` (NOT
  `import * as` — that defeats tree-shaking). Register them with `addIcons` on
  `componentWillLoad`.
- Re-export `addIcons` + a `registerIcons(map)` helper from a package-root
  [`src/index.ts`](src/index.ts) so consumers bundle their own icons (no runtime SVG fetch).
- Add an icon-source *seam* (a `set` prop) even if you only implement one source, so others slot
  in later without API churn.

**5. Build stamp + demo** — copy [`scripts/gen-build-stamp.mjs`](scripts/gen-build-stamp.mjs):
- Generate `src/assets/build-stamp.js` (git sha/branch/time + the `iconset/Stencil/component`
  version triple) via `prebuild` / `prestart` npm hooks; show it in the demo footer. Gitignore it.

**6. Tests + a rename guard** — copy [`scripts/check-icon-manifest.mjs`](scripts/check-icon-manifest.mjs),
[`testing/smoke.mjs`](testing/smoke.mjs), [`vitest.config.ts`](vitest.config.ts):
- Spec tests on Stencil/Jest (`*.spec.ts`); a Vitest POC under `test/**/*.vitest.ts`; a
  Puppeteer smoke that self-serves `./www`.
- `check.icons` validates every manifest name against the **installed** icon set — so a renamed
  icon fails the build instead of silently 404-ing.

**7. CI + release** — copy [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and
[`release.yml`](.github/workflows/release.yml):
- CI: install → lint → `check.icons` → build → Jest → Vitest → smoke.
- Release (on `v*` tag): publish to npm + deploy the demo + GitHub Release.
- **Publish with npm Trusted Publishing (OIDC) — no token to store/rotate.** Register your
  repo+workflow as a trusted publisher on the npm package and give the job
  `permissions: id-token: write` + npm ≥ 11.5.1 (see the maintainer runbook above). For the demo
  deploy add a **`FIREBASE_SERVICE_ACCOUNT`** secret. _(Token fallback exists if OIDC isn't an
  option — see the runbook.)_

**8. Package hygiene (don't ship the demo to consumers).** In `package.json`:
- Entry fields: `main` (cjs), `module` (esm), `unpkg`, `types` → `dist/types/index.d.ts`,
  `customElements` → `dist/components/index.js`. Remove any stale `es2015`/`es2017` entries.
- `files`: ship `dist/` but **negate the runtime-fetch SVG copy and demo assets** so they
  don't bloat consumers:
  ```jsonc
  "files": ["dist/", "!dist/<namespace>/svg", "!dist/<namespace>/svg/**",
            "!dist/collection/assets", "!dist/collection/assets/**"]
  ```
- Add `"prepublishOnly": "npm run build"`. Verify with **`npm publish --dry-run`** (check the
  file list — no demo svgs / no build-stamp leak).
- Set `homepage` to the deployed demo URL.

**9. Publish.** Bump `version`, commit, then `git tag vX.Y.Z && git push origin vX.Y.Z` — the
release workflow does the rest.

> **Maintainers:** the dedicated [`docs/THIRD-PARTY-GUIDE.md`](docs/THIRD-PARTY-GUIDE.md) must be
> kept in sync with each release (review §8, CF-10). Its pinned toolchain is **CI-enforced** —
> `npm run check.guide` fails if the guide's pins drift from `package.json`. When the versions
> above change, update both this recipe and that guide.

## License

MIT © adaept
