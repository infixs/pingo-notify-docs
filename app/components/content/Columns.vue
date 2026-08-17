<script setup lang="ts">
const props = withDefaults(defineProps<{ cols?: number | string }>(), { cols: 2 })

const columns = computed(() => {
  const value = Number(props.cols) || 2
  return Math.min(Math.max(value, 1), 4)
})

const GRID: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}
</script>

<template>
  <div class="not-prose my-6 grid gap-4" :class="GRID[columns]">
    <slot />
  </div>
</template>
