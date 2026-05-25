<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <article id="topic-vague-label" tabindex="-1" class="learn-topic flex flex-col gap-6">
    <header>
      <h2 class="learn-title m-0">{{ t('learn.vagueLabel.title') }}</h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">{{ t('learn.vagueLabel.intro') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.vagueLabel.matterTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.vagueLabel.matterP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.vagueLabel.matterP2') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.vagueLabel.goodTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.vagueLabel.goodLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.vagueLabel.goodVerbNoun') }}</li>
        <li class="learn-paragraph">{{ t('learn.vagueLabel.goodResult') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.vagueLabel.okTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.vagueLabel.okLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.vagueLabel.okContext') }}</li>
        <li class="learn-paragraph">{{ t('learn.vagueLabel.okPattern') }}</li>
        <li class="learn-paragraph">{{ t('learn.vagueLabel.okIcon') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.vagueLabel.testTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.vagueLabel.testP') }}</p>
    </section>
  </article>
</template>
