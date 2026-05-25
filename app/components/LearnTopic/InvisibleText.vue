<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
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
</template>
