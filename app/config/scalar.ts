/**
 * Scalar API Reference wiring.
 *
 * The Mintlify build exposed four OpenAPI documents (2 languages × 2 API
 * versions). Each one becomes a Scalar configuration mounted on its own base
 * path, so the URLs stay language- and version-scoped:
 *
 *   /en/reference/v3      /en/reference/v2
 *   /pt-BR/reference/v3   /pt-BR/reference/v2
 *
 * This file is imported by `nuxt.config.ts`, so it must stay free of any
 * Nuxt runtime import.
 */

export const DOC_LOCALES = ['en', 'pt-BR'] as const
export type DocLocale = (typeof DOC_LOCALES)[number]

export const API_VERSIONS = ['v3', 'v2'] as const
export type ApiVersion = (typeof API_VERSIONS)[number]

/** Base path of the Scalar reference for a language / API version pair. */
export function scalarBasePath(locale: string, version: string): string {
  return `/${locale}/reference/${version}`
}

/** Public URL of the OpenAPI document copied into `public/openapi`. */
export function openApiUrl(locale: string, version: string): string {
  return `/openapi/${locale}/${version}.json`
}

const TITLES: Record<string, Record<string, string>> = {
  en: {
    v3: 'Pingo Notify API v3 · Reference',
    v2: 'Pingo Notify API v2 · Reference',
  },
  'pt-BR': {
    v3: 'API Pingo Notify v3 · Referência',
    v2: 'API Pingo Notify v2 · Referência',
  },
}

/** The `apiKey` security scheme is named differently between v2 and v3. */
const SECURITY_SCHEME: Record<string, string> = {
  v3: 'apiKey',
  v2: 'ApiKeyAuth',
}

/**
 * Repaints Scalar with the Pingo Notify tokens.
 *
 * The `--pn-*` custom properties are declared once in `app/assets/css/main.css`
 * and already flip with the theme, so a single block covers light and dark —
 * no `.light-mode` / `.dark-mode` duplication.
 */
const PINGO_SCALAR_CSS = `
.scalar-app,
.scalar-api-reference,
.light-mode,
.dark-mode {
  --scalar-font: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --scalar-font-code: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;

  --scalar-radius: 0.5rem;
  --scalar-radius-lg: 0.65rem;
  --scalar-radius-xl: 0.85rem;

  --scalar-background-1: var(--pn-background);
  --scalar-background-2: var(--pn-muted);
  /* --pn-muted and --pn-accent are the same value, so step 3 is mixed by hand. */
  --scalar-background-3: color-mix(in oklch, var(--pn-muted), var(--pn-foreground) 7%);
  --scalar-background-accent: color-mix(in oklch, var(--pn-brand) 14%, transparent);

  --scalar-color-1: var(--pn-foreground);
  --scalar-color-2: var(--pn-muted-foreground);
  --scalar-color-3: var(--pn-subtle-foreground);
  --scalar-color-accent: var(--pn-brand-text);
  --scalar-border-color: var(--pn-border);

  --scalar-button-1: var(--pn-brand-solid);
  --scalar-button-1-hover: var(--pn-brand-hover);
  --scalar-button-1-color: var(--pn-brand-foreground);

  /* The docs sidebar is transparent, so the reference must not lift off the page. */
  --scalar-sidebar-background-1: var(--pn-background);
  --scalar-sidebar-color-1: var(--pn-foreground);
  --scalar-sidebar-color-2: var(--pn-muted-foreground);
  --scalar-sidebar-border-color: var(--pn-border);
  --scalar-sidebar-item-hover-background: var(--pn-accent);
  --scalar-sidebar-item-hover-color: var(--pn-foreground);
  --scalar-sidebar-item-active-background: color-mix(in oklch, var(--pn-brand) 14%, transparent);
  --scalar-sidebar-color-active: var(--pn-brand-text);
  --scalar-sidebar-indent-border-active: var(--pn-brand);
  --scalar-sidebar-search-background: var(--pn-background);
  --scalar-sidebar-search-border-color: var(--pn-border);
  --scalar-sidebar-search-color: var(--pn-muted-foreground);

  --scalar-scrollbar-color: var(--pn-border);
  --scalar-scrollbar-color-active: var(--pn-subtle-foreground);

  /*
   * Scalar paints every HTTP method badge and every syntax-highlighting token
   * from these six, so leaving them stock puts a foreign purple next to the
   * brand violet in the same sidebar. "orange" stays a mix rather than another
   * --pn-warning — PUT and PATCH badges would otherwise be identical.
   */
  --scalar-color-blue: var(--pn-info);
  --scalar-color-green: var(--pn-success);
  --scalar-color-red: var(--pn-destructive);
  --scalar-color-yellow: var(--pn-warning);
  --scalar-color-orange: color-mix(in oklch, var(--pn-warning), var(--pn-destructive) 40%);
  --scalar-color-purple: var(--pn-brand);

  /* Scalar's default points links at --scalar-color-1, i.e. body text. */
  --scalar-link-color: var(--pn-brand-text);
  --scalar-link-color-hover: var(--pn-brand-hover);
  --scalar-link-color-visited: var(--pn-muted-foreground);
}
`.trim()

export const SCALAR_CONFIGURATIONS = DOC_LOCALES.flatMap((locale) =>
  API_VERSIONS.map((version) => ({
    url: openApiUrl(locale, version),
    pathRouting: { basePath: scalarBasePath(locale, version) },
    metaData: {
      title: TITLES[locale]![version]!,
      description:
        locale === 'pt-BR'
          ? 'Referência completa da API do Pingo Notify.'
          : 'The complete Pingo Notify API reference.',
    },
    hideDownloadButton: false,
    documentDownloadType: 'json' as const,
    defaultHttpClient: { targetKey: 'shell' as const, clientKey: 'curl' as const },
    authentication: { preferredSecurityScheme: SECURITY_SCHEME[version]! },
    baseServerURL: 'https://api.pingonotify.com',
    favicon: '/favicon.svg',
    // Translate Scalar's own UI along with the page it sits on.
    localization: { locale: locale === 'pt-BR' ? 'pt' : 'en' },
    // Authoring affordances that do not belong on a public reference.
    showToolbar: 'never' as const,
    showDeveloperTools: 'never' as const,
    // The site header already carries a theme switch.
    hideDarkModeToggle: true,
    customCss: PINGO_SCALAR_CSS,
  })),
)

/** Routes the static build has to render even though nothing links deeply into them. */
export const SCALAR_PRERENDER_ROUTES = DOC_LOCALES.flatMap((locale) =>
  API_VERSIONS.map((version) => scalarBasePath(locale, version)),
)
