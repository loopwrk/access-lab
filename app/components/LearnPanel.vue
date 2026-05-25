<script setup lang="ts">
/**
 * Long-form educational content shown in the inspector's Learn tab.
 *
 * Each topic is wrapped in an <article> with an id and tabindex="-1" so
 * IssuesPanel's "Read more in the Learn tab" link can scroll + focus the
 * specific explainer (via useInspectorTab.focusPanel(tab, focusId)).
 *
 * The topic ids here are the source of truth for the values that rules use
 * in their `learnTopicId` field. Adding a topic = pick an id, render an
 * <article id="topic-...">, point one or more rules at it.
 */

const { t } = useI18n()

const responsibilities = computed(() => [
  {
    icon: 'i-lucide-focus',
    title: t('learn.nativeRendering.focusRingsTitle'),
    body: t('learn.nativeRendering.focusRingsBody'),
  },
  {
    icon: 'i-lucide-pointer',
    title: t('learn.nativeRendering.hitAreasTitle'),
    body: t('learn.nativeRendering.hitAreasBody'),
  },
  {
    icon: 'i-lucide-contrast',
    title: t('learn.nativeRendering.contrastTitle'),
    body: t('learn.nativeRendering.contrastBody'),
  },
])
</script>

<template>
  <div class="flex flex-col gap-10">

    <!-- Topic: native rendering -->
    <article id="topic-native-rendering" tabindex="-1" class="learn-topic flex flex-col gap-6">
      <header>
        <h2 class="learn-title m-0">{{ t('learn.nativeRendering.title') }}</h2>
      </header>

      <section class="flex flex-col gap-3">
        <p class="learn-paragraph">{{ t('learn.nativeRendering.p1') }}</p>
        <p class="learn-paragraph">{{ t('learn.nativeRendering.p2') }}</p>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="learn-subhead m-0">{{ t('learn.nativeRendering.shiftTitle') }}</h3>
        <p class="learn-paragraph">{{ t('learn.nativeRendering.p3') }}</p>
        <p class="learn-paragraph">{{ t('learn.nativeRendering.p4') }}</p>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="learn-subhead m-0">{{ t('learn.nativeRendering.responsibilityTitle') }}</h3>
        <p class="learn-paragraph">{{ t('learn.nativeRendering.p5') }}</p>
        <p class="learn-paragraph">{{ t('learn.nativeRendering.p6') }}</p>

        <ul class="flex flex-col gap-3 list-none p-0 m-0">
          <li v-for="item in responsibilities" :key="item.title" class="flex gap-3 items-start">
            <UIcon :name="item.icon" class="shrink-0 mt-0.5 text-(--brand) text-(length:--al-font-size-heading)"
              aria-hidden="true" />
            <div class="flex flex-col gap-1 min-w-0">
              <h4 class="learn-responsibility-title m-0">{{ item.title }}</h4>
              <p class="learn-paragraph m-0">{{ item.body }}</p>
            </div>
          </li>
        </ul>
      </section>
    </article>

    <!-- Topic: invisible text / contrast skipped by axe -->
    <article id="topic-invisible-text" tabindex="-1" class="learn-topic flex flex-col gap-6">
      <header>
        <h2 class="learn-title m-0">{{ t('learn.invisibleText.title') }}</h2>
      </header>

      <section class="flex flex-col gap-3">
        <p class="learn-paragraph">{{ t('learn.invisibleText.intro') }}</p>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="learn-subhead m-0">{{ t('learn.invisibleText.skipTitle') }}</h3>
        <p class="learn-paragraph">{{ t('learn.invisibleText.skipP1') }}</p>
        <p class="learn-paragraph">{{ t('learn.invisibleText.skipP2') }}</p>
        <p class="learn-paragraph">{{ t('learn.invisibleText.skipP3') }}</p>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="learn-subhead m-0">{{ t('learn.invisibleText.productionTitle') }}</h3>
        <p class="learn-paragraph">{{ t('learn.invisibleText.productionP1') }}</p>
        <p class="learn-paragraph">{{ t('learn.invisibleText.productionLead') }}</p>
        <ul class="learn-list">
          <li class="learn-paragraph">{{ t('learn.invisibleText.productionSplitScreenReader') }}</li>
          <li class="learn-paragraph">{{ t('learn.invisibleText.productionSplitSighted') }}</li>
        </ul>
        <p class="learn-paragraph">{{ t('learn.invisibleText.productionOutro') }}</p>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="learn-subhead m-0">{{ t('learn.invisibleText.wcagTitle') }}</h3>
        <p class="learn-paragraph">{{ t('learn.invisibleText.wcagLead') }}</p>
        <ul class="learn-list">
          <li class="learn-paragraph">{{ t('learn.invisibleText.wcagAA') }}</li>
          <li class="learn-paragraph">{{ t('learn.invisibleText.wcagAAA') }}</li>
        </ul>
        <p class="learn-paragraph">{{ t('learn.invisibleText.wcagOutro') }}</p>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="learn-subhead m-0">{{ t('learn.invisibleText.fixTitle') }}</h3>

        <p class="learn-paragraph font-semibold text-(--text-primary)">
          {{ t('learn.invisibleText.fixMistakeLead') }}
        </p>
        <p class="learn-paragraph">{{ t('learn.invisibleText.fixMistakeBody') }}</p>

        <p class="learn-paragraph font-semibold text-(--text-primary) mt-2">
          {{ t('learn.invisibleText.fixIntentLead') }}
        </p>
        <i18n-t keypath="learn.invisibleText.fixIntentBody" tag="p" class="learn-paragraph">
          <template #pos>
            <code class="learn-code">position: absolute</code>
          </template>
          <template #clip>
            <code class="learn-code">clip-path</code>
          </template>
        </i18n-t>
        <p class="learn-paragraph m-0">
          <a href="https://webaim.org/techniques/css/invisiblecontent/" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center text-(--brand) no-underline hover:text-(--brand-hover) hover:underline">
            {{ t('learn.invisibleText.fixIntentLink') }}
            <span class="i-lucide-external-link text-xs ml-1" aria-hidden="true" />
          </a>
        </p>
      </section>
    </article>

  </div>
</template>

<style scoped>
.learn-topic:focus {
  /* Programmatic focus from IssuesPanel — don't show a default outline on a
     non-interactive container, but keep the element focusable. */
  outline: none;
}

.learn-title {
  font-size: var(--al-font-size-display);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.25;
}

.learn-subhead {
  font-size: var(--al-font-size-heading);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.learn-responsibility-title {
  font-size: var(--al-font-size-body);
  font-weight: 600;
  color: var(--text-primary);
}

.learn-paragraph {
  font-size: var(--al-font-size-body);
  line-height: 1.55;
  color: var(--text-secondary);
}

.learn-list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: disc;
}

.learn-code {
  font-family: var(--al-font-mono);
  font-size: 0.9em;
  padding: 0.1em 0.35em;
  background: var(--brand-soft);
  color: var(--text-primary);
  border-radius: 3px;
  white-space: nowrap;
}
</style>
