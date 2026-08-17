import type { Ref } from 'vue'

/** Closes popovers when the reader clicks anywhere outside of them. */
export function onClickOutsideEl(target: Ref<HTMLElement | null>, handler: () => void) {
  if (!import.meta.client) return

  const listener = (event: MouseEvent) => {
    const el = target.value
    if (!el) return
    if (event.target instanceof Node && !el.contains(event.target)) handler()
  }

  onMounted(() => document.addEventListener('click', listener, true))
  onBeforeUnmount(() => document.removeEventListener('click', listener, true))
}
