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

## 3. Click-info panel scrolled out of sight (GitHub issue #23)

**Request:** [issue #23](https://github.com/adaept/ae-icon5-component/issues/23) — "On scrolling
down the Octocat icon with GitHub link remains visible but the information that is displayed
when the icon is clicked will scroll out of sight. It should remain visible."

**Root cause:** `#fixedGithub`/`#circleGithub` (the octocat link) were already `position: fixed`
(`aestyles.css`), so they stayed pinned to the viewport. Nothing else in the header — the ae
logo/™, the version-triple build stamp, and critically `#containerPara`/`#containerDetail` (the
click-info panel) — had any fixed/sticky positioning, so all of it scrolled away with the rest of
the page inside `div.aeicon5-scroll`'s (and `body`'s own, since both share the same `height:
800px; overflow: scroll` rule) scroll box.

**Fix:**
- `src/index.html`: wrapped the ae-logo/™ block, the version-triple stamp, and the click-info
  `<ion-row>` in a new `<div id="aeHeader">`. Folded in a pre-existing stray unmatched `</div>`
  found while doing this (harmless — browsers silently no-op an orphan closing tag — but it's now
  the wrapper's real closing tag instead of dangling).
- `aestyles.css`: `#aeHeader { position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  background-color: ivory; }`, plus `body { padding-top: 152px; }` to reserve the flow-space
  `#aeHeader` no longer occupies (152px measured from the element's actual rendered height via a
  live Puppeteer check, not guessed, so `div.aeicon5-scroll`'s content doesn't start out hidden
  underneath the new fixed header).
- **Regression caught before landing:** the new `#aeHeader`'s opaque background painted over the
  octocat icon (both fixed-position; `#aeHeader`'s explicit `z-index: 50` outranked
  `#fixedGithub`'s unset z-index). First fix attempt added `z-index: 60` to *both*
  `#fixedGithub` and `#circleGithub`, which fixed the header-vs-github stacking but broke the
  *octocat-glyph-vs-pink-circle* stacking within `#fixedGithub` itself (equal z-index positioned
  siblings paint in DOM order, and `#circleGithub` comes after the icon — its explicit z-index
  now let its background paint over the icon glyph, showing a blank pink circle). Fixed by
  putting `z-index: 60` on `#fixedGithub` **only** — since that also has `position: fixed`, it
  establishes its own stacking context, so its `#circleGithub` child's z-index resolves relative
  to *that* context (unchanged relative order vs. the icon) while the whole pair still lifts
  above `#aeHeader` as one unit.

**Verified:** `npm run build`, `npm run test.unit` (3/3 pass), `npm run lint` (same 3
pre-existing, unrelated issues as prior sessions), and a live Puppeteer sequence — clicked an
icon (populating `#containerDetail` with real data), scrolled both `div.aeicon5-scroll` and the
page 3000px down, confirmed `#aeHeader`'s top and the octocat icon's top both stayed at 0/30px
(unchanged from the unscrolled state) and `#containerDetail` still showed the clicked icon's
info — plus a direct `elementFromPoint` check at the octocat's coordinates resolving to the
`<ae-icon5-component>` (not `#circleGithub`'s flat pink background), confirming the stacking fix.

**Not committed as part of a release** — no version bump.

---

## 4. References

- **Prior review:** `rvw/Code_review 2026-08-14.md` (CF table origin; §4/§5/§6 for issues
  #19/#21/#20, all closed in that session).
- **This session's origin:** [GitHub issue #22](https://github.com/adaept/ae-icon5-component/issues/22)
  (§2's origin), [GitHub issue #23](https://github.com/adaept/ae-icon5-component/issues/23)
  (§3's origin).
- **This repo:** `README.md` ("Themeable hover" section, `--ae-hover-ring-width` default and the
  new em-scaling note), `ae-icon5-component.css` (`:host` hover-ring custom properties),
  `aestyles.css` (`#aeHeader`, `#fixedGithub`/`#circleGithub` stacking, `body` padding-top — §3).
