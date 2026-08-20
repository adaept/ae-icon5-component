# Code Review — ae-icon5-component

**Date:** 2026-08-20 · **Repo:** `adaept/ae-icon5-component`
**Continues:** `rvw/Code_review 2026-08-19.md` (CF table carried below unchanged; not re-audited
this session — scope was a devDependency bump plus one TS strictness fix).

---

## 1. Carry-forward tasks — carried from 2026-08-19

**Not re-checked line by line** — this session touched none of these. Status shown is
2026-08-19's last-verified state.

| # | Task | Status | Pri |
|---|------|---|-----|
| CF-2 | aedh adopts `registerIcons`/`dist-custom-elements`, drops the 1357-svg glob, ticks off item L | ☐ open | HIGH |
| CF-4 | Jest → Vitest full crossover; drop deprecated `stencil test` | ◑ partial | MED |
| CF-5 | Iconify source (`set="iconify:*"` seam) — design finalized 2026-08-15, `docs/modernization-plan.md` §6 | ☐ deferred (≈v1.6.0) | LOW |
| CF-6 | Drop legacy `dist` lazy loader once consumers are on `dist-custom-elements` | ☐ future major | LOW |
| CF-7 | `codeql-analysis.yml`: `actions/checkout@v2` → `@v4` | ☐ open | LOW |
| CF-8 | Click-info panel cosmetic (`iconClicked`/`renderInfoPanel` builds display HTML with now-empty/`undefined` `color=`) | ☐ open | LOW |
| CF-9 | Confirm aedh's ~20 icon names are in the default manifest or registered when item C lands | ☐ open | LOW |
| CF-10 | Third-party guide sync (`docs/THIRD-PARTY-GUIDE.md`, guard `check.guide`) | ◑ ongoing-per-release | LOW |
| CF-11 | Generalize the release runbook for 3rd-party devs | ☐ open | LOW |
| CF-12 | `--ionicon-stroke-width` not overridable from outside the component | ☐ open | MED |
| CF-13 | Deployed demo (`https://aeicon5.web.app`) stale — never redeployed for v1.4.0/v1.5.0 | ☐ open | HIGH |
| CF-14 | `adaeptZone` vendored SVGs/tokens have no automated re-sync from `design-system/` | ☐ open (documented, not automated) | LOW |

---

## 2. `@stencil/core` devDependency bump: 4.43.5 → 4.44.0

**Change:** `package.json`/`package-lock.json` only — `^4.43.5` → `^4.44.0`, no code changes
required by the bump itself. `npm install` also normalized the lockfile's stale top-level
`version` field (`1.4.0` → `1.5.0`) to match `package.json`, unrelated to Stencil.

**Verified:** `npm install` completed with 0 vulnerabilities; `npx tsc --noEmit` clean
afterward (see §3, checked together).

---

## 3. TypeScript fix: unsafe `HTMLElement` → `HTMLAeIcon5ComponentElement` cast

**Bug:** `iconClicked`'s `ae-refresh-circle` case cast `document.getElementById('1'|'2')`
(typed `HTMLElement | null`) directly to the Stencil-generated `HTMLAeIcon5ComponentElement`.
TS2352 — the two types don't sufficiently overlap for a direct assertion (`HTMLElement` is
missing `adaept`, `aerotatedeg`, `aesize`, `aetitle`, and 8 more component-specific members).

**Fix** (`ae-icon5-component.tsx:401-402`): route the cast through `unknown` first, as the
compiler suggested — `as unknown as HTMLAeIcon5ComponentElement`. No runtime behavior change;
ids `'1'`/`'2'` are demo-only elements known at this call site to actually be
`<ae-icon5-component>`.

**Verified:** `npx tsc --noEmit -p .` clean (previously reported the TS2352 error at this
location).

---

## 4. References

- **Prior review:** `rvw/Code_review 2026-08-19.md` (CF table origin; `aetype` presets, v1.5.0).
- **This repo:** `ae-icon5-component.tsx` (`iconClicked`), `package.json`/`package-lock.json`.
