<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article
    id="topic-switches"
    tabindex="-1"
    class="learn-topic flex flex-col gap-6"
  >
    <header>
      <h2 class="learn-title m-0">
        {{ t('learn.switches.title') }}
      </h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">
        {{ t('learn.switches.intro') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.switches.patternTitle') }}
      </h3>
      <i18n-t keypath="learn.switches.patternP1" tag="p" class="learn-paragraph">
        <template #buttonRoleSwitch>
          <code>&lt;button role="switch"&gt;</code>
        </template>
        <template #ariaChecked>
          <code>aria-checked="true|false"</code>
        </template>
      </i18n-t>
      <i18n-t keypath="learn.switches.patternP2" tag="p" class="learn-paragraph">
        <template #inputCheckboxSwitch>
          <code>&lt;input type="checkbox" role="switch"&gt;</code>
        </template>
        <template #label>
          <code>&lt;label&gt;</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.switches.patternP3') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.switches.labelClickTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.switches.labelClickP1') }}
      </p>
      <i18n-t keypath="learn.switches.labelClickP2" tag="p" class="learn-paragraph">
        <template #inputCheckboxSwitch>
          <code>&lt;input type="checkbox" role="switch"&gt;</code>
        </template>
        <template #labelFor>
          <code>&lt;label for&gt;</code>
        </template>
        <template #buttonRoleSwitch>
          <code>&lt;button role="switch"&gt;</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.switches.labelClickP3') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.switches.switchVsCheckboxTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.switches.switchVsCheckboxP1') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.switches.switchVsCheckboxP2') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.switches.switchVsCheckboxP3') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.switches.antipatternsTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.switches.antipatternsLead') }}
      </p>
      <ul class="learn-list">
        <li class="learn-paragraph">
          {{ t('learn.switches.antipatternsNone') }}
        </li>
        <li class="learn-paragraph">
          {{ t('learn.switches.antipatternsWrongAttr') }}
        </li>
        <li class="learn-paragraph">
          {{ t('learn.switches.antipatternsLabelFlip') }}
        </li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.switches.relatedTitle') }}
      </h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a
            href="#topic-toggle-buttons"
            class="learn-topic-link"
            @click.prevent="focusLearnTopic('toggle-buttons')"
          >
            {{ t('learn.switches.relatedToggleButtons') }}
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
            {{ t('learn.switches.relatedAccessibleName') }}
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
