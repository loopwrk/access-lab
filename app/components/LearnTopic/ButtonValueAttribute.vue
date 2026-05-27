<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article id="topic-button-value-attribute" tabindex="-1" class="learn-topic flex flex-col gap-6">
    <header>
      <h2 class="learn-title m-0">{{ t('learn.buttonValueAttribute.title') }}</h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.intro') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonValueAttribute.differenceTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.differenceP1') }}</p>
      <i18n-t keypath="learn.buttonValueAttribute.differenceVoid" tag="p" class="learn-paragraph">
        <template #inputElement>
          <code class="learn-code">&lt;input&gt;</code>
        </template>
        <template #invalidMarkup>
          <code class="learn-code">&lt;input type="submit"&gt;Save&lt;/input&gt;</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.differenceP2') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.differenceP3') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonValueAttribute.useCaseTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.useCaseP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.useCaseP2') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.useCaseP3') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonValueAttribute.a11yTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.a11yP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.a11yP2') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.a11yP3') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonValueAttribute.mismatchTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.mismatchP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.mismatchP2') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.mismatchP3') }}</p>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.mismatchP4') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonValueAttribute.guidanceTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.buttonValueAttribute.guidanceLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.buttonValueAttribute.guidance1') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonValueAttribute.guidance2') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonValueAttribute.guidance3') }}</li>
        <li class="learn-paragraph">{{ t('learn.buttonValueAttribute.guidance4') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.buttonValueAttribute.relatedTitle') }}</h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a href="#topic-button-types" class="learn-topic-link"
            @click.prevent="focusLearnTopic('button-types')">
            {{ t('learn.buttonValueAttribute.relatedButtonTypes') }}
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5 inline-block ml-0.5 opacity-70"
              aria-hidden="true" />
          </a>
        </li>
        <li class="learn-paragraph">
          <a href="#topic-form-wrapping" class="learn-topic-link"
            @click.prevent="focusLearnTopic('form-wrapping')">
            {{ t('learn.buttonValueAttribute.relatedFormWrapping') }}
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
