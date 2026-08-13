# Code Review — ae-icon5-component

**Date:** 2026-08-13 · **Repo:** `adaept/ae-icon5-component`
**Continues:** `rvw/Code_review 2026-08-12.md` (task-only entry; CF-1..CF-12 carried, not
re-verified this session)

---

## 1. Carry-forward tasks — carried from 2026-08-12, not re-verified this session

**Not re-checked line by line** — this session's scope was demo-page fixes (§2) plus the new
task below (§3). Status shown is 2026-08-12's last-verified state; treat as stale until a session
that actually re-audits each item.

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
| **CF-13** | **Deployed demo (`https://aeicon5.web.app`) is stale — never successfully redeployed for v1.4.0** — see below. | ☐ open | HIGH |

### CF-13 detail — stale deployed demo, found via user report (2026-08-13)

**Reported:** the live demo at `https://aeicon5.web.app` doesn't reflect the latest release.

**Confirmed and root-caused:**
- `curl https://aeicon5.web.app/` returns 200, but the HTML has no `build-stamp.js` reference and
  no `aeVersionTriple`/`aeBuildStamp` element — i.e. it predates the git# build-stamp feature
  (added ~2026-06-05/07). The live site is that old.
- `gh run list --repo adaept/ae-icon5-component --workflow=release.yml` shows **every** run tied
  to tag `v1.4.0` (9 runs, 2026-06-05 → 2026-06-06, all re-pushes of the same tag while debugging
  npm's OIDC Trusted Publishing setup — see README's release-runbook history) **failed**. None of
  those runs reached the "Deploy demo to Firebase" step successfully, so `release.yml` has never
  redeployed the Firebase site since the build-stamp feature landed. Everything built and merged
  to `master` since then (E2E test-ids, puppeteer 25 bump, this session's demo-icon fixes,
  CF-12's stroke-width bug log, etc.) is live in the repo but **not** on `aeicon5.web.app`.

**Update process (document + next action):**

CI path (once OIDC publishing is confirmed working — see README's "Release runbook" §
troubleshooting for the OIDC diagnostics already added to `release.yml`):
```bash
git tag vX.Y.Z && git push origin vX.Y.Z
# Actions → Release: build+test → npm publish (OIDC) → firebase deploy (aeicon5) → smoke → GH Release
```

Manual path — already documented in README's **"Manual fallback (no CI)"** section, and the
one to use right now given CF-13's root cause plus the user's separate decision this session to
disable the `Release` workflow's auto-trigger (manual build/test/deploy going forward):
```bash
npm run build                       # dist/ + dist-custom-elements/ + www/
npm i -g firebase-tools             # once
firebase login                      # once, interactive
firebase deploy --only hosting --project aeicon5   # → https://aeicon5.web.app
npm run smoke                       # BASE_URL=https://aeicon5.web.app for a post-deploy check
```

**Not yet executed** — this entry documents the task and the process; the actual `firebase
deploy` (a production push to shared infra) is left for an explicit go-ahead rather than run as
part of logging this task.

---

## 2. Demo-page fixes — 2026-08-13

- Swapped the demo's one remaining bare `<ion-icon>` (the "RESET" refresh-circle in the
  SIZE/RESET row) for `<ae-icon5-component>`, matching its `remove-circle`/`add-circle` siblings
  (`aetype="round" aesize="ae48" color="danger"`). The old `<ion-icon>` had no ionicons loader in
  the demo and rendered nothing; verified via a Puppeteer screenshot that it now renders correctly
  with no other layout change.
- Removed the stale hardcoded placeholder text (`5.5.1/2.5.2/1.3.4`) from `#aeVersionTriple` in
  `src/index.html` — dead text, always overwritten before paint by the build-stamp script.
- Fixed issue **#1** ("add github icon with link"): the `#fixedGithub` icon existed since 2020 but
  was never wrapped in a link. Wrapped it in
  `<a href="https://github.com/adaept/ae-icon5-component" target="_blank" rel="noopener noreferrer">`.
  Verified via headless-browser check that the anchor resolves and the icon renders unchanged.

None of the above committed yet as of this entry.

---

## 3. References

- **Prior review:** `rvw/Code_review 2026-08-12.md` (§1 CF table, CF-12 detail).
- **README:** `## Deploy`, `### Release runbook (maintainer — adaept)`, `#### Manual fallback (no CI)`.
- **Issue:** `adaept/ae-icon5-component#1` ("add github icon with link").
