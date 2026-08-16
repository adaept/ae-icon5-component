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

## 4. RESET button didn't display info (GitHub issue #24)

**Request:** [issue #24](https://github.com/adaept/ae-icon5-component/issues/24) — "the reset
button does not display info when clicked" (no body).

**Root cause:** `iconClicked()`'s switch on `this.arialabel` has three cases for the SIZE row's
three icons (`id="1"`/`"2"`/`"3"`, `-`/`+`/RESET). `ae-remove-circle` and `ae-add-circle` both
update `#containerDetail`/`#containerPara` with the clicked icon's info (same two-statement
block, copy-pasted between them — the file's existing convention, not something this fix
changed). `ae-refresh-circle` (RESET) only reset the SIZE row's icon sizes back to default and
`break`s — the copy-paste never happened for that third case, so clicking RESET silently did
nothing to the info panel.

**Fix:** added the same two-statement `#containerDetail`/`#containerPara` update block to the
`ae-refresh-circle` case, after its existing size-reset logic — matching the other two cases'
exact pattern rather than extracting a shared helper, consistent with how the surrounding code is
already written.

**Verified:** `npm run build`, `npm run test.unit` (3/3 pass), `npm run lint` (same 3
pre-existing, unrelated issues), and a live Puppeteer click on the RESET icon (`id="3"`) —
`#containerDetail` now reads `name:refresh-circle color:danger aesize:ae48 aetype:round
arialabel:ae-refresh-circle`, matching the `-`/`+` icons' behavior.

**Not committed as part of a release** — no version bump.

---

## 5. Click-info panel: "jump to source" link (GitHub issue #26)

**Request:** [issue #26](https://github.com/adaept/ae-icon5-component/issues/26) — "show the line
numbers for first occurrence of icon info with click icon to goto the code example… for
developers to quickly see the first code implementation example of any click info feature."

**Fix:**
- New `scripts/gen-icon-line-map.mjs` — build-time script, same convention as
  `gen-build-stamp.mjs` (demo-only, gitignored output, wired into `prebuild`/`prestart`). Scans
  `src/index.html`, records the **first** line number of every icon `name`'s first occurrence
  (verified beforehand that every `name="…"` in the file, apart from three unrelated `<meta>`
  tags in `<head>`, is on a line that also contains the literal text `ae-icon5-component`, so a
  same-line substring check is enough — no HTML parser needed), writes
  `src/assets/icon-line-map.js` (`window.AE_ICON_LINE_MAP`).
- `ae-icon5-component.tsx`: the click-info panel now appends a **source** link —
  `github.com/adaept/ae-icon5-component/blob/master/src/index.html#L<line>` — when the clicked
  icon's `name` is in the map. Icons rendered via `src` (no `name`, e.g. `adaeptZone`) correctly
  omit the link rather than showing a broken one.
- **Consolidated `iconClicked()`'s four copy-pasted info-panel blocks into one
  `renderInfoPanel()` method** while touching all four to add this feature — directly motivated
  by #21 and #24 both being exactly this copy-paste going stale in one of the four spots; one
  method removes the recurring failure mode instead of adding a fifth near-duplicate.
- `eslint.config.mjs` / `.gitignore`: excluded the new generated file, mirroring
  `build-stamp.js`'s existing treatment (same `window`-global lint noise, same "regenerated every
  build" reasoning).
- `README.md`: documented the new link and generator script.

**Verified:** `npm run build`, `npm run test.unit` (3/3 pass), `npm run lint` (same 3 pre-existing
issues), `npm run check.icons`, and live Puppeteer checks — clicking `add` linked to
`index.html:467` (confirmed against the file directly), RESET linked to `index.html:141`
(its own `name="refresh-circle"` tag), and a `src`-based icon correctly showed no source link.

**Found but out of scope, filed separately:** `src`-based icons show a literal `name:undefined`
in the panel (same string-concat-with-no-fallback category as #21's `aetype:undefined`, and the
`color=` case CF-8 already tracks) — filed as
[issue #27](https://github.com/adaept/ae-icon5-component/issues/27) rather than folded in here.

**Post-verification catch — the link pointed at the wrong line until this was pushed:** the demo
computes line numbers against the **local** `src/index.html` (155 for `tennisball-outline`,
after this session's own edits shifted everything below the new `<script>` tag down by 5 lines),
but the link is hardcoded to `blob/master/…` — the already-**pushed** `master`, which still had
the pre-#26 file (`tennisball-outline` at line 150) until this commit. Reported by the user
testing against the live dev server before the push; confirmed via `git show
origin/master:src/index.html`. Not a logic bug in the generator — an inherent gap between
"what the local demo just computed" and "what's live on GitHub" whenever `src/index.html` has
unpushed changes. No code fix for this (there isn't one that doesn't defeat the point of linking
at the canonical GitHub source); resolved for this specific case by pushing promptly. Worth
keeping in mind for any future `src/index.html`-editing session between generating the map and
pushing.

**Not committed as part of a release** — no version bump.

---

## 6. Octocat icon top-aligned with the logo (GitHub issue #28)

**Request:** [issue #28](https://github.com/adaept/ae-icon5-component/issues/28) — "the top of
the Octocat icon should align with the top of the logo" (no body).

**Investigation:** `#fixedGithub`'s hardcoded `top: 30px` (`aestyles.css`) sat 12px below the "ae"
logo icon's actual top — measured via `getBoundingClientRect()` on both icons' shadow-DOM
`ion-icon` elements (logo: 18px; octocat: 30px), not eyeballed.

**Fix (with two false starts, both reverted before landing):**
- First pass: moved `#fixedGithub` to `top: 18px` (matching the logo) and shifted `#circleGithub`
  — the pink circle behind the octocat glyph — by the same 12px, `32px` → `20px`, preserving its
  original 2px inset from the icon's own top (that inset centers the circle on the glyph,
  compensating for the icon's internal padding within its 32px box).
- User asked to A/B test `#circleGithub` at the *same* top as the icon (no 2px inset), to compare
  visually — set to `18px` temporarily.
- Misread the follow-up ("move the logo up 2px to match the pink circle") as "shift the logo's
  own position" and added `margin-top: -2px` to the logo's `<a>` — user corrected: the octocat
  icon's top should be level with the logo (not offset), and the pink circle's 2px inset needed
  to stay (it's what centers the circle on the icon, not something to remove). Reverted the
  logo's `margin-top` entirely and set `#circleGithub` back to `top: 20px`.
- **Final state:** `#fixedGithub` (octocat icon) `top: 18px` = logo's `top: 18px` (level, per the
  request); `#circleGithub` (pink circle) `top: 20px` (2px inset from the icon, preserved).

**Verified:** `npm run build`, `npm run test.unit` (3/3 pass), `npm run lint` (same 3
pre-existing, unrelated issues), and a live Puppeteer measurement of the final state —
`ghTop: 18`, `logoTop: 18`, `circleTop: 20` — plus a screenshot.

**Not committed as part of a release** — no version bump.

---

## 7. Stale favicon/icon predating the design-system logo (GitHub issue #25)

**Request:** [issue #25](https://github.com/adaept/ae-icon5-component/issues/25) — "the ae icon
in the GitHub repo is not showing the design system logo update… This is the original ae account
logo that predates the design system update."

**Investigation:** `src/assets/icon/icon.png` (64×64, used as the demo's `apple-touch-icon`) and
`favicon.ico` (5 sizes: 64/48/32/24/16, all 32bpp) both dated to 2026-06-05 — before any of the
design-system work. Visually confirmed against a Puppeteer render of the current mark: the old
files show a different construction entirely (a thin outer ring + interlaced swirl), not the
canonical "ae" ambigram this repo already vendors at `src/assets/aeicons/ae-logo.svg` (§ from
2026-08-14's session) — and not a stale copy of a *newer* design-system version either, genuinely
the old pre-C1 mark. Cross-checked `adaept5tudio/design-system/assets/ae-icon.png` (512×512
RGBA, transparent, documented there as the canonical web-app/PWA icon source) — visually
identical to `ae-logo.svg`'s color mark, confirming this repo's `icon.png`/`favicon.ico` were
simply never updated when the design-system logo work landed.

**Fix:** regenerated both from `src/assets/aeicons/ae-logo.svg` (already vendored, no new
cross-repo copy needed) rather than downscaling a raster source, for crisp results at each size:
- No ImageMagick/sharp/Inkscape available on this machine — rendered each target size (16/24/32/
  48/64px, matching the original `favicon.ico`'s exact size set) directly via headless Chrome
  (`page.setViewport` to the exact pixel size + `page.screenshot({omitBackground: true})`), then
  hand-packed the 5 PNGs into a valid multi-resolution `.ico` (PNG-per-entry ICONDIR format,
  valid since Windows Vista — no BMP encoding needed). Verified structurally (`file`, and a check
  that every entry's image data starts with the PNG magic bytes) before replacing the files.
- `icon.png` replaced with the 64px render (same size as before).
- Followed the design-system's own documented convention for `ae-icon.png` (a **manual**,
  documented regen step, not part of its automated build script) rather than adding a permanent
  script to this repo — same reasoning, this is a rare, visually-verified-by-hand operation, not
  something to automate.

**Verified:** confirmed `www/`'s copied assets are byte-identical to the new `src/` files after
`npm run build`, confirmed the running dev server serves the new `favicon.ico` (`file` on the
response body), `npm run test.unit` (3/3 pass), `npm run lint` (same 3 pre-existing issues).

**Not committed as part of a release** — no version bump. Note: `src/index.html`'s `<link
rel="manifest" href="/manifest.json">` points at a file that doesn't exist anywhere in this repo
(pre-existing dead reference, found incidentally while checking for other icon-size references
to update) — left alone, out of scope for this issue.

---

## 8. "Alphabetic group list" outline/sharp filter (GitHub issue #29)

**Request:** [issue #29](https://github.com/adaept/ae-icon5-component/issues/29) — "Ionicons -
alphabetic group list shows 3 variants by default" / "Ionicons have 3 variants for the main icons
so loading time will be ~3x." Ask: default-filter that section to exclude `-outline`/`-sharp`,
toggleable, with the actual situation documented in the resolution, and a status readout beside
the version triple: "Filter On/Off — X of Y icons displayed."

**The actual situation (measured, not assumed — this is the "description of the actual
situation" the issue asked to be included here):** every one of the 421 non-logo icon concepts in
`node_modules/ionicons` has **exactly** 3 style variants (plain/`-outline`/`-sharp`), no
exceptions — confirmed programmatically, not eyeballed. `421 × 3 = 1263`, matching the group
list's actual icon count exactly. So filtering to base-only is a clean **3.0x** fewer icons in
that one section (not the ~2.6x I'd estimated in chat before landing this — that number wrongly
blended in the 94 single-style logo icons, which live in a separate section entirely and were
never part of this claim or this fix's scope).

**Fix:**
- `#aeGroupList` id added to scope the group list container (only that section — not logos, not
  the curated color demo, not `adaeptZone`).
- CSS hides `ae-icon5-component[name$="-outline"]`/`[name$="-sharp"]` inside it **by default**
  (baked into the stylesheet, not toggled on after page load — no flash of the unfiltered set).
- New toggle beside `#aeVersionTriple` (the actual page header, not the section's own `<h1>` —
  confirmed with the user before implementing, after an initial ambiguity). Counts are read live
  from the DOM (`querySelectorAll`), not hardcoded — the exact class of bug that made issue #19
  necessary in the first place.
- **Three follow-up bugs, all found by the user against the live dev server and fixed in the same
  session, not after-the-fact:**
  1. Adding the toggle grew `#aeHeader`'s height (152px → 180px) but `body`'s compensating
     `padding-top` was still 152px — caught and fixed by the same live-measurement approach used
     throughout this file, before the user even saw it.
  2. **Bug 1/2 (reported together):** the toggle's own text held the *entire* sentence ("Filter
     On — 421 of 1263 icons displayed"), and it rendered on its own line below the version
     triple instead of beside it. Restructured into a flex row: `#aeVersionTriple`, a "Filter"
     label, a real toggle button whose own text is just "On"/"Off" (green when on, gray when
     off, `role="switch"`/`aria-pressed`), and the count as separate text — all on one row.
     Re-measured `#aeHeader`'s height again after this layout change (158px, since the button no
     longer needed its own line) and corrected `body`'s `padding-top` to match.
  3. **Bug 3:** clicking `woman` with the filter on (or off — confirmed irrelevant, the line-map
     is keyed by `name`, not visibility) showed source line 1736, reported as "should be 1724."
     Not a generator bug — the exact same gap documented in §5: the panel correctly computes
     against the **local** file (1736, correct — this session's header edits shifted everything
     below down), but the source link is hardcoded to `blob/master/…`, the **already-pushed**
     master, where `woman` was still at 1724 (confirmed via `git show origin/master:src/
     index.html`) because none of this session's changes had been pushed yet. Resolves itself on
     push, same as the `tennisball-outline` case in §5.

**Verified:** `npm run build`, `npm run test.unit` (3/3 pass), `npm run lint` (same 3
pre-existing issues), and live Puppeteer checks after each fix — initial state (421/1263,
`aria-pressed="true"`), toggled state (1263/1263, `aria-pressed="false"`), toggle beside the
triple on the same row (top-coordinates within 3px), no header/content overlap (8px gap), and the
issue #23 scroll-visibility regression re-checked after every layout change in this section.

**Not committed as part of a release** — no version bump.

---

## 9. Iconify design finalized (planning, no code) — `docs/modernization-plan.md` §6

**Request:** D3 (Iconify support, §6, deferred since 2026-06-05 with no actual design beyond "a
`set` prop + adapter interface, target ≈v1.5.0") needed a concrete design — triggered by two
follow-on questions from the day's issue #29 work: whether calling every source "ionicons" was
wrong once other providers are in play, and whether that would force a v2.0.0 breaking bump
instead of the planned v1.5.0 minor.

**Resolved, documented in `docs/modernization-plan.md` §6 (5 subsections, no renumbering of
existing §7–13 or the CF/roadmap cross-references that already cite them by number):**
- **§6.1 Naming** — adopt Iconify's own `{prefix}:{name}` convention (already standardized;
  Ionicons itself is hosted there under `ion`) inside a new opt-in `set="iconify"` mode, rather
  than inventing a new scheme. `set="ionicons"` stays a permanent, unchanged default.
- **§6.2 Versioning** — **confirmed v1.5.0, not v2.0.0.** Per semver, incompatible API changes
  force MAJOR, not scope size — and with §6.1's design nothing about the existing default
  changes. The one thing that *would* force v2.0.0 (renaming/dropping the `"ionicons"` identifier
  itself) is explicitly ruled out as a non-negotiable.
- **§6.3 Staged mdi pilot** — Material Design Icons (Apache-2.0, ~7,000 icons) as the first real
  implementation, 5 stages (0 prep → 1 type-level seam → 2 component-level → 3 isolated demo pilot
  → 4 expand), each with an explicit "how to prove the existing demo/component didn't regress"
  check. Stages 1–2 touch zero lines of `src/index.html` by construction — the existing showcase
  literally cannot regress until Stage 3. Stage 0 doubles as 1.4.x-line prep work: a real
  `manifest.json` (currently a dead `<link>`, found incidentally during issue #25, now a hard
  requirement for §6.5's Windows path), plus closing CF-13 (stale demo deploy) and CF-12
  (`--ionicon-stroke-width` override — now more relevant once icon families with different stroke
  conventions coexist).
- **§6.4 Starter-kit gotchas** — Angular (`CUSTOM_ELEMENTS_SCHEMA`, extract from aedh's real
  usage), React (attribute casing only, not a real blocker — every prop here is a plain string/
  boolean), Ionic Framework (already integrates via the `color=` theme path, a selling point not
  a gotcha), and the one real **correctness** issue: Capacitor/offline apps must use pre-bundled
  `addIcons`/`registerIcons`, never a runtime network-fetch fallback (`file://`/`capacitor://`
  pages don't resolve same-origin fetches the way `https://` does) — which is also why Stage 2
  specifically requires Iconify's *offline* `@iconify-json/*` packages, not its on-demand API.
- **§6.5 aetimeline as the real test case** — the user's own Capacitor app (`capacitor.config.ts`
  already targets Android first, iOS "later reuses the same webDir"). Recommended **one iconset
  uniformly** across Android/iOS/Windows rather than per-platform-native conventions — SF Symbols
  specifically ruled out for iOS as licensing-incompatible with cross-platform reuse, not just a
  style call. Microsoft Store given a pros/cons/suggestion table (no macOS/Xcode needed to attempt
  it; reuses the existing `www` PWA build via PWABuilder; validates the pipeline but not
  Capacitor-specific concerns; verify current MS-Store account terms directly rather than trust
  memory) and a concrete staging: Android now (lowest friction, exercises the mdi pilot
  end-to-end), Windows now-in-parallel (near-zero marginal cost, same `www` build), iOS later
  (most new infrastructure, historically more App Store scrutiny of thin web wrappers).
- `§12` roadmap bullet and `D3` in "Resolved decisions" both updated to point at §6 instead of the
  old one-line placeholder.

**Not implemented — planning only.** No code changed; `npm run build`/`test.unit`/`lint` untouched
by this entry (verify via `git diff --stat` showing only `docs/modernization-plan.md`).

---

## 10. References

- **Prior review:** `rvw/Code_review 2026-08-14.md` (CF table origin; §4/§5/§6 for issues
  #19/#21/#20, all closed in that session).
- **This session's origin:** [GitHub issue #22](https://github.com/adaept/ae-icon5-component/issues/22)
  (§2's origin), [GitHub issue #23](https://github.com/adaept/ae-icon5-component/issues/23)
  (§3's origin), [GitHub issue #24](https://github.com/adaept/ae-icon5-component/issues/24)
  (§4's origin), [GitHub issue #26](https://github.com/adaept/ae-icon5-component/issues/26)
  (§5's origin; that section also spun off
  [issue #27](https://github.com/adaept/ae-icon5-component/issues/27)), [GitHub issue
  #28](https://github.com/adaept/ae-icon5-component/issues/28) (§6's origin), [GitHub issue
  #25](https://github.com/adaept/ae-icon5-component/issues/25) (§7's origin), [GitHub issue
  #29](https://github.com/adaept/ae-icon5-component/issues/29) (§8's origin; also the direct
  trigger for §9's Iconify design discussion, no separate issue filed for it).
- **This repo:** `README.md` ("Themeable hover" section, `--ae-hover-ring-width` default and the
  new em-scaling note; §5's source-link doc), `ae-icon5-component.css` (`:host` hover-ring custom
  properties, §4's `iconClicked` fix), `aestyles.css` (`#aeHeader`, `#fixedGithub`/`#circleGithub`
  stacking and positioning, `#aeIconFilterToggle` — §3, §6, §8), `scripts/gen-icon-line-map.mjs`
  (§5), `src/assets/icon/{icon.png,favicon.ico}` (§7), `docs/modernization-plan.md` §6/§12/D3
  (§9).
- **Cross-repo:** `adaept5tudio/design-system/assets/ae-icon.png` (§7's source-of-truth
  comparison).
