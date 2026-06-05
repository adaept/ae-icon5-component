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
