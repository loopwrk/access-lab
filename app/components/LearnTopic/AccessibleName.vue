<script setup lang="ts">
const { t } = useI18n()
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
  </article>
</template>
