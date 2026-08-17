import tailwindcss from '@tailwindcss/vite'
import { COLOR_MODE_BOOT } from './app/config/color-mode-boot'
import { ICON_BUNDLE } from './app/config/icons'
import { allContentPaths } from './app/config/navigation'
import { DOC_LOCALES, SCALAR_CONFIGURATIONS, SCALAR_PRERENDER_ROUTES } from './app/config/scalar'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  modules: ['@nuxt/content', '@nuxt/icon', '@scalar/nuxt'],

  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  components: [
    // MDC components used inside the Markdown must be globally registered.
    { path: '~/components/content', pathPrefix: false, global: true },
    { path: '~/components', pathPrefix: false },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // sRGB rendering of `--pn-brand`, oklch(60.6% 0.25 292.717).
        { name: 'theme-color', content: '#8e51ff' },
      ],
      // Declared here rather than in `app.vue`: the `ssr: false` reference
      // shells never run `app.vue` on the server, so a `useHead()` script does
      // not reach them. See `app/config/color-mode-boot.ts`.
      script: [{ innerHTML: COLOR_MODE_BOOT, tagPosition: 'head' }],
    },
  },

  // ---------------------------------------------------------------------------
  // Guides — Nuxt Content (the pages migrated from the Mintlify `.mdx` sources)
  // ---------------------------------------------------------------------------
  content: {
    // Node 22+ ships `node:sqlite`, so no native `better-sqlite3` build is needed.
    experimental: { sqliteConnector: 'native' },
    build: {
      // Keep the `pt-BR` folder name in the route. Nuxt Content lower-cases
      // path segments by default, which would turn `/pt-BR/...` into
      // `/pt-br/...` and break every link inherited from the Mintlify site.
      pathMeta: { slugifyOptions: { lower: false } },
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          theme: { default: 'github-light', dark: 'github-dark' },
          // Every language used by a fenced block in `content/`, plus the few
          // a future page is likely to need. Unknown ids break the build.
          langs: [
            'bash',
            'css',
            'diff',
            'handlebars',
            'html',
            'http',
            'ini',
            'js',
            'json',
            'jsonc',
            'markdown',
            'php',
            'python',
            'sql',
            'ts',
            'vue',
            'xml',
            'yaml',
          ],
        },
      },
    },
    renderer: {
      anchorLinks: { h2: true, h3: true, h4: true },
    },
  },

  // ---------------------------------------------------------------------------
  // API Reference — Scalar. One configuration per language × API version.
  // Docs: https://scalar.com/products/api-references/integrations/nuxt
  // ---------------------------------------------------------------------------
  scalar: {
    // Render the reference inside our own shell so the header, language and
    // version switchers stay identical between the guides and the API explorer.
    layout: 'reference',
    theme: 'default',
    darkMode: true,
    hideModels: false,
    showSidebar: true,
    searchHotKey: 'k',
    hideDownloadButton: false,
    metaData: {
      title: 'Pingo Notify API Reference',
    },
    configurations: SCALAR_CONFIGURATIONS,
  },

  icon: {
    mode: 'svg',
    // Whole collections server-side so the prerendered HTML already contains
    // the inline SVG; an explicit list client-side for client navigation. The
    // names are built at runtime by `resolveIcon()`, so scanning cannot find
    // them on its own.
    serverBundle: { collections: ['fa6-solid', 'fa6-brands', 'lucide'] },
    clientBundle: {
      icons: ICON_BUNDLE,
      scan: true,
      sizeLimitKb: 1024,
    },
  },

  routeRules: {
    // The Scalar reference is a client-side app; prerender a shell for it.
    '/en/reference/**': { ssr: false },
    '/pt-BR/reference/**': { ssr: false },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
      // Listed explicitly rather than left to the crawler: the v2 API pages are
      // only reachable through the version dropdown, whose links do not exist
      // in the HTML until it is opened.
      routes: [
        '/',
        '/sitemap.xml',
        '/200.html',
        '/404.html',
        ...DOC_LOCALES.flatMap((locale) => allContentPaths(locale)),
        ...SCALAR_PRERENDER_ROUTES,
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://docs.pingonotify.com',
    },
  },

  typescript: {
    strict: true,
  },
})
