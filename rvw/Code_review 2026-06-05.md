# Code Review — ae-icon5-component

**Date:** 2026-06-05 · **Repo:** `adaept/ae-icon5-component` (`master`) · **Base git#:** `d450a4c`
**Cross-ref:** aedh `rvw/Code_review 2026-06-04.md` §2 (item ★A), §4.1.2 (findings), §4.3 ·
this repo `docs/modernization-plan.md` §13 (phased sequence), §5 / D2 (scoped icons).

> Living execution log for the modernization (plan §13). Records each phase as it lands plus
> an **ionicons rename** investigation (§3) that surfaced in Phase 1. Sections: §1 Phase 1,
> §2 test hang, §3 ionicons rename, §4 Phase 2, §5 Phase 3, §6 next.

**Status (2026-06-05):**

| Phase | Scope | State | Commit |
|---|---|---|---|
| **1 — Tooling** | Stencil 4, ionicons 8, Node 22 / TS 5.9 / ESLint 9 flat; `homepage`; green build/test/lint | ✅ done | `75124fa` |
| **2 — Outputs + UX** | `dist-custom-elements`; themeable hover (★A fix) + `--ae-color`; demo git# stamp; §2 CSS split; `setInterval` fix | ✅ done | `86803fd` |
| **3 — Scoped icons** | manifest + `addIcons` (D2); `registerIcons` API; `set` source seam (D3); rename CI guard (item L) | ✅ done | `556d091` |
| **4 — CI + tests + docs** | `ci.yml` / `release.yml`; Puppeteer smoke + Vitest POC; fuller README | ✅ done | `4abb658` |
| **5 — Release** | **prepped** (v1.4.0, entry fields fixed, dry-run verified); awaiting secrets + `v1.4.0` tag | 🟡 prepped | §8 |

All phases verified green (build · lint 0-err · spec tests · icon guard · browser/demo smoke).
Aedh-side follow-ups (★A2 / item C, carry-forward item L tick-off) tracked in §6 and aedh §2.

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

## 6. Phase 4 (CI + tests + docs) — executed 2026-06-05

Plan §13.4. Iconify-free per D3; full Jest→Vitest crossover stays deferred (D4 → aedh-A22).

| Item | What landed |
|---|---|
| **Smoke (§10)** | `testing/smoke.mjs` (mirrors aedh) — Puppeteer; **self-serves `./www`** (no separate server) or hits `BASE_URL`. Asserts title, `<ae-icon5-component>` renders an `<ion-icon>`, the footer **build-stamp triple**, and **0 page errors**. `npm run smoke`. Local run: 5/5 PASS (1440 icons). |
| **Vitest POC (D4)** | `vitest` + `jsdom`; `vitest.config.ts` (scoped to `test/**/*.vitest.ts`, jsdom, globals) + `test/vitest-poc.vitest.ts` (arithmetic · jsdom DOM · project-ESM manifest import). `npm run test.unit` → 3/3. **Kept separate** from the Stencil/Jest `*.spec.ts` baseline so `stencil test` never collides. |
| **`ci.yml`** | push/PR `master`: install → `lint` → `check.icons` → `build` → `npm test` (Jest) → `test.unit` (Vitest) → `smoke` (built `www`). |
| **`release.yml`** | tag `v*`: build + test → `npm publish --provenance` (`NPM_TOKEN`) → `firebase deploy --only hosting` to **aeicon5** (`FIREBASE_SERVICE_ACCOUNT`) → smoke the deployed demo → GitHub Release. |
| **Docs** | README **Test** + **CI / Release** sections (commands, `BASE_URL`, secrets, the `git tag v1.4.0` release flow). |
| **lint** | flat config extended: node+browser globals for `scripts/` + `testing/` tooling (puppeteer `page.evaluate` uses `document`). |

**Verification:** lint 0-err · build · Jest **8/8** · Vitest **3/3** · smoke **5/5** · `check.icons`
all green. (CI/release workflows are YAML-validated; they run on GitHub once pushed — the
`NPM_TOKEN` and `FIREBASE_SERVICE_ACCOUNT` repo secrets must be set before a `v*` tag.)

**Note (codeql):** the pre-existing `codeql-analysis.yml` still uses `actions/checkout@v2`
(old). Out of Phase-4 scope; bump to `@v4` when convenient (roadmap).

## 7. Phase 5 (release) — prepped 2026-06-05

Not yet released (needs repo secrets + a deliberate tag), but everything else is ready:

- **Version → `1.4.0`** in `package.json`; demo triple now `8.0.13/4.43.5/1.4.0` (auto from
  the build stamp).
- **Packaging fixes (found at the release gate):** `es2015`/`es2017` pointed at a **missing**
  `dist/esm/index.mjs` (stale Stencil-2 layout) → removed; added `unpkg` →
  `dist/aeicon5/aeicon5.esm.js`; `types` already → `dist/types/index.d.ts`. Added
  `prepublishOnly: npm run build` so a manual `npm publish` can't ship a stale `dist`.
- **`npm publish --dry-run` verified:** `@adaept/ae-icon5@1.4.0` — after the CF-3 trim,
  **126.8 kB packed / 508 kB unpacked, 48 files** (was 360 kB / 1.3 MB / 1418).
- **CF-3 done — demo assets no longer shipped to consumers.** `package.json` `files` now
  negates `dist/aeicon5/svg/**` (1357 ionicons; lazy runtime-fetch fallback, redundant under
  `addIcons`) **and** `dist/collection/assets/**` (the 12 adaept **aeicons** + the generated
  demo `build-stamp.js`, which had been leaking in via the collection copy). Confirmed: 0
  aeicons / 0 demo-stamp / 0 ionicons-svg in the tarball; the **Firebase demo (`www`) keeps
  its own copies** and is unaffected.

**To release (your action):** set `NPM_TOKEN` + `FIREBASE_SERVICE_ACCOUNT` repo secrets →
`git tag v1.4.0 && git push origin v1.4.0` → `release.yml` publishes npm + deploys
`aeicon5.web.app` + cuts the GitHub Release.

## 8. Summary findings & carry-forward

**Findings (Phases 1–4):**
- **ionicons rename risk is insulated today** (§3): the published component hard-codes no icon
  names (forwards `name=`); the demo's 1192 names all resolve in ionicons 8. D2's `addIcons`
  ES-imports make any future rename a **build error**, with `check.icons` as a second net.
- **Color was shadow-DOM-coupled:** the ~100 web-color classes only worked because they sat in
  the component's shadow scope (ionicons reflects `color=` → `.ion-color-*`). Replaced by
  `--ae-color` (custom props pierce shadow DOM); component CSS **40 KB → 6.3 KB**.
- **Stencil's integrated `stencil test` is deprecated** (removed in Stencil v5) → reinforces the
  Vitest goal (D4). Jest baseline kept + Vitest POC seeded this cycle.
- **Packaging drift:** legacy `es2015`/`es2017` entries pointed at a file Stencil 4 no longer
  emits (fixed in Phase-5 prep).
- **Publish bloat + demo-asset leak (fixed, CF-3):** the tarball had shipped the 1357-svg
  ionicons collection **and** demo-only assets — the 12 adaept **aeicons** (used only by the
  `aelogos`/`namigram` showcase modes; referenced via relative URLs that never resolve from the
  package anyway) plus the generated demo `build-stamp.js`, both copied into `dist/collection/
  assets/`. Excluded via `files` negation → 360 kB → **126.8 kB**, 1418 → **48 files**. The demo
  (`www`, deployed separately) keeps everything.

**Carry-forward tasks:**

| # | Task | Where | Priority |
|---|---|---|---|
| **CF-1** | **Release v1.4.0** — set `NPM_TOKEN` + `FIREBASE_SERVICE_ACCOUNT`, tag `v1.4.0` | this repo (Phase 5) | **HIGH** |
| **CF-2** | **aedh ★A2 / item C** — adopt `dist-custom-elements`, `registerIcons` aedh's ~20 icons, drop the 1357-SVG glob, then **tick off item L** | aedh §2 | **HIGH** (after CF-1) |
| ~~CF-3~~ | ✅ **DONE 2026-06-05** — `files` negates `dist/aeicon5/svg/**` (ionicons) + `dist/collection/assets/**` (demo aeicons + build-stamp). Tarball 360 kB → **126.8 kB**, 1418 → **48 files**; demo `www` unaffected | this repo | — |
| **CF-4** | **Jest → Vitest** full crossover of component specs; migrate off deprecated `stencil test` (→ `@stencil/vitest` / `@stencil/playwright`) | sync with aedh **A22** (D4) | MED |
| **CF-5** | **Iconify source** — implement the D3 seam (`set="iconify:*"`) | ≈ v1.5.0 | LOW |
| **CF-6** | **Drop the legacy `dist` lazy loader** once all consumers are on `dist-custom-elements` (D1) | future major | LOW |
| **CF-7** | **`codeql-analysis.yml`** uses `actions/checkout@v2` → bump to `@v4` | this repo | LOW |
| **CF-8** | **Click-info panel cosmetic** — `iconClicked` builds display HTML with `color=` + `this.color`, now empty for `--ae-color` icons (demo only) | this repo | LOW |
| **CF-9** | **Default icon set coverage** — confirm aedh's ~20 names are either in the default manifest or registered by aedh when item C lands | this repo / aedh | LOW |
| **CF-10** | **Third-party procedural guide** — maintain a dedicated, version-pinned `docs/THIRD-PARTY-GUIDE.md` for authors creating their own icon-component package (expand the README "Build your own" recipe into a bullet-proof, step-by-step doc). **Keep it in sync with each release** (toolchain version pins + steps); README links to it. | this repo | MED |

CF-1/CF-2 are mirrored in aedh `rvw/Code_review 2026-06-04.md` §2 (★A / ★A2 / item C / item L).
