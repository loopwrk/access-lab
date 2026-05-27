<script setup lang="ts">
import { learnTopics, getLearnTopic } from '~/composables/useLearnTopics'

const { t } = useI18n()
const { activeLearnTopic, focusLearnTopic, clearLearnTopic } = useInspectorTab()

const currentTopic = computed(() =>
  activeLearnTopic.value ? getLearnTopic(activeLearnTopic.value) : undefined
)
</script>

<template>
  <!-- Detail: single topic article -->
  <div v-if="currentTopic" class="flex flex-col gap-4 pb-4">
    <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-chevron-left" class="self-start -ml-2"
      @click="clearLearnTopic">
      {{ t('learn.backToTopics') }}
    </UButton>
    <component :is="currentTopic.component" />
  </div>

  <!-- Index: list of topic cards -->
  <div v-else class="flex flex-col gap-4 pb-4">
    <header class="flex flex-col gap-2">
      <h2 class="learn-index-title m-0">{{ t('learn.index.title') }}</h2>
    </header>

    <ul class="flex flex-col gap-2 list-none p-0 m-0">
      <li v-for="topic in learnTopics" :key="topic.id">
        <button type="button" class="learn-topic-card" @click="focusLearnTopic(topic.id)">
          <span class="learn-topic-card-body">
            <span class="learn-topic-card-title">{{ t(topic.titleKey) }}</span>
            <span class="learn-topic-card-summary">{{ t(topic.summaryKey) }}</span>
          </span>
          <UIcon name="i-lucide-chevron-right" class="learn-topic-card-chevron shrink-0" aria-hidden="true" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.learn-index-title {
  font-size: var(--al-font-size-heading);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.25;
}

.learn-index-intro {
  font-size: var(--al-font-size-detail);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Topic card — a styled button rather than a UCard so the entire card
   surface is one accessible button rather than a div with click-to-focus
   nested children. Mimics UCard's outline variant via tokens. */
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
  transition:
    border-color 0.15s,
    background-color 0.15s;
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
</style>
