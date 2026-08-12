// E2E test using the typed data-testid selectors from ./test-ids.mjs (dev plan A22, same shape
// as adaept5tudio/aesvgcon/testing/e2e.smoke.mjs and aedh/testing/e2e.testids.mjs). Deliberately
// a SEPARATE file from testing/smoke.mjs, not an addition to it: smoke.mjs is the general
// "does the deployed demo render" check and defaults to https://aeicon5.web.app (a normal load
// with the E2E flag never set); this file always sets window.__AE_E2E__ before navigation, so it
// must run against a build/serve it controls, not assume whatever's already running has the flag
// on.
//
//   npm run build && node testing/e2e.testids.mjs   # self-serves ./www
//   $env:BASE_URL = "http://localhost:3333"; node testing/e2e.testids.mjs   # against `npm start`
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import puppeteer from 'puppeteer';
import { testIds } from './test-ids.mjs';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon', '.png': 'image/png', '.gif': 'image/gif' };

let failures = 0;
const log = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failures++; };

let server = null;
let baseUrl = process.env.BASE_URL;
if (!baseUrl) {
  const root = join(process.cwd(), 'www');
  server = http.createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const body = await readFile(join(root, p));
      res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404); res.end('not found');
    }
  });
  await new Promise((r) => server.listen(0, r));
  baseUrl = `http://localhost:${server.address().port}`;
}

const browser = await puppeteer.launch({
  headless: true,
  args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
});
try {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  // Set the flag BEFORE any of the page's own scripts run -- see test-ids.mjs's header for why
  // this is Tier 1 (runtime-gated) even though the project itself has a bundler: the demo
  // bootstrap script isn't compiled by it.
  await page.evaluateOnNewDocument(() => { window.__AE_E2E__ = true; });

  const home = await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2', timeout: 30000 });
  log(home?.ok() ?? false, `GET / -> ${home?.status()}`);

  await page.waitForSelector(`[data-testid="${testIds.buildStamp}"]`, { timeout: 10000 }).catch(() => {});
  const stamp = await page.$eval(`[data-testid="${testIds.buildStamp}"]`, (el) => el.textContent).catch(() => null);
  log(stamp !== null, `build stamp is selectable via data-testid="${testIds.buildStamp}"`);
  log(
    stamp !== null && /\d+\.\d+\.\d+\/\d+\.\d+\.\d+\//.test(stamp),
    `build stamp shows the version triple ("${(stamp ?? '').slice(0, 40)}…")`,
  );

  log(pageErrors.length === 0, `no uncaught page errors (${pageErrors.length})`);
  if (pageErrors.length) console.error(pageErrors.join('\n'));
} finally {
  await browser.close();
  server?.close();
}

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
