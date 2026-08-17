<script setup lang="ts">
import type { NuxtError } from '#app'
import { UI } from '~/config/ui'
import { DOC_LOCALES, type DocLocale } from '~/config/scalar'

defineProps<{ error: NuxtError }>()

const route = useRoute()
const first = route.path.split('/').filter(Boolean)[0]
const locale: DocLocale = (DOC_LOCALES as readonly string[]).includes(first ?? '')
  ? (first as DocLocale)
  : 'en'
const t = UI[locale]

// This page renders outside <NuxtLayout>, so neither layout's `useHead` runs and
// the Portuguese copy would sit under `lang="en"`. On the prerendered 404.html
// the route is `/404.html`, so `locale` — and the copy with it — only resolves
// after hydration; the two stay consistent either way.
useHead({ title: t.notFoundTitle, htmlAttrs: { lang: locale } })
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
    <p class="font-mono text-6xl font-semibold text-brand">{{ error.statusCode || 500 }}</p>
    <h1 class="text-2xl font-semibold text-fg">
      {{ error.statusCode === 404 ? t.notFoundTitle : error.message }}
    </h1>
    <p class="max-w-md text-fg-muted">{{ t.notFoundBody }}</p>
    <NuxtLink
      :to="`/${locale}`"
      class="rounded-lg bg-brand-solid px-5 py-2.5 text-sm font-medium text-brand-fg transition hover:bg-brand-hover"
    >
      {{ t.backHome }}
    </NuxtLink>
  </div>
</template>
