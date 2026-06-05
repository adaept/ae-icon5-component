# ae-icon5-component — Modernization Plan

**Started:** 2026-06-05 · **Repo:** `adaept/ae-icon5-component` (`master`) · **Status:** DRAFT for review
**Cross-ref:** aedh `rvw/Code_review 2026-06-04.md` §4.1 / §4.3 (master integration plan).

> First task of the modernization (per `CLAUDE.md`). This is the **plan**, not the code —
> review/iterate, then execute in phases (§13).

---

## 0. Current state (from source review, 2026-06-04)

- **Package:** `@adaept/ae-icon5@1.3.4` (npm, public, MIT). **Stencil** component.
- **Element:** tag `<ae-icon5-component>`, namespace `aeicon5`, **`shadow: true`**.
- **Props:** `aesize`, `name`, `color`, `src`, `adaept`, `arialabel`, `aetype`; render modes
  `aelogos` / `mydataform`(+`mydatapanel`) / `namigram` / default — each emits `<ion-icon>`.
- **Output targets:** `dist` (lazy loader → `dist/loader`, what aedh registers) + `www` (demo).
  **No `dist-custom-elements`** (no tree-shakable build).
- **Deploy:** npm publish + Firebase project `aeicon5` (`www`) — **both manual**. CI = CodeQL only.
- **Tooling (2021):** Stencil **2.5.2**, ionicons **5.5.1**, Jest 27, Puppeteer 10, typescript-eslint 4,
  `.eslintrc.json`. `homepage` = `aeicon5.adaept.com` (stale/NXDOMAIN).
- **Known bug:** `ion-icon:hover { box-shadow: inset 0 0 0 2px red; transform: scale(2) }` —
  square, hardcoded red, inside shadow DOM → un-overridable by consumers.

## 1. Goals / non-goals

**Goals:** modern toolchain in sync with aedh; a **minimal, tree-shakable** component for aedh;
configurable hover (color/shape/effect via CSS); keep npm + `aeicon5` Firebase + GitHub repo;
demo with a git# stamp; pluggable icon sources (e.g. Iconify); real tests + README; a living roadmap.
**Non-goals (this cycle):** breaking the public prop API (additive only); rewriting consumers;
moving off Stencil.

## 2. Architecture — separate the **two artifacts** (emphasized)

Keep these cleanly decoupled, with separate build outputs and separate styles:

| Artifact | What | Build target | Ships to | Styling |
|---|---|---|---|---|
| **Component (library)** | the web component(s) | `dist-custom-elements` (+ `dist` loader for back-compat) | **npm** → aedh | only component-essential CSS (sizing, hover vars) |
| **Demo (showcase)** | gallery, examples, git# stamp | `www` | **Firebase `aeicon5`** | demo-only CSS (the 100+ color classes, layout) |

Actions:
- Audit the current component CSS: the 100+ `ion-color-*` classes + demo layout belong to the
  **demo**, not the published component — move them out of the component's bundled styles.
- Confirm nothing demo-only (`index.html`, gallery scripts) is pulled into `dist`/`dist-custom-elements`.
- Consider a `src/demo/` (or `www-src/`) folder for demo assets vs `src/components/` for the library.

## 3. Tooling modernization (sync with aedh)

- **Stencil 2.5.2 → 4.x** (follow 2→3→4 upgrade notes: config shape, output-target names, Node engine,
  Jest). **ionicons 5.5.1 → 8.x.**
- **Node 22**, **TypeScript ~5.9**, `package.json` `engines`.
- **ESLint 9 flat config** (`eslint.config.js`, mirror aedh); remove `.eslintrc.json`.
- **Output targets (→ D1):** add `dist-custom-elements` (`customElementsExportBehavior:
  'auto-define-custom-elements'`) as the primary, keep `dist` (loader) for aedh's current `main.ts`
  through one transition cycle, keep `www`.
- Migration approach: scaffold a fresh Stencil 4 config and port the component, or run the official
  upgrade — whichever yields a green build faster.

## 4. Hover + feature updates (CSS options) — fixes the ★A blocker

Replace the hardcoded rule with themeable CSS custom properties (defaults = round, currentColor):
```css
:host {
  --ae-hover-ring-color: currentColor;
  --ae-hover-ring-width: 2px;
  --ae-hover-radius: 50%;     /* shape: 50% = circle, 0 = square */
  --ae-hover-scale: 1;        /* effect */
}
ion-icon:hover {
  box-shadow: inset 0 0 0 var(--ae-hover-ring-width) var(--ae-hover-ring-color);
  border-radius: var(--ae-hover-radius);
  transform: scale(var(--ae-hover-scale));
}
```
- Expose via CSS custom props (works through shadow DOM) and/or `::part(icon)` for deeper styling.
- Document the knobs in the README; keep `shadow: true`.

## 5. Scoped icons for aedh (extract only what's used)

aedh uses a small set (Home balls: `football`, `basketball`, `tennisball`, `baseball`; plus
About/menu/fab icons: `add`, `alarm`, `american-football`, `aperture`, `at`, `barcode`, `basket`,
`beer`, `menu`, …). Options to evaluate:
- **(a)** `dist-custom-elements` + aedh imports only the component (JS tree-shakes), but `<ion-icon>`
  still lazy-loads SVGs at runtime → aedh must still provide the SVGs.
- **(b)** **Bundle a curated SVG subset** in the component (only the needed glyphs) so aedh drops the
  wholesale 1357-SVG copy.
- **(c)** **Build-time subsetting**: a manifest of icon names → generate a minimal icon module.
- **Decided (→ D2):** build-time **manifest** (`src/icons/manifest.ts`) + `addIcons` ES-module
  registration (bundled, no runtime SVG fetch); ship a small default set + a documented way for
  consumers to register their own. Directly enables aedh **item C** (drop the `ionicons/.../svg` glob).

## 6. Multiple icon sources (Iconify, etc.)

- Abstract the source behind an adapter; add a `set`/`provider` prop
  (e.g. `set="ionicons"` default, `set="iconify:mdi"`, …).
- Evaluate **Iconify** (on-demand SVG API + offline packages) for bundle impact and offline use.
- Keep ionicons as default for back-compat; additive API only.
- **Deferred this cycle (→ D3):** build the adapter **seam** now, implement **ionicons only**; land
  Iconify in a follow-up (≈ v1.5.0), tracked in §12.

## 7. git# stamp in the Firebase demo

- Mirror aedh's About build stamp (03a §13): a prebuild script writes git sha/branch/time; the **demo**
  (`www`) shows it in a footer. **Demo-only** — not in the published component.

## 8. Version-bump protocol

- **Triple** `ionicons/Stencil/component` (e.g. `8.x/4.x/1.4.0`) shown on the demo (like aedh's About).
- On a change: bump component semver → update the demo triple (installed ionicons/Stencil + new
  component version) → tag `vX.Y.Z` → CI publishes npm + deploys the demo → bump the aedh dep.
- Document in README + `CLAUDE.md`.

## 9. CI/CD (automate npm + Firebase; keep GitHub + CodeQL)

- **`ci.yml`** — PR/push: `npm ci` → build (`dist` + `dist-custom-elements` + `www`) → lint → test.
- **`release.yml`** — tag `v*`: build → `npm publish` (`NPM_TOKEN`, `--provenance`) →
  `firebase deploy --only hosting` to `aeicon5` (service-account secret) → GitHub Release.
- Keep `codeql-analysis.yml`; add Dependabot/renovate; fold into aedh's monthly cadence.
- **Fix `homepage` → `https://aeicon5.web.app`** (aedh §4.1 finding 5).

## 10. Testing

- **Smoke** (mirror aedh `testing/smoke.mjs`): Puppeteer hits the deployed demo / local `www`, asserts
  it renders and a sample `<ae-icon5-component>` appears, no page errors.
- **Component specs (→ D4):** baseline on **Stencil 4 Jest** (`newSpecPage` / `newE2EPage`) — render,
  prop reactivity, hover CSS-var application, the scoped-icon manifest (modernize Jest 27 → Stencil 4
  stack). **Plus a minimal Vitest POC** (pure unit test) this cycle to stand up the Vitest harness.
  Full **Jest → Vitest** crossover is planned to land with **aedh's A22** (D4).

## 11. README docs

Install; register-loader vs `dist-custom-elements` import; **props table**; **CSS custom props** for
hover/theming; icon sources; examples; demo link (`aeicon5.web.app`); versioning protocol; dev loop
(`npm pack` with aedh); deploy/release.

## 12. Roadmap (living — capture improvements surfaced this cycle)

- **Jest → Vitest** component-spec crossover — **sync with aedh A22** (D4); reassess Stencil's Vitest
  support then.
- **Iconify** + other icon sources (D3) — ≈ **v1.5.0**.
- Remove the legacy **`dist` loader** once all consumers are on `dist-custom-elements` (D1) — a future major.
- Standalone/no-Ionic icon rendering; SSR/hydration; a11y audit (aria, labels); animation presets;
  typed icon-name unions; tree-shaking/bundle-size metrics; theming tokens. *(append as discovered.)*

## 13. Sequenced execution

1. **Tooling** — Stencil 4, ionicons 8, Node 22/TS 5.9/ESLint 9 flat; green build/test; fix `homepage`.
2. **Outputs + UX** — add `dist-custom-elements`; themeable hover CSS (§4); demo git# stamp; enforce the
   §2 component/demo separation.
3. **Icons** — scoped-icon mechanism (§5); Iconify adapter (§6).
4. **CI + tests + docs** — `ci.yml` / `release.yml`; Puppeteer smoke + Stencil-Jest specs **+ a minimal
   Vitest POC**; README. (Full Jest→Vitest crossover deferred to the aedh-A22 sync — §12.)
5. **Release** — tag `v1.4.0` (triple `8.x/4.x/1.4.0`); verify npm + `aeicon5.web.app` + GitHub →
   aedh consumes (★A2) and drops the SVG glob (item C).

## Resolved decisions (2026-06-05)

**D1 — Output targets: ship BOTH `dist-custom-elements` (primary) and `dist` (loader), for now.**
- aedh targets **`dist-custom-elements`** (tree-shakable; the goal) — the switch happens in aedh
  item ★A2, not here.
- Keep the **`dist` lazy loader** through **one** transition cycle so aedh's current `main.ts`
  registration keeps working and the cutover is deliberate, not a flag-day break.
- **Deprecate/remove `dist`** in a later major once aedh (and any other consumer) is on
  custom-elements → roadmap (§12).

**D2 — Scoped icons: build-time manifest + `addIcons` ES-module registration (option c), consumer-extensible.**
- Register icons from `ionicons/icons` **ES modules** via `addIcons({...})` (bundled, **no runtime
  SVG fetch**). This is precisely what lets aedh drop the wholesale 1357-SVG copy (item C) and bundle
  only its ~20 glyphs.
- Drive the set from a **manifest** (e.g. `src/icons/manifest.ts`); ship a small **default set**
  (demo/common icons), and expose a documented way for consumers to register **their own** additional
  icons (re-export `addIcons` / accept an icons map prop).
- Rejected: **(a)** keeps fetching all SVGs at runtime; pure **(b)** (hardcoded subset) isn't extensible.

**D3 — Iconify: deferred to roadmap (post-1.4.0); keep the architecture adapter-ready.**
- This cycle implements **ionicons only**. Design the icon-source seam now (a `set`/`provider` prop +
  a thin adapter interface) so Iconify slots in later **without** API churn — but **don't implement it
  this cycle** (it would delay the aedh-unblocking deliverables ★A→★A2→C). Target ≈ **v1.5.0**.

**D4 — Tests: Vitest is the GOAL (aedh parity); this cycle = Stencil-Jest baseline + a minimal Vitest
POC; full crossover lands with aedh's A22.**
- **Goal:** unify the component on **Vitest** to match aedh's runner.
- **This cycle:** keep **Stencil 4's built-in Jest** (`newSpecPage` / `newE2EPage`) as the *working*
  component-spec baseline — **don't block the release on a test-runner migration**. **Add a minimal
  Vitest POC** (a pure unit test, no Stencil renderer) to stand up the Vitest harness and prove the
  path — the same way aedh seeded its `vitest-harness.spec.ts`.
- **Crossover:** plan the full **Jest → Vitest** migration of the component specs to **coincide with
  aedh being on Angular 22** (the natural sync point). Reassess Stencil's Vitest-support maturity at
  that time. Tracked in §12 roadmap.
- **Smoke** stays **Puppeteer** (mirrors aedh `testing/smoke.mjs`; framework-neutral) regardless.

*(All four were the prior open questions; resolved for execution. Revisit only if a phase surfaces a
blocker.)*
