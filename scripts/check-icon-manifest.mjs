// Rename CI guard (aedh carry-forward item L; modernization-plan §5 / D2).
//
// Validates every kebab `name` in src/icons/manifest.ts against the INSTALLED
// ionicons version — both that a `<name>.svg` exists and that the matching
// camelCase ES export exists. Catches an ionicons rename/removal (or a kebab
// typo) loudly at CI time instead of a silent runtime 404 / blank icon.
//
// Usage: npm run check.icons   (exit 1 on any mismatch)
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = process.cwd()

// 1. kebab names declared in the manifest
const manifestSrc = readFileSync(join(root, 'src/icons/manifest.ts'), 'utf8')
const objBody = manifestSrc.slice(manifestSrc.indexOf('defaultIcons'))
const names = [...objBody.matchAll(/^\s*'([a-z0-9-]+)'\s*:/gm)].map((m) => m[1])

if (names.length === 0) {
  console.error('[check-icons] no manifest names found — parse failed?')
  process.exit(1)
}

// 2. installed ionicons: svg set + ES exports
const base = join(root, 'node_modules/ionicons')
const svgDir = ['dist/svg', 'dist/ionicons/svg', 'icons']
  .map((d) => join(base, d))
  .find((d) => existsSync(d) && readdirSync(d).some((f) => f.endsWith('.svg')))
const svgSet = new Set(
  readdirSync(svgDir).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, ''))
)
const exports = require('ionicons/icons')
const toCamel = (kebab) => kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
const iconsVersion = JSON.parse(readFileSync(join(base, 'package.json'), 'utf8')).version

// 3. validate
const missingSvg = names.filter((n) => !svgSet.has(n))
const missingExport = names.filter((n) => !(toCamel(n) in exports))

if (missingSvg.length || missingExport.length) {
  console.error(`[check-icons] FAIL against ionicons ${iconsVersion}:`)
  if (missingSvg.length) console.error('  missing SVG     :', missingSvg.join(', '))
  if (missingExport.length) console.error('  missing ES export:', missingExport.join(', '))
  console.error('  → an icon was renamed/removed (or a kebab typo). Fix the manifest.')
  process.exit(1)
}

console.log(`[check-icons] OK — ${names.length} manifest icons all valid in ionicons ${iconsVersion}`)
