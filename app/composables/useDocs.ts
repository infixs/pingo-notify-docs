import { API_VERSIONS, DOC_LOCALES, type ApiVersion, type DocLocale } from '~/config/scalar'
import { LOCALES, NAVBAR_CTA, tabsFor, translatePath, type TabId } from '~/config/navigation'
import { UI } from '~/config/ui'

const DEFAULT_LOCALE: DocLocale = 'en'
const DEFAULT_VERSION: ApiVersion = 'v3'

function parseLocale(path: string): DocLocale {
  const first = path.split('/').filter(Boolean)[0]
  return (DOC_LOCALES as readonly string[]).includes(first ?? '')
    ? (first as DocLocale)
    : DEFAULT_LOCALE
}

function parseVersion(path: string): ApiVersion | null {
  const match = path.match(/\/(?:api-reference|reference)\/(v\d)(?:\/|$)/)
  const version = match?.[1]
  return (API_VERSIONS as readonly string[]).includes(version ?? '')
    ? (version as ApiVersion)
    : null
}

/**
 * Everything the shell needs to render itself for the current route: which
 * language, which API version, which tab is active.
 */
export function useDocs() {
  const route = useRoute()

  // Remembers the last version the reader looked at, so the API tab keeps it
  // when navigating from a guide page.
  const stickyVersion = useState<ApiVersion>('docs-api-version', () => DEFAULT_VERSION)

  // `vercel.json` normalises the trailing slash away, `public/_redirects` does
  // not — so `/en/connections/` reaches the app as-is. Everything that compares
  // routes (sidebar highlight, pagination) uses this instead of `route.path`.
  const path = computed(() => route.path.replace(/\/+$/, '') || '/')

  const locale = computed<DocLocale>(() => parseLocale(route.path))

  const version = computed<ApiVersion>(() => parseVersion(route.path) ?? stickyVersion.value)

  watch(
    () => parseVersion(route.path),
    (found) => {
      if (found) stickyVersion.value = found
    },
    { immediate: true },
  )

  const isReference = computed(() => /\/reference\/v\d/.test(route.path))

  const activeTab = computed<TabId>(() =>
    /\/(api-reference|reference)\//.test(route.path) ? 'api' : 'docs',
  )

  const tabs = computed(() => tabsFor(locale.value, version.value))

  const currentTab = computed(
    () => tabs.value.find((tab) => tab.id === activeTab.value) ?? tabs.value[0]!,
  )

  const t = computed(() => UI[locale.value])

  const localeOptions = computed(() =>
    LOCALES.map((entry) => ({
      ...entry,
      to: translatePath(route.path, entry.locale),
      active: entry.locale === locale.value,
    })),
  )

  const cta = computed(() => NAVBAR_CTA[locale.value])

  return {
    route,
    path,
    locale,
    version,
    stickyVersion,
    isReference,
    activeTab,
    tabs,
    currentTab,
    t,
    localeOptions,
    cta,
  }
}
