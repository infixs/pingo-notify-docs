<script setup lang="ts">
defineProps<{ icon?: string; title?: string }>()
</script>

<template>
  <Callout type="info" :icon="icon" :title="title">
    <slot />
  </Callout>
</template>
