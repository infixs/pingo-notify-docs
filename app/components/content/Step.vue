<script setup lang="ts">
defineProps<{ title?: string; icon?: string }>()
</script>

<template>
  <div class="docs-step relative pb-1 pl-11">
    <span
      class="docs-step__marker absolute top-0 left-0 flex size-8 items-center justify-center rounded-full border border-brand/30 bg-brand-soft text-sm font-semibold text-brand-text"
      aria-hidden="true"
    >
      <DocsIcon v-if="icon" :name="icon" class="size-4" />
    </span>

    <p v-if="title" class="mb-2 pt-1 font-semibold text-fg">
      {{ title }}
    </p>
    <div class="docs-prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.docs-step {
  counter-increment: docs-step;
}

.docs-step__marker:not(:has(svg))::before {
  content: counter(docs-step);
}
</style>
