// Package entry — public exports for consumers of @adaept/ae-icon5.
// The component itself is registered via the loader (dist/loader) or the
// custom-elements build (dist/components); these are the icon utilities (D2/D3).
export {
  addIcons,
  registerIcons,
  registerDefaultIcons,
  defaultIcons,
  getIconSource,
  DEFAULT_ICON_SET
} from './icons'
export type { IconSource, IconSetId } from './icons'
