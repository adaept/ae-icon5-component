# Third-party guide — build your own icon component package

> **STATUS: STUB.** This is the dedicated, version-pinned procedural guide for authors who want
> to create their own Stencil icon-component package modelled on `@adaept/ae-icon5`
> (review CF-10). The condensed recipe lives in the [README](../README.md#build-your-own-icon-component-package-recipe);
> this document expands it into bullet-proof, copy-pasteable steps. **Flesh out the sections
> below; keep the pinned toolchain in sync with each release** — the `check.guide` guard
> (`scripts/check-guide-pins.mjs`) fails CI if the pins below drift from `package.json`.

## Pinned toolchain

These are the versions this package is built and tested against. They are **machine-checked**
against `package.json` — do not edit the block below by hand without matching `package.json`
(and vice-versa).

<!-- toolchain-pins:start -->
- node: >=22
- @stencil/core: ^4.43.5
- ionicons: ^8.0.13
- typescript: ~5.9.3
- eslint: ^9.39.4
- typescript-eslint: ^8.60.1
- jest: ^29.7.0
- puppeteer: ^24.1.0
- vitest: ^4.1.8
<!-- toolchain-pins:end -->

## Steps

The procedure mirrors the README recipe (9 steps). Each section should give exact commands,
the canonical file to copy, and the common pitfalls.

1. **Scaffold + pin the toolchain** — `npm init stencil@latest component <name>`; set `engines`,
   pin the versions above. _(expand)_
2. **Output targets** — `dist-custom-elements` (auto-define) + `dist` + `www`; `shadow: true`. _(expand)_
3. **Component + themeable CSS** — inner `<ion-icon>`; CSS custom props (`--*-color`, `--*-hover-*`);
   no bundled color palette; timers in `connectedCallback`/`disconnectedCallback`. _(expand)_
4. **Scoped icons** — `manifest.ts` with **named** `ionicons/icons` imports; `addIcons`;
   export `registerIcons`; a `set` source seam. _(expand)_
5. **Build stamp + demo** — `gen-build-stamp.mjs` + `prebuild`/`prestart` hooks; demo footer. _(expand)_
6. **Tests + rename guard** — Jest specs, Vitest POC, Puppeteer smoke, `check.icons`. _(expand)_
7. **CI + release** — `ci.yml` + `release.yml`; secrets `NPM_TOKEN` + `FIREBASE_SERVICE_ACCOUNT`. _(expand)_
8. **Package hygiene** — entry fields; `files` negation for the SVG copy + demo assets;
   `prepublishOnly`; `npm publish --dry-run`. _(expand)_
9. **Publish** — bump `version`; `git tag vX.Y.Z && git push origin vX.Y.Z`. _(expand)_

## Release checklist (keep in sync)

On every release, update this guide alongside `package.json`:

- [ ] Bump the **Pinned toolchain** block above to match `package.json` (the `check.guide` guard
      enforces this).
- [ ] Re-verify each step's commands against the current toolchain.
- [ ] Re-run `npm run check.guide` locally (CI also runs it).
