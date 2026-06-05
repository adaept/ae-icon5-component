// Default scoped-icon manifest (modernization-plan §5 / D2).
//
// Maps the kebab `name=` you use in markup → the icon's ES-module export from
// `ionicons/icons`. These are NAMED imports on purpose: the bundler tree-shakes
// to just this set, and — crucially — if ionicons ever renames/removes an icon,
// this file FAILS TO BUILD (missing export) instead of silently 404-ing a runtime
// SVG fetch. (See aedh carry-forward item L / this repo's review §3.)
//
// `addIcons(defaultIcons)` registers these so `<ion-icon name="…">` renders from
// bundled data with NO network fetch. Anything NOT in this map still falls back to
// ionicons' runtime fetch — so the demo gallery keeps working unchanged.
//
// Consumers extend this with their OWN icons via the re-exported `addIcons` /
// `registerIcons` (see ./index.ts and the README) — keep this default set SMALL.
import {
  // Home balls (used by aedh) + outline variants
  football, footballOutline,
  basketball, basketballOutline,
  baseball, baseballOutline,
  tennisball, tennisballOutline,
  americanFootball, americanFootballOutline,
  // demo primary area + common app icons (aedh About/menu/fab overlap)
  logoGithub,
  informationCircleOutline,
  removeCircle, addCircle, refreshCircle, globe,
  rocket, rocketOutline, textOutline,
  add, alarm, aperture, at, barcode, basket, beer, menu,
  car, train, airplane, boat, bus, subway, cog
} from 'ionicons/icons'

/**
 * The default bundled icon set: `name=` (kebab) → SVG data URI.
 * Keep keys in sync with the imports above; the CI guard
 * (`scripts/check-icon-manifest.mjs`) validates every key against the
 * installed ionicons version.
 */
export const defaultIcons: Record<string, string> = {
  'football': football,
  'football-outline': footballOutline,
  'basketball': basketball,
  'basketball-outline': basketballOutline,
  'baseball': baseball,
  'baseball-outline': baseballOutline,
  'tennisball': tennisball,
  'tennisball-outline': tennisballOutline,
  'american-football': americanFootball,
  'american-football-outline': americanFootballOutline,
  'logo-github': logoGithub,
  'information-circle-outline': informationCircleOutline,
  'remove-circle': removeCircle,
  'add-circle': addCircle,
  'refresh-circle': refreshCircle,
  'globe': globe,
  'rocket': rocket,
  'rocket-outline': rocketOutline,
  'text-outline': textOutline,
  'add': add,
  'alarm': alarm,
  'aperture': aperture,
  'at': at,
  'barcode': barcode,
  'basket': basket,
  'beer': beer,
  'menu': menu,
  'car': car,
  'train': train,
  'airplane': airplane,
  'boat': boat,
  'bus': bus,
  'subway': subway,
  'cog': cog
}
