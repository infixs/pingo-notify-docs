<script setup lang="ts">
import { LOCALES, translatePath } from '~/config/navigation'

const { locale, route, t } = useDocs()

// Absolute origin — search engines ignore root-relative hreflang and canonical.
// Same runtime config the sitemap builds its <loc> from.
const site = (useRuntimeConfig().public.siteUrl as string).replace(/\/$/, '')

// `lang` + hreflang alternates, done by hand instead of pulling in an i18n module.
useHead(() => ({
  htmlAttrs: { lang: locale.value },
  link: [
    { rel: 'canonical', href: `${site}${route.path}` },
    ...LOCALES.map((entry) => ({
      rel: 'alternate' as const,
      hreflang: entry.htmlLang,
      href: `${site}${translatePath(route.path, entry.locale)}`,
    })),
    // English is the fallback for every language the site does not carry.
    { rel: 'alternate', hreflang: 'x-default', href: `${site}${translatePath(route.path, 'en')}` },
  ],
}))
</script>

<template>
  <div class="min-h-dvh">
    <a
      href="#docs-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-lg focus:bg-brand-solid focus:px-4 focus:py-2 focus:text-brand-fg"
    >
      {{ t.skipToContent }}
    </a>

    <AppHeader />

    <div class="mx-auto flex max-w-[110rem] px-0 sm:px-6">
      <AppSidebar />
      <div class="min-w-0 flex-1">
        <slot />
      </div>
    </div>

    <AppFooter />
    <ClientOnly>
      <DocsSearch />
    </ClientOnly>
  </div>
</template>
