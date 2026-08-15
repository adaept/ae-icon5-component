# Code Review — ae-icon5-component

**Date:** 2026-08-15 · **Repo:** `adaept/ae-icon5-component`
**Continues:** `rvw/Code_review 2026-08-14.md` (CF table carried below unchanged; that session's
GitHub issues #19/#20/#21 are already closed and referenced from its own §4/§5/§6 — not repeated
here).

---

## 1. Carry-forward tasks — carried from 2026-08-14

**Not re-checked line by line** — this session's scope was issue #22 (§2 below) only. Status
shown is 2026-08-14's last-verified state; treat as stale until a session that actually
re-audits each item.

| # | Task | Status | Pri |
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
| CF-12 | `--ionicon-stroke-width` not overridable from outside the component | ☐ open | MED |
| CF-13 | Deployed demo (`https://aeicon5.web.app`) is stale — never successfully redeployed for v1.4.0 | ☐ open | HIGH |
| CF-14 | `adaeptZone` vendored SVGs/tokens have no automated re-sync from `design-system/` — see modernization-plan §12. | ☐ open (documented, not automated) | LOW |

---

## 2. Hover ring width didn't scale with icon size (GitHub issue #22)

**Request:** [issue #22](https://github.com/adaept/ae-icon5-component/issues/22) — "stroke width
does not scale"; body: "Stroke Width Sample… the stroke on hover is the same thin line for all
size icons."

**Root cause:** `ae-icon5-component.css`'s `:host` rule hardcoded `--ae-hover-ring-width: 2px` —
a fixed pixel value, unaffected by `aesize`/`aesw*`. Every icon from `ae16` (16px) up to `ae1024`
(1024px) got the identical 2px `box-shadow` inset ring on hover; most visible in the demo's
"Stroke Width Sample" row (`aesw32` through `aesw80`), which exists specifically to show icons at
increasing sizes/stroke weights side by side, so the constant-width ring stood out as clearly
wrong there. Distinct from **CF-12** above (`--ionicon-stroke-width`, the icon's own path stroke
thickness) — that variable already scales correctly per `aesw*` class; this bug was the *hover
ring*, a separate custom property.

**Fix:** changed the default from a fixed `2px` to `0.0625em` in both `ae-icon5-component.css`
and `README.md`'s documented default. `em` on `ion-icon:hover`'s `box-shadow` resolves against
`ion-icon`'s own computed font-size — exactly what `aesize`/`aesw*` classes set — so the ring now
scales with the icon automatically. `0.0625em` was chosen so the rendered ring is pixel-identical
to the old default at the demo's dominant `aesize="ae32"` (`0.0625 × 32px = 2px`), i.e. a
non-breaking default for the common case, only changing behavior at other sizes where it was
already wrong. Consumers who want a constant-width ring regardless of icon size can still
override `--ae-hover-ring-width` with a fixed `px` value, same as before.

**Verified:** `npm run build`, `npm run test.unit` (3/3 pass), `npm run lint` (same 3
pre-existing, unrelated issues as prior sessions — `no-undef` in `test-ids.browser.js`, two
`any`-type warnings in the component), and a live Puppeteer hover test against the dev server
across all seven "Stroke Width Sample" sizes — computed `box-shadow` inset width now reads 2px /
2.5px / 3px / 3.5px / 4px / 4.5px / 5px for `aesw32` … `aesw80` respectively (previously a flat
2px at every size).

**Not committed as part of a release** — no version bump.

---

## 3. References

- **Prior review:** `rvw/Code_review 2026-08-14.md` (CF table origin; §4/§5/§6 for issues
  #19/#21/#20, all closed in that session).
- **This task's origin:** [GitHub issue #22](https://github.com/adaept/ae-icon5-component/issues/22)
  (§2's origin).
- **This repo:** `README.md` ("Themeable hover" section, `--ae-hover-ring-width` default and the
  new em-scaling note), `ae-icon5-component.css` (`:host` hover-ring custom properties).
