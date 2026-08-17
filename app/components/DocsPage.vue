<script setup lang="ts">
const route = useRoute()
const { t } = useDocs()

/** `/en/connections/` and `/en/connections` are the same document. */
const path = computed(() => {
  const clean = route.path.replace(/\/+$/, '')
  return clean === '' ? '/' : clean
})

const { data: page } = await useAsyncData(`docs-page:${path.value}`, () =>
  queryCollection('docs').path(path.value).first(),
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  ogTitle: () => page.value?.title,
  ogDescription: () => page.value?.description,
  ogType: 'article',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div v-if="page" class="flex gap-10">
    <article
      id="docs-content"
      class="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10 xl:max-w-4xl"
    >
      <header class="mb-8">
        <h1
          class="flex items-center gap-3 text-3xl font-semibold tracking-tight text-fg"
        >
          <DocsIcon
            v-if="page.icon"
            :name="page.icon"
            class="size-7 shrink-0 text-brand"
          />
          {{ page.title }}
        </h1>
        <p v-if="page.description" class="mt-3 text-lg text-fg-muted">
          {{ page.description }}
        </p>
      </header>

      <div class="docs-prose">
        <ContentRenderer :value="page" />
      </div>

      <DocsPagination />
    </article>

    <div class="hidden w-(--docs-toc-width) shrink-0 xl:block">
      <div class="docs-scroll sticky top-(--docs-header-height) max-h-[calc(100dvh-var(--docs-header-height))] overflow-y-auto py-10 pr-4">
        <DocsToc :links="page.body?.toc?.links" />
        <p class="mt-8 border-t border-line pt-4 text-xs text-fg-subtle">
          {{ t.poweredByScalar }}
        </p>
      </div>
    </div>
  </div>
</template>
