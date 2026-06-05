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

## 4. Next (per plan §13)

- **Phase 2** — `dist-custom-elements` output; themeable hover CSS (§4, fixes the ★A blocker);
  demo git# stamp; §2 component/demo CSS separation; **clear the `setInterval`** (drop `--forceExit`).
- **Phase 3** — scoped-icon **manifest + `addIcons`** (§5 / D2) with the rename CI guard above.
