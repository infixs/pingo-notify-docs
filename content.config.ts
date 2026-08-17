import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * A single `docs` collection holds every language. The locale is the first
 * segment of the generated path (`/en/...`, `/pt-BR/...`), which mirrors the
 * folder layout inherited from the Mintlify sources.
 */
export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
        /** Hide the page from the sidebar without unpublishing it. */
        hidden: z.boolean().optional(),
      }),
    }),
  },
})
