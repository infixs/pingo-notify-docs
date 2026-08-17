<script setup lang="ts">
import { translatePath } from '~/config/navigation'

const { localeOptions, isReference, t } = useDocs()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

onClickOutsideEl(root, () => (open.value = false))

// Scalar navigates with raw `history.pushState`, which vue-router never sees,
// so inside the reference `route.path` is frozen at the URL the shell was
// entered on and `localeOptions` would send the reader back to the landing
// page. Resolve the counterpart from the live URL each time the menu opens, and
// leave the navigation to the browser (`:external`) — the other locale is a
// different Scalar configuration and document, so it needs a full load anyway.
const referencePath = ref('')

function toggle() {
  open.value = !open.value
  referencePath.value = open.value && isReference.value ? window.location.pathname : ''
}

const options = computed(() =>
  referencePath.value
    ? localeOptions.value.map((option) => ({
        ...option,
        to: translatePath(referencePath.value, option.locale),
      }))
    : localeOptions.value,
)
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-fg-muted transition hover:bg-accent hover:text-fg"
      :aria-label="t.language"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="toggle"
    >
      <Icon name="lucide:languages" mode="svg" class="size-4" />
      <span class="hidden sm:inline">{{
        options.find((option) => option.active)?.label
      }}</span>
      <Icon name="lucide:chevron-down" mode="svg" class="size-3.5 opacity-60" />
    </button>

    <div
      v-if="open"
      role="menu"
      class="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-elevated py-1 shadow-lg"
    >
      <NuxtLink
        v-for="option in options"
        :key="option.locale"
        :to="option.to"
        :external="isReference"
        role="menuitem"
        class="flex items-center gap-2.5 px-3 py-2 text-sm transition"
        :class="
          option.active
            ? 'bg-brand-soft font-medium text-brand-text'
            : 'text-fg-muted hover:bg-accent'
        "
        @click="open = false"
      >
        <span aria-hidden="true">{{ option.flag }}</span>
        <span>{{ option.label }}</span>
        <Icon v-if="option.active" name="lucide:check" mode="svg" class="ml-auto size-4" />
      </NuxtLink>
    </div>
  </div>
</template>
