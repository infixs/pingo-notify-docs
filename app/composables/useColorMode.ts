export type ColorMode = 'light' | 'dark'

const STORAGE_KEY = 'pingo-docs-color-mode'
/** Scalar reads this key and these body classes for its own theme. */
const SCALAR_STORAGE_KEY = 'colorMode'

/**
 * Minimal class-based color mode, shared with the Scalar reference so one
 * switch drives both. The initial value is applied before paint by the inline
 * script in `app/config/color-mode-boot.ts`, so there is no flash on the
 * static build.
 */
export function useColorMode() {
  const mode = useState<ColorMode>('docs-color-mode', () => 'light')

  function paint(next: ColorMode) {
    const dark = next === 'dark'
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dataset.theme = next
    document.body.classList.toggle('dark-mode', dark)
    document.body.classList.toggle('light-mode', !dark)
  }

  function persist(next: ColorMode) {
    try {
      localStorage.setItem(STORAGE_KEY, next)
      localStorage.setItem(SCALAR_STORAGE_KEY, next)
    } catch {
      // Private mode / storage disabled — the choice just will not persist.
    }
  }

  function apply(next: ColorMode) {
    mode.value = next
    if (!import.meta.client) return
    paint(next)
    persist(next)
  }

  onMounted(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      stored = null
    }
    const resolved: ColorMode =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'

    mode.value = resolved
    // Deliberately not persisted: writing the resolved value back would pin an
    // untouched install to whatever the OS said on the first visit, and
    // `matchMedia` would never be consulted again. Only `toggle()` persists.
    paint(resolved)
  })

  function toggle() {
    apply(mode.value === 'dark' ? 'light' : 'dark')
  }

  return { mode, toggle, apply }
}
