<script lang="ts">
import { Comment, Fragment, Text, defineComponent, h, ref, type VNode } from 'vue'

/**
 * Port of the Mintlify `<Tabs>` / `<Tab title="…">` pair.
 *
 * The labels are read from the slot vnodes at render time (rather than through
 * child registration) so the very first server render already contains the
 * complete tab list — no hydration mismatch on the static build.
 */
function flatten(nodes: VNode[] = []): VNode[] {
  const out: VNode[] = []
  for (const node of nodes) {
    if (!node) continue
    if (node.type === Fragment) {
      out.push(...flatten((node.children as VNode[]) ?? []))
      continue
    }
    if (node.type === Comment) continue
    if (node.type === Text && !String(node.children ?? '').trim()) continue
    out.push(node)
  }
  return out
}

export default defineComponent({
  name: 'Tabs',
  setup(_props, { slots }) {
    const selected = ref(0)

    return () => {
      const items = flatten(slots.default?.() as VNode[])
      const active = Math.min(selected.value, Math.max(items.length - 1, 0))

      const labels = items.map(
        (node, index) =>
          (node.props?.title as string) ?? (node.props?.label as string) ?? `Tab ${index + 1}`,
      )

      return h(
        'div',
        {
          class:
            'not-prose my-6 overflow-hidden rounded-xl border border-line',
        },
        [
          h(
            'div',
            {
              class:
                'docs-scroll flex gap-1 overflow-x-auto border-b border-line bg-muted px-2',
              role: 'tablist',
            },
            labels.map((label, index) =>
              h(
                'button',
                {
                  key: index,
                  type: 'button',
                  role: 'tab',
                  'aria-selected': index === active,
                  class: [
                    'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition',
                    index === active
                      ? 'border-brand text-brand-text'
                      : 'border-transparent text-fg-muted hover:text-fg',
                  ],
                  onClick: () => (selected.value = index),
                },
                label,
              ),
            ),
          ),
          h(
            'div',
            { class: 'px-4' },
            items.map((node, index) =>
              h(
                'div',
                {
                  key: index,
                  role: 'tabpanel',
                  style: index === active ? undefined : { display: 'none' },
                },
                [node],
              ),
            ),
          ),
        ],
      )
    }
  },
})
</script>
