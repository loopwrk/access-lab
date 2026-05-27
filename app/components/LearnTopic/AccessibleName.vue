<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article id="topic-accessible-name" tabindex="-1" class="learn-topic flex flex-col gap-6">
    <header>
      <h2 class="learn-title m-0">{{ t('learn.accessibleName.title') }}</h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">{{ t('learn.accessibleName.intro') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.accessibleName.whyTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.accessibleName.whyP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.accessibleName.whyP2') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.accessibleName.precedenceTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.accessibleName.precedenceLead') }}</p>
      <ol class="learn-list">
        <li class="learn-paragraph">{{ t('learn.accessibleName.precedence1') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.precedence2') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.precedence3') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.precedence4') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.precedence5') }}</li>
      </ol>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.accessibleName.countsTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.accessibleName.countsLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.accessibleName.countsAria') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.countsContent') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.countsAssoc') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.countsAlt') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.accessibleName.doesntCountTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.accessibleName.doesntCountLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.accessibleName.doesntPlaceholder') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.doesntNearby') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.doesntStyling') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.doesntColor') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.doesntButtonValue') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.accessibleName.mismatchTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.accessibleName.mismatchP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.accessibleName.mismatchP2') }}</p>
      <p class="learn-paragraph">{{ t('learn.accessibleName.mismatchP3') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.accessibleName.guidanceTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.accessibleName.guidanceLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.accessibleName.guidance1') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.guidance2') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.guidance3') }}</li>
        <li class="learn-paragraph">{{ t('learn.accessibleName.guidance4') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.accessibleName.relatedTitle') }}</h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a href="#topic-button-value-attribute" class="learn-topic-link"
            @click.prevent="focusLearnTopic('button-value-attribute')">
            {{ t('learn.accessibleName.relatedButtonValue') }}
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5 inline-block ml-0.5 opacity-70"
              aria-hidden="true" />
          </a>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
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
}
</style>
