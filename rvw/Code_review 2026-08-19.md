# Code Review — ae-icon5-component

**Date:** 2026-08-19 · **Repo:** `adaept/ae-icon5-component`
**Continues:** `rvw/Code_review 2026-08-16.md` (CF table carried below unchanged; that session's
issue #27 is already closed and referenced from its own §2 — not repeated here).

---

## 1. Carry-forward tasks — carried from 2026-08-16

**Not re-checked line by line** — this session's scope was the `aetype` hover-effect presets
feature (§2 below) plus the resulting version bump (§3). Status shown is 2026-08-16's
last-verified state; treat as stale until a session that actually re-audits each item.

| # | Task | Status | Pri |
|---|------|---|-----|
| CF-2 | aedh adopts `registerIcons`/`dist-custom-elements`, drops the 1357-svg glob, ticks off item L | ☐ open | HIGH |
| CF-4 | Jest → Vitest full crossover; drop deprecated `stencil test` | ◑ partial | MED |
| CF-5 | Iconify source (`set="iconify:*"` seam) — design finalized 2026-08-15, `docs/modernization-plan.md` §6. **Renumbered v1.5.0 → v1.6.0 this session** (§3 below claimed v1.5.0 for `aetype`) | ☐ deferred (≈v1.6.0) | LOW |
| CF-6 | Drop legacy `dist` lazy loader once consumers are on `dist-custom-elements` | ☐ future major | LOW |
| CF-7 | `codeql-analysis.yml`: `actions/checkout@v2` → `@v4` | ☐ open | LOW |
| CF-8 | Click-info panel cosmetic (`iconClicked`/`renderInfoPanel` builds display HTML with now-empty/`undefined` `color=`) | ☐ open | LOW |
| CF-9 | Confirm aedh's ~20 icon names are in the default manifest or registered when item C lands | ☐ open | LOW |
| CF-10 | Third-party guide sync (`docs/THIRD-PARTY-GUIDE.md`, guard `check.guide`) | ◑ ongoing-per-release | LOW |
| CF-11 | Generalize the release runbook for 3rd-party devs | ☐ open | LOW |
| CF-12 | `--ionicon-stroke-width` not overridable from outside the component | ☐ open | MED |
| CF-13 | Deployed demo (`https://aeicon5.web.app`) is stale — never successfully redeployed for v1.4.0; still true, this session bumped to v1.5.0 in `package.json` but **did not tag/publish/deploy** (out of scope — see §3's note) | ☐ open | HIGH |
| CF-14 | `adaeptZone` vendored SVGs/tokens have no automated re-sync from `design-system/` | ☐ open (documented, not automated) | LOW |

---

## 2. `aetype` hover-effect presets — `round`/`square`/`pentagon`/`rotate` (direct user request, not a filed issue)

**Request:** the user specified a 5-value design for the previously WIP/inert `aetype` prop —
`round` (id `1`, unchanged), `square` (id `2`), `pentagon` (id `3`), `rotate` (id `0`, the header
ae logo, degrees-configurable, default `180`), and `pulse` (id `4`, explicitly deferred to a
follow-up cycle pending approval of the first four). Plan drafted and approved
(`docs/modernization-plan.md` §4.1) before any code — see that section for the full design,
mechanics, and bug-by-bug history; this entry summarizes what shipped and links the four review
rounds it took to get there.

**Implementation:**
- New `aerotatedeg` prop (`ae-icon5-component.tsx`, default `180`) → `--ae-hover-rotate-deg`.
- `:host([aetype="…"])` CSS presets (`ae-icon5-component.css`) layered on the existing
  `--ae-hover-*` custom-property hover system (§4).
- Demo re-tagging (`src/index.html`): header logo → `id="0" aetype="rotate"`; SIZE `+` (`id="2"`)
  → `aetype="square"`; RESET (`id="3"`) → `aetype="pentagon"`; SIZE `-` (`id="1"`) unchanged
  (`aetype="round"`); `#ambiZone`'s two-tone logo copy → rotates via a scoped `nth-child(1)` CSS
  rule (not the `aetype` prop — see round 3). `pulse`/`id="4"` stays commented out, unimplemented.

**Four review rounds — each caught what the previous one's verification method couldn't:**

1. **Round 1 (computed-style assertions only):** shipped `round`/`square`/`pentagon`/`rotate`;
   assertions on `clip-path`/`border-radius`/`transform` all matched expectations — but two bugs
   were invisible to that method: `rotate` still showed the default ring underneath the spin (no
   rule suppressed it), and `pentagon`'s `clip-path`, applied directly to `ion-icon`, clipped the
   icon's own rendered glyph instead of just a decorative ring (cut `refresh-circle`'s edges off).
   Fixed by suppressing the ring for `rotate` (`--ae-hover-ring-width: 0`) and moving all shape
   rendering onto a `::before` layer behind the icon so shape effects never touch the glyph itself.
2. **Round 2 (added zoomed/isolated screenshots):** caught that `pentagon` still wasn't a clean
   pentagon — a leftover `--ae-hover-radius: 50%` fought the clip-path (scalloped/gear shape), and
   separately the coordinates used (the commonly copy-pasted CSS "pentagon" clip-path) aren't
   actually a regular pentagon, producing 3 small bumps up top and one flat slab at the bottom
   when overlaid as a ring around a circular glyph. Fixed with `--ae-hover-radius: 0` and a true
   regular pentagon (`vertex_k = 50% + 50%·cos/sin(90°−72°k)`).
3. **Round 3 (user correction — design misunderstanding, then a regression from the fix):** the
   user clarified that `#ambiZone`'s copies 2-6 (single-color logos) should keep their **original**
   plain ring, unchanged color, no rotation — only copy 1 (two-tone) rotates. An earlier attempt
   had applied `aetype="rotate"` to the group's single shared host (rotating *and* silencing the
   ring for all six at once) then tried to compensate with a shared hover-color change on copies
   2-6 — both reverted. Redesigned: `aetype="rotate"` removed from the `#ambiZone` host; copy 1's
   rotation is now a `ion-item:nth-child(1)`-scoped rule instead. The revert of the (now-unused)
   `--ae-hover-color` custom property was incomplete — its `:host` definition was removed but a
   usage (`color: var(--ae-hover-color)`) was left dangling in the base `ion-icon:hover` rule,
   which resolved to the **inherited** color (white, from the demo's unrelated `#ambiZone {
   color: #fff }`) instead of being dropped, flashing every `#ambiZone` icon white on hover
   regardless of its own color. Fixed by deleting the leftover line. A stale hashed chunk in
   `www/build/` briefly masked this fix mid-diagnosis — a clean `www`/`dist` rebuild resolved it.
4. **Round 4 (pixel-sampled screenshots, not just eyeballing one):** `pentagon` *still* didn't
   visibly extend outside the icon at zoom. Root cause was the ring *mechanism* itself, not the
   math: `box-shadow` (how round/square/the base ring all draw) only ever paints a band hugging
   the `::before` box's own **rectangular** edge — `clip-path` just erases whatever of that band
   falls outside the polygon, it doesn't reshape the band. A regular pentagon's edges dip inward
   to ~81% of its circumradius at the midpoint between vertices — almost exactly the icon glyph's
   own measured radius — so there was no ring band left inside the polygon along most of each
   edge, at any size tried (confirmed by literally sampling screenshot pixels along the vertex vs.
   edge-midpoint angles). Fixed by abandoning `box-shadow` for `pentagon` entirely: it's now a
   filled donut via one `clip-path: polygon(evenodd, …)` (an outer pentagon sized to clear the
   glyph at every angle, and a smaller inner pentagon as the "hole"), filled via `--ae-hover-bg`.

**Verified (final state):** `npm run build`/`lint`/`test --spec` (8/8)/`test.unit` (3/3)/`smoke`,
all green (lint's 3 findings are the same pre-existing, unrelated issues noted in prior reviews).
Live Puppeteer hover checks plus pixel-sampled/zoomed screenshots on every affected element: `id=0`
and `#ambiZone` copy 1 rotate 180° with no ring; `#ambiZone` copies 2-6 show no rotation, no color
change, and their own original ring color — exactly their pre-existing behavior; `id=1` (round)
and `id=2` (square) unchanged; `id=3` (pentagon) shows a single, fully-connected pentagon outline
around the icon, confirmed by scanning actual rendered pixels (not just computed-style values) at
both a vertex angle and a waist angle.

**Not implemented:** `pulse`/`id="4"` — stays commented out in the demo, tracked in §12 roadmap,
explicitly deferred per the user's original scoping.

---

## 3. Version bump: 1.4.0 → **1.5.0** (not 1.4.1) — Iconify renumbered to v1.6.0

**Discussion:** the assistant initially proposed 1.5.0, then — on noticing `docs/modernization-
plan.md` §6 had informally earmarked "v1.5.0" for the not-yet-implemented Iconify work back on
2026-08-15 — second-guessed to 1.4.1 to avoid the collision. The user corrected this: per strict
semver, **PATCH is for backward-compatible bug fixes only**; §2's `aetype` work added a genuinely
new prop (`aerotatedeg`) and gave a previously-inert, documented-but-no-op prop (`aetype`) real
behavior for the first time — that's new, additive *functionality*, which is MINOR territory
regardless of how small the diff looks. **Resolution:** `aetype` keeps **v1.5.0**; Iconify moves to
**v1.6.0** throughout §6/§12 of the modernization plan and the README's Iconify roadmap note. Full
rationale recorded in the plan's §8 (Version-bump protocol) so future bumps here check for an
existing roadmap version reservation before claiming one, and default to MINOR (not PATCH) for any
change that adds a prop or activates a previously-inert one.

**Not done this session (explicitly out of scope of "bump version, update rvw and docs, commit,
push"):** no git tag, no `npm publish`, no Firebase deploy — those are separate, harder-to-reverse
actions (external package registry + production site) warranting their own explicit go-ahead. The
demo triple (`ionicons/Stencil/component`) is generated from `package.json`'s `version` at build
time (`scripts/gen-build-stamp.mjs`), so no other file needed manual syncing for the bump itself.

---

## 4. References

- **Prior review:** `rvw/Code_review 2026-08-16.md` (CF table origin; issue #27).
- **This session's design + full bug-by-bug history:** `docs/modernization-plan.md` §4.1 (`aetype`
  presets) and §8 (version-bump protocol / semver rationale).
- **This repo:** `ae-icon5-component.tsx` (`aerotatedeg`, `applyRotateDeg`), `ae-icon5-component.css`
  (`:host([aetype="…"])` rules, the pentagon donut `clip-path`), `src/index.html` (demo re-tagging).
