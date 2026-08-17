<script setup lang="ts">
// The pre-paint color mode script is registered in `nuxt.config.ts`, not here:
// the `ssr: false` reference shells never render `app.vue` on the server.
useHead({
  titleTemplate: (title) => (title ? `${title} · Pingo Notify` : 'Pingo Notify Docs'),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
