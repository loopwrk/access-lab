import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * Nuxt Content collection registration.
 *
 * The Learn topics live as Markdown files under `content/learn/`. The
 * frontmatter carries the topic's title, the canonical `topicId` (which
 * matches the in-app Learn-topic registry id), and a short summary
 * shown in the Learn index. The body is plain Markdown rendered by
 * ContentRenderer with the `prose` prop.
 */
export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: 'learn/**/*.md',
      schema: z.object({
        title: z.string(),
        topicId: z.string(),
        summary: z.string()
      })
    })
  }
})
