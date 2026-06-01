<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article
    id="topic-checkbox"
    tabindex="-1"
    class="learn-topic flex flex-col gap-6"
  >
    <header>
      <h2 class="learn-title m-0">
        {{ t('learn.checkbox.title') }}
      </h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">
        {{ t('learn.checkbox.intro') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.checkbox.labelTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.checkbox.labelLead') }}
      </p>
      <ul class="learn-list">
        <i18n-t keypath="learn.checkbox.labelForId" tag="li" class="learn-paragraph">
          <template #forId>
            <code>for</code>/<code>id</code>
          </template>
          <template #labelOpen>
            <code>&lt;label&gt;</code>
          </template>
          <template #labelClose>
            <code>&lt;/label&gt;</code>
          </template>
        </i18n-t>
        <i18n-t keypath="learn.checkbox.labelWrapping" tag="li" class="learn-paragraph">
          <template #forId>
            <code>for</code>/<code>id</code>
          </template>
          <template #labelOpen>
            <code>&lt;label&gt;</code>
          </template>
          <template #labelClose>
            <code>&lt;/label&gt;</code>
          </template>
          <template #inputTag>
            <code>&lt;input&gt;</code>
          </template>
        </i18n-t>
        <i18n-t keypath="learn.checkbox.labelAriaLabel" tag="li" class="learn-paragraph">
          <template #ariaLabel>
            <code>aria-label</code>
          </template>
        </i18n-t>
        <li class="learn-paragraph">
          {{ t('learn.checkbox.labelNone') }}
        </li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.checkbox.groupsTitle') }}
      </h3>
      <i18n-t keypath="learn.checkbox.groupsP1" tag="p" class="learn-paragraph">
        <template #fieldsetTag>
          <code>&lt;fieldset&gt;</code>
        </template>
        <template #legendTag>
          <code>&lt;legend&gt;</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.checkbox.groupsP2') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.checkbox.indeterminateTitle') }}
      </h3>
      <i18n-t keypath="learn.checkbox.indeterminateP1" tag="p" class="learn-paragraph">
        <template #jsExample>
          <code>element.indeterminate = true</code>
        </template>
        <template #indeterminateAttr>
          <code>indeterminate</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.checkbox.indeterminateP2') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.checkbox.requiredTitle') }}
      </h3>
      <i18n-t keypath="learn.checkbox.requiredP1" tag="p" class="learn-paragraph">
        <template #requiredAttr>
          <code>required</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.checkbox.requiredP2') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.checkbox.checkboxVsSwitchTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.checkbox.checkboxVsSwitchP1') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.checkbox.checkboxVsSwitchP2') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.checkbox.checkboxVsSwitchP3') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.checkbox.relatedTitle') }}
      </h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a
            href="#topic-switches"
            class="learn-topic-link"
            @click.prevent="focusLearnTopic('switches')"
          >
            {{ t('learn.checkbox.relatedSwitches') }}
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
            {{ t('learn.checkbox.relatedAccessibleName') }}
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
