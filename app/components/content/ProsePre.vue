<script setup lang="ts">
/**
 * Overrides Nuxt Content's default `<pre>` so code blocks get the language
 * badge, an optional filename and a copy button — the affordances the Mintlify
 * theme provided.
 */
const props = defineProps<{
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: number[]
  meta?: string | null
  class?: string | null
}>()

const { t } = useDocs()
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

async function copy() {
  if (!props.code) return
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 1600)
  } catch {
    // Clipboard blocked (insecure context) — leave the button silent.
  }
}

onBeforeUnmount(() => timer && clearTimeout(timer))
</script>

<template>
  <div class="not-prose group relative my-6">
    <div
      v-if="filename"
      class="flex items-center gap-2 rounded-t-xl border border-b-0 border-line bg-accent px-4 py-2 font-mono text-xs text-fg-muted"
    >
      {{ filename }}
    </div>

    <pre
      :class="[
        props.class,
        'docs-scroll overflow-x-auto border border-line bg-muted p-4 font-mono text-sm leading-relaxed',
        filename ? 'rounded-b-xl' : 'rounded-xl',
      ]"
    ><slot /></pre>

    <div class="absolute top-2 right-2 flex items-center gap-2" :class="filename ? 'top-11' : ''">
      <span
        v-if="language"
        class="rounded bg-elevated/85 px-1.5 py-0.5 font-mono text-[0.65rem] tracking-wide text-fg-subtle uppercase opacity-0 transition group-hover:opacity-100"
      >
        {{ language }}
      </span>
      <button
        type="button"
        class="inline-flex size-7 items-center justify-center rounded-md border border-line bg-elevated/85 text-fg-muted opacity-0 transition group-hover:opacity-100 hover:text-fg focus:opacity-100"
        :aria-label="copied ? t.copied : t.copy"
        :title="copied ? t.copied : t.copy"
        @click="copy"
      >
        <Icon
          :name="copied ? 'lucide:check' : 'lucide:copy'"
          mode="svg"
          class="size-3.5"
          :class="copied ? 'text-brand' : ''"
        />
      </button>
    </div>
  </div>
</template>
