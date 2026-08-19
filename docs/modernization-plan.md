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

### 4.1 `aetype` hover-effect presets — `round`/`square`/`pentagon`/`rotate` implemented 2026-08-19

Extends §4's CSS-custom-property hover system with a small set of **named presets** selected via
the existing `aetype` prop, instead of every consumer hand-writing `--ae-hover-*` values from
scratch. `aetype` already exists as a WIP prop (doc comment "identify round", currently just
`"round"` set on three demo icons with no actual render/CSS effect tied to it). This formalizes it
into 5 values, demoed one-per-`id` in `src/index.html`'s header logo + SIZE/RESET row.

| id | Element (demo) | `aetype` | Hover effect | Status |
|---|---|---|---|---|
| `0` | header ae logo (`src/index.html`) | `rotate` | rotates `--ae-hover-rotate-deg` (default `180`, via new `aerotatedeg` prop) on hover | **implemented** |
| `1` | SIZE `-` (`remove-circle`) | `round` | existing default: circular ring (`--ae-hover-radius: 50%`) | unchanged |
| `2` | SIZE `+` (`add-circle`) | `square` | square ring (`--ae-hover-radius: 0`) | **implemented** |
| `3` | RESET (`refresh-circle`) | `pentagon` | pentagon ring via `clip-path` | **implemented** |
| `4` | (still commented-out `globe` row) | `pulse` | pulsing scale animation | **not implemented — a follow-up cycle, now that this design is approved and the first four presets are proven** |

Mechanics:
- Each preset is a host-attribute selector in CSS, the same pattern as the existing
  `:host([color])` override:
  ```css
  :host([aetype="square"])   { --ae-hover-radius: 0; }
  :host([aetype="pentagon"]) { --ae-hover-ring-width: 0; --ae-hover-bg: var(--ae-hover-ring-color);
                                --ae-hover-clip-path: polygon(evenodd, /* outer pentagon */ …, /* inner pentagon */ …); }
  :host([aetype="rotate"])   { --ae-hover-ring-width: 0; }
  :host([aetype="rotate"]) ion-icon:hover { transform: rotate(var(--ae-hover-rotate-deg, 0deg)); }
  :host([aetype="pulse"])  ion-icon:hover { animation: ae-pulse 1s ease-in-out infinite; }
  ```
  `round` needs no override — it's already the `:host` default (`--ae-hover-radius: 50%`).
- **`pentagon`** can't reuse `--ae-hover-radius` (`border-radius` can't draw a pentagon) *or*
  `box-shadow` the way round/square/the base mechanism do (`box-shadow` only paints a band hugging
  the box's own rectangular edge — clipping it to a pentagon leaves gaps wherever the pentagon's
  edges dip inside that band, i.e. almost everywhere except the 5 vertices; see fix #8 in §4.1's
  bug log below for the full story). Instead it's a filled donut: one `clip-path: polygon(evenodd,
  …)` listing an outer and inner pentagon, filled via `--ae-hover-bg` instead of `box-shadow`.
- **`rotate`** needs a *value*, not just a shape — a new prop, `aerotatedeg` (number, default
  `180`), maps to `--ae-hover-rotate-deg`. Keeps `aetype` itself a plain enum (consistent with
  `color`/`set`) instead of overloading it with an embedded value (`aetype="rotate:180"`) — matches
  how `arialabel`/`decorative` are already separate single-purpose props rather than packed into one.
- **`pulse`** needs a new `@keyframes ae-pulse` — intentionally not designed in detail here;
  revisit once `round`/`square`/`pentagon`/`rotate` are implemented and the preset pattern is
  proven, per the user's explicit note that id `4` follows after this setup is approved.
- All four implemented presets stay overridable the same way the existing hover vars already are
  — consumers can still set `--ae-hover-radius`/`--ae-hover-clip-path`/`--ae-hover-rotate-deg`
  directly without setting `aetype` at all; `aetype` is a convenience preset, not the only path in.

**Demo changes made:**
- Added `id="0"` + `aetype="rotate"` to the header ae logo element (`src/index.html`).
- Changed `id="2"`'s `aetype` from `round` → `square`, `id="3"`'s from `round` → `pentagon`.
- Added `aetype="rotate"` to the `#ambiZone` six-copy logo showcase's single host element (no new
  `id` — see "id question" below).
- The `id="4"` `globe` row stays commented out (with `aetype="pulse"` already written in, ready to
  uncomment) until `pulse` itself is implemented, so the demo never advertises a non-functional
  preset.

**Bugs found in initial implementation, fixed same day (2026-08-19):**
1. **`rotate` still showed the default ring.** The original CSS only *added* `transform: rotate(…)`
   for `aetype="rotate"`; it never suppressed the base `ion-icon:hover` ring (rebeccapurple, or
   `currentColor` when `color`/`--ae-color` is set), so the header logo rotated *and* flashed a ring
   on hover. Fix: `:host([aetype="rotate"]) { --ae-hover-ring-width: 0; }` — `rotate` is now a pure
   rotation with no ring, by design (the rotation itself is the effect).
2. **`pentagon`'s `clip-path` clipped the icon's own artwork, not just a decorative ring** —
   applying `clip-path` directly to `ion-icon` (the same element that renders the glyph) chopped the
   visible icon (e.g. `refresh-circle`'s filled circle) to the pentagon outline, cutting its edges
   off. Fix: moved the ring/shape rendering (`box-shadow`/`border-radius`/`clip-path`/`background`)
   onto a `::before` pseudo-element positioned `absolute; inset: var(--ae-hover-inset, 0)` behind/
   around `ion-icon`, so it decorates without ever clipping the actual glyph — `ion-icon:hover`
   itself now only carries `transform`/`z-index`. Also added `--ae-hover-inset` (new custom
   property, default `0`): `ion-icon`'s own box is its full `aesize`/`aesw` box, which has some
   internal padding around the rendered glyph (ionicons' own margin, not this component's), so a
   ring/clip-path sized to that box sits slightly outside the visible glyph — round/square read
   fine that way (matching curve/rectangle, just a bit of breathing room), but pentagon's points
   stuck out sharply past the glyph's actual (round) silhouette, looking mis-sized. `pentagon` sets
   `--ae-hover-inset: 6%` to pull its ring in tighter around the glyph; `round`/`square` are
   unaffected (still `0`).
3. **Same two fixes apply to the `#ambiZone` six-copy showcase**, not just the header logo — one
   `<ae-icon5-component adaept="aelogos">` host renders all six recolored copies in one shadow root
   (`componentWillLoad`'s `aelogos` array), so setting `aetype="rotate"` on that single host applies
   both fixes (rotation, no ring) to all six via the same `:host([aetype="rotate"])` CSS, no
   per-copy markup needed.

**Second round of bugs, found by zooming into the actual rendered hover result (2026-08-19):**
4. **`pentagon` still wasn't a pentagon after fix #2 — two compounding bugs:**
   - The `pentagon` preset never reset `--ae-hover-radius` back to `0`, so the leftover global
     default (`--ae-hover-radius: 50%`) still rounded the `::before` layer's `border-radius`. Since
     `box-shadow` shape is computed from the box's own `border-radius` *before* `clip-path` is
     applied, the ring rendered as a circular ring first, then got clipped to the pentagon — a
     scalloped/gear shape (round bumps), not straight pentagon edges. Fix: `pentagon` now also sets
     `--ae-hover-radius: 0`.
   - Even with straight edges, the shape still looked wrong — 3 small bumps clustered at the top and
     one large flat rectangular slab at the bottom, not a symmetric 5-point shape. Root cause: the
     coordinates used, `polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)`, are the commonly
     copy-pasted CSS "pentagon" clip-path from shape tutorials — but they're **not an actual regular
     pentagon**: computing each vertex's distance from center (50%,50%) gives ~50% for the top 3
     vertices but ~59% for the bottom 2, i.e. the bottom vertices sit ~19% further from center than
     the top ones. That's invisible when clipping a plain filled box (no reference shape to compare
     against), but overlaying it as a *ring* around an already-circular icon glyph made the mismatch
     obvious: top vertices ≈ the glyph's own radius (small, blends in), bottom vertices well outside
     it (the flat slab). Fix: replaced with a true regular pentagon (all 5 vertices at the exact same
     50% circumradius, computed via `50% + 50%·cos/sin(90° − 72°k)` for k=0..4) —
     `polygon(50% 0%, 97.55% 34.55%, 79.39% 90.45%, 20.61% 90.45%, 2.45% 34.55%)`. Verified with an
     isolated `aesize="ae256"` render (no demo layout/scaling to obscure the shape): a symmetric
     5-point accent evenly hugging the circular glyph, no lopsided protrusion.
5. **`rotate` alone gives zero visible feedback for a rotationally-symmetric single-color mark —
   fix attempted, then reverted per explicit user correction.** The `#ambiZone` showcase's copy 1
   (two-tone `ae-logo.svg`) visibly changes on rotate (its two colors swap position); copies 2-6
   (single-color `ae.svg`) don't, since a 180° rotation of one flat color is visually a no-op. The
   *first* fix attempt added a generic `--ae-hover-color` custom property and set it per-copy in the
   demo so copies 2-6 would shift to a shared green on hover — **this was the wrong interpretation**:
   the user's actual, explicit ask was that copies 2-6 keep their **original plain ring, unchanged
   color, no rotation at all** — copy 1 should be the *only* one that rotates. Superseded by fix #6.
6. **Redesigned to scope `rotate` to just copy 1, not the whole `#ambiZone` group.** All six copies
   share **one** shadow root (`componentWillLoad`'s `aelogos` array), so the `aetype` prop can't
   apply per-child — setting `aetype="rotate"` on that single host (an earlier attempt) rotated *and*
   silenced the ring for all six at once, which is exactly what fix #5 was wrongly compensating for
   with a color change instead of just not doing that in the first place. Corrected: removed
   `aetype="rotate"` from the `#ambiZone` host entirely; added `ion-item:nth-child(1) { --ae-hover-
   ring-width: 0; } ion-item:nth-child(1) ion-icon:hover { transform: rotate(var(--ae-hover-rotate-
   deg, 180deg)); }` in `ae-icon5-component.css` (scoped by the same `nth-child` selectors already
   used to recolor each copy) so **only copy 1** rotates-with-no-ring; copies 2-6's original
   `ion-item:nth-child(2)`-`(6)` rules (`--ae-color` + `--ae-hover-ring-color` only) are back to
   exactly what they were before any of this `aetype` work started — own color, own ring, no
   rotation, no color change. The `--ae-hover-color` custom property added by fix #5 was removed
   entirely (not left as unused generic API) since nothing in this codebase needs it anymore.
7. **Fix #6's revert of `--ae-hover-color` was incomplete and caused a real regression, found by a
   third review pass.** Removing `--ae-hover-color`'s `:host` definition without also removing its
   *usage* (`color: var(--ae-hover-color);`, still in the base `ion-icon:hover` rule) left a
   dangling `var()` reference with nothing to fall back to — an inherited property (`color`) used
   with an invalid/unset custom property and no fallback resolves to its **inherited** value instead
   of the rule being dropped. The demo's `#ambiZone { color: #fff }` (unrelated, pre-existing —
   white text for the pink zone's "SIZE"/"RESET" labels) was that inherited value, so **every**
   `#ambiZone` icon — not just copies 2-6 — flashed white on hover regardless of its own `--ae-color`,
   silently overriding the component's own `ion-icon { color: var(--ae-color, var(--color)); }` rule
   only during `:hover`. A `www`/`dist` clean rebuild was needed mid-diagnosis too — a stale hashed
   chunk in `www/build/` still contained the pre-fix CSS, which briefly looked like the fix hadn't
   taken effect at all. Fixed by deleting the leftover `color: var(--ae-hover-color);` line.
8. **Pentagon still didn't visibly extend outside the icon — fix #4 fixed the *shape's math* but
   not the fundamental *mechanism*, found by a fourth review pass with pixel-level zoom.** Fix #4's
   regular-pentagon coordinates were geometrically correct, but the ring was still built the same
   way as round/square: a `box-shadow` on the `::before` box, clipped by `--ae-hover-clip-path`.
   `box-shadow` only ever paints a thin band hugging the **box's own rectangular edge** — clip-path
   just erases whatever of that band falls outside the polygon, it doesn't reshape the band itself.
   A regular pentagon's edges dip inward to ~81% of its circumradius at the midpoint between two
   vertices (`cos(36°)`) — almost exactly the glyph's own measured radius (~81% of the box's
   half-width, confirmed by sampling the unhovered icon's actual pixels) — so along most of each
   edge there was no box-shadow band left inside the polygon to show *at all*, at any inset/size
   tried (confirmed empirically: pixel-sampling the "waist" between two vertices found zero ring
   pixels whether the pentagon was shrunk 6% inward or expanded 25% beyond the box — only the 5
   vertices, which do coincide with the box's own edge, ever showed anything, as disconnected
   points with no visible edge between them). Fix: stopped using `box-shadow` for `pentagon`
   entirely — built the ring directly as a filled donut via a single `clip-path: polygon(evenodd,
   …)` listing both an outer pentagon and a smaller inner pentagon (points inside both loops are
   excluded by the evenodd fill rule, leaving just the band between them as the visible ring,
   filled via `--ae-hover-bg: var(--ae-hover-ring-color)` instead of `box-shadow`). The outer
   loop's circumradius (~1.075× the box half-width, so apothem ≈ 0.87) was sized to clear the
   glyph's ~0.81 radius at every angle, not just at the vertices — pixel-verified afterward: the
   ring now extends visibly past the glyph at the waist angle too (not just at vertices), and a
   screenshot shows a single, fully-connected pentagon outline around the icon, not 5 disconnected
   points.

**Answering "does the ambiZone logo need a new id, and would `id="0"` also target the header
logo?"** No new id was needed. This answer's *reasoning* changed with fix #6 (the effect is no
longer driven by the `aetype` HTML attribute at all for this group — it's plain `nth-child` CSS
scoping, same mechanism the demo already uses for each copy's color), but the conclusion is the
same: `id` is unrelated plumbing here — (a) documentation/label convenience for the id-`0`-`4`
preset table, and (b) for ids `1`/`2`, actual `getElementById` lookups in `iconClicked()`'s
SIZE-reset case. Reusing `id="0"` on the `#ambiZone` host would still have been a real, independent
bug: HTML `id`s must be document-unique, so a duplicate `id="0"` risks `document.getElementById('0')`
silently resolving to only the *first* matching element (the header logo). The `#ambiZone` host has
no numeric id — see the code comment directly above it in `src/index.html`.

**Status:** `round`/`square` implemented 2026-08-19 as designed, unchanged since. `pentagon`
implemented via a filled-donut `clip-path: polygon(evenodd, …)` (fix #8), not `box-shadow` (the
mechanism every other preset uses) — a genuine mechanism difference worth remembering if `pentagon`
needs further tweaks. `rotate` implemented for the header logo (`id="0"`, uses the `aetype` prop as
designed) and, after fixes #5-7, correctly scoped to just `#ambiZone` copy 1 via plain CSS rather
than the `aetype` prop (copies 2-6 are deliberately back to their pre-existing, unmodified
behavior) — `aerotatedeg` prop (`ae-icon5-component.tsx`); the `:host([aetype="…"])` CSS rules +
`--ae-hover-clip-path` and the `::before` ring layer (`ae-icon5-component.css`, **no**
`--ae-hover-color` — added then fully removed, fixes #5/#7; **no** `--ae-hover-inset` either —
added for fix #4, removed again by fix #8 once `pentagon` stopped needing a box-shadow-relative
inset at all); the demo re-tagging (header logo `id="0"`, `id="2"`/`id="3"` retyped) plus
`#ambiZone`'s `ion-item:nth-child(1)`-scoped rotate rule, with copies 2-6 unchanged from before
this work began.

**Four review rounds, each catching what the previous one's verification method couldn't:** round 1
checked computed-style assertions only (`clip-path`/`border-radius`/`transform` values matched
expectations) — passed, but missed that the *rendered pixels* were still wrong (pentagon math,
rotate design misunderstanding), because computed-style checks confirm a rule *applied*, not that it
*looks right*. Round 2 added zoomed/isolated screenshots and caught both — but only checked that the
pentagon *looked roughly pentagon-shaped* at one zoom level, not that it actually cleared the glyph
edge along its whole perimeter (it hadn't; fix #4's fix was necessary but not sufficient). Round 3
re-ran the same kind of computed-style + screenshot checks after a further correction and caught a
real regression (fix #7) that neither prior round's *scope* would have exercised (it only manifested
once copies 2-6 were reverted back to no-color-change, at which point a leftover dangling `var()`
reference — not a wrong value, an entirely unintended fallback path — surfaced). Round 4 added
pixel-level sampling (scanning actual screenshot pixels along specific angles, not just eyeballing a
thumbnail) after visual re-inspection still looked wrong at high zoom — this is what finally exposed
that `box-shadow` was never going to work for a shape whose edges dip inside the glyph's own radius,
no matter how the polygon or inset was tuned. **Takeaway for future hover-effect changes here:**
verify with pixel-sampled measurements at the angles that matter (a shape's vertices *and* its
edge-midpoints/waists, not just vertices), not just a screenshot glanced at — and check every
affected element, not just the ones being changed (`#ambiZone`'s copies 2-6 broke from a change
aimed at copy 1).

Verified (final): rotate → `matrix(-1,0,0,-1,0,0)` transform, `0px`-spread (invisible) ring, on both
the header logo and `#ambiZone` copy 1 only; copies 2-6 → no rotation (`matrix(1,0,0,1,0,0)`), no
color change, each own ring color restored (gold/red/green/blue/dimgray, `3.5px`-spread); square →
`border-radius: 0px` ring; pentagon → screenshot-verified (at `aesize="ae256"`, isolated from the
demo layout) as a symmetric 5-point shape correctly hugging the unclipped glyph; round unchanged.
Plus a **clean** `www`/`dist` rebuild (a stale hashed chunk masked fix #7 mid-diagnosis) and
`npm run lint`/`test`(`--spec`)/`test.unit`/`smoke`, all green (lint's 3 findings are the same
pre-existing, unrelated issues noted in prior reviews). `pulse`/id `4` stays a §12 roadmap item,
deferred as originally scoped.

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

## 6. Multiple icon sources (Iconify, etc.) — concrete design (revised 2026-08-15)

D3 (below) deferred this to "a follow-up, ≈v1.5.0" with no actual design. This section replaces
that placeholder with one, after a design discussion covering naming, versioning, a staged
rollout, and multi-platform/starter-kit implications — driven by the user's real deployment plan
(§6.5). **Confirmed: this design stays MINOR, not v2.0.0** — see §6.2 for why, and the one choice
that would force a major bump if made differently. **Renumbered to v1.6.0** (was "v1.5.0" when this
section was written 2026-08-15) — §4.1's `aetype` hover-effect presets landed first and claimed
**v1.5.0** (released 2026-08-19); Iconify is still unimplemented (§12 roadmap), so it's the next
MINOR after that, not this one.

### 6.1 Naming: adopt Iconify's own `prefix:name` convention — don't invent one

Don't invent a new compound-reference scheme. **Iconify already has one**: every icon set it
aggregates gets a registered short prefix (`mdi` for Material Design Icons, `fa-solid` for Font
Awesome, `heroicons`, …) and every icon is addressed as `{prefix}:{name}`. Ionicons itself is
hosted on Iconify under the prefix **`ion`**.

- `set="ionicons"` (unchanged, still the default) + `name="home-outline"` → this component's
  **direct, offline, tree-shaken** npm integration (today's behavior, byte-for-byte, D2).
- `set="iconify"` + `name="mdi:home"` / `name="ion:home-outline"` → Iconify's data, using
  **Iconify's own** prefix:name convention as-is, no translation layer.

These are two genuinely different code paths even when an icon is visually identical (`ion:home`
vs. this component's own `home`) — one's bundled/offline via `ionicons/icons`' ES exports, the
other's Iconify JSON data (see 6.3 for why it must also be the **offline** package, not a runtime
API call). That's not a seam to hide, it's an accurate reflection of two different delivery
mechanisms, and it's exactly how Iconify's own ecosystem already treats "same icon, direct
package vs. Iconify-hosted."

**Non-negotiable for staying additive:** `"ionicons"` remains a permanently-supported value for
`set` — never renamed to something like `"ionic/ionicons"` for symmetry with the new `iconify`
value, even internally. Costs nothing to keep, and it's the difference between an additive minor
release and an unnecessary breaking one (§6.2).

### 6.2 Versioning: confirmed v1.6.0 (was "v1.5.0" — see §6's renumbering note), not v2.0.0

Per semver, a MAJOR bump is for incompatible API changes — not for how much new capability
ships. With the design in 6.1:
- The existing default (`set="ionicons"`, or omitted entirely — already the default) + bare
  `name="home-outline"` **never changes**. No existing consumer's markup breaks.
- Iconify only appears behind the new, opt-in `set="iconify"` value, using Iconify's own naming
  inside that mode only.
- License-group filtering (6.3, Stage 4) is a query against Iconify's own collection metadata —
  additive UI/config, not a naming or default-behavior change.

That's purely additive, which is what MINOR is for. **The one thing that would force v2.0.0**:
renaming or dropping the existing `"ionicons"` identifier itself (6.1's non-negotiable). As long
as that's respected, the next MINOR (v1.6.0) stands.

### 6.3 Staged rollout — mdi pilot, each stage independently validated

Material Design Icons (`mdi`, Apache-2.0, ~7,000 icons, Iconify prefix `mdi`) is the pilot set —
chosen because it's large enough to be a real stress test, permissively licensed, and directly
relevant to §6.5's Android target. Every stage below states exactly how to confirm the *existing*
demo/component are unaffected before moving to the next.

**Stage 0 — prep in the 1.4.x line (before any Iconify code exists):**
- Add a real `manifest.json` — `src/index.html` already links `<link rel="manifest"
  href="/manifest.json">` to a file that **doesn't exist anywhere in this repo** (found
  incidentally during issue #25, left out-of-scope then). This becomes a hard requirement once
  §6.5's Windows/PWABuilder path is attempted — PWABuilder packages a PWA's manifest, so a dead
  link there isn't just cosmetic debt anymore, it's a blocker.
- Close out **CF-13** (`https://aeicon5.web.app` stale, never redeployed for v1.4.0) — don't build
  a new pilot section on top of a demo deployment that's already known-broken; makes it impossible
  to smoke-test the pilot anywhere but locally.
- Close out **CF-12** (`--ionicon-stroke-width` hardcoded, not overridable) — matters more once
  multiple icon families coexist. mdi's glyphs don't share ionicons' stroke-outline convention, so
  a consumer mixing sources needs to be able to harmonize visual weight from outside the shadow
  root, the same way `--ae-color` already works.
- *Validate:* none of this touches icon-rendering code. `npm run build`, `test.unit`,
  `check.icons`, `smoke` all green exactly as before — these changes can't regress icon behavior
  because they don't touch it.

**Stage 1 — type-level seam only, no new icons, no demo changes:**
- Widen `IconSetId` (`src/icons/sources.ts`) from `'ionicons'` to `'ionicons' | 'iconify'`; add a
  stub `iconifySource` (unimplemented/throws) purely to prove the seam compiles.
- *Validate:* `npm run build && npm run test.unit && npm run check.icons` green.
  `src/index.html` has **zero** diff — the demo is byte-identical, so by construction nothing
  about it can have regressed.

**Stage 2 — component-level only, still no demo:**
- `@iconify-json/mdi` — Iconify's **offline** JSON data package (not the runtime/network API;
  see 6.4's Capacitor gotcha for why this choice isn't optional). Consumers opt in the same way
  they already do for extra ionicons icons today (D2's `addIcons`/`registerIcons` pattern) —
  `ae-icon5-component` itself doesn't bundle `@iconify-json/mdi`.
- Implement `iconifySource.register()`/`registerDefaults()` for real, parsing Iconify's own
  `prefix:name` strings.
- New Vitest spec (matching D4's existing POC convention): render
  `<ae-icon5-component set="iconify" name="mdi:home">` in isolation, assert real SVG path data
  resolves.
- *Validate:* `npm run test.unit` covers the new path and passes. `npm run build` still green.
  **`src/index.html` still has zero diff** — the existing showcase provably cannot have regressed,
  because nothing touched it yet.

**Stage 3 — small, isolated demo pilot (first time `src/index.html` changes):**
- A new, clearly-separated section — not woven into the existing "alphabetic group list" — e.g.
  `<div id="aeIconifyPilot">` with ~15-20 curated `mdi:*` icons, to validate real-DOM rendering,
  `--ae-color`/hover theming, and the click-info/source-link panel for a non-ionicons source.
- Extend `scripts/gen-icon-line-map.mjs` to key by the **full name as written in markup**
  (`mdi:home`, not `home`) — needed once a second source can appear in the same page, to avoid an
  Iconify `mdi:home` colliding with ionicons' own `home` in the map.
- Add `src/icons/iconify-sets.ts` — a small metadata table (`prefix → { name, license, homepage
  }`), seeded with just `mdi`'s entry. Not a UI yet — just real data for Stage 4's filter to
  consume, instead of building that UI against a single hardcoded set.
- *Validate:* diff `src/index.html` — every existing section (group list, logos, curated colors,
  `adaeptZone`, Stroke Width Sample, SIZE/RESET) shows **zero** changes, only new markup added.
  Re-run the full existing Puppeteer verification suite (click-info panel, hover-ring scaling,
  scroll-pin, group-list filter toggle) — all must still pass unmodified. Screenshot-verify the
  new pilot section independently.

**Stage 4 — expand only if the pilot holds up:**
- Add more Iconify sets behind the identical pattern (each its own `@iconify-json/<set>` opt-in +
  a row in `iconify-sets.ts`).
- Build the real license-filter UI (only makes sense with >1 set to filter between).
- **Still don't try to exhaustively enumerate a full Iconify catalog** the way the demo currently
  enumerates all of ionicons — Iconify aggregates 200,000+ icons across hundreds of sets; issue
  #29 already needed a default filter to make ionicons' mere 1,357 tolerable. Keep each set's demo
  section to a curated/representative sample and link out to Iconify's own browser
  (icon-sets.iconify.design) for actual discovery.

### 6.4 Multi-platform starter kit (Ionic / Angular / React / Capacitor) — gotchas

Preparing a downloadable starter for app developers targeting multiple frameworks/platforms:

- **Default to `dist-custom-elements`, not the `dist` lazy loader**, for React/Angular/Vue starter
  templates — native custom-elements support, no loader indirection. (`dist` stays for aedh's
  current registration style until CF-6's future major.)
- **Angular:** needs `CUSTOM_ELEMENTS_SCHEMA` wherever `<ae-icon5-component>` is used — the
  classic Stencil-in-Angular requirement. aedh already has this wired up; the starter's Angular
  example should be extracted from aedh's real usage, not written from scratch.
- **React:** every prop on this component is a plain string/boolean HTML attribute (no
  object/array props), which sidesteps most of React-custom-elements' historical pain. Only
  gotcha: React <19 doesn't do JSX-prop-to-DOM-property translation for custom elements, so use
  lowercase attribute names in JSX (`aesize=`, not `aeSize=`) — a one-line starter-doc note, not a
  real blocker.
- **Ionic Framework:** should just work, and is arguably a selling point rather than a gotcha —
  `<ae-icon5-component color="primary">` already deliberately defers to Ionic's own theme-color
  system (README "Coloring icons"), so it sits naturally beside `<ion-icon>` in an Ionic app.
- **Capacitor / offline apps — the one real correctness gotcha:** always pre-register icons via
  `addIcons`/`registerIcons` (the bundled-manifest path, D2). **Never rely on ionicons' or
  Iconify's runtime network-fetch fallback** for icons outside your registered set. A packaged
  mobile app may run with no network, and even when online, `file://`/`capacitor://`-scheme pages
  don't resolve a same-origin SVG fetch the way a normal `https://` page does. This is exactly why
  Stage 2 (6.3) uses Iconify's **offline** `@iconify-json/*` packages, not its on-demand API — the
  starter kit should state this as a hard rule, not a suggestion.
- **iOS WKWebView:** modern enough for shadow DOM/custom elements (iOS 11+), but verify Stencil's
  build target/browserslist (`stencil.config.ts`) against Capacitor's actual minimum supported iOS
  version before shipping — a mismatch fails silently as a blank/broken WebView, not a build error.
- **Windows via PWABuilder, not a Capacitor "Windows platform"** — Capacitor has no first-party
  Windows target. The realistic path is packaging the *same* `www` PWA build (already built for
  the Capacitor Android/iOS wrapper) into an MSIX via PWABuilder — a genuinely different toolchain
  from Capacitor, worth stating clearly in the starter kit so it isn't assumed to be "just another
  `npx cap add` platform." This is also why Stage 0's real `manifest.json` matters.

### 6.5 aetimeline as the real-world test case — platform staging

The user's own **aetimeline** app (Capacitor, `capacitor.config.ts`: `appId:
com.adaept.aetimeline`, `@capacitor/android` already installed, comment already says "Android is
the first target… iOS later reuses the same webDir") is the actual validation vehicle for all of
6.3/6.4 — not a hypothetical. Target stores: Google Play (Android/mdi), Apple App Store
(iOS/**TBD**), Microsoft Store (Windows/**TBD**).

**"One iconset to rule them all" — recommend yes, uniformly, not per-platform-native:**
Matching each platform's native icon convention (SF Symbols on iOS, Segoe Fluent on Windows,
Material on Android) would mean per-platform branching logic and three sets to maintain instead
of one — directly against the stated goal. There's also a hard **licensing** reason to not even
consider SF Symbols for this: Apple's SF Symbols license restricts use to Apple-platform apps
built with Apple's tools — it isn't redistributable as a normal npm/Iconify package the way `mdi`
is, so it's structurally incompatible with a cross-platform "one iconset" approach regardless of
preference. **Recommendation: mdi (or whichever set the pilot lands on) uniformly across
Android/iOS/Windows** — same code path everywhere, no per-platform icon-selection logic needed.

**Microsoft Store as the first target — pros/cons/suggestion:**

| | |
|---|---|
| **Pros** | No macOS/Xcode/paid Apple Developer account needed to attempt it — removes the single biggest cross-platform gotcha for a Windows-based dev machine. Packages the *existing* `www` PWA build via PWABuilder — no new native wrapper, so it validates the icon-rendering pipeline in a real packaged-app context with the least new infrastructure. Store review is generally understood to be faster/lighter than Apple's. |
| **Cons** | Packaging via PWABuilder/MSIX is a **different** toolchain than Capacitor (which is still needed for Android/iOS regardless) — succeeding here derisks "does the web build + icon system survive packaging," not Capacitor-specific concerns like native WebView quirks or plugin bridging. Smallest realistic user base of the three stores for a niche personal app — validates the pipeline, not reach. |
| **Suggestion** | Verify current Microsoft Store individual-developer-account terms directly before committing to this as a plan input — account/fee policies change over time and shouldn't be assumed stable from memory. |

**Now vs. later vs. staged:**
- **Now:** **Android** via Capacitor — aetimeline's own config already targets this, lowest
  friction (Chromium WebView, closest to the browser environment the demo/tests already exercise),
  and directly exercises the mdi pilot (6.3) end-to-end on a real device/store.
- **Now, in parallel (not instead of Android):** **Microsoft Store** via PWABuilder — near-zero
  marginal cost since it reuses the same `www` build; a good "learn the store-submission process
  end-to-end cheaply" track that doesn't compete with or block the Android work.
- **Later:** **iOS** — after Android and the Windows path have validated the icon-rendering
  pipeline broadly. Adds the most new infrastructure (macOS build machine, Apple Developer Program
  enrollment, TestFlight, code signing) and Apple has historically applied more scrutiny to
  "thin web-wrapper" apps than Google or Microsoft — worth attempting once the app itself is more
  fully baked, not as a pipeline smoke test.
- **Even earlier than "now," ahead of aetimeline entirely — see §6.6:** this repo's own demo could
  become the *first* Capacitor app of all, smaller and lower-stakes than aetimeline, and validate
  a second thing (paid-tier/payment integration) at the same time.

### 6.6 An even simpler first Capacitor app: this repo's own demo, free/paid-tier gated

**Idea:** before (or instead of first attempting on) aetimeline, package **this repo's own demo**
as the first Capacitor app — free tier = current state (ionicons only, D2's manifest), paid tier
= Iconify unlocked (6.3's mdi pilot and beyond). This validates payment/entitlement integration in
a **DRY** way: solve it once, on the smallest possible surface area, then reuse the same pattern
in aetimeline and any future Capacitor app, instead of each app re-solving it independently.

**Why this repo specifically is the better first test bed, not just a smaller one:**
- It's *already* a Stencil `www` build with the exact same packaging path (Capacitor/PWABuilder)
  §6.5 lays out for aetimeline — no new build infrastructure to stand up.
- It has effectively **no app-specific business logic** — a feature-gate (Iconify on/off) is
  close to the *only* thing a purchase would unlock, so the entitlement-check code path stays
  small and easy to reason about while it's being gotten right.
- It's a genuine two-birds test: proves the mdi pilot (6.3) end-to-end **and** the payment
  integration, in one lower-stakes app, before either pattern gets carried into aetimeline where
  they'd be tangled up with the app's own real functionality.

**Gotcha worth surfacing now, not after building toward it:** Apple and Google **require using
their own in-app-purchase APIs** (StoreKit / Google Play Billing) for unlocking digital features
*within* an app — a plain external checkout (Stripe, PayPal, etc.) isn't allowed for this and is
a common app-store rejection reason. Microsoft Store has its own equivalent. This means "payment
processing integration" here isn't a single generic integration — it's at minimum one
Capacitor IAP plugin per store (e.g. a community plugin wrapping StoreKit/Play Billing), each
with its own entitlement-verification quirks. Confirming exactly which plugin(s) to use is a
research step for whenever this stage is actually picked up, not a decision to make now — flagged
here so it's not a surprise discovered mid-implementation.

**Sequencing implication:** this doesn't have to precede aetimeline's Android target (6.5) — the
two can run in parallel, since one is icon-source work (6.3) and the other is packaging +
entitlement work. But if payment integration is wanted validated early and cheaply, this repo's
demo is the place to do that first, not aetimeline.

## 7. git# stamp in the Firebase demo

- Mirror aedh's About build stamp (03a §13): a prebuild script writes git sha/branch/time; the **demo**
  (`www`) shows it in a footer. **Demo-only** — not in the published component.

## 8. Version-bump protocol

- **Triple** `ionicons/Stencil/component` (e.g. `8.x/4.x/1.4.0`) shown on the demo (like aedh's About).
- On a change: bump component semver → update the demo triple (installed ionicons/Stencil + new
  component version) → tag `vX.Y.Z` → CI publishes npm + deploys the demo → bump the aedh dep.
- Document in README + `CLAUDE.md`.
- The demo triple is **not** manually edited — `scripts/gen-build-stamp.mjs` reads `package.json`'s
  `version` directly (plus the installed `ionicons`/`@stencil/core` versions) on every build. Bump
  `package.json` and the triple updates itself.

**MINOR vs PATCH — worked example (v1.4.0 → v1.5.0, 2026-08-19):** §4.1's `aetype` hover-effect
presets were briefly mis-versioned as v1.4.1 (a PATCH) before landing here as v1.5.0. Per semver,
**PATCH is for backward-compatible bug fixes only** — it doesn't cover new capability, even if
that capability builds on something already partially present. This release added a **new prop**
(`aerotatedeg`) and gave a previously-inert, documented-but-no-op prop (`aetype`, shipped as WIP in
earlier versions) **real behavior for the first time** — new, additive, backward-compatible
*functionality*, which is what MINOR is for, not PATCH, regardless of how small the diff looks or
whether the prop name already existed. **Consequence for §6**: this claimed the "v1.5.0" slot that
had been informally earmarked there for Iconify since 2026-08-15 (before `aetype` work existed) —
Iconify is renumbered to **v1.6.0** throughout §6 and §12. Lesson for future bumps here: check
§12's roadmap for an existing version reservation *before* assigning one to unrelated work, and
default to MINOR (not PATCH) for anything that adds a prop or makes a previously-inert one do
something, even if it feels like "finishing" existing API surface rather than adding new API
surface.

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

- **`aetype` hover-effect presets — `round`/`square`/`pentagon`/`rotate` done 2026-08-19, `pulse`
  still open. Released as v1.5.0** (see §8's versioning note for why this is MINOR, not PATCH).
  See §4.1: ids `0`-`3` (header logo + SIZE/RESET row) now each demo a distinct preset. `pulse`/
  `id="4"` (the commented-out `globe` row) remains a follow-up cycle.
- **Jest → Vitest** component-spec crossover — **sync with aedh A22** (D4); reassess Stencil's Vitest
  support then.
- **Iconify** + other icon sources (D3) — ≈ **v1.6.0** (renumbered from "v1.5.0" — §4.1's `aetype`
  presets claimed that slot first), now a concrete staged design, not a placeholder — see §6
  (naming, versioning confirmation, mdi pilot stages, starter-kit gotchas, aetimeline platform
  staging). Stage 0 there lists 1.4.x prep items (real `manifest.json`, close CF-13/CF-12) to do
  before any Iconify code lands.
- Remove the legacy **`dist` loader** once all consumers are on `dist-custom-elements` (D1) — a future major.
- Standalone/no-Ionic icon rendering; SSR/hydration; a11y audit (aria, labels); animation presets;
  typed icon-name unions; tree-shaking/bundle-size metrics; theming tokens. *(append as discovered.)*
- **`--ionicon-stroke-width` override hook (CF-12, found via aedh's About page, 2026-08-12)** —
  hardcoded as a direct 16px assignment on the component's inner `<ion-icon>` (half of ionicons'
  own 32px default), not a `var()` indirection like `--ae-color`, so it can't be overridden from
  outside — makes stroke-based icons (e.g. `add`) render visibly thinner than the same icon
  rendered unwrapped. Fix: `--ionicon-stroke-width: var(--ae-stroke-width, 16px)`, same pattern as
  color. Full writeup: `rvw/Code_review 2026-08-12.md` CF-12.
- **Item N ("ae" brand-mark icon, `rvw/Code_review 2026-08-07.md` §2) — done 2026-08-14.**
  `adaeptZone`'s 5-icon row (`at`/`dp`/`ae`/`pd`/`ta`) now sources from
  `adaept5tudio/design-system/` instead of independently-drawn local SVGs — including two *new*
  design-system canonicals (`ae-base-at.svg`/`ae-base-dp.svg`) added as part of this task, since
  `at`/`dp` had the same "duplicated with no shared source of truth" problem the "ae" mark did.
  Full writeup: `rvw/Code_review 2026-08-14.md`. **Known limitation, not yet automated:** the
  vendored copies in `src/assets/aeicons/` require a manual re-sync when the design-system source
  changes — there's no build-time or CI link between the two repos. Worth automating (e.g. a
  `check`-style guard comparing file hashes, mirroring `check.guide`'s pattern) if this drifts in
  practice; not done now since it's a two-file, low-churn asset.
- **Issue #31 ("old logo used in top animation rotation") — done 2026-08-18.** The `#ambiZone`
  demo row (`adaept="aelogos"`) was still cycling six flat-color recolors of the pre-issue-#20
  logo shape (`ae-outline`/`ae-red-green`/`ae-yellow`/`ae-red`/`ae-green`/`ae-blue.svg`), missed
  when #20 fixed the header logo. Now: copy 1 is the genuine two-tone `ae-logo.svg`
  (`--ae-color-imperial`/`--ae-color-emerald`); copies 2-6 are single-color and use `ae.svg` (the
  vendored `ae-logo-mono.svg`) colored via plain `--ae-color`, **not** `ae-logo.svg` with both
  `<use>` tags set to the same color — that reintroduced the hairline-seam bug the design system
  already fixed for single-color contexts (see `ae.svg`'s header comment). Each copy's
  `--ae-hover-ring-color` is pinned to match its fill, since the `:host` default (rebeccapurple)
  is only meant for genuinely uncolored icons.

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

**D3 — Iconify: deferred to roadmap (post-1.4.0); design finalized 2026-08-15, see §6.**
- This cycle implements **ionicons only**. The icon-source seam (`set` prop + adapter interface)
  now has a concrete design (§6.1): `set="iconify"` + Iconify's own `prefix:name` convention
  (`mdi:home`), `set="ionicons"` permanently unchanged as the default. **Confirmed v1.6.0** (was
  "v1.5.0" — see §6's renumbering note; §4.1's `aetype` presets claimed v1.5.0 first), **not
  v2.0.0** — additive only, no existing consumer's markup can break (§6.2's reasoning; the one
  thing that *would* force v2.0.0 — renaming the `"ionicons"` identifier itself — is explicitly
  ruled out). Staged mdi pilot with per-stage validation in §6.3; don't implement any of it this
  cycle (would delay the aedh-unblocking deliverables ★A→★A2→C).

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
