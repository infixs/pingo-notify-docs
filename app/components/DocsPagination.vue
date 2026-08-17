<script setup lang="ts">
import type { NavEntry } from '~/config/navigation'

const { currentTab, path, t } = useDocs()
const { meta } = await useDocsPages()

/** Flatten the active tab into a reading order, skipping the Scalar entries. */
const sequence = computed<NavEntry[]>(() =>
  currentTab.value.groups.flatMap((group) => group.entries).filter((entry) => !entry.scalar),
)

const index = computed(() => sequence.value.findIndex((entry) => entry.path === path.value))

const previous = computed(() => (index.value > 0 ? sequence.value[index.value - 1] : undefined))
const next = computed(() =>
  index.value >= 0 && index.value < sequence.value.length - 1
    ? sequence.value[index.value + 1]
    : undefined,
)

function title(entry?: NavEntry) {
  return entry ? (meta(entry.path)?.title ?? entry.label ?? entry.path) : ''
}
</script>

<template>
  <nav
    v-if="previous || next"
    class="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
  >
    <NuxtLink
      v-if="previous"
      :to="previous.path"
      class="group flex flex-col gap-1 rounded-xl border border-line p-4 transition hover:border-brand"
    >
      <span class="flex items-center gap-1.5 text-xs text-fg-subtle">
        <Icon name="lucide:chevron-left" mode="svg" class="size-3.5" />
        {{ t.previous }}
      </span>
      <span
        class="font-medium text-fg group-hover:text-brand-text"
      >
        {{ title(previous) }}
      </span>
    </NuxtLink>
    <span v-else class="hidden sm:block" />

    <NuxtLink
      v-if="next"
      :to="next.path"
      class="group flex flex-col items-end gap-1 rounded-xl border border-line p-4 text-right transition hover:border-brand sm:col-start-2"
    >
      <span class="flex items-center gap-1.5 text-xs text-fg-subtle">
        {{ t.next }}
        <Icon name="lucide:chevron-right" mode="svg" class="size-3.5" />
      </span>
      <span
        class="font-medium text-fg group-hover:text-brand-text"
      >
        {{ title(next) }}
      </span>
    </NuxtLink>
  </nav>
</template>
