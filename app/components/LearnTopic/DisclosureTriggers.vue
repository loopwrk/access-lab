<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article
    id="topic-disclosure-triggers"
    tabindex="-1"
    class="learn-topic flex flex-col gap-6"
  >
    <header>
      <h2 class="learn-title m-0">
        {{ t('learn.disclosureTriggers.title') }}
      </h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.intro') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.disclosureTriggers.patternTitle') }}
      </h3>
      <i18n-t keypath="learn.disclosureTriggers.patternP1" tag="p" class="learn-paragraph">
        <template #button>
          <code>&lt;button&gt;</code>
        </template>
        <template #ariaExpanded>
          <code>aria-expanded="true|false"</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.patternP2') }}
      </p>
      <i18n-t keypath="learn.disclosureTriggers.patternP3" tag="p" class="learn-paragraph">
        <template #hidden>
          <code>hidden</code>
        </template>
        <template #displayNone>
          <code>display: none</code>
        </template>
      </i18n-t>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.disclosureTriggers.controlsTitle') }}
      </h3>
      <i18n-t keypath="learn.disclosureTriggers.controlsP1" tag="p" class="learn-paragraph">
        <template #ariaControls>
          <code>aria-controls</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.controlsP2') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.controlsP3') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.disclosureTriggers.labelStabilityTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.labelStabilityP1') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.labelStabilityP2') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.labelStabilityP3') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.disclosureTriggers.antipatternsTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.antipatternsLead') }}
      </p>
      <ul class="learn-list">
        <li class="learn-paragraph">
          {{ t('learn.disclosureTriggers.antipatternsVisualOnly') }}
        </li>
        <li class="learn-paragraph">
          {{ t('learn.disclosureTriggers.antipatternsOutOfSync') }}
        </li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <i18n-t keypath="learn.disclosureTriggers.nativeAlternativeTitle" tag="h3" class="learn-subhead m-0">
        <template #details>
          <code>&lt;details&gt;</code>
        </template>
        <template #summary>
          <code>&lt;summary&gt;</code>
        </template>
      </i18n-t>
      <i18n-t keypath="learn.disclosureTriggers.nativeAlternativeP1" tag="p" class="learn-paragraph">
        <template #detailsTag>
          <code>&lt;details&gt;</code>
        </template>
        <template #summaryTag>
          <code>&lt;summary&gt;</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.nativeAlternativeWhenLead') }}
      </p>
      <ul class="learn-list">
        <li class="learn-paragraph">
          {{ t('learn.disclosureTriggers.nativeAlternativeWhen1') }}
        </li>
        <li class="learn-paragraph">
          {{ t('learn.disclosureTriggers.nativeAlternativeWhen2') }}
        </li>
        <li class="learn-paragraph">
          {{ t('learn.disclosureTriggers.nativeAlternativeWhen3') }}
        </li>
      </ul>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.nativeAlternativeJsLead') }}
      </p>
      <ul class="learn-list">
        <i18n-t keypath="learn.disclosureTriggers.nativeAlternativeJs1" tag="li" class="learn-paragraph">
          <template #summaryTag>
            <code>&lt;summary&gt;</code>
          </template>
        </i18n-t>
        <i18n-t keypath="learn.disclosureTriggers.nativeAlternativeJs2" tag="li" class="learn-paragraph">
          <template #detailsTag>
            <code>&lt;details&gt;</code>
          </template>
        </i18n-t>
        <li class="learn-paragraph">
          {{ t('learn.disclosureTriggers.nativeAlternativeJs3') }}
        </li>
        <i18n-t keypath="learn.disclosureTriggers.nativeAlternativeJs4" tag="li" class="learn-paragraph">
          <template #interpolateSize>
            <code>interpolate-size</code>
          </template>
          <template #displayProp>
            <code>display</code>
          </template>
        </i18n-t>
      </ul>
      <i18n-t keypath="learn.disclosureTriggers.nativeAlternativeRule" tag="p" class="learn-paragraph">
        <template #detailsTag>
          <code>&lt;details&gt;</code>
        </template>
        <template #summaryTag>
          <code>&lt;summary&gt;</code>
        </template>
      </i18n-t>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.disclosureTriggers.switchVsDisclosureTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.disclosureTriggers.switchVsDisclosureP1') }}
      </p>
      <i18n-t keypath="learn.disclosureTriggers.switchVsDisclosureP2" tag="p" class="learn-paragraph">
        <template #ariaExpanded>
          <code>aria-expanded</code>
        </template>
      </i18n-t>
      <i18n-t keypath="learn.disclosureTriggers.switchVsDisclosureP3" tag="p" class="learn-paragraph">
        <template #ariaPressed>
          <code>aria-pressed</code>
        </template>
        <template #roleSwitch>
          <code>role="switch"</code>
        </template>
      </i18n-t>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.disclosureTriggers.relatedTitle') }}
      </h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a
            href="#topic-toggle-buttons"
            class="learn-topic-link"
            @click.prevent="focusLearnTopic('toggle-buttons')"
          >
            {{ t('learn.disclosureTriggers.relatedToggleButtons') }}
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-3.5 inline-block ml-0.5 opacity-70"
              aria-hidden="true"
            />
          </a>
        </li>
        <li class="learn-paragraph">
          <a
            href="#topic-switches"
            class="learn-topic-link"
            @click.prevent="focusLearnTopic('switches')"
          >
            {{ t('learn.disclosureTriggers.relatedSwitches') }}
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
