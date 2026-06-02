/**
 * Learn-topic access layer.
 *
 * Wraps Nuxt Content's `queryCollection('content')` so the rest of the
 * app can read topics without thinking about query syntax. Replaces
 * the previous hardcoded array + per-topic Vue components — markdown
 * + ContentRenderer now own the article rendering, and frontmatter
 * owns the metadata.
 */

export type LearnTopicCategory
  = | 'foundations'
    | 'text-and-labels'
    | 'interaction'
    | 'visual'

/** Shape of a topic as it surfaces from the Content collection. */
export interface LearnTopic {
  id: string
  title: string
  summary: string
  category?: LearnTopicCategory
  order?: number
  related?: string[]
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
        .select('topicId', 'title', 'summary', 'category', 'order', 'related')
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
      related: d.related ?? []
    }))
  )

  return { topics }
}

/**
 * Fetch a single topic by id, body included. Used by both
 * LearnPanel's detail view and ReadModeOverlay.
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
