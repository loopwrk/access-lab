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
const { t } = useI18n();
const { groups } = useLearnTopicTree();
const { topics } = useLearnTopics();
const { open: openReadMode } = useReadMode();
const {
  activeComponentName,
  activeLearnTopicId,
  activeRelevantConcepts,
} = useStudioToolbar();

/**
 * Pinned articles, ordered: primary first (if set and resolvable),
 * then concept-matched articles by overlap-count desc, with
 * category/order as the stable tiebreaker. Duplicates removed.
 */
const pinnedTopics = computed(() => {
  const byId = new Map(topics.value.map((topic) => [topic.id, topic]));
  const componentConcepts = new Set(activeRelevantConcepts.value);
  const seen = new Set<string>();
  const pinned: typeof topics.value = [];

  // 1. Primary always wins the top spot regardless of concept overlap.
  //    Even if the primary article's concepts don't match the
  //    component's, the explicit declaration takes precedence.
  const primaryId = activeLearnTopicId.value;
  if (primaryId) {
    const primary = byId.get(primaryId);
    if (primary) {
      pinned.push(primary);
      seen.add(primary.id);
    }
  }

  // 2. Concept-matched articles. Compute overlap count per article,
  //    drop zero-overlap and already-seen, then sort by overlap desc.
  if (componentConcepts.size > 0) {
    const matched: { topic: typeof topics.value[number]; overlap: number }[] = [];
    for (const topic of topics.value) {
      if (seen.has(topic.id)) continue;
      const topicConcepts = topic.concepts ?? [];
      const overlap = topicConcepts.reduce(
        (sum, c) => sum + (componentConcepts.has(c) ? 1 : 0),
        0,
      );
      if (overlap > 0) matched.push({ topic, overlap });
    }
    // Stable sort: overlap desc, then by category order + topic
    // order so ties resolve predictably (and identically across
    // re-renders / SSR).
    matched.sort((a, b) => b.overlap - a.overlap);
    for (const { topic } of matched) {
      pinned.push(topic);
      seen.add(topic.id);
    }
  }

  return pinned;
});

const pinnedHeading = computed(() =>
  t("learn.pinnedForComponent", { component: activeComponentName.value ?? "" }),
);

// Shared classes for the topic cards. Lifted to a const so the pinned
// section and the categorised sections can't drift; same styling, both
// places.
const topicCardClass
  = "w-full flex items-center justify-between gap-3 px-3 py-2.5 "
    + "bg-(--surface) border border-(--border) rounded-lg cursor-pointer text-left "
    + "transition-[border-color,background-color] duration-150 [font:inherit] text-inherit "
    + "hover:border-(--brand) hover:bg-(--brand-soft) "
    + "focus-visible:border-(--brand) focus-visible:bg-(--brand-soft) "
    + "focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2";
</script>

<template>
  <nav
    class="flex flex-col gap-5 pb-4"
    :aria-label="t('learn.index.title')"
  >
    <!--
      Pinned section only renders when the active definition surfaces
      a primary topic and/or one or more concept tags that resolve
      to articles. Treated as a regular <section> with its own <h3>,
      so screen-reader heading navigation lands here first and the
      structural outline still makes sense.

      Brand-tinted background using `--brand-soft-2` (the lightest
      brand-scale tint), with a brand-accent border to anchor it
      visually. `--brand-soft-2` is intentionally subtler than
      `--brand-soft`, which the topic-card hover state uses — so
      hovering a card inside the section still produces a visible
      contrast change instead of blending into the section background.
    -->
    <section
      v-if="pinnedTopics.length"
      class="flex flex-col gap-2.5 py-3 px-3.5 bg-(--brand-soft-2) border border-[color-mix(in_oklch,var(--brand)_30%,transparent)] rounded-[10px]"
    >
      <h3
        class="m-0 flex items-center gap-1.5 text-(length:--al-font-size-body) font-semibold text-(--brand-press) leading-tight"
      >
        <UIcon
          name="i-lucide-pin"
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        <span>{{ pinnedHeading }}</span>
      </h3>
      <ul class="flex flex-col gap-1.5 list-none p-0 m-0">
        <li
          v-for="topic in pinnedTopics"
          :key="`pinned-${topic.id}`"
        >
          <button
            type="button"
            :class="topicCardClass"
            @click="openReadMode(topic.id)"
          >
            <span class="flex flex-col gap-[3px] min-w-0">
              <span class="text-(length:--al-font-size-body) font-semibold text-(--text-primary) leading-tight">{{
                topic.title }}</span>
              <span class="text-(length:--al-font-size-detail) text-(--text-secondary) leading-snug">{{ topic.summary
              }}</span>
            </span>
            <UIcon
              name="i-lucide-chevron-right"
              class="shrink-0 text-(--text-muted) text-(length:--al-font-size-heading)"
              aria-hidden="true"
            />
          </button>
        </li>
      </ul>
    </section>

    <section
      v-for="group in groups"
      :key="group.category.id"
      class="flex flex-col gap-2"
    >
      <!--
        h3 sits inside the inspector tab's region (which already has
        a heading-level role from the tab pattern), so h3 is the
        correct level for category subdivisions. Screen-reader users
        can jump between categories with the heading shortcut.

        Category headings: small caps, muted — distinct from the
        pinned heading so the hierarchy reads as "this special thing,
        then the library."
      -->
      <h3
        class="m-0 text-(length:--al-font-size-detail) font-semibold uppercase tracking-[0.06em] text-(--text-muted) leading-tight"
      >
        {{ t(group.category.titleKey) }}
      </h3>
      <ul class="flex flex-col gap-1.5 list-none p-0 m-0">
        <li
          v-for="topic in group.topics"
          :key="topic.id"
        >
          <!--
            Each topic is a styled <button> so the whole row is one
            focusable element, mimicking UCard's outline variant via
            tokens. <button> rather than <a>: clicking doesn't navigate
            via the URL bar — it calls the read-mode composable which
            stashes the studio path then pushes /learn/<id>. The button
            is the honest semantic for that action. The chevron is a
            visual affordance only (aria-hidden) — the title is the
            accessible name.
          -->
          <button
            type="button"
            :class="topicCardClass"
            @click="openReadMode(topic.id)"
          >
            <span class="flex flex-col gap-[3px] min-w-0">
              <span class="text-(length:--al-font-size-body) font-semibold text-(--text-primary) leading-tight">{{
                topic.title }}</span>
              <span class="text-(length:--al-font-size-detail) text-(--text-secondary) leading-snug">{{ topic.summary
              }}</span>
            </span>
            <UIcon
              name="i-lucide-chevron-right"
              class="shrink-0 text-(--text-muted) text-(length:--al-font-size-heading)"
              aria-hidden="true"
            />
          </button>
        </li>
      </ul>
    </section>
  </nav>
</template>
