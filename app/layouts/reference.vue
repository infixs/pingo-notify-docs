<script setup lang="ts">
import { LOCALES, translatePath } from '~/config/navigation'

const { locale, version, route } = useDocs()

useHead(() => ({
  htmlAttrs: { lang: locale.value },
  title: `API ${version.value}`,
  link: LOCALES.map((entry) => ({
    rel: 'alternate',
    hreflang: entry.htmlLang,
    href: translatePath(route.path, entry.locale),
  })),
}))
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader />
    <!-- Scalar renders its own sidebar and search; give it the rest of the viewport. -->
    <div class="scalar-shell">
      <slot />
    </div>
    <!-- No <DocsSearch> here: Scalar ships its own search on this page and both
         would answer the same ⌘K. -->
    <ClientOnly>
      <ScalarSidebarIcons />
    </ClientOnly>
  </div>
</template>
