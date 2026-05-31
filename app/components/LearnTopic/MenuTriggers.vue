<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article
    id="topic-menu-triggers"
    tabindex="-1"
    class="learn-topic flex flex-col gap-6"
  >
    <header>
      <h2 class="learn-title m-0">
        {{ t('learn.menuTriggers.title') }}
      </h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">
        {{ t('learn.menuTriggers.intro') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.menuTriggers.patternTitle') }}
      </h3>
      <i18n-t keypath="learn.menuTriggers.patternP1" tag="p" class="learn-paragraph">
        <template #button>
          <code>&lt;button&gt;</code>
        </template>
        <template #ariaHasPopup>
          <code>aria-haspopup="menu"</code>
        </template>
        <template #ariaExpanded>
          <code>aria-expanded="true|false"</code>
        </template>
      </i18n-t>
      <i18n-t keypath="learn.menuTriggers.patternP2" tag="p" class="learn-paragraph">
        <template #roleMenu>
          <code>role="menu"</code>
        </template>
        <template #roleMenuItem>
          <code>role="menuitem"</code>
        </template>
      </i18n-t>
      <i18n-t keypath="learn.menuTriggers.patternP3" tag="p" class="learn-paragraph">
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
        {{ t('learn.menuTriggers.twoAttrsTitle') }}
      </h3>
      <i18n-t keypath="learn.menuTriggers.twoAttrsP1" tag="p" class="learn-paragraph">
        <template #ariaHasPopup>
          <code>aria-haspopup</code>
        </template>
        <template #ariaExpanded>
          <code>aria-expanded</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.menuTriggers.twoAttrsP2') }}
      </p>
      <p class="learn-paragraph">
        {{ t('learn.menuTriggers.twoAttrsP3') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.menuTriggers.keyboardTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.menuTriggers.keyboardLead') }}
      </p>
      <ul class="learn-list">
        <li class="learn-paragraph">
          {{ t('learn.menuTriggers.keyboardOpen') }}
        </li>
        <li class="learn-paragraph">
          {{ t('learn.menuTriggers.keyboardMove') }}
        </li>
        <li class="learn-paragraph">
          {{ t('learn.menuTriggers.keyboardClose') }}
        </li>
      </ul>
      <p class="learn-paragraph">
        {{ t('learn.menuTriggers.keyboardP1') }}
      </p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.menuTriggers.antipatternsTitle') }}
      </h3>
      <p class="learn-paragraph">
        {{ t('learn.menuTriggers.antipatternsLead') }}
      </p>
      <ul class="learn-list">
        <li class="learn-paragraph">
          {{ t('learn.menuTriggers.antipatternsNoAria') }}
        </li>
        <li class="learn-paragraph">
          {{ t('learn.menuTriggers.antipatternsHalfWired') }}
        </li>
        <li class="learn-paragraph">
          {{ t('learn.menuTriggers.antipatternsKeyboardMissing') }}
        </li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.menuTriggers.selectVsMenuTitle') }}
      </h3>
      <i18n-t keypath="learn.menuTriggers.selectVsMenuP1" tag="p" class="learn-paragraph">
        <template #selectTag>
          <code>&lt;select&gt;</code>
        </template>
      </i18n-t>
      <p class="learn-paragraph">
        {{ t('learn.menuTriggers.selectVsMenuP2') }}
      </p>
      <i18n-t keypath="learn.menuTriggers.selectVsMenuP3" tag="p" class="learn-paragraph">
        <template #selectTag>
          <code>&lt;select&gt;</code>
        </template>
      </i18n-t>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">
        {{ t('learn.menuTriggers.relatedTitle') }}
      </h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a
            href="#topic-disclosure-triggers"
            class="learn-topic-link"
            @click.prevent="focusLearnTopic('disclosure-triggers')"
          >
            {{ t('learn.menuTriggers.relatedDisclosureTriggers') }}
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
            {{ t('learn.menuTriggers.relatedAccessibleName') }}
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
