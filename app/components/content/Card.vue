<script setup lang="ts">
/**
 * Port of the Mintlify `<Card>`. Accepts either `href` (original prop name) or
 * `to`; external URLs open in a new tab.
 */
const props = withDefaults(
  defineProps<{
    title?: string
    icon?: string
    href?: string
    to?: string
    horizontal?: boolean
    /** Accent colour: `green`, `red`, `amber`, `sky` or any CSS colour. */
    color?: string
    cta?: string
  }>(),
  { horizontal: false },
)

const target = computed(() => props.to || props.href)
const isExternal = computed(() => !!target.value && /^(https?:)?\/\//.test(target.value))

/** The colour names the Mintlify sources used, mapped onto the product tokens. */
const ACCENTS: Record<string, string> = {
  brand: 'text-brand',
  violet: 'text-brand',
  purple: 'text-brand',
  green: 'text-whatsapp',
  red: 'text-destructive',
  amber: 'text-warning',
  yellow: 'text-warning',
  sky: 'text-info',
  blue: 'text-info',
  slate: 'text-fg-muted',
  gray: 'text-fg-muted',
}

const accent = computed(
  () => ACCENTS[props.color ?? ''] ?? 'text-brand',
)

const component = computed(() => (target.value ? (isExternal.value ? 'a' : resolveComponent('NuxtLink')) : 'div'))

const linkAttrs = computed(() => {
  if (!target.value) return {}
  return isExternal.value
    ? { href: target.value, target: '_blank', rel: 'noopener' }
    : { to: target.value }
})
</script>

<template>
  <component
    :is="component"
    v-bind="linkAttrs"
    class="not-prose group block rounded-xl border border-line bg-elevated p-5 transition"
    :class="[
      target ? 'hover:border-brand hover:shadow-sm' : '',
      horizontal ? 'flex items-start gap-4' : '',
    ]"
  >
    <DocsIcon v-if="icon" :name="icon" class="size-5 shrink-0" :class="[accent, horizontal ? 'mt-0.5' : 'mb-3']" />

    <div class="min-w-0 flex-1">
      <p
        v-if="title"
        class="flex items-center gap-1.5 font-semibold text-fg"
      >
        {{ title }}
        <Icon
          v-if="target"
          name="lucide:arrow-right"
          mode="svg"
          class="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-60"
        />
      </p>
      <div
        class="docs-prose prose-sm mt-1 max-w-none text-fg-muted [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      >
        <slot />
      </div>
      <p v-if="cta" class="mt-3 text-sm font-medium" :class="accent">{{ cta }}</p>
    </div>
  </component>
</template>
