# Code Review — ae-icon5-component

**Date:** 2026-08-14 · **Repo:** `adaept/ae-icon5-component`
**Continues:** `rvw/Code_review 2026-08-13.md` (CF table carried below; item **N** closed out
this session)
**Cross-ref:** `adaept5tudio/design-system/README.md` (two new canonical marks added this
session), `adaept5tudio/rvw/Code_review 2026-08-14.md` (the design-system + font side of this
same task), `adaept5tudio/docs/adaept5tudio-dev-plan.md` item **A17**.

---

## 1. Carry-forward tasks — carried from 2026-08-13, item N closed out (§2 below)

**Not re-checked line by line** — this session's scope was the `adaeptZone` demo row (§2) only.
Status shown is 2026-08-13's last-verified state; treat as stale until a session that actually
re-audits each item. Item **N** (2026-08-07 §2 / 2026-08-12's CF table) is **done** as of this
session — see §2 — and is dropped from the table below per this file's usual convention (done
items aren't carried forward, only referenced from their closing entry).

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
| **CF-14** | **`adaeptZone` vendored SVGs/tokens have no automated re-sync from `design-system/`** — see modernization-plan §12. | ☐ open (documented, not automated) | LOW |

---

## 2. `adaeptZone`: canonical design-system icons for the "adaept" logo animation — 2026-08-14

**Request:** replace each SVG in the (until now, commented-out) `<div id="adaeptZone">` demo
row with "the design system canonical that uses the colors," confirm it visually, then delete
the old SVG files. Clarified with the user into a concrete scope: `ae` should come from
`design-system/`; `at`/`dp` should be *added* to `design-system/` as new canonicals (matching
stroke width and circular construction); the adaept font should get these three from
`design-system/` too, not keep independent copies; uncomment the demo row for visual approval
before anything is deleted; add `arialabel`/`color` to the markup; one central source of truth
for this logo animation.

**Investigation (before touching anything):**
- Local `ae.svg` turned out to be an *old, geometrically unrelated* hand-drawn outline — nothing
  to do with the studio's actual "ae" brand mark (`design-system/ae-base-a.svg` →
  `ae-logo.svg`/`ae-logo-mono.svg`, documented C1 circle/arc construction + `tokens.css` colors).
  This repo's own item **N** (`rvw/Code_review 2026-08-07.md` §2) already called for wiring "ae"
  to that source; this session finally did it.
- Local `at.svg`/`dp.svg`, by contrast, turned out to be **numerically identical** (verified via
  a flattened-curve nearest-point distance check, not eyeballed) to the `at`/`dp` glyphs already
  hand-designed in the adaept font's `adaept5tudio/assets/font/g4/adaept/adaept-canonical-351.json`
  — both trace back to the same historical `aezdb` import — but that geometry had **no home in
  `design-system/`**, duplicated across two repos with no sync mechanism.
- `pd.svg`/`ta.svg` are exactly `at`/`dp` rotated 180° about their own center (confirmed
  numerically) — a "natural ambigram" pair, the same relationship `ae-base-a.svg`'s "a"/"e"
  already has. Confirmed with the user: only `at`/`dp` needed to become new canonical
  constructions; `pd`/`ta` are generated, never hand-authored.

**Cross-repo work (full detail in `adaept5tudio/rvw/Code_review 2026-08-14.md`):**
- New canonical `design-system/ae-base-at.svg` / `ae-base-dp.svg` — construction (outer/inner
  ring radius, center, the "t" crossbar/stem and "p" stem bridges) derived via a least-squares
  circle fit over each path's own flattened curve points, not eyeballed, documented in-file the
  same way `ae-base-a.svg` documents its R=500/r=430. `design-system.build` extended to
  populate `assets/{at,dp}.svg` (direct copies) and **generate** `assets/{pd,ta}.svg` (180°
  rotation of `dp`/`at` — never hand-authored, same technique already used for
  `ae-logo-mono.svg`'s rotated "e" half).
- Font sync verified numerically, not assumed: the adaept font's `at`/`dp`/`ae` Glyphs-layer
  cells already matched the design-system-derived candidates (a `git diff` after the paste
  script ran showed **zero** change for `ae` — that sync must have happened in an earlier,
  undocumented session; the carry-forward note calling it "not yet applied" was stale since
  2026-08-02 and has been corrected). No risky glyph swap was needed — just documenting the new
  design-system → font dependency direction.

**This repo's changes:**
- `src/assets/aeicons/{at,dp,ae,pd,ta}.svg` replaced in place with the design-system-derived
  versions (`ae` ← `ae-logo-mono.svg`, single-color `currentColor` — chosen over the two-tone
  `ae-logo.svg` for visual consistency with `at`/`dp`/`pd`/`ta`'s currentColor treatment in the
  same row; flagged to the user as the one assumption made, confirmed fine at the visual-review
  checkpoint). Old stroke color hardcoded to `#000` switched to `currentColor` so the row is
  themeable like the rest of the demo. Each vendored file's header comment records its
  design-system provenance and that re-sync is manual (no cross-repo build link — see
  modernization-plan §12, CF-14 above).
- New `src/assets/design-tokens.css` — a vendored copy of `design-system/tokens.css`, linked
  from `index.html`'s `<head>`, same provenance-copy approach.
- `ae-icon5-component.tsx`: new `@Prop() decorative: boolean = false` — when set, the rendered
  `<ion-icon>` gets `aria-hidden="true"` and no `aria-label`, instead of the always-on
  `aria-label={this.resolvedArialabel}`. Backs the a11y choice below (only touches the
  `adaept === 'adaept'` render branch).
- `index.html`: `adaeptZone` uncommented. The 5 icons are individually `decorative`; the
  container carries `aria-label="adaept™"` `role="img"` — read as one word by a screen reader,
  not 5 meaningless two-letter fragments (`role="img"` also means anything else placed inside
  the container is invisible to the accessibility tree unless folded into that one label, which
  is why the `™` text below is `aria-hidden` and the label itself became `"adaept™"`).

**Verified live** (Stencil dev server + a throwaway Puppeteer script, not just "renders without
a JS error"): the row displays 5 real SVGs (confirmed each has a parsed `<path>`, not an empty/
malformed fetch), reads as the word "adaept" via the design-system ring/mark geometry, and the
existing hover translate/rotate animation still works end-to-end (screenshotted before, mid-
transition, and after hover).

### 2a. Follow-up bug — hover background stayed pink, should be transparent

**Reported after the above landed.** `#adaeptZone { background: hotpink; }` and
`div.adaept div { background: hotpink; }` were leftover placeholder colors from whenever this
block was first built — changed both to `transparent`.

That surfaced a second, related issue: with the pink gone, the icons (then `color: #fff`) were
nearly invisible against the page's ivory background. Fixing the container's plain CSS `color`
to something dark **did nothing** — root cause: `ae-icon5-component.css` doesn't use inherited
`color` at all; it reads a **shadow-DOM-piercing custom property**,
`ion-icon { color: var(--ae-color, var(--color)); }`, with `--color: pink` hardcoded as the
shadow-root-local fallback (`* { --color: pink; ... }`). An ancestor's plain `color:` can never
reach that — only setting `--ae-color` from outside works (documented in the component's own
CSS comments, already the pattern every other icon in this demo uses via
`style="--ae-color: …"`). Fixed by setting `#adaeptZone { --ae-color: #222; }` instead. Verified
via computed-style check + a fresh screenshot: transparent background, legible dark mark.

### 2b. Follow-up — add a ™ mark, outside the animation, top-aligned

**Request:** add `™` after "adaept," not necessarily part of the hover animation, in the
existing display font, top-aligned with the icon row. Clarified with the user first: this
codebase declares no custom `font-family` anywhere (no `@font-face`, no web-font link) — the
whole page, headings included, already renders in one single browser-default font, so "the
existing display font" meant exactly that, not the adaept custom font (which — separately noted
to the user — has no standalone T/M/™ glyph anyway; it's a letter-*pair* font at PUA codepoints,
not a normal alphabet).

Added `<span class="adaept-tm" aria-hidden="true">™</span>` as a **sibling** of `div.adaept`
(not nested inside it, and not inside the inner `div` that also gets a 360° rotate on hover) —
verified via `getBoundingClientRect()` that its position is bit-for-bit identical before and
during hover, so it's fully excluded from both transforms. `position: absolute; top: 10px;`
matches the icon row's own top edge within the 60px-tall zone (icon row: `bottom: 10px`,
`height: 40px`, so `60 − 10 − 40 = 10px` from the top). `#adaeptZone`'s `aria-label` updated to
`"adaept™"` so the mark is still announced despite being `aria-hidden` itself (see §2's `role="img"`
note on why a plain visible-but-unlabeled child would otherwise be silently dropped from the
accessibility tree).

**Not committed as part of a release** — no version bump; `npm run start` was used throughout
for live verification, never `npm publish` or a Firebase deploy.

---

## 3. References

- **Prior review:** `rvw/Code_review 2026-08-13.md` (CF table, CF-13 deploy-staleness detail).
- **This task's origin:** `rvw/Code_review 2026-08-07.md` §2 (item N, "ae" brand-mark icon).
- **Cross-repo:** `adaept5tudio/rvw/Code_review 2026-08-14.md` (design-system + font side),
  `adaept5tudio/design-system/README.md` (the two new canonical files' full documentation),
  `adaept5tudio/docs/adaept5tudio-dev-plan.md` item **A17** (the adaept font, whose `at`/`dp`/`ae`
  cells this task verified against).
- **This repo:** `docs/modernization-plan.md` §12 (roadmap entry + CF-14, the manual-resync
  limitation), `README.md` (`decorative` prop, `adaeptZone` provenance note).
