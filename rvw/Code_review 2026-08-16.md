# Code Review — ae-icon5-component

**Date:** 2026-08-16 · **Repo:** `adaept/ae-icon5-component`
**Continues:** `rvw/Code_review 2026-08-15.md` (CF table carried below, CF-5 text refreshed to
point at the now-concrete Iconify design; that session's GitHub issues #22/#23/#24/#25/#26/#28/
#29 are already closed and referenced from its own §2–§8 — not repeated here. Issue #27 was
*filed* that session, during #26's verification, but not fixed until today — see §2 below).

---

## 1. Carry-forward tasks — carried from 2026-08-15

**Not re-checked line by line** — this session's scope was issue #27 (§2 below) only. Status
shown is 2026-08-15's last-verified state; treat as stale until a session that actually
re-audits each item.

| # | Task | Status | Pri |
|---|------|---|-----|
| CF-2 | aedh adopts `registerIcons`/`dist-custom-elements`, drops the 1357-svg glob, ticks off item L | ☐ open | HIGH |
| CF-4 | Jest → Vitest full crossover; drop deprecated `stencil test` | ◑ partial | MED |
| CF-5 | Iconify source (`set="iconify:*"` seam) — design finalized 2026-08-15, `docs/modernization-plan.md` §6 (naming, confirmed v1.5.0, staged mdi pilot, starter-kit gotchas, §6.6's free/paid Capacitor idea) | ☐ deferred (≈v1.5.0, now a real plan not a placeholder) | LOW |
| CF-6 | Drop legacy `dist` lazy loader once consumers are on `dist-custom-elements` | ☐ future major | LOW |
| CF-7 | `codeql-analysis.yml`: `actions/checkout@v2` → `@v4` | ☐ open | LOW |
| CF-8 | Click-info panel cosmetic (`iconClicked`/`renderInfoPanel` builds display HTML with now-empty/`undefined` `color=`) | ☐ open | LOW |
| CF-9 | Confirm aedh's ~20 icon names are in the default manifest or registered when item C lands | ☐ open | LOW |
| CF-10 | Third-party guide sync (`docs/THIRD-PARTY-GUIDE.md`, guard `check.guide`) | ◑ ongoing-per-release | LOW |
| CF-11 | Generalize the release runbook for 3rd-party devs | ☐ open | LOW |
| CF-12 | `--ionicon-stroke-width` not overridable from outside the component — flagged again in modernization-plan §6.3 Stage 0 as prep work now more relevant once multiple icon families coexist | ☐ open | MED |
| CF-13 | Deployed demo (`https://aeicon5.web.app`) is stale — never successfully redeployed for v1.4.0; also now a modernization-plan §6.3 Stage 0 prep item | ☐ open | HIGH |
| CF-14 | `adaeptZone` vendored SVGs/tokens have no automated re-sync from `design-system/` — see modernization-plan §12. | ☐ open (documented, not automated) | LOW |

---

## 2. `name:undefined` for `src`-based icons (GitHub issue #27)

**Request:** [issue #27](https://github.com/adaept/ae-icon5-component/issues/27) — filed by this
project itself on 2026-08-15 while verifying issue #26 (found incidentally, not the thing being
tested): icons rendered via the `src` prop (the ae logo, `adaeptZone`'s marks — no `name` set)
showed the literal string `name:undefined` in `#containerDetail`, since `renderInfoPanel()`
concatenates `this.name` with no fallback. Same bug category as #21's `aetype:undefined` (fixed
2026-08-15) and CF-8's `color=` case (still open, tracked above, not touched by this fix).

**Fix:** `renderInfoPanel()` (`ae-icon5-component.tsx`) now computes `const displayName =
this.name || this.src || ''` once, and uses it in **both** places that previously concatenated
`this.name` raw — `#containerDetail`'s `name:` field *and* `#containerPara`'s code-preview
snippet. The issue only reported the first; the second had the identical bug from the same line
and was fixed in the same pass rather than left half-done. Chose "fall back to `src`" over a bare
`|| ''` guard (the pattern used for `aetype`) because it's more informative here — the panel still
identifies *which* icon was clicked instead of going blank.

**Verified:** `npm run build`, `npm run test.unit` (3/3 pass), `npm run lint` (same 3
pre-existing, unrelated issues), and a live Puppeteer click on a `src`-based icon (the header ae
logo) — `#containerDetail` now reads `name:assets/aeicons/ae-logo.svg` instead of
`name:undefined`; a normal `name`-based icon (`add`) re-checked alongside it, unaffected, still
showing its issue #26 source link. Noted but explicitly **not** touched: the same click also shows
`color="undefined"` in `#containerPara`'s preview — that's CF-8, a different field, already
tracked separately above.

**Not committed as part of a release** — no version bump.

---

## 3. References

- **Prior review:** `rvw/Code_review 2026-08-15.md` (CF table origin; §2–§8 for issues #22/#23/
  #24/#25/#26/#28/#29, all closed in that session; §9/§9 addendum for the Iconify design that
  produced this session's refreshed CF-5).
- **This session's origin:** [GitHub issue #27](https://github.com/adaept/ae-icon5-component/issues/27)
  (§2's origin; filed 2026-08-15 during #26's verification, fixed today).
- **This repo:** `ae-icon5-component.tsx` (`renderInfoPanel`, §2).
