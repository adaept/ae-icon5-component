# Code Review — ae-icon5-component

**Date:** 2026-08-12 · **Repo:** `adaept/ae-icon5-component`
**Continues:** `rvw/Code_review 2026-08-07.md` (task-only entry; CF-1..CF-11 re-verified there)
**Cross-ref:** `adaept5tudio/docs/e2e-testing-strategy.md` (the strategy adopted below, §5a's
cross-project id registry), `adaept5tudio/docs/adaept5tudio-dev-plan.md` item **A22**, `aedh
rvw/Code_review 2026-08-12.md` (the Angular counter-example this session's design choice avoids
repeating).

---

## 1. Carry-forward tasks — carried from 2026-08-07, not re-verified this session

**Not re-checked line by line** — this session's scope was the E2E test-id adoption only (§2
below), no other files touched. Status shown is 2026-08-07's last-verified state; treat as stale
until a session that actually re-audits each item.

| # | Task | Status (08-07) | Pri |
|---|------|---|-----|
| CF-2 | aedh adopts `registerIcons`/`dist-custom-elements`, drops the 1357-svg glob, ticks off item L | ☐ open | HIGH |
| CF-4 | Jest → Vitest full crossover; drop deprecated `stencil test` | ◑ partial | MED |
| CF-5 | Iconify source (`set="iconify:*"` seam) | ☐ deferred (≈v1.5.0) | LOW |
| CF-6 | Drop legacy `dist` lazy loader once consumers are on `dist-custom-elements` | ☐ future major | LOW |
| CF-7 | `codeql-analysis.yml`: `actions/checkout@v2` → `@v4` | ☐ open | LOW |
| CF-8 | Click-info panel cosmetic (`iconClicked` builds display HTML with now-empty `color=`) | ☐ open | LOW |
| CF-9 | Confirm aedh's ~20 icon names are in the default manifest or registered when item C lands | ☐ open | LOW |
| CF-10 | Third-party guide sync (`docs/THIRD-PARTY-GUIDE.md`, guard `check.guide`) | ◑ ongoing-per-release | LOW |
| CF-11 | Generalize the release runbook for 3rd-party devs | ☐ open | LOW |
| **N** | **New task from §2, published to design system** — see 2026-08-07's §2 ("ae" brand-mark icon), still not started as of that entry. | ☐ open | MED |

---

## 2. E2E test-id adoption (dev plan A22) — 2026-08-12

Adopted the typed `data-testid` strategy from `adaept5tudio/docs/e2e-testing-strategy.md` into
this repo's demo page, following the same naming grammar already used in `aesvgcon` and `aedh`.

**Files added**, mirroring `aesvgcon`'s Tier-1 shape exactly (same two-file ESM/browser-mirror
split, same reason: `testing/test-ids.mjs` is imported by the Node-side Puppeteer test;
`src/assets/test-ids.browser.js` is a classic-script mirror loaded by `src/index.html`):
- `testing/test-ids.mjs` — one id: `testIds.buildStamp = 'label-build-stamp'`.
- `src/assets/test-ids.browser.js` — hand-synced browser mirror (`window.AE_TEST_IDS`,
  `window.aeSetTestId`); auto-copied into `www/assets/` by Stencil's default `src/assets` copy
  behavior (confirmed empirically — no explicit `copy:` entry was needed in `stencil.config.ts`).
- `src/index.html` — loads the mirror script, then a one-line inline call
  (`aeSetTestId(document.getElementById('aeVersionTriple'), AE_TEST_IDS.buildStamp)`) on the
  existing version-triple stamp element — the one thing `testing/smoke.mjs` already asserts the
  content of via a regex, so this adds a selector for an already-meaningful element rather than
  inventing a new one.
- `testing/e2e.testids.mjs` (new) — deliberately separate from `testing/smoke.mjs` (which targets
  the real deployed `https://aeicon5.web.app` by default and never sets the E2E flag). Sets
  `window.__AE_E2E__ = true` via `page.evaluateOnNewDocument()`, self-serves `www/` when no
  `BASE_URL` is set.
- `package.json` — added `"e2e.testids": "node testing/e2e.testids.mjs"`.

**Deliberately Tier 1 (runtime flag), not Tier 2, despite this project having a real bundler
(Stencil).** `src/index.html` is copied by Stencil's `www` output target as static output, never
compiled through Stencil's Rollup pipeline the way `src/components/**/*.tsx` is — so a
`process.env`-style build-time flag on this file wouldn't be dead-code-eliminated regardless.
Reasoned to this conclusion from `aedh`'s adoption the same day (`aedh
rvw/Code_review 2026-08-12.md` §2 — Angular's `fileReplacements` swaps the flag correctly but
doesn't eliminate the string) rather than repeating that discovery the hard way here: the general
lesson is "verify which specific file a bundler actually compiles before claiming build-time
stripping for it," and this file isn't one of them.

**Verified, in order:**
1. `npm run build` → `www/assets/test-ids.browser.js` present, `www/index.html` wired correctly.
2. `npm run e2e.testids` → 4/4 checks pass (`GET /`, selectable via `data-testid`, version-triple
   regex match on the selected element's content, zero page errors).
3. `npm run smoke` (existing, unmodified) → still 5/5 checks pass — no regression.
4. Direct DOM query on a normal load (flag not set) → **zero** `data-testid` attributes anywhere
   on the page, confirmed via a one-off Puppeteer script (not just inferred from `smoke` passing).

**One reference dictionary** (not a per-project one): `adaept5tudio/docs/e2e-testing-strategy.md`
§5a now lists every `testIds.*` value across all four adopting projects
(`aesvgcon`/`aedh`/`ae-icon5-component`/`aetimeline`) in one table — `label-build-stamp` added
there in the same session.

**README updated** (`## Test`, and the "Build your own icon component package" recipe's step 6)
to document `npm run e2e.testids` alongside the existing `npm run smoke`.

Not committed as part of any release — no version bump, this is test infrastructure only, no
change to the published package's runtime behavior (the flag/attribute logic lives in
`src/index.html` and `src/assets/`, both demo-only, never part of `dist/`).

## 2a. Dependabot follow-up — `puppeteer` 24 → 25 (same day, on request)

Pushing §2's commit triggered GitHub's push-time Dependabot summary: 6 open alerts (4 high,
2 moderate). Investigated on request (`user: "look into the aetimeline dependabot
vulnerabilities"`, which also covered this repo since both were touched the same session) —
checked via `gh api repos/adaept/ae-icon5-component/dependabot/alerts`, not just the push
message, since `aetimeline`'s identical-looking warning turned out to already be resolved by the
same commit that triggered it (see that repo's `rvw/Code_review 2026-08-12.md` §2a).

**This repo's alerts were real and only partly self-resolving.** Local `npm audit` (8 findings):
`brace-expansion`/`js-yaml`/`nanoid` cleared via plain `npm audit fix` (non-breaking). The
remaining 4 (`extract-zip` + `ip-address` ×3, all high) only clear via `npm audit fix --force` —
pulled in transitively through `@puppeteer/browsers` by the pinned `puppeteer ^24.1.0`; the fix
bumps it to `^25.6.0`, a major version. Asked before applying (a version-pin change, not a pure
lockfile fix) — approved. Applied, rebuilt, reran both `smoke` (5/5) and `e2e.testids` (4/4,
§2's new test) — no regression. `npm audit`: **0 vulnerabilities**. README's pinned-toolchain
note (`## Build your own icon component package`) updated: `puppeteer 24` → `puppeteer 25`
(now matches `aedh`/`aetimeline`, both already on 25.6.0).

---

## 3. References

- **Prior review:** `rvw/Code_review 2026-08-07.md` (§1's re-verified CF table, §2's "ae"
  brand-mark task).
- **Cross-repo:** `adaept5tudio/docs/e2e-testing-strategy.md` (§2's Angular counter-example, §5a's
  registry), `adaept5tudio/docs/adaept5tudio-dev-plan.md` item **A22**, `aedh
  rvw/Code_review 2026-08-12.md` §2, `aetimeline rvw/Code_review 2026-08-12.md` (same-day sibling
  adoption).
