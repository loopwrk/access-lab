<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <article id="topic-rem-units" tabindex="-1" class="learn-topic flex flex-col gap-6">
    <header>
      <h2 class="learn-title m-0">{{ t('learn.remUnits.title') }}</h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">{{ t('learn.remUnits.intro') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.remUnits.responsiveTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.remUnits.responsiveP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.remUnits.responsiveP2') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.remUnits.a11yTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.remUnits.a11yP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.remUnits.a11yLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.remUnits.a11yPoint1') }}</li>
        <li class="learn-paragraph">{{ t('learn.remUnits.a11yPoint2') }}</li>
        <li class="learn-paragraph">{{ t('learn.remUnits.a11yPoint3') }}</li>
      </ul>
      <p class="learn-paragraph">{{ t('learn.remUnits.a11yOutro') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.remUnits.comparisonTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.remUnits.comparisonLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.remUnits.comparisonPx') }}</li>
        <li class="learn-paragraph">{{ t('learn.remUnits.comparisonEm') }}</li>
        <li class="learn-paragraph">{{ t('learn.remUnits.comparisonRem') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.remUnits.whenTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.remUnits.whenRemLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.remUnits.whenRem1') }}</li>
        <li class="learn-paragraph">{{ t('learn.remUnits.whenRem2') }}</li>
        <li class="learn-paragraph">{{ t('learn.remUnits.whenRem3') }}</li>
        <li class="learn-paragraph">{{ t('learn.remUnits.whenRem4') }}</li>
      </ul>
      <p class="learn-paragraph">{{ t('learn.remUnits.whenPxLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.remUnits.whenPx1') }}</li>
        <li class="learn-paragraph">{{ t('learn.remUnits.whenPx2') }}</li>
        <li class="learn-paragraph">{{ t('learn.remUnits.whenPx3') }}</li>
      </ul>
      <p class="learn-paragraph">{{ t('learn.remUnits.whenOutro') }}</p>
    </section>
  </article>
</template>
