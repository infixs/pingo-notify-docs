<script setup lang="ts">
/** Wraps a screenshot with an optional caption, like the Mintlify `<Frame>`. */
defineProps<{ caption?: string; center?: boolean }>()
</script>

<template>
  <figure class="not-prose my-6" :class="center ? 'mx-auto flex flex-col items-center' : ''">
    <div
      class="overflow-hidden rounded-xl border border-line bg-muted [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_p]:m-0"
      :class="center ? 'grid place-items-center' : ''"
    >
      <slot />
    </div>
    <figcaption v-if="caption" class="mt-2 text-center text-sm text-fg-muted">
      {{ caption }}
    </figcaption>
  </figure>
</template>
