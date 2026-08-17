<script setup lang="ts">
import { allContentPaths } from '~/config/navigation'
import { API_VERSIONS, type ApiVersion } from '~/config/scalar'

const { locale, version, path, t, isReference } = useDocs()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

onClickOutsideEl(root, () => (open.value = false))

// `allContentPaths` is synchronous on purpose: this component also mounts on
// the `ssr: false` reference layout, where awaiting `useDocsPages()` would turn
// it into an async component with no Suspense boundary around it.
const contentPaths = computed(() => allContentPaths(locale.value))

/** `authentication` and `webhooks` exist in both versions — keep the page. */
function docsPath(value: ApiVersion) {
  const index = `/${locale.value}/api-reference/${value}`
  const slug = path.value.match(/\/api-reference\/v\d\/(.+)$/)?.[1]
  const target = slug ? `${index}/${slug}` : index
  return contentPaths.value.includes(target) ? target : index
}

/** Stay in the same kind of page (prose vs. explorer) when switching version. */
const options = computed(() =>
  API_VERSIONS.map((value) => ({
    value,
    to: isReference.value ? `/${locale.value}/reference/${value}` : docsPath(value),
    active: value === version.value,
  })),
)
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-fg-muted transition hover:border-brand/40 hover:text-fg"
      :aria-label="t.apiVersion"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="uppercase">{{ version }}</span>
      <Icon name="lucide:chevron-down" mode="svg" class="size-3 opacity-60" />
    </button>

    <div
      v-if="open"
      role="menu"
      class="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-elevated py-1 shadow-lg"
    >
      <p
        class="px-3 py-1.5 text-[0.7rem] font-semibold tracking-wide text-fg-subtle uppercase"
      >
        {{ t.apiVersion }}
      </p>
      <NuxtLink
        v-for="option in options"
        :key="option.value"
        :to="option.to"
        role="menuitem"
        class="flex items-center gap-2 px-3 py-2 text-sm transition"
        :class="
          option.active
            ? 'bg-brand-soft font-medium text-brand-text'
            : 'text-fg-muted hover:bg-accent'
        "
        @click="open = false"
      >
        <span class="uppercase">{{ option.value }}</span>
        <Icon v-if="option.active" name="lucide:check" mode="svg" class="ml-auto size-4" />
      </NuxtLink>
    </div>
  </div>
</template>
