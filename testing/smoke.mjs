// Smoke test for the ae-icon5 demo (mirrors aedh testing/smoke.mjs).
//
//   node testing/smoke.mjs                                   # self-serves ./www
//   $env:BASE_URL = "https://aeicon5.web.app"; node testing/smoke.mjs   # deployed
//
// With no BASE_URL it builds a tiny static server over ./www (so CI can smoke the
// freshly built demo without a separate serve step). Exits 0 if all checks pass.
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import puppeteer from 'puppeteer'

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon', '.png': 'image/png', '.gif': 'image/gif' }

let failures = 0
const log = (ok, msg) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)
  if (!ok) failures++
}

// Resolve a base URL: env override, or a throwaway static server over ./www.
let server = null
let baseUrl = process.env.BASE_URL
if (!baseUrl) {
  const root = join(process.cwd(), 'www')
  server = http.createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(req.url.split('?')[0])
      if (p === '/') p = '/index.html'
      const body = await readFile(join(root, p))
      res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404); res.end('not found')
    }
  })
  await new Promise((r) => server.listen(0, r))
  baseUrl = `http://localhost:${server.address().port}`
}

const browser = await puppeteer.launch({
  headless: true,
  args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
})
try {
  const page = await browser.newPage()
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))

  const home = await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2', timeout: 30000 })
  log(home?.ok() ?? false, `GET / -> ${home?.status()}`)
  log((await page.title()).length > 0, `/ has a document title ("${await page.title()}")`)

  // The custom element registers and renders an inner <ion-icon>.
  await page.waitForFunction(() => {
    const c = document.querySelector('ae-icon5-component')
    return c && c.shadowRoot && c.shadowRoot.querySelector('ion-icon')
  }, { timeout: 30000 }).catch(() => {})

  const rendered = await page.evaluate(() => {
    const hosts = [...document.querySelectorAll('ae-icon5-component')]
    return hosts.filter((h) => h.shadowRoot && h.shadowRoot.querySelector('ion-icon')).length
  })
  log(rendered > 0, `<ae-icon5-component> renders an <ion-icon> (${rendered} on page)`)

  // The footer build stamp shows the version triple (ionicons/Stencil/component).
  const stamp = await page.evaluate(() => document.getElementById('aeBuildStamp')?.textContent ?? '')
  log(/\d+\.\d+\.\d+\/\d+\.\d+\.\d+\//.test(stamp), `build stamp shows the version triple ("${stamp.slice(0, 40)}…")`)

  log(pageErrors.length === 0, `no uncaught page errors (${pageErrors.length})`)
  if (pageErrors.length) console.error(pageErrors.join('\n'))
} finally {
  await browser.close()
  server?.close()
}

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}`)
process.exit(failures === 0 ? 0 : 1)
