<script setup lang="ts">
import type { NavEntry } from '~/config/navigation'

const { currentTab, tabs, route, t } = useDocs()
const { meta } = await useDocsPages()
const sidebarOpen = useState('docs-sidebar-open', () => false)

function label(entry: NavEntry): string {
  return meta(entry.path)?.title ?? entry.label ?? entry.path
}

function icon(entry: NavEntry): string | undefined {
  return entry.icon ?? meta(entry.path)?.icon
}

// `public/_redirects` serves `/en/connections/` without stripping the trailing
// slash, and no path in `navigation.ts` carries one — compare them normalised
// or the page renders with nothing highlighted.
const path = computed(() => route.path.replace(/\/$/, '') || '/')

function isActive(entry: NavEntry): boolean {
  if (entry.exact) return path.value === entry.path
  if (entry.scalar) return (entry.match ?? [entry.path]).some((p) => path.value.startsWith(p))
  return path.value === entry.path
}

watch(() => route.fullPath, () => (sidebarOpen.value = false))
</script>

<template>
  <!-- Mobile scrim -->
  <div
    v-if="sidebarOpen"
    class="fixed inset-0 z-40 bg-overlay backdrop-blur-sm lg:hidden"
    @click="sidebarOpen = false"
  />

  <!-- `invisible` takes the closed drawer out of the tab order; the transform
       alone leaves every link focusable off-screen. -->
  <aside
    class="fixed inset-y-0 left-0 z-45 w-(--docs-sidebar-width) shrink-0 border-r border-line bg-elevated transition-[transform,visibility] lg:sticky lg:top-(--docs-header-height) lg:z-auto lg:h-[calc(100dvh-var(--docs-header-height))] lg:translate-x-0 lg:bg-transparent"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full invisible lg:visible'"
    :aria-label="t.navigation"
  >
    <div class="docs-scroll h-full overflow-y-auto px-4 pt-(--docs-header-height) pb-12 lg:pt-8">
      <!-- Tab switcher, mobile only (the header hides it below md) -->
      <nav class="mb-6 flex gap-1 md:hidden">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="tab.home"
          class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="
            tab.id === currentTab.id
              ? 'bg-brand-soft text-brand-text'
              : 'text-fg-muted hover:bg-accent'
          "
        >
          <DocsIcon :name="tab.icon" class="size-4 shrink-0" />
          {{ tab.label }}
        </NuxtLink>
      </nav>

      <nav class="space-y-7">
        <div v-for="group in currentTab.groups" :key="group.label">
          <p
            class="mb-2 flex items-center gap-2.5 px-3 text-[0.7rem] font-semibold tracking-wider text-fg-subtle uppercase"
          >
            <DocsIcon :name="group.icon" class="size-3.5 shrink-0 opacity-70" />
            {{ group.label }}
          </p>
          <ul class="space-y-0.5">
            <li v-for="entry in group.entries" :key="entry.path">
              <NuxtLink
                :to="entry.path"
                class="group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition"
                :class="
                  isActive(entry)
                    ? 'bg-brand-soft font-medium text-brand-text'
                    : 'text-fg-muted hover:bg-accent hover:text-fg'
                "
              >
                <DocsIcon
                  v-if="icon(entry)"
                  :name="icon(entry)"
                  class="size-3.5 shrink-0 opacity-70"
                />
                <span class="truncate">{{ label(entry) }}</span>
                <Icon
                  v-if="entry.scalar"
                  name="lucide:arrow-up-right"
                  mode="svg"
                  class="ml-auto size-3.5 shrink-0 opacity-50"
                />
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </aside>
</template>
