<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article
    id="topic-toggle-buttons"
    tabindex="-1"
    class="learn-topic flex flex-col gap-6"
  >
    <header>
      <h2 class="learn-title m-0">
        {{ t('learn.toggleButtons.title') }}
      </h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">
        {{ t('learn.toggleButtons.intro') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.toggleButtons.patternTitle') }}
      </h3>
      <i18n-t keypath="learn.toggleButtons.patternP1" tag="p" class="learn-paragraph">
        <template #button>
          <code>&lt;button&gt;</code>
        </template>
        <template #ariaPressed>
          <code>aria-pressed="true|false"</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.toggleButtons.patternP2') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.toggleButtons.patternP3') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.toggleButtons.labelStabilityTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.toggleButtons.labelStabilityP1') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.toggleButtons.labelStabilityP2') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.toggleButtons.labelStabilityP3') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.toggleButtons.antipatternsTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.toggleButtons.antipatternsLead') }}
      </p>
      <ul class="learn-list">
        <li class="learn-paragraph">
          {{ t('learn.toggleButtons.antipatternsVisual') }}
        </li>
        <i18n-t keypath="learn.toggleButtons.antipatternsWrongAttr" tag="li" class="learn-paragraph">
          <template #button>
            <code>&lt;button&gt;</code>
          </template>
        </i18n-t>
        <li class="learn-paragraph">
          {{ t('learn.toggleButtons.antipatternsLabelFlip') }}
        </li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.toggleButtons.switchVsToggleTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.toggleButtons.switchVsToggleP1') }}
      </p>
      <i18n-t keypath="learn.toggleButtons.switchVsToggleP2" tag="p" class="learn-paragraph">
        <template #roleSwitch>
          <code>role="switch"</code>
        </template>
        <template #buttonAriaPressed>
          <code>&lt;button aria-pressed&gt;</code>
        </template>
      </i18n-t>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.toggleButtons.relatedTitle') }}
      </h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a
            href="#topic-switches"
            class="learn-topic-link"
            @click.prevent="focusLearnTopic('switches')"
          >
            {{ t('learn.toggleButtons.relatedSwitches') }}
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-3.5 inline-block ml-0.5 opacity-70"
              aria-hidden="true"
            />
          </a>
        </li>
        <li class="learn-paragraph">
          <a
            href="#topic-accessible-name"
            class="learn-topic-link"
            @click.prevent="focusLearnTopic('accessible-name')"
          >
            {{ t('learn.toggleButtons.relatedAccessibleName') }}
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-3.5 inline-block ml-0.5 opacity-70"
              aria-hidden="true"
            />
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
