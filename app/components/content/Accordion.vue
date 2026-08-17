<script setup lang="ts">
withDefaults(
  defineProps<{ title?: string; icon?: string; defaultOpen?: boolean }>(),
  { defaultOpen: false },
)
</script>

<template>
  <details
    class="not-prose group my-3 overflow-hidden rounded-xl border border-line"
    :open="defaultOpen"
  >
    <summary
      class="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 text-sm font-medium text-fg transition hover:bg-accent"
    >
      <Icon
        name="lucide:chevron-right"
        mode="svg"
        class="size-4 shrink-0 text-fg-subtle transition group-open:rotate-90"
      />
      <DocsIcon v-if="icon" :name="icon" class="size-4 shrink-0 text-brand" />
      {{ title }}
    </summary>
    <div
      class="docs-prose prose-sm max-w-none border-t border-line px-4 py-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
    >
      <slot />
    </div>
  </details>
</template>
