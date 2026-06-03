/**
 * Learn-topic access layer.
 *
 * Wraps Nuxt Content's `queryCollection('content')` so the rest of the
 * app can read topics without thinking about query syntax. Replaces
 * the previous hardcoded array + per-topic Vue components — markdown
 * + ContentRenderer now own the article rendering, and frontmatter
 * owns the metadata.
 */

/**
 * Re-exported from `learnCategories` so consumers of this composable
 * have a single place to import topic + category types from.
 */
export type LearnTopicCategory = LearnCategoryId

/** Shape of a topic as it surfaces from the Content collection. */
export interface LearnTopic {
  id: string
  title: string
  summary: string
  category?: LearnTopicCategory
  order?: number
  related?: string[]
  /**
   * Closed-vocabulary tags declared by the article. Used by the
   * studio's Learn picker to intersect with the active component's
   * `relevantConcepts` for the "Relevant to <component>" pinned
   * section. Empty / undefined means the article isn't pinned for
   * any component but still appears in its category in the library.
   */
  concepts?: LearnConceptId[]
}

/**
 * Topic group keyed by category, used to render the Learn tree.
 */
export interface LearnTopicGroup {
  category: LearnCategory
  topics: LearnTopic[]
}

/**
 * Reactive list of every learn topic, sorted by `order` ascending.
 * Use this in the Learn index to render the topic cards.
 */
export function useLearnTopics() {
  const { data } = useAsyncData(
    'learn-topics-index',
    () =>
      queryCollection('content')
        .select('topicId', 'title', 'summary', 'category', 'order', 'related', 'concepts')
        .order('order', 'ASC')
        .all()
  )

  const topics = computed<LearnTopic[]>(() =>
    (data.value ?? []).map(d => ({
      id: d.topicId,
      title: d.title,
      summary: d.summary,
      category: d.category as LearnTopicCategory | undefined,
      order: d.order ?? undefined,
      related: d.related ?? [],
      concepts: (d.concepts ?? []) as LearnConceptId[]
    }))
  )

  return { topics }
}

/**
 * Fetch a single topic by id, body included. Used by both the
 * inspector's LearnPanel detail view and the standalone
 * `/learn/<topicId>` route.
 *
 * Static `useAsyncData` key + `watch: [id]` so the handler refetches
 * when the topic id changes (per-id caching would require a reactive
 * key, which `useAsyncData` doesn't support — only a static string).
 */
export function useLearnTopic(topicId: MaybeRefOrGetter<string | null | undefined>) {
  const id = computed(() => toValue(topicId))

  const { data, status } = useAsyncData(
    'learn-topic-detail',
    () => {
      const value = id.value
      if (!value) return Promise.resolve(null)
      return queryCollection('content').where('topicId', '=', value).first()
    },
    { watch: [id] }
  )

  return { doc: data, status }
}

/**
 * Reactive tree of topics grouped by category, in the order defined
 * by `LEARN_CATEGORIES`. Topics within each group are sorted by
 * their `order` field. Empty categories are dropped so the consumer
 * can render the result without filtering.
 */
export function useLearnTopicTree() {
  const { topics } = useLearnTopics()

  const groups = computed<LearnTopicGroup[]>(() =>
    LEARN_CATEGORIES
      .map(category => ({
        category,
        topics: topics.value
          .filter(t => t.category === category.id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      }))
      .filter(group => group.topics.length > 0)
  )

  return { groups }
}
