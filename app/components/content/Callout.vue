<script setup lang="ts">
/**
 * Base for every admonition. `Note`, `Info`, `Warning`, `Tip`, `Check` and
 * `Danger` are thin wrappers, matching the component names used by the
 * original Mintlify sources.
 */
export type CalloutType = 'note' | 'info' | 'tip' | 'check' | 'warning' | 'danger'

const props = withDefaults(
  defineProps<{
    type?: CalloutType
    icon?: string
    title?: string
  }>(),
  { type: 'note' },
)

/**
 * Each variant tints one of the product's status tokens, so the whole set
 * flips with the theme without a single `dark:` variant.
 */
const STYLES: Record<CalloutType, { wrapper: string; icon: string; defaultIcon: string }> = {
  note: {
    wrapper: 'border-line bg-muted',
    icon: 'text-fg-muted',
    defaultIcon: 'circle-info',
  },
  info: {
    wrapper: 'border-info/30 bg-info/8',
    icon: 'text-info',
    defaultIcon: 'circle-info',
  },
  tip: {
    wrapper: 'border-brand/30 bg-brand/8',
    icon: 'text-brand',
    defaultIcon: 'lightbulb',
  },
  check: {
    wrapper: 'border-success/30 bg-success/8',
    icon: 'text-success',
    defaultIcon: 'circle-check',
  },
  warning: {
    wrapper: 'border-warning/35 bg-warning/10',
    icon: 'text-warning',
    defaultIcon: 'triangle-exclamation',
  },
  danger: {
    wrapper: 'border-destructive/30 bg-destructive/8',
    icon: 'text-destructive',
    defaultIcon: 'circle-exclamation',
  },
}

const style = computed(() => STYLES[props.type] ?? STYLES.note)
const iconName = computed(() => props.icon || style.value.defaultIcon)
</script>

<template>
  <div class="not-prose my-6 flex gap-3 rounded-xl border p-4" :class="style.wrapper">
    <DocsIcon :name="iconName" class="mt-0.5 size-4.5 shrink-0" :class="style.icon" />
    <div class="min-w-0 flex-1">
      <p v-if="title" class="mb-1 font-semibold text-fg">{{ title }}</p>
      <div class="docs-prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        <slot />
      </div>
    </div>
  </div>
</template>
