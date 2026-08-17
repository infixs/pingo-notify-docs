<script setup lang="ts">
// `title` / `label` are read by the parent <Tabs> to build the tab strip.
defineProps<{ title?: string; label?: string }>()
</script>

<template>
  <div class="docs-prose prose-sm max-w-none py-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    <slot />
  </div>
</template>
