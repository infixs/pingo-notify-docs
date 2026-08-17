import { API_SECTIONS, tagSlug } from './api-sections'
import { scalarBasePath, type ApiVersion, type DocLocale } from './scalar'

/**
 * Site navigation — a direct port of the `navigation` block of the Mintlify
 * `docs.json`. Page titles are **not** duplicated here: they are resolved at
 * runtime from the front matter of the corresponding Markdown file, so a title
 * only ever lives in one place.
 */

export type TabId = 'docs' | 'api'

export interface NavEntry {
  /** Route of the page. */
  path: string
  /** Rendered as a Scalar reference link instead of a content page. */
  scalar?: boolean
  /** Fallback label when the entry has no matching content page. */
  label?: string
  /** Highlight only on an exact path match (prefix matching by default). */
  exact?: boolean
  /** Extra paths this entry highlights for (prefix match). Defaults to `path`. */
  match?: string[]
  /** Icon override (Mintlify/Font Awesome name, see `utils/icons.ts`). */
  icon?: string
}

export interface NavGroup {
  label: string
  icon: string
  entries: NavEntry[]
}

export interface NavTab {
  id: TabId
  label: string
  icon: string
  /** Landing page of the tab. */
  home: string
  groups: NavGroup[]
}

export interface LocaleConfig {
  locale: DocLocale
  /** Native name shown in the language switcher. */
  label: string
  /** Value for the `lang` attribute / hreflang. */
  htmlLang: string
  flag: string
}

export const LOCALES: LocaleConfig[] = [
  { locale: 'en', label: 'English', htmlLang: 'en', flag: '🇺🇸' },
  { locale: 'pt-BR', label: 'Português (BR)', htmlLang: 'pt-BR', flag: '🇧🇷' },
]

interface Labels {
  docsTab: string
  apiTab: string
  gettingStarted: string
  features: string
  wordpressPlugin: string
  authentication: string
  apiDocumentation: string
  endpoints: string
  endpointsOverview: string
}

const LABELS: Record<DocLocale, Labels> = {
  en: {
    docsTab: 'Documentation',
    apiTab: 'API Reference',
    gettingStarted: 'Getting Started',
    features: 'Features',
    wordpressPlugin: 'WordPress Plugin',
    authentication: 'Authentication',
    apiDocumentation: 'API Documentation',
    endpoints: 'Endpoints',
    endpointsOverview: 'Overview',
  },
  'pt-BR': {
    docsTab: 'Documentação',
    apiTab: 'Referência da API',
    gettingStarted: 'Começando',
    features: 'Recursos',
    wordpressPlugin: 'Plugin WordPress',
    authentication: 'Autenticação',
    apiDocumentation: 'Documentação da API',
    endpoints: 'Endpoints',
    endpointsOverview: 'Visão geral',
  },
}

function guideGroups(locale: DocLocale): NavGroup[] {
  const l = LABELS[locale]
  const p = (slug: string) => (slug ? `/${locale}/${slug}` : `/${locale}`)

  return [
    {
      label: l.gettingStarted,
      icon: 'rocket',
      entries: [{ path: p('') }, { path: p('official-whatsapp-api') }],
    },
    {
      label: l.features,
      icon: 'star',
      entries: [{ path: p('connections') }, { path: p('integrations') }, { path: p('webhooks') }],
    },
    {
      label: l.wordpressPlugin,
      icon: 'wordpress',
      entries: [
        { path: p('plugin-wordpress') },
        { path: p('template-plugins') },
        { path: p('hooks-and-development') },
      ],
    },
    {
      label: l.authentication,
      icon: 'key',
      entries: [{ path: p('apikeys') }],
    },
  ]
}

function apiGroups(locale: DocLocale, version: ApiVersion): NavGroup[] {
  const l = LABELS[locale]
  const base = `/${locale}/api-reference/${version}`

  const pages: NavEntry[] =
    version === 'v3'
      ? [
          { path: base },
          { path: `${base}/authentication` },
          { path: `${base}/conventions` },
          { path: `${base}/webhooks` },
          { path: `${base}/realtime` },
        ]
      : [{ path: base }, { path: `${base}/authentication` }, { path: `${base}/webhooks` }]

  const reference = scalarBasePath(locale, version)

  // One entry per API section, deep-linking into the Scalar reference at the
  // section's first tag. The same sections drive Scalar's own grouped sidebar
  // (see `app/config/api-sections.ts`). `match` carries every tag of the
  // section: Scalar rewrites the URL as the reader scrolls, so matching the
  // first tag alone would drop the highlight on all the others.
  const endpoints: NavEntry[] = [
    {
      path: reference,
      scalar: true,
      label: l.endpointsOverview,
      icon: 'compass',
      exact: true,
    },
    ...API_SECTIONS[version].map((section) => ({
      path: `${reference}/tag/${tagSlug(section.tags[0]!)}`,
      scalar: true,
      label: section.label[locale],
      icon: section.icon,
      match: section.tags.map((tag) => `${reference}/tag/${tagSlug(tag)}`),
    })),
  ]

  return [
    { label: l.apiDocumentation, icon: 'book', entries: pages },
    { label: l.endpoints, icon: 'signs-post', entries: endpoints },
  ]
}

export function tabsFor(locale: DocLocale, version: ApiVersion): NavTab[] {
  const l = LABELS[locale]
  return [
    {
      id: 'docs',
      label: l.docsTab,
      icon: 'book',
      home: `/${locale}`,
      groups: guideGroups(locale),
    },
    {
      id: 'api',
      label: l.apiTab,
      icon: 'signs-post',
      home: `/${locale}/api-reference/${version}`,
      groups: apiGroups(locale, version),
    },
  ]
}

/** Every content route the site knows about — used to prerender and to build hreflang pairs. */
export function allContentPaths(locale: DocLocale): string[] {
  const paths = new Set<string>()
  for (const version of ['v3', 'v2'] as ApiVersion[]) {
    for (const tab of tabsFor(locale, version)) {
      for (const group of tab.groups) {
        for (const entry of group.entries) {
          if (!entry.scalar) paths.add(entry.path)
        }
      }
    }
  }
  return [...paths]
}

/** `/en/connections` ⇄ `/pt-BR/connections` — the same page in another language. */
export function translatePath(path: string, to: DocLocale): string {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return `/${to}`
  segments[0] = to
  return `/${segments.join('/')}`
}

export const NAVBAR_CTA: Record<DocLocale, { label: string; href: string }> = {
  en: { label: 'Dashboard', href: 'https://pingonotify.com/dashboard' },
  'pt-BR': { label: 'Painel', href: 'https://pingonotify.com/dashboard' },
}
