<script setup lang="ts">
const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <article id="topic-form-wrapping" tabindex="-1" class="learn-topic flex flex-col gap-6">
    <header>
      <h2 class="learn-title m-0">{{ t('learn.formWrapping.title') }}</h2>
    </header>

    <section class="flex flex-col gap-3">
      <i18n-t keypath="learn.formWrapping.intro" tag="p">
        <template #buttonText>
          <code>&lt;button /&gt;</code>
        </template>
      </i18n-t>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.formWrapping.defaultsTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.formWrapping.defaultsLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.formWrapping.defaultsSubmit') }}</li>
        <li class="learn-paragraph">{{ t('learn.formWrapping.defaultsReset') }}</li>
        <li class="learn-paragraph">{{ t('learn.formWrapping.defaultsButton') }}</li>
      </ul>
      <p class="learn-paragraph">{{ t('learn.formWrapping.defaultsOutro') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.formWrapping.resetScopeTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.formWrapping.resetScopeP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.formWrapping.resetScopeP2') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.formWrapping.pitfallTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.formWrapping.pitfallP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.formWrapping.pitfallP2') }}</p>
      <p class="learn-paragraph">{{ t('learn.formWrapping.pitfallP3') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.formWrapping.whenTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.formWrapping.whenLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.formWrapping.whenSubmit') }}</li>
        <li class="learn-paragraph">{{ t('learn.formWrapping.whenValidation') }}</li>
        <li class="learn-paragraph">{{ t('learn.formWrapping.whenAutofill') }}</li>
        <li class="learn-paragraph">{{ t('learn.formWrapping.whenMultiSubmit') }}</li>
      </ul>
      <p class="learn-paragraph">{{ t('learn.formWrapping.whenNotLead') }}</p>
      <ul class="learn-list">
        <li class="learn-paragraph">{{ t('learn.formWrapping.whenNotInteractive') }}</li>
        <li class="learn-paragraph">{{ t('learn.formWrapping.whenNotLink') }}</li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.formWrapping.preventionTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.formWrapping.preventionP1') }}</p>
      <p class="learn-paragraph">{{ t('learn.formWrapping.preventionP2') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.formWrapping.relatedTitle') }}</h3>
      <ul class="learn-list">
        <li class="learn-paragraph">
          <a href="#topic-button-types" class="learn-topic-link"
            @click.prevent="focusLearnTopic('button-types')">
            {{ t('learn.formWrapping.relatedButtonTypes') }}
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5 inline-block ml-0.5 opacity-70"
              aria-hidden="true" />
          </a>
        </li>
        <li class="learn-paragraph">
          <a href="#topic-button-value-attribute" class="learn-topic-link"
            @click.prevent="focusLearnTopic('button-value-attribute')">
            {{ t('learn.formWrapping.relatedButtonValue') }}
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
