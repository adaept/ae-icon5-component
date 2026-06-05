// Guide-sync guard (review CF-10). Fails if the pinned toolchain in
// docs/THIRD-PARTY-GUIDE.md drifts from package.json — so the third-party guide
// can't silently rot across releases.
//
// Usage: npm run check.guide   (exit 1 on any drift)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const guide = readFileSync(join(root, 'docs/THIRD-PARTY-GUIDE.md'), 'utf8')

// Deps whose versions the guide pins. `node` comes from engines; the rest from
// dependencies/devDependencies.
const TRACKED = [
  '@stencil/core', 'ionicons', 'typescript', 'eslint',
  'typescript-eslint', 'jest', 'puppeteer', 'vitest'
]
const deps = { ...pkg.dependencies, ...pkg.devDependencies }
const expected = { node: pkg.engines?.node }
for (const name of TRACKED) expected[name] = deps[name]

// Parse the machine-readable pin block: `- name: range` between the markers.
const block = guide.match(/<!--\s*toolchain-pins:start\s*-->([\s\S]*?)<!--\s*toolchain-pins:end\s*-->/)
if (!block) {
  console.error('[check-guide] no <!-- toolchain-pins --> block in docs/THIRD-PARTY-GUIDE.md')
  process.exit(1)
}
const found = {}
for (const m of block[1].matchAll(/^\s*-\s*([^:]+?):\s*(.+?)\s*$/gm)) {
  found[m[1].trim()] = m[2].trim()
}

const problems = []
for (const [name, range] of Object.entries(expected)) {
  if (range === undefined) continue // not declared in package.json — skip
  if (!(name in found)) problems.push(`missing in guide: ${name} (package.json: ${range})`)
  else if (found[name] !== range) problems.push(`${name}: guide "${found[name]}" != package.json "${range}"`)
}
// Flag stray pins in the guide that no longer track anything.
for (const name of Object.keys(found)) {
  if (!(name in expected)) problems.push(`stray pin in guide (not tracked / not in package.json): ${name}`)
}

if (problems.length) {
  console.error('[check-guide] FAIL — docs/THIRD-PARTY-GUIDE.md pins drifted from package.json:')
  for (const p of problems) console.error('  - ' + p)
  console.error('  → update the toolchain-pins block in the guide (review CF-10).')
  process.exit(1)
}

console.log(`[check-guide] OK — guide toolchain pins match package.json (${Object.keys(found).length} entries)`)
