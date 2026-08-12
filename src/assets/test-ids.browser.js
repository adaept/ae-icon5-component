// Browser-side mirror of ../../testing/test-ids.mjs's `testIds` + `setTestId` (dev plan A22).
//
// A classic <script src> (this file), not `<script type="module">` importing the .mjs directly
// -- keeps this consistent with the same pattern used in adaept5tudio/aesvgcon (that project
// needs classic-script loading for a file:// requirement this one doesn't share, but matching
// the shape everywhere is the actual point of "one naming/loading convention across the family"
// rather than each project inventing its own wiring). Two small, hand-synced copies on purpose:
// test-ids.mjs (ESM, canonical, imported by the Node-side Puppeteer test in testing/e2e.testids.mjs)
// and this file (plain global, for src/index.html). Keep both in sync when adding an id.
(function (root) {
  var testIds = {
    buildStamp: 'label-build-stamp',
  };

  function isE2E() {
    return root.__AE_E2E__ === true;
  }

  function setTestId(el, id) {
    if (el && isE2E()) el.setAttribute('data-testid', id);
  }

  root.AE_TEST_IDS = testIds;
  root.aeSetTestId = setTestId;
})(window);
