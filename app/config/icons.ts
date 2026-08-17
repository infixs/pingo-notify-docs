/**
 * The Mintlify sources referenced Font Awesome icon names in front matter and
 * in `<Card icon="…">`. This maps those names onto the Iconify collections
 * bundled with the site (`fa6-solid`, `fa6-brands`, `lucide`), so the exact
 * same names keep working in the migrated Markdown.
 *
 * Imported by `nuxt.config.ts` as well, to pin the client bundle: the names
 * are produced at runtime by `resolveIcon()`, which the icon module's source
 * scanner cannot see.
 */

/** Font Awesome names with no free counterpart, brands, and UI chrome. */
export const ICON_ALIASES: Record<string, string> = {
  // Font Awesome Pro names that have no free counterpart
  'badge-check': 'lucide:badge-check',
  'sparkles': 'lucide:sparkles',
  'webhook': 'lucide:webhook',
  'timer': 'lucide:timer',
  'square-envelope': 'fa6-solid:envelope',
  'signs-post': 'fa6-solid:signs-post',
  'grid-2': 'lucide:layout-grid',
  'messages': 'lucide:messages-square',
  'robot': 'lucide:bot',
  'chart': 'lucide:chart-column',
  'chart-line': 'lucide:chart-line',
  'compass': 'lucide:compass',
  'headset': 'lucide:headset',
  'life-buoy': 'lucide:life-buoy',
  'building': 'lucide:building-2',
  'users': 'lucide:users',
  'envelope-open': 'lucide:mail-open',
  'shield': 'lucide:shield',
  'arrows-rotate': 'lucide:refresh-cw',
  'comments': 'lucide:messages-square',
  'paper-plane': 'lucide:send',
  'bullhorn': 'lucide:megaphone',
  'address-book': 'lucide:contact',
  'inbox': 'lucide:inbox',
  'tag': 'lucide:tag',
  'sliders': 'lucide:sliders-horizontal',
  'filter': 'lucide:funnel',
  'bell': 'lucide:bell',
  'star': 'lucide:star',
  'puzzle': 'lucide:puzzle',
  'credit-card': 'lucide:credit-card',

  // Brands
  'wordpress': 'fa6-brands:wordpress',
  'whatsapp': 'fa6-brands:whatsapp',
  'meta': 'fa6-brands:meta',
  'facebook': 'fa6-brands:facebook',
  'github': 'fa6-brands:github',
  'n8n': 'lucide:workflow',

  // Callout defaults
  'circle-info': 'fa6-solid:circle-info',
  'triangle-exclamation': 'fa6-solid:triangle-exclamation',
  'circle-check': 'fa6-solid:circle-check',
  'lightbulb': 'fa6-solid:lightbulb',
  'circle-exclamation': 'fa6-solid:circle-exclamation',

  // UI chrome
  'chevron-down': 'lucide:chevron-down',
  'chevron-right': 'lucide:chevron-right',
  'chevron-left': 'lucide:chevron-left',
  'arrow-right': 'lucide:arrow-right',
  'arrow-up-right': 'lucide:arrow-up-right',
  'external-link': 'lucide:external-link',
  'search': 'lucide:search',
  'menu': 'lucide:menu',
  'close': 'lucide:x',
  'sun': 'lucide:sun',
  'moon': 'lucide:moon',
  'languages': 'lucide:languages',
  'copy': 'lucide:copy',
  'check': 'lucide:check',
}

/** Names that exist verbatim in `fa6-solid` and are used by the content. */
export const ICON_FA_SOLID: string[] = [
  'bolt',
  'book',
  'check-double',
  'circle-dot',
  'clock-rotate-left',
  'code',
  'cube',
  'expand',
  'eye-slash',
  'gauge',
  'gear',
  'key',
  'keyboard',
  'layer-group',
  'link',
  'list',
  'list-check',
  'phone-slash',
  'plug',
  'plus',
  'qrcode',
  'rocket',
  'toggle-on',
  'tower-broadcast',
  'trash',
  'user-plus',
  'users-slash',
  'wifi',
]

/** Icons referenced directly in Vue templates (the module's scanner finds these too). */
const UI_ICONS = [
  'lucide:arrow-right',
  'lucide:arrow-up-right',
  'lucide:check',
  'lucide:chevron-down',
  'lucide:chevron-left',
  'lucide:chevron-right',
  'lucide:languages',
  'lucide:menu',
  'lucide:moon',
  'lucide:search',
  'lucide:sun',
  'lucide:x',
  'lucide:circle',
  'lucide:bot',
  'lucide:chart-column',
  'lucide:compass',
  'lucide:headset',
  'lucide:messages-square',
  'lucide:layout-grid',
]

/** Complete, explicit list handed to `icon.clientBundle.icons`. */
export const ICON_BUNDLE: string[] = [
  ...new Set([
    ...Object.values(ICON_ALIASES),
    ...ICON_FA_SOLID.map((name) => `fa6-solid:${name}`),
    ...UI_ICONS,
  ]),
]

const FA_SOLID_SET = new Set(ICON_FA_SOLID)

export function resolveIcon(name?: string | null): string {
  if (!name) return 'lucide:circle'
  const raw = String(name).trim()
  if (!raw) return 'lucide:circle'
  // Already an Iconify identifier (`collection:name`)
  if (raw.includes(':')) return raw
  if (ICON_ALIASES[raw]) return ICON_ALIASES[raw]!
  if (FA_SOLID_SET.has(raw)) return `fa6-solid:${raw}`
  return `fa6-solid:${raw}`
}
