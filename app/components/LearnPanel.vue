<script setup lang="ts">
/**
 * Learn-topic picker shown in the inspector. Pure navigation surface
 * — every topic is a button that opens the article in read mode
 * (`/learn/<topicId>`). The panel itself no longer renders article
 * content; read mode is the single canonical reading surface.
 *
 * Layout choice: Option 3 from the design exploration — always-
 * visible sectioned list. Topics are grouped under category
 * headings so AT users can jump between categories by heading
 * navigation, and pointer users get the full IA at a glance.
 *
 * Categories come from `useLearnTopicTree`, which is the same data
 * source as the read-mode tree — so a topic added to a markdown
 * file's frontmatter shows up in both surfaces with no extra wiring.
 */
const { t } = useI18n()
const { groups } = useLearnTopicTree()
const { open: openReadMode } = useReadMode()
</script>

<template>
  <nav class="flex flex-col gap-5 pb-4" :aria-label="t('learn.index.title')">
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
            (Right-click "open in new tab" isn't meaningful here
            since there's no shareable href to mirror; the read-mode
            URL is reached through the composable.)
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
