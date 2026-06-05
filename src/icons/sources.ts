// Icon-source adapter seam (modernization-plan §6 / D3).
//
// This is the SEAM only: ionicons is the sole source this cycle. The `set` prop
// on <ae-icon5-component> selects a source so additional providers (e.g.
// `iconify:*`, targeted ≈ v1.5.0) can slot in later WITHOUT public-API churn.
// Iconify is intentionally NOT implemented here yet.
import { addIcons } from 'ionicons'
import { defaultIcons } from './manifest'

/** Known icon-set ids. Extend (e.g. `'iconify'`) when a source is added. */
export type IconSetId = 'ionicons'

export interface IconSource {
  id: IconSetId
  /** Register a `name`(kebab) → SVG-data map with this source. */
  register(icons: Record<string, string>): void
  /** Register this source's bundled default set (idempotent). */
  registerDefaults(): void
}

let ioniconsDefaultsRegistered = false
const ioniconsSource: IconSource = {
  id: 'ionicons',
  register(icons) {
    addIcons(icons)
  },
  registerDefaults() {
    if (ioniconsDefaultsRegistered) return
    ioniconsDefaultsRegistered = true
    addIcons(defaultIcons)
  }
}

export const DEFAULT_ICON_SET: IconSetId = 'ionicons'

export const iconSources: Record<IconSetId, IconSource> = {
  ionicons: ioniconsSource
}

/** Resolve a source by id, falling back to the default (ionicons). */
export const getIconSource = (set?: string): IconSource =>
  iconSources[set as IconSetId] ?? iconSources[DEFAULT_ICON_SET]
