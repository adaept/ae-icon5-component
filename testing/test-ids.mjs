// Centralized, typed(-ish) E2E selector constants + a conditional data-testid helper (dev plan
// A22; pattern adapted from
// https://daviddalbusco.com/blog/type-safe-attribute-selectors-for-e2e-testing). Plain JS +
// JSDoc, not TypeScript -- keeps this file importable by the Node-side Puppeteer test without a
// compile step, same reasoning as adaept5tudio/aesvgcon's version of this file (the one this was
// copy-adapted from).
//
// TIER 1 (this file): RUNTIME-gated, not build-time-stripped -- and deliberately so even though
// this *project* is Stencil-bundled: the surface this instruments is `src/index.html`'s demo
// page (built by Stencil's "www" output target), which is copied/served as-is, not run through
// Stencil's Rollup pipeline the way `src/components/**/*.tsx` is. A `process.env.E2E`-style
// build-time flag only gets dead-code-eliminated inside files Stencil actually *compiles* --
// this demo bootstrap isn't one of them, so claiming build-time stripping here would repeat the
// exact mistake corrected in aedh's adoption (see docs/e2e-testing-strategy.md §2's Angular
// counter-example): don't assume a project's bundler reaches every file in it. isE2E() checks a
// flag the E2E harness sets before the page's own script runs (see e2e.testids.mjs's
// page.evaluateOnNewDocument) -- zero extra build tooling, works against the demo exactly as
// deployed to https://aeicon5.web.app.
//
// Naming grammar + category vocabulary: see the shared, cross-project registry in
// adaept5tudio/docs/e2e-testing-strategy.md §5 -- add new ids there in the same commit, not just
// here.

/** @typedef {'btn'|'stage'|'label'|'panel'} TestCategory */
/** @typedef {`${TestCategory}-${string}`} TestId */

/** Single source of truth for every selector this project's E2E tests use. Add here, not inline. */
export const testIds = /** @type {const} */ ({
  buildStamp: /** @type {TestId} */ ('label-build-stamp'),
});

function isE2E() {
  return typeof window !== 'undefined' && window.__AE_E2E__ === true;
}

/**
 * Applies (or, outside an E2E run, deliberately doesn't apply) a data-testid to a live DOM
 * element. Call once per element at setup time.
 * @param {Element|null} el
 * @param {TestId} id
 */
export function setTestId(el, id) {
  if (el && isE2E()) el.setAttribute('data-testid', id);
}
