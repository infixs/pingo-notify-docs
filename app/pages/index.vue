<script setup lang="ts">
import { DOC_LOCALES } from '~/config/scalar'

definePageMeta({ layout: false })

// Same origin the sitemap and the layout's canonical read.
const site = (useRuntimeConfig().public.siteUrl as string).replace(/\/$/, '')

/**
 * The site has no language-neutral landing page: `/` picks a language from the
 * browser and forwards. A `<meta http-equiv="refresh">` covers readers with no
 * JavaScript, which matters because the build is fully static.
 */
useHead({
  title: 'Pingo Notify Docs',
  meta: [
    { 'http-equiv': 'refresh', content: '0; url=/en' },
    { name: 'robots', content: 'noindex' },
  ],
  link: [{ rel: 'canonical', href: `${site}/en` }],
})

onMounted(() => {
  const preferred = (navigator.languages ?? [navigator.language]).map((tag) => tag.toLowerCase())
  const match = DOC_LOCALES.find((locale) =>
    preferred.some((tag) => tag === locale.toLowerCase() || tag.startsWith(`${locale.split('-')[0]!.toLowerCase()}-`)),
  )
  const target = preferred.some((tag) => tag.startsWith('pt')) ? 'pt-BR' : (match ?? 'en')
  navigateTo(`/${target}`, { replace: true, external: true })
})
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center gap-3 text-fg-subtle">
    <span
      class="size-4 animate-spin rounded-full border-2 border-line border-t-brand"
      aria-hidden="true"
    />
    <NuxtLink to="/en" class="text-sm underline">Continue to the documentation</NuxtLink>
  </div>
</template>
