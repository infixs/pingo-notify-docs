<template>
  <!-- Numbering is done with a CSS counter so it survives SSR without any
       parent/child registration. -->
  <div class="not-prose docs-steps my-6 space-y-6">
    <slot />
  </div>
</template>

<style scoped>
.docs-steps {
  counter-reset: docs-step;
}
</style>
