<script setup lang="ts">
const { locale, tabs, activeTab, isReference, t, cta } = useDocs()
const sidebarOpen = useState('docs-sidebar-open', () => false)
const searchOpen = useState('docs-search-open', () => false)
</script>

<template>
  <header
    class="sticky top-0 z-50 h-(--docs-header-height) border-b border-line bg-bg/85 backdrop-blur-md"
  >
    <div class="mx-auto flex h-full max-w-[110rem] items-center gap-3 px-4 sm:px-6">
      <!-- Only the docs layout renders <AppSidebar>; on the reference this would
           toggle a state nothing listens to. -->
      <button
        v-if="!isReference"
        type="button"
        class="-ml-1 inline-flex size-9 items-center justify-center rounded-lg text-fg-muted transition hover:bg-accent lg:hidden"
        :aria-label="sidebarOpen ? t.closeMenu : t.openMenu"
        @click="sidebarOpen = !sidebarOpen"
      >
        <Icon :name="sidebarOpen ? 'lucide:x' : 'lucide:menu'" mode="svg" class="size-5" />
      </button>

      <NuxtLink :to="`/${locale}`" class="flex shrink-0 items-center gap-2" aria-label="Pingo Notify">
        <img src="/logo/light.svg" alt="Pingo Notify" class="h-7 w-auto dark:hidden" />
        <img src="/logo/dark.svg" alt="Pingo Notify" class="hidden h-7 w-auto dark:block" />
      </NuxtLink>

      <!-- Scalar owns the whole viewport on the reference, so this strip is the
           only way back to the guides — it stays visible at every width there. -->
      <nav
        class="ml-4 items-center gap-1"
        :class="isReference ? 'flex' : 'hidden md:flex'"
        aria-label="Sections"
      >
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="tab.home"
          :title="tab.id === 'docs' ? t.backToDocs : t.openReference"
          class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="
            tab.id === activeTab
              ? 'bg-brand-soft text-brand-text'
              : 'text-fg-muted hover:bg-accent hover:text-fg'
          "
        >
          <DocsIcon :name="tab.icon" class="size-4" />
          {{ tab.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-1.5">
        <!-- Scalar owns the search on the reference pages. -->
        <button
          v-if="!isReference"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-line py-1.5 pr-2 pl-2.5 text-sm text-fg-muted transition hover:border-brand/40 hover:text-fg"
          :aria-label="t.search"
          @click="searchOpen = true"
        >
          <Icon name="lucide:search" mode="svg" class="size-4" />
          <span class="hidden w-28 text-left lg:inline">{{ t.search }}</span>
          <kbd
            class="hidden rounded border border-line px-1.5 font-mono text-[0.7rem] lg:block"
            >⌘K</kbd
          >
        </button>

        <VersionSwitcher v-if="activeTab === 'api'" />
        <LocaleSwitcher />
        <ThemeToggle />

        <a
          :href="cta.href"
          target="_blank"
          rel="noopener"
          class="ml-1 hidden rounded-lg bg-brand-solid px-3.5 py-2 text-sm font-medium text-brand-fg transition hover:bg-brand-hover sm:inline-flex"
        >
          {{ cta.label }}
        </a>
      </div>
    </div>
  </header>
</template>
