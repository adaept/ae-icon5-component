# ae-icon5-component — project notes

Stencil component published to npm as **@adaept/ae-icon5**; element tag
**`<ae-icon5-component>`** (namespace `aeicon5`, shadow DOM).

## Consumers
- **aedh** (a-divine-history) imports this via npm and registers the dist loader in its
  `main.ts`. Changes here reach aedh as a version bump. The integration plan + status is
  the master copy in aedh's `rvw/Code_review 2026-06-04.md` §4.1.

## Deploy
- **npm:** `npm publish` (public, MIT).
- **Demo:** Firebase project `aeicon5` → **https://aeicon5.web.app** (canonical). NOT
  `aeicon5.adaept.com` (never configured — NXDOMAIN). Set `package.json` `homepage` =
  `https://aeicon5.web.app`.

## Modernization (planned — see aedh review §4.1)
- Stencil 2.5.2 → 4; ionicons 5.5.1 → 8; add a `dist-custom-elements` output target.
- Fix the shadow-DOM hover ring (`box-shadow: inset 0 0 0 2px red` → `border-radius:50%`
  + themeable `currentColor`).
- ESLint 9 flat config, Node 22, TypeScript ~5.9 (match aedh).
- CI: build/test on PR + a tagged `release.yml` that publishes npm AND deploys the
  `aeicon5` Firebase site.

## Dev loop with aedh (decided: npm pack)
- Iterate here with `npm run start` (Stencil watch build).
- To test in aedh **without publishing**, use **`npm pack`** (chosen over `npm link` to
  avoid Angular peer-dep / duplicate-instance issues):
  1. here: `npm pack` → produces `adaept-ae-icon5-<version>.tgz`
  2. in aedh: `npm i ../ae-icon5-component/adaept-ae-icon5-<version>.tgz`
- When good: bump version → `npm publish` (or push a tag for CI) → bump the dep in aedh.

## Notes
- Claude Code auto-memory is **per working directory**, so this repo has its own
  (separate from aedh's). This committed `CLAUDE.md` is the shared, version-controlled
  cross-repo context.

## Local setup (initialized 2026-06-05)
- `start-claude.cmd` — Claude launcher, copied from aedh.
- `_claude_backup/` — gitignored snapshot target for this project's Claude settings/memory;
  populated by `C:\adaept\aeBibleClass\synch-to-onedrive.bat` (this project = **option 3**,
  `ae-icon5-component`).

## First task — write the detailed modernization plan (before any code)
When work starts here, the first deliverable is a **detailed plan** covering:
- **Design** + a clear separation of the **generated minimal component** (shipped to aedh,
  tree-shaken via `dist-custom-elements`) from the **Firebase demo** (`www`).
- **Version-bump protocol** (the `ionicons/Stencil/component` triple; npm publish + aedh
  dep sync).
- A **git# stamp** in the Firebase demo (mirror aedh's About build stamp).
- **Extracting only the icons aedh uses** into the shipped component.
- **Feature updates**: hover **color / shape / effect as CSS options** (replace the
  hardcoded red square ring).
- **README** docs.
- **Other icon sets** (e.g. **Iconify**) as selectable sources.
- **Smoke test** + **testing infrastructure**.
- A living **roadmap** of future improvements surfaced during this upgrade cycle.

Scope mirrored in aedh `rvw/Code_review 2026-06-04.md` §4.3.

**Draft plan started 2026-06-05 → `docs/modernization-plan.md`** (review/iterate, then execute
its phased sequence §13).
