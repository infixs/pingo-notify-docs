<script setup lang="ts">
const { t } = useDocs()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-line py-8">
    <div
      class="mx-auto flex max-w-[110rem] flex-col items-center justify-between gap-3 px-4 text-sm text-fg-muted sm:flex-row sm:px-6"
    >
      <p>© {{ year }} Pingo Notify. {{ t.footerRights }}</p>
      <div class="flex items-center gap-4">
        <a
          href="https://pingonotify.com"
          target="_blank"
          rel="noopener"
          class="transition hover:text-fg"
        >
          pingonotify.com
        </a>
        <span class="text-line">·</span>
        <span>{{ t.footerBuiltWith }}</span>
      </div>
    </div>
  </footer>
</template>
