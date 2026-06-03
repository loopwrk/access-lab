<script setup lang="ts">
/**
 * Learn-topic picker shown in the inspector. Pure navigation surface
 * — every topic is a button that opens the article in read mode
 * (`/learn/<topicId>`). The panel itself no longer renders article
 * content; read mode is the single canonical reading surface.
 *
 * Layout: a "Relevant to <component>" pinned section at the top,
 * then the full topic library grouped by category below. Pinned
 * topics are duplicated in their original category by design — so
 * users who scroll the library don't lose track of which topics
 * were surfaced as relevant.
 *
 * Pinned-topic selection: the primary topic (when set) always pins
 * first, then articles whose `concepts` frontmatter intersects with
 * the active component's `relevantConcepts`, sorted by overlap
 * count descending so the most-relevant rises to the top.
 *
 * Topics come from `useLearnTopicTree` / `useLearnTopics` — the
 * same data source as the read-mode tree, so adding a topic in
 * markdown frontmatter shows up here automatically.
 */
const { t } = useI18n()
const { groups } = useLearnTopicTree()
const { topics } = useLearnTopics()
const { open: openReadMode } = useReadMode()
const {
  activeComponentName,
  activeLearnTopicId,
  activeRelevantConcepts
} = useStudioToolbar()

/**
 * Pinned articles, ordered: primary first (if set and resolvable),
 * then concept-matched articles by overlap-count desc, with
 * category/order as the stable tiebreaker. Duplicates removed.
 */
const pinnedTopics = computed(() => {
  const byId = new Map(topics.value.map(topic => [topic.id, topic]))
  const componentConcepts = new Set(activeRelevantConcepts.value)
  const seen = new Set<string>()
  const pinned: typeof topics.value = []

  // 1. Primary always wins the top spot regardless of concept overlap.
  //    Even if the primary article's concepts don't match the
  //    component's, the explicit declaration takes precedence.
  const primaryId = activeLearnTopicId.value
  if (primaryId) {
    const primary = byId.get(primaryId)
    if (primary) {
      pinned.push(primary)
      seen.add(primary.id)
    }
  }

  // 2. Concept-matched articles. Compute overlap count per article,
  //    drop zero-overlap and already-seen, then sort by overlap desc.
  if (componentConcepts.size > 0) {
    const matched: { topic: typeof topics.value[number], overlap: number }[] = []
    for (const topic of topics.value) {
      if (seen.has(topic.id)) continue
      const topicConcepts = topic.concepts ?? []
      const overlap = topicConcepts.reduce(
        (sum, c) => sum + (componentConcepts.has(c) ? 1 : 0),
        0
      )
      if (overlap > 0) matched.push({ topic, overlap })
    }
    // Stable sort: overlap desc, then by category order + topic
    // order so ties resolve predictably (and identically across
    // re-renders / SSR).
    matched.sort((a, b) => b.overlap - a.overlap)
    for (const { topic } of matched) {
      pinned.push(topic)
      seen.add(topic.id)
    }
  }

  return pinned
})

const pinnedHeading = computed(() =>
  t('learn.pinnedForComponent', { component: activeComponentName.value ?? '' })
)
</script>

<template>
  <nav class="flex flex-col gap-5 pb-4" :aria-label="t('learn.index.title')">
    <!--
      Pinned section only renders when the active definition surfaces
      a primary topic and/or one or more concept tags that resolve
      to articles. Treated as a regular <section> with its own <h3>,
      so screen-reader heading navigation lands here first and the
      structural outline still makes sense.
    -->
    <section v-if="pinnedTopics.length" class="learn-pinned-section">
      <h3 class="learn-pinned-heading m-0">
        <UIcon name="i-lucide-pin" class="size-4 shrink-0" aria-hidden="true" />
        <span>{{ pinnedHeading }}</span>
      </h3>
      <ul class="flex flex-col gap-1.5 list-none p-0 m-0">
        <li v-for="topic in pinnedTopics" :key="`pinned-${topic.id}`">
          <button type="button" class="learn-topic-card" @click="openReadMode(topic.id)">
            <span class="learn-topic-card-body">
              <span class="learn-topic-card-title">{{ topic.title }}</span>
              <span class="learn-topic-card-summary">{{ topic.summary }}</span>
            </span>
            <UIcon name="i-lucide-chevron-right" class="learn-topic-card-chevron shrink-0" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </section>

    <section v-for="group in groups" :key="group.category.id" class="flex flex-col gap-2">
      <!--
        h3 sits inside the inspector tab's region (which already has
        a heading-level role from the tab pattern), so h3 is the
        correct level for category subdivisions. Screen-reader users
        can jump between categories with the heading shortcut.
      -->
      <h3 class="learn-section-heading m-0">{{ t(group.category.titleKey) }}</h3>
      <ul class="flex flex-col gap-1.5 list-none p-0 m-0">
        <li v-for="topic in group.topics" :key="topic.id">
          <!--
            <button> rather than <a>: clicking doesn't navigate via
            the URL bar — it calls the read-mode composable which
            stashes the studio path then pushes /learn/<id>. The
            button is the honest semantic for that action.
          -->
          <button type="button" class="learn-topic-card" @click="openReadMode(topic.id)">
            <span class="learn-topic-card-body">
              <span class="learn-topic-card-title">{{ topic.title }}</span>
              <span class="learn-topic-card-summary">{{ topic.summary }}</span>
            </span>
            <UIcon name="i-lucide-chevron-right" class="learn-topic-card-chevron shrink-0" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </section>
  </nav>
</template>

<style scoped>
/*
 * Pinned section: brand-tinted background using `--brand-soft-2`
 * (the lightest brand-scale tint), with a brand-accent border to
 * anchor it visually. `--brand-soft-2` is intentionally subtler
 * than `--brand-soft`, which the topic-card hover state uses — so
 * hovering a card inside the section still produces a visible
 * contrast change instead of blending into the section background.
 */
.learn-pinned-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  background: var(--brand-soft-2);
  border: 1px solid color-mix(in oklch, var(--brand) 30%, transparent);
  border-radius: 10px;
}

.learn-pinned-heading {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--al-font-size-body);
  font-weight: 600;
  color: var(--brand-press);
  line-height: 1.3;
}

/*
 * Category headings: small caps, muted — distinct from the pinned
 * heading so the hierarchy reads as "this special thing, then the
 * library."
 */
.learn-section-heading {
  font-size: var(--al-font-size-detail);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  line-height: 1.3;
}

/*
 * Each topic is a styled <button> so the whole row is one focusable
 * element, mimicking UCard's outline variant via tokens. The chevron
 * is a visual affordance only (aria-hidden) — the title is the
 * accessible name.
 */
.learn-topic-card {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background-color 0.15s;
  font: inherit;
  color: inherit;
}

.learn-topic-card:hover,
.learn-topic-card:focus-visible {
  border-color: var(--brand);
  background: var(--brand-soft);
}

.learn-topic-card:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.learn-topic-card-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.learn-topic-card-title {
  font-size: var(--al-font-size-body);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.learn-topic-card-summary {
  font-size: var(--al-font-size-detail);
  color: var(--text-secondary);
  line-height: 1.4;
}

.learn-topic-card-chevron {
  color: var(--text-muted);
  font-size: var(--al-font-size-heading);
}
</style>
