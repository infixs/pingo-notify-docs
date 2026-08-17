<script setup lang="ts">
import { resolveIcon } from '~/config/icons'

const props = defineProps<{ name?: string | null }>()

const resolved = computed(() => resolveIcon(props.name))
</script>

<template>
  <Icon :name="resolved" mode="svg" />
</template>
