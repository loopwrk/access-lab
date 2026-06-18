<script setup lang="ts">
/**
 * Learn-topic picker shown in the inspector. Pure navigation surface
 * - every topic is a button that opens the article in read mode
 * (`/learn/<topicId>`).
 *
 * Topics come from `useLearnTopicTree` / `useLearnTopics` - the
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
  activeRelatedLearnTopicIds,
} = useActiveComponent();

const pinnedTopics = computed(() => {
  const byId = new Map(topics.value.map((topic) => [topic.id, topic]));
  const seen = new Set<string>();
  const pinned: typeof topics.value = [];

  // 1. Primary always wins the top spot. No need to repeat
  //    the primary id in `relatedLearnTopicIds`; if they do, it's
  //    deduped here.
  const primaryId = activeLearnTopicId.value;
  if (primaryId) {
    const primary = byId.get(primaryId);
    if (primary) {
      pinned.push(primary);
      seen.add(primary.id);
    }
  }

  // 2. Curated related topics in declaration order. The author's
  //    intent is preserved literally - no re-sorting by category or
  //    overlap.
  for (const id of activeRelatedLearnTopicIds.value) {
    if (seen.has(id)) continue;
    const topic = byId.get(id);
    if (topic) {
      pinned.push(topic);
      seen.add(id);
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
      to articles.
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
