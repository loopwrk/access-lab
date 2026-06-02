<script setup lang="ts">
const { t } = useI18n()
const { activeLearnTopic, focusLearnTopic, clearLearnTopic } = useInspectorTab()
// `open()` stashes the current studio path before navigating to
// `/learn/<id>`, so the layout's close button can put the user back
// where they were. Same call shape as before — only the navigation
// target changed (overlay → real route).
const { open: openReadMode } = useReadMode()

const { topics } = useLearnTopics()
const { doc, status } = useLearnTopic(activeLearnTopic)

// Quick lookup for the related-topics footer — we want titles, not
// just ids, and the index query already has them all.
const topicTitles = computed(() =>
  Object.fromEntries((topics.value ?? []).map(t => [t.id, t.title]))
)

const relatedTopics = computed(() =>
  (doc.value?.related ?? [])
    .map(id => ({ id, title: topicTitles.value[id] }))
    .filter(item => item.title)
)
</script>

<template>
  <!-- Detail: single topic article -->
  <div v-if="activeLearnTopic" class="flex flex-col gap-4 pb-4">
    <div class="flex items-center justify-between gap-2">
      <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-chevron-left" class="-ml-2"
        @click="clearLearnTopic">
        {{ t('learn.backToTopics') }}
      </UButton>
      <UButton v-if="doc" variant="soft" color="primary" size="sm" icon="i-lucide-book-open"
        @click="openReadMode(activeLearnTopic)">
        {{ t('learn.readMode.button') }}
      </UButton>
    </div>

    <div v-if="status === 'pending'" class="flex items-center justify-center gap-2 py-8">
      <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-(--text-muted)" aria-hidden="true" />
      <span class="sr-only">{{ t('learn.readMode.loading') }}</span>
    </div>

    <div v-else-if="!doc" class="text-(length:--al-font-size-body) text-(--text-muted) py-4">
      {{ t('learn.readMode.notFound') }}
    </div>

    <!--
      Article body. <h1> rendered from frontmatter so the markdown
      file's body can stay focused on section content (## and below).
      Same approach used by the standalone `/learn/<id>` page.
    -->
    <article v-else :id="`topic-${activeLearnTopic}`" tabindex="-1"
      class="learn-topic flex flex-col gap-4 focus:outline-none">
      <h2 class="learn-title m-0">{{ doc.title }}</h2>
      <div class="learn-prose">
        <ContentRenderer :value="doc" prose />
      </div>

      <!--
        Related topics — pulled from frontmatter `related: [...]`,
        rendered as in-app links so clicks navigate within the
        Learn tab rather than reloading the page.
      -->
      <section v-if="relatedTopics.length" class="flex flex-col gap-2 pt-2 border-t border-(--border)">
        <h3 class="learn-subhead m-0">{{ t('learn.relatedTitle') }}</h3>
        <ul class="list-none p-0 m-0 flex flex-col gap-1">
          <li v-for="item in relatedTopics" :key="item.id">
            <a :href="`#topic-${item.id}`" class="learn-topic-link inline-flex items-center gap-1"
              @click.prevent="focusLearnTopic(item.id)">
              {{ item.title }}
              <UIcon name="i-lucide-arrow-up-right" class="size-3.5 opacity-70" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </section>
    </article>
  </div>

  <!-- Index: list of topic cards -->
  <div v-else class="flex flex-col gap-4 pb-4">
    <header class="flex flex-col gap-2">
      <h2 class="learn-index-title m-0">{{ t('learn.index.title') }}</h2>
    </header>

    <ul class="flex flex-col gap-2 list-none p-0 m-0">
      <li v-for="topic in topics" :key="topic.id">
        <button type="button" class="learn-topic-card" @click="focusLearnTopic(topic.id)">
          <span class="learn-topic-card-body">
            <span class="learn-topic-card-title">{{ topic.title }}</span>
            <span class="learn-topic-card-summary">{{ topic.summary }}</span>
          </span>
          <UIcon name="i-lucide-chevron-right" class="learn-topic-card-chevron shrink-0" aria-hidden="true" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.learn-index-title,
.learn-title {
  font-size: var(--al-font-size-heading);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.25;
}

.learn-subhead {
  font-size: var(--al-font-size-body);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

/* Topic card — styled <button> so the whole surface is one focusable
   element, mimicking UCard's outline variant via tokens. */
.learn-topic-card {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
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
  gap: 4px;
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

/* Related-topic in-app links. */
.learn-topic-link {
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
}

.learn-topic-link:hover,
.learn-topic-link:focus-visible {
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.learn-topic-link:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

/*
 * Prose styling for the inspector-tab article body. Every rule reads
 * from the --al-learn-* token set in tokens.css, keyed to markdown
 * semantics (h1–h6, paragraph, bold, italic, code, code-block, link,
 * list, list-item, blockquote, hr). Editing typography here means
 * editing the tokens, not these selectors.
 */
.learn-prose :deep(h1) {
  font-size: var(--al-learn-h1-font-size);
  font-weight: var(--al-learn-h1-font-weight);
  color: var(--al-learn-h1-color);
  line-height: var(--al-learn-h1-line-height);
  margin-top: var(--al-learn-h1-margin-top);
  margin-bottom: var(--al-learn-h1-margin-bottom);
}

.learn-prose :deep(h2) {
  font-size: var(--al-learn-h2-font-size);
  font-weight: var(--al-learn-h2-font-weight);
  color: var(--al-learn-h2-color);
  line-height: var(--al-learn-h2-line-height);
  margin-top: var(--al-learn-h2-margin-top);
  margin-bottom: var(--al-learn-h2-margin-bottom);
}

.learn-prose :deep(h3) {
  font-size: var(--al-learn-h3-font-size);
  font-weight: var(--al-learn-h3-font-weight);
  color: var(--al-learn-h3-color);
  line-height: var(--al-learn-h3-line-height);
  margin-top: var(--al-learn-h3-margin-top);
  margin-bottom: var(--al-learn-h3-margin-bottom);
}

.learn-prose :deep(h4) {
  font-size: var(--al-learn-h4-font-size);
  font-weight: var(--al-learn-h4-font-weight);
  color: var(--al-learn-h4-color);
  line-height: var(--al-learn-h4-line-height);
  margin-top: var(--al-learn-h4-margin-top);
  margin-bottom: var(--al-learn-h4-margin-bottom);
}

.learn-prose :deep(h5) {
  font-size: var(--al-learn-h5-font-size);
  font-weight: var(--al-learn-h5-font-weight);
  color: var(--al-learn-h5-color);
  line-height: var(--al-learn-h5-line-height);
  margin-top: var(--al-learn-h5-margin-top);
  margin-bottom: var(--al-learn-h5-margin-bottom);
}

.learn-prose :deep(h6) {
  font-size: var(--al-learn-h6-font-size);
  font-weight: var(--al-learn-h6-font-weight);
  color: var(--al-learn-h6-color);
  line-height: var(--al-learn-h6-line-height);
  margin-top: var(--al-learn-h6-margin-top);
  margin-bottom: var(--al-learn-h6-margin-bottom);
}

.learn-prose :deep(p) {
  color: var(--al-learn-paragraph-color);
  line-height: var(--al-learn-paragraph-line-height);
  margin: 0 0 var(--al-learn-paragraph-margin-bottom);
}

.learn-prose :deep(strong),
.learn-prose :deep(b) {
  font-weight: var(--al-learn-bold-font-weight);
  color: var(--al-learn-bold-color);
}

.learn-prose :deep(em),
.learn-prose :deep(i) {
  font-style: var(--al-learn-italic-font-style);
  color: var(--al-learn-italic-color);
}

.learn-prose :deep(code) {
  font-family: var(--al-learn-code-font-family);
  font-size: var(--al-learn-code-font-size);
  padding: var(--al-learn-code-padding);
  background: var(--al-learn-code-background);
  color: var(--al-learn-code-color);
  border-radius: var(--al-learn-code-border-radius);
}

.learn-prose :deep(pre) {
  background: var(--al-learn-code-block-background);
  border: var(--al-learn-code-block-border);
  border-radius: var(--al-learn-code-block-border-radius);
  padding: var(--al-learn-code-block-padding);
  margin: 0 0 var(--al-learn-code-block-margin-bottom);
  font-size: var(--al-learn-code-block-font-size);
  line-height: var(--al-learn-code-block-line-height);
  overflow-x: auto;
}

.learn-prose :deep(pre code) {
  background: transparent;
  padding: 0;
  font-size: inherit;
  color: var(--al-learn-code-block-color);
}

.learn-prose :deep(a) {
  color: var(--al-learn-link-color);
  text-decoration: var(--al-learn-link-text-decoration);
  text-underline-offset: var(--al-learn-link-text-underline-offset);
}

.learn-prose :deep(a:hover),
.learn-prose :deep(a:focus-visible) {
  color: var(--al-learn-link-color-hover);
}

.learn-prose :deep(ul),
.learn-prose :deep(ol) {
  padding-left: var(--al-learn-list-padding-left);
  margin: 0 0 var(--al-learn-list-margin-bottom);
}

.learn-prose :deep(li) {
  color: var(--al-learn-list-item-color);
  line-height: var(--al-learn-list-item-line-height);
  margin-bottom: var(--al-learn-list-item-margin-bottom);
}

.learn-prose :deep(blockquote) {
  border-left: var(--al-learn-blockquote-border-left);
  padding-left: var(--al-learn-blockquote-padding-left);
  color: var(--al-learn-blockquote-color);
  font-style: var(--al-learn-blockquote-font-style);
  margin: var(--al-learn-blockquote-margin);
}

.learn-prose :deep(hr) {
  border: none;
  border-top: var(--al-learn-hr-border-top);
  margin: var(--al-learn-hr-margin);
}
</style>
