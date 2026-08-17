<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

interface SearchSection {
  id: string
  title: string
  titles: string[]
  content: string
  level: number
}

const { locale, t } = useDocs()
const router = useRouter()

const open = useState('docs-search-open', () => false)
const query = ref('')
const activeIndex = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const itemEls = ref<HTMLElement[]>([])
let lastFocused: HTMLElement | null = null

const { data: sections } = await useAsyncData('docs-search-sections', () =>
  queryCollectionSearchSections('docs', { ignoredTags: ['code', 'pre'] }),
)

const { meta } = await useDocsPages()

// A section id is `${path}#${anchor}`, so both the locale filter and the icon
// lookup have to run on the path half — a landing-page heading is `/en#…`.
function pagePath(id: string) {
  return id.split('#')[0] ?? ''
}

const scoped = computed<SearchSection[]>(() =>
  ((sections.value ?? []) as SearchSection[]).filter((section) => {
    const path = pagePath(section.id)
    return path === `/${locale.value}` || path.startsWith(`/${locale.value}/`)
  }),
)

function pageIcon(id: string) {
  return meta(pagePath(id))?.icon
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const results = computed(() => {
  const terms = normalize(query.value).split(/\s+/).filter(Boolean)
  if (!terms.length) return []

  return scoped.value
    .map((section) => {
      const title = normalize(section.title ?? '')
      const breadcrumb = normalize((section.titles ?? []).join(' '))
      const body = normalize(section.content ?? '')
      let score = 0

      for (const term of terms) {
        if (title.startsWith(term)) score += 12
        else if (title.includes(term)) score += 8
        else if (breadcrumb.includes(term)) score += 4
        else if (body.includes(term)) score += 2
        else return null
      }
      // Prefer page-level hits over deep headings.
      score += Math.max(0, 4 - (section.level ?? 1))
      return { section, score }
    })
    .filter((hit): hit is { section: SearchSection; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((hit) => hit.section)
})

watch(query, () => {
  activeIndex.value = 0
  itemEls.value = []
})

function setItemEl(el: Element | ComponentPublicInstance | null, index: number) {
  if (el) itemEls.value[index] = el as HTMLElement
}

// The list slices to 12 but the box only shows ~7, so the last hits would be
// selected off-screen.
watch(activeIndex, (index) => itemEls.value[index]?.scrollIntoView({ block: 'nearest' }))

function lockScroll(locked: boolean) {
  document.body.style.overflow = locked ? 'hidden' : ''
}

watch(open, async (value) => {
  if (!value) {
    lockScroll(false)
    lastFocused?.focus?.()
    lastFocused = null
    return
  }
  // Captured before the await — after `nextTick()` the input already has focus
  // and the header trigger we have to return to is gone.
  lastFocused = document.activeElement as HTMLElement | null
  query.value = ''
  activeIndex.value = 0
  itemEls.value = []
  lockScroll(true)
  await nextTick()
  inputEl.value?.focus()
})

function go(section?: SearchSection) {
  const target = section ?? results.value[activeIndex.value]
  if (!target) return
  open.value = false
  router.push(target.id)
}

// The panel is teleported to <body>, so nothing keeps Tab from walking into the
// page behind it; the results are `tabindex="-1"` options, so the ring is the
// input alone.
function trapFocus(event: KeyboardEvent) {
  const focusable = panelEl.value?.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable?.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value = !open.value
    return
  }
  if (!open.value) return
  if (event.key === 'Escape') {
    open.value = false
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    go()
  } else if (event.key === 'Tab') {
    trapFocus(event)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  // Unmounting while open would otherwise leave <body> unscrollable.
  lockScroll(false)
})

function excerpt(section: SearchSection) {
  const text = (section.content ?? '').replace(/\s+/g, ' ').trim()
  return text.length > 140 ? `${text.slice(0, 140)}…` : text
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-100 flex items-start justify-center bg-overlay px-4 pt-[10vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      :aria-label="t.search"
      @click.self="open = false"
    >
      <div
        ref="panelEl"
        class="w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-elevated shadow-2xl"
      >
        <div class="flex items-center gap-3 border-b border-line px-4">
          <Icon name="lucide:search" mode="svg" class="size-4.5 shrink-0 text-fg-subtle" />
          <input
            ref="inputEl"
            v-model="query"
            type="search"
            role="combobox"
            aria-controls="docs-search-results"
            aria-autocomplete="list"
            :aria-expanded="results.length > 0"
            :aria-activedescendant="results.length ? `docs-search-opt-${activeIndex}` : undefined"
            :placeholder="t.searchPlaceholder"
            class="w-full bg-transparent py-4 text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
          <kbd
            class="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-fg-subtle sm:block"
            >esc</kbd
          >
        </div>

        <div
          id="docs-search-results"
          role="listbox"
          :aria-label="t.search"
          class="docs-scroll max-h-[60vh] overflow-y-auto p-2"
        >
          <p v-if="!query" class="px-3 py-6 text-center text-sm text-fg-subtle">
            {{ t.searchHint }}
          </p>
          <p v-else-if="!results.length" class="px-3 py-6 text-center text-sm text-fg-subtle">
            {{ t.searchEmpty }}
          </p>
          <button
            v-for="(section, index) in results"
            :id="`docs-search-opt-${index}`"
            :key="section.id"
            :ref="(el) => setItemEl(el, index)"
            type="button"
            role="option"
            tabindex="-1"
            :aria-selected="index === activeIndex"
            class="block w-full rounded-lg px-3 py-2.5 text-left transition"
            :class="
              index === activeIndex
                ? 'bg-brand-soft'
                : 'hover:bg-accent'
            "
            @mouseenter="activeIndex = index"
            @click="go(section)"
          >
            <!-- The button itself stays `block`: made a flex container, the
                 three text spans would sit side by side. -->
            <span class="flex items-start gap-3">
              <DocsIcon
                v-if="pageIcon(section.id)"
                :name="pageIcon(section.id)"
                class="mt-0.5 size-4 shrink-0 text-fg-subtle"
              />
              <span class="min-w-0 flex-1">
                <span
                  v-if="section.titles?.length"
                  class="block text-[0.7rem] text-fg-subtle"
                >
                  {{ section.titles.join(' › ') }}
                </span>
                <span class="block text-sm font-medium text-fg">
                  {{ section.title }}
                </span>
                <span v-if="excerpt(section)" class="mt-0.5 block truncate text-xs text-fg-muted">
                  {{ excerpt(section) }}
                </span>
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
