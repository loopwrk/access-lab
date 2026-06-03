export type LearnTopicCategory = LearnCategoryId

export interface LearnTopic {
  id: string
  title: string
  summary: string
  category?: LearnTopicCategory
  order?: number
  related?: string[]
  concepts?: LearnConceptId[]
}

export interface LearnTopicGroup {
  category: LearnCategory
  topics: LearnTopic[]
}

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
