<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article id="topic-button-disabled-states" tabindex="-1" class="learn-topic flex flex-col gap-6">
    <header>
      <h2 class="learn-title m-0">{{ t('learn.buttonDisabledStates.title') }}</h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.intro') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonDisabledStates.whatTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.whatLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.buttonDisabledStates.what1') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonDisabledStates.what2') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonDisabledStates.what3') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonDisabledStates.what4') }}</li>
      </ul>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.whatOutro') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonDisabledStates.screenReaderTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.screenReaderP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.screenReaderP2') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonDisabledStates.ariaDisabledTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.ariaDisabledP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.ariaDisabledP2') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.ariaDisabledP3') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.ariaDisabledP4') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonDisabledStates.whenAvoidTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.whenAvoidP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonDisabledStates.whenAvoidP2') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonDisabledStates.guidanceTitle') }}</h3>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.buttonDisabledStates.guidance1') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonDisabledStates.guidance2') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonDisabledStates.guidance3') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonDisabledStates.guidance4') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonDisabledStates.relatedTitle') }}</h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a href="#topic-button-types" class="learn-topic-link"
            @click.prevent="focusLearnTopic('button-types')">
            {{ t('learn.buttonDisabledStates.relatedButtonTypes') }}
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5 inline-block ml-0.5 opacity-70"
              aria-hidden="true" />
          </a>
        </li>
        <li class="learn-paragraph">
          <a href="#topic-accessible-name" class="learn-topic-link"
            @click.prevent="focusLearnTopic('accessible-name')">
            {{ t('learn.buttonDisabledStates.relatedAccessibleName') }}
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
