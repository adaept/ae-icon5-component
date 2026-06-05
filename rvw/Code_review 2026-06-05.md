# Code Review — ae-icon5-component

**Date:** 2026-06-05 · **Repo:** `adaept/ae-icon5-component` (`master`) · **Base git#:** `d450a4c`
**Cross-ref:** aedh `rvw/Code_review 2026-06-04.md` §2 (item ★A), §4.1.2 (findings), §4.3 ·
this repo `docs/modernization-plan.md` §3 / §13 (Phase 1) and §5 / D2 (scoped icons).

> Record of **Phase 1 (tooling)** execution + an **ionicons rename** investigation that surfaced
> during it. Phase 1 = modernization-plan §13.1: Stencil 4, ionicons 8, Node 22 / TS 5.9 / ESLint 9
> flat; green build/test/lint; fix `homepage`.

---

## 1. Phase 1 (tooling) — executed

| Area | Before | After |
|---|---|---|
| `@stencil/core` | 2.5.2 | **^4.43.5** |
| `ionicons` | 5.5.1 | **^8.0.13** |
| `typescript` | (bundled, ~4) | **~5.9.3** (explicit dev dep) |
| ESLint | 7 + `.eslintrc.json` (`eslint-config-standard`) | **9.39.4 flat** (`eslint.config.mjs`, `typescript-eslint` 8) |
| Jest / Puppeteer | 27 / 10 | **29 / 24** (Stencil-4-compatible) |
| `engines.node` | (none) | **>=22** |
| `homepage` | `aeicon5.adaept.com` (NXDOMAIN) | **`https://aeicon5.web.app`** |
| scripts | — | added `lint`, `lint.fix` |

**Validation (all green):**
- `npm install` — 417 packages, **0 vulnerabilities**.
- `npm run build` — Stencil 4.43.5, `dist` + `www`, build finished ~5.4 s.
- `npm run lint` — exit 0; 2 intentional `no-explicit-any` warnings (the `as any` CSS-custom-prop
  casts at `ae-icon5-component.tsx:353,391`).
- `npm test` (`stencil test --spec`) — **3/3 pass** (added a smoke spec; the file was empty before).

**Code touched beyond config** (real issues the modern linter surfaced — behaviour-preserving):
- `ae-icon5-component.tsx` — two ternaries-used-as-statements (`x < 8 ? x = … : x`) → plain `if`;
  corrected stale `eslint-disable` directive names (legacy `no-unused-vars` → `@typescript-eslint/...`,
  kept for the JSX pragma `h`).
- `stencil.config.ts` — `import { Config }` → `import type { Config }` (drops a stale disable).

**Not changed (deliberate):** `tsconfig.json` left at `target: es2017` — bumping to es2022 would flip
`useDefineForClassFields` to `true` and break Stencil's decorator class-fields (`@Prop` etc.). Revisit
only with an explicit `useDefineForClassFields: false`.

## 2. ⚠ Known issue — test process hang (stopgap applied)

The component constructor runs `setInterval(() => this.aeUpdateMethod(), 4000)`
(`ae-icon5-component.tsx:117`) and **never clears it**. Under Jest the assertions pass but the timer
keeps the Node process alive → the run *hangs* instead of exiting (looks stuck; not a failure).

- **Stopgap (now):** `--forceExit` added to the `test` script so `npm test` / CI terminate.
- **Proper fix (Phase 2, when we touch the component):** store the interval id and
  `clearInterval` it in `disconnectedCallback()`. Then drop `--forceExit`.
- Aside: Stencil 4 prints a **deprecation** notice — integrated `stencil test` (`--spec`/`--e2e`)
  is removed in **Stencil v5**; migrate to `@stencil/vitest` / `@stencil/playwright`. Reinforces
  plan **D4** (Vitest is the goal). Logged to roadmap §12.

## 3. ionicons 5 → 8 rename exposure — investigated

**Concern raised:** later ionicons versions renamed/removed some icon names; **aedh already fixed its
names, this component did not** — is there latent breakage here?

**How `<ion-icon name="…">` resolves (why renames are dangerous):** the name binds at **runtime**,
not build time — ion-icon fetches `…/svg/<name>.svg` from the ionicons package. A renamed/removed icon
does **not** error the build; it **silently 404s and renders nothing**. No signal that it broke.

**Where the exposure actually lands — findings:**
1. **The published component hardcodes *no* ionicons names.** The only name usage is
   `name={this.name}` (`ae-icon5-component.tsx:402`) — it **forwards** the consumer's name. So today
   the rename liability sits with the **consumer (aedh)** — which is exactly why aedh had to fix its
   names and this repo had nothing to fix. (`addIcons` / `ionicons/icons` imports: none present.)
2. **The demo (`src/index.html`) does hardcode names — and they all still resolve.** Empirically
   diffed **1192 distinct** demo icon names against the **installed ionicons 8** svg set (1357 files):
   **0 missing.** The 5→8 jump was purely additive for everything the demo uses; the gallery won't
   show blanks. (aedh's sampled in-app names — `football`, `basketball`, `american-football`, `menu`,
   `aperture`, … — also all resolve in v8.)

**Conclusion:** **No broken icons** in what this component ships or demos against ionicons 8 today.

**But this changes at plan §5 / D2.** Once we ship a build-time **manifest + `addIcons` ES-module
registration** and bundle a *default* icon set, this repo **starts** hardcoding names and inherits the
rename risk. The `addIcons` approach is **protective**: `import { football } from 'ionicons/icons'`
turns a renamed/removed icon into a **build-time error** (missing export), not a silent runtime 404.

**→ Carry-forward (do at D2 / Phase 3), mirrored in aedh §2:**
- Build the default manifest from `ionicons/icons` **ES-module imports** (fail-loud at build).
- Add a CI check that validates every manifest name against the **pinned** ionicons version.
- When aedh adopts the manifest (★A2 / item C), reconcile its ~20 in-app names against the same
  pinned version so a future ionicons bump can't silently blank an icon on either side.

## 4. Phase 2 (outputs + UX) — executed 2026-06-05

Plan §13.2. All five items done; build + lint + test green; color model browser-verified.

| Item | Before | After |
|---|---|---|
| **Output targets (D1)** | `dist` + `www` | added **`dist-custom-elements`** (auto-define) as primary; `dist` loader + `www` kept. Emits `dist/components/index.js`; `customElements` field added to `package.json`. |
| **Hover (★A blocker)** | `box-shadow: inset 0 0 0 2px red` + `scale(2)`, hardcoded, un-overridable in shadow DOM | themeable `--ae-hover-ring-color` (currentColor) / `-width` / `-radius` (50%) / `-scale` (1) / `-bg`. |
| **`setInterval` leak** | uncleared in constructor → hung Jest (needed `--forceExit`) | moved to `connectedCallback`, cleared in `disconnectedCallback`; `--forceExit` removed — test exits clean. |
| **Demo git# stamp** | static `<div>5.5.1/2.5.2/1.3.4</div>` | `scripts/gen-build-stamp.mjs` (prebuild/prestart) → live triple `ionicons/Stencil/component · git@branch · built…` in footer. Demo-only, gitignored. |
| **CSS separation (§2)** | ~1330-line web-color palette bundled **in the component** | palette dropped; **`--ae-color`** custom prop added (theme colors stay on `color=`). Component CSS **40 KB → 6.3 KB**; palette **gone from `dist`**. 244 demo tags converted; `aered`/`aegreen` → hex. |

**Color model (now, documented in README "How it works"):**
- Ionic **theme** colors (`primary`…`dark`) → `color=` attribute (ionicons' own `icon.css`
  resolves these via `:host(.ion-color){color:var(--ion-color-base)!important}`).
- **Any other** color → `--ae-color` (pierces shadow DOM; falls back to `--color`). The old
  `.ion-color-<webcolor>` classes were demo-only and load-bearing *only* because they sat in the
  component's shadow scope — exactly the §2 bloat that's now removed.

**Verification:** `stencil build` ✓ · `eslint` ✓ (0 errors; 2 intentional `no-explicit-any`
warnings) · spec tests 3/3 ✓ (clean exit, no `--forceExit`). Headless Puppeteer against built
`www/`: `--ae-color: mediumaquamarine` → `rgb(102,205,170)`, `color="success"` → `rgb(16,220,96)`,
**0 page errors**.

**Minor follow-up (non-blocking):** the click-info panel (`iconClicked` in the `.tsx`) builds
display HTML with `color=` + `this.color`, now empty for `--ae-color` icons — cosmetic demo-panel
only; tidy when the component is next touched.

**README:** rewritten with install, the two register paths (`dist/components` vs `dist/loader`),
sizing, the two coloring paths, themeable hover, props table, build-stamp, dev loop, deploy.

## 5. Phase 3 (scoped icons) — executed 2026-06-05

Plan §13.3 / §5 / D2 (+ the D3 seam). Iconify stays deferred (D3 → roadmap ≈ v1.5.0).
Build + lint + tests + icon guard all green.

| Item | What landed |
|---|---|
| **Manifest + `addIcons` (D2)** | `src/icons/manifest.ts` — kebab `name=` → **named ES imports** from `ionicons/icons` (tree-shaken; **34** default icons: sport balls + common app/menu icons). `src/icons/index.ts` registers them via `addIcons` on the component's `componentWillLoad`. Names not in the set still fall back to ionicons' runtime fetch (demo gallery unchanged). |
| **Consumer extensibility** | re-exported `addIcons` + a friendly `registerIcons(map)` from the **package root** `@adaept/ae-icon5` (new `src/index.ts`; `types` → `dist/types/index.d.ts`). This is how aedh drops the wholesale 1357-SVG copy (**item C**): `registerIcons({ home, … })` from `ionicons/icons`. |
| **Source seam + `set` prop (D3)** | `src/icons/sources.ts` — minimal `IconSource` interface, ionicons the sole source; `set` prop (default `ionicons`) selects it. Unknown sets fall back to ionicons. Iconify slots in later with **no API churn** — not implemented this cycle. |
| **Rename CI guard (item L)** | `scripts/check-icon-manifest.mjs` + `npm run check.icons` — validates **every** manifest name against the **installed** ionicons (svg set **and** ES export). Fail-loud on a rename/removal/typo. Currently: *OK — 34 icons valid in ionicons 8.0.13*. |
| **Tests** | `src/icons/icons.spec.ts` (5 specs: manifest shape, kebab keys, aedh icons present, registration no-throw, source-seam fallback). Suite now **8/8** green, clean exit. |
| **README** | new "**Icon sources & scoped icons**" section: default set, `registerIcons` (root import) + ionicons `addIcons` equivalence, the `set` prop, the CI guard, Iconify roadmap note. |

**Why named ES imports (the item-L payoff):** `import { football } from 'ionicons/icons'`
makes an ionicons rename a **build error**, not a silent runtime 404 — exactly the protection
flagged in §3. The `check.icons` guard adds a second net against kebab-name typos.

**Packaging note:** the icon utils are inlined into the component bundle, so they are **not** a
separate `dist/components/icons` path. They are exported from the **package root** (runtime via
`dist/index.*`, types via `dist/types/index.d.ts`) and also present on the custom-elements
build. README documents the root import. aedh's `dist/loader` consumption is unaffected.

## 6. Next (per plan §13)

- **Phase 4** — CI (`ci.yml` / `release.yml`), Puppeteer smoke + Vitest POC, fuller README.
- **aedh-side (★A2 / item C):** adopt `dist-custom-elements`, register its ~20 icons via
  `registerIcons`, drop the 1357-SVG glob, then **tick off carry-forward item L** after
  reconciling its names against the pinned ionicons.
