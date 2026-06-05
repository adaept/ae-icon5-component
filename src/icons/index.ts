// Public icon utilities for consumers (modernization-plan §5 / D2).
//
// Usage in a host app (e.g. aedh, to drop the wholesale ionicons SVG copy — item C):
//   import { registerIcons } from '@adaept/ae-icon5/dist/components/icons';
//   import { home, settings } from 'ionicons/icons';
//   registerIcons({ home, settings }); // bundled, no runtime SVG fetch
export { addIcons } from 'ionicons'
export { defaultIcons } from './manifest'
export {
  getIconSource,
  iconSources,
  DEFAULT_ICON_SET
} from './sources'
export type { IconSource, IconSetId } from './sources'

import { addIcons } from 'ionicons'
import { getIconSource, DEFAULT_ICON_SET } from './sources'

/**
 * Register the component's default bundled set. Called by the component on load;
 * idempotent, so safe to call again. Honors the active icon `set`.
 */
export function registerDefaultIcons(set: string = DEFAULT_ICON_SET): void {
  getIconSource(set).registerDefaults()
}

/**
 * Register your OWN icons (kebab `name` → SVG data, e.g. from `ionicons/icons`).
 * Thin, friendly wrapper over ionicons' `addIcons`.
 */
export function registerIcons(icons: Record<string, string>): void {
  addIcons(icons)
}
