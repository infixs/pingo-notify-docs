export interface DocPageMeta {
  path: string
  title: string
  description?: string
  icon?: string
}

/**
 * Front matter of every Markdown page, fetched once and shared. The sidebar,
 * the breadcrumb and the prev/next footer all read their labels from here so
 * a title is never duplicated in the navigation config.
 */
export async function useDocsPages() {
  const { data } = await useAsyncData('docs-pages-meta', () =>
    queryCollection('docs').select('path', 'title', 'description', 'icon').all(),
  )

  const byPath = computed(() => {
    const map = new Map<string, DocPageMeta>()
    for (const page of (data.value ?? []) as DocPageMeta[]) {
      map.set(page.path, page)
    }
    return map
  })

  function meta(path: string): DocPageMeta | undefined {
    return byPath.value.get(path)
  }

  return { pages: data, byPath, meta }
}
