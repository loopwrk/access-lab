import { defineCollection, defineContentConfig, z } from "@nuxt/content";

/**
 * Nuxt Content collection registration.
 *
 * The Learn topics live as Markdown files under `content/learn/`. The
 * frontmatter carries:
 *   - `title`     — the article heading
 *   - `topicId`   — canonical id, also keys cross-links from the studio
 *   - `summary`   — short copy shown on the Learn index card
 *   - `category`  — grouping hint for the sidebar (optional)
 *   - `order`     — sort key for the Learn index (smaller = earlier)
 *   - `related`   — topicIds shown in the "Related topics" footer list
 *   - `concepts`  — closed-vocabulary tags used to relate articles to
 *     components in the studio's Learn picker. Validated against the
 *     same id list exported from `app/utils/learnConcepts.ts` —
 *     keep both lists in sync (adding to one without the other
 *     either fails Zod validation here or fails the type-check on
 *     the component side).
 */
export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "learn/**/*.md",
      schema: z.object({
        title: z.string(),
        topicId: z.string(),
        summary: z.string(),
        category: z
          .enum([
            "foundations",
            "accessible-names",
            "forms",
            "form-inputs",
            "buttons-with-state",
            "disclosure-and-menu",
          ])
          .optional(),
        order: z.number().optional(),
        related: z.array(z.string()).optional(),
        concepts: z
          .array(z.enum([
            "accessible-name",
            "button-element",
            "form-control",
            "form-context",
            "disabled-state",
            "aria-state",
            "disclosure-pattern",
            "menu-pattern",
            "native-elements",
          ]))
          .optional(),
      }),
    }),
  },
});
