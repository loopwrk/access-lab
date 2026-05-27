<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article id="topic-button-types" tabindex="-1" class="learn-topic flex flex-col gap-6">
    <header>
      <h2 class="learn-title m-0">{{ t('learn.buttonTypes.title') }}</h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">{{ t('learn.buttonTypes.intro') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonTypes.typesTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonTypes.typesLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.buttonTypes.typeSubmit') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonTypes.typeReset') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonTypes.typeButton') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonTypes.whyExplicitTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonTypes.whyExplicitP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonTypes.whyExplicitP2') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonTypes.whyExplicitP3') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonTypes.guidanceTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonTypes.guidanceLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.buttonTypes.guidance1') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonTypes.guidance2') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonTypes.guidance3') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonTypes.guidance4') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonTypes.relatedTitle') }}</h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a href="#topic-form-wrapping" class="learn-topic-link"
            @click.prevent="focusLearnTopic('form-wrapping')">
            {{ t('learn.buttonTypes.relatedFormWrapping') }}
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5 inline-block ml-0.5 opacity-70"
              aria-hidden="true" />
          </a>
        </li>
        <li class="learn-paragraph">
          <a href="#topic-button-value-attribute" class="learn-topic-link"
            @click.prevent="focusLearnTopic('button-value-attribute')">
            {{ t('learn.buttonTypes.relatedButtonValue') }}
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
