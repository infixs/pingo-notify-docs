<script setup lang="ts">
interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

const props = defineProps<{ links?: TocLink[] }>()

const { t } = useDocs()
const activeId = ref<string>('')

const flat = computed<TocLink[]>(() => {
  const out: TocLink[] = []
  const walk = (links: TocLink[] = []) => {
    for (const link of links) {
      out.push(link)
      if (link.children?.length) walk(link.children)
    }
  }
  walk(props.links ?? [])
  return out.filter((link) => link.depth <= 3)
})

// With `rootMargin: '-70%'` nothing intersects before the first scroll on a
// short viewport, so the first heading stands in until the observer speaks.
const currentId = computed(() => activeId.value || flat.value[0]?.id)

let observer: IntersectionObserver | null = null

function observe() {
  observer?.disconnect()
  if (!flat.value.length) return

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]?.target.id) activeId.value = visible[0].target.id
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
  )

  for (const link of flat.value) {
    const el = document.getElementById(link.id)
    if (el) observer.observe(el)
  }
}

onMounted(() => nextTick(observe))
watch(flat, () => nextTick(observe))
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav v-if="flat.length" :aria-label="t.onThisPage" class="text-sm">
    <p
      class="mb-3 text-[0.7rem] font-semibold tracking-wider text-fg-subtle uppercase"
    >
      {{ t.onThisPage }}
    </p>
    <ul class="space-y-1 border-l border-line">
      <li v-for="link in flat" :key="link.id">
        <a
          :href="`#${link.id}`"
          :aria-current="currentId === link.id ? 'location' : undefined"
          class="-ml-px block border-l py-1 transition"
          :class="[
            link.depth >= 3 ? 'pl-6' : 'pl-4',
            currentId === link.id
              ? 'border-brand font-medium text-brand-text'
              : 'border-transparent text-fg-muted hover:border-brand/40 hover:text-fg',
          ]"
        >
          {{ link.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
