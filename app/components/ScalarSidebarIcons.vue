<script setup lang="ts">
import { API_SECTIONS, TAG_DISPLAY_NAMES, TAG_ICONS } from '~/config/api-sections'

/**
 * Puts a section icon in front of each group and tag in Scalar's own sidebar.
 *
 * Scalar has no per-tag icon extension (`x-scalar-icon` only exists at document
 * level), so the icons are rendered here by the site's normal icon pipeline
 * into a hidden template and then cloned into place, keyed by the label text.
 * A MutationObserver re-applies them when Scalar re-renders.
 *
 * This is progressive enhancement: if Scalar's markup ever changes, nothing
 * matches and the sidebar simply renders without icons.
 */
const { locale, version } = useDocs()

/** label → icon, for both the group rows and the tag rows inside them. */
const iconByLabel = computed(() => {
  const map = new Map<string, string>()
  const displayNames = TAG_DISPLAY_NAMES[locale.value] ?? {}

  for (const section of API_SECTIONS[version.value]) {
    map.set(section.label[locale.value], section.icon)
    for (const tag of section.tags) {
      map.set(displayNames[tag] ?? tag, TAG_ICONS[tag] ?? section.icon)
    }
  }
  return map
})

const entries = computed(() => [...iconByLabel.value.entries()].map(([label, icon]) => ({ label, icon })))

const source = ref<HTMLElement | null>(null)
let observer: MutationObserver | null = null

const MARKER = 'data-pn-icon'

function decorate() {
  const template = source.value
  if (!template) return

  for (const label of document.querySelectorAll<HTMLElement>('[class*="group/button-label"]')) {
    if (label.hasAttribute(MARKER)) continue

    const text = (label.textContent ?? '').trim()
    const icon = template.querySelector<HTMLElement>(`[data-label="${CSS.escape(text)}"] svg`)
    if (!icon) continue

    const clone = icon.cloneNode(true) as SVGElement
    clone.classList.add('pn-scalar-icon')
    label.setAttribute(MARKER, '')
    label.prepend(clone)
  }
}

onMounted(() => {
  nextTick(decorate)
  observer = new MutationObserver(() => requestAnimationFrame(decorate))
  observer.observe(document.body, { childList: true, subtree: true })
})

watch([locale, version], () => {
  for (const label of document.querySelectorAll(`[${MARKER}]`)) {
    label.removeAttribute(MARKER)
    label.querySelector('.pn-scalar-icon')?.remove()
  }
  nextTick(decorate)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="source" class="hidden" aria-hidden="true">
    <span v-for="entry in entries" :key="entry.label" :data-label="entry.label">
      <DocsIcon :name="entry.icon" />
    </span>
  </div>
</template>

<style>
/* Scoped styles would not survive the clone into Scalar's tree. */
.pn-scalar-icon {
  display: inline-block;
  width: 0.95em;
  height: 0.95em;
  margin-right: 0.5em;
  vertical-align: -0.14em;
  opacity: 0.65;
  flex-shrink: 0;
}
</style>
