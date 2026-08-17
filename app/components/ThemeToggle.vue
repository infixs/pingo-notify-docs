<script setup lang="ts">
const { mode, toggle } = useColorMode()
const { t } = useDocs()
</script>

<template>
  <button
    type="button"
    class="inline-flex size-9 items-center justify-center rounded-lg text-fg-muted transition hover:bg-accent hover:text-fg"
    :aria-label="t.toggleTheme"
    :title="t.toggleTheme"
    @click="toggle"
  >
    <Icon v-if="mode === 'dark'" name="lucide:sun" mode="svg" class="size-4.5" />
    <Icon v-else name="lucide:moon" mode="svg" class="size-4.5" />
  </button>
</template>
