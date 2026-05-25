<script setup lang="ts">
const { t } = useI18n()

const responsibilities = computed(() => [
  {
    icon: 'i-lucide-focus',
    title: t('learn.nativeRendering.focusRingsTitle'),
    body: t('learn.nativeRendering.focusRingsBody'),
  },
  {
    icon: 'i-lucide-pointer',
    title: t('learn.nativeRendering.hitAreasTitle'),
    body: t('learn.nativeRendering.hitAreasBody'),
  },
  {
    icon: 'i-lucide-contrast',
    title: t('learn.nativeRendering.contrastTitle'),
    body: t('learn.nativeRendering.contrastBody'),
  },
])
</script>

<template>
  <article id="topic-native-rendering" tabindex="-1" class="learn-topic flex flex-col gap-6">
    <header>
      <h2 class="learn-title m-0">{{ t('learn.nativeRendering.title') }}</h2>
    </header>

    <section class="flex flex-col gap-3">
      <p class="learn-paragraph">{{ t('learn.nativeRendering.p1') }}</p>
      <p class="learn-paragraph">{{ t('learn.nativeRendering.p2') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.nativeRendering.shiftTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.nativeRendering.p3') }}</p>
      <p class="learn-paragraph">{{ t('learn.nativeRendering.p4') }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="learn-subhead m-0">{{ t('learn.nativeRendering.responsibilityTitle') }}</h3>
      <p class="learn-paragraph">{{ t('learn.nativeRendering.p5') }}</p>
      <p class="learn-paragraph">{{ t('learn.nativeRendering.p6') }}</p>

      <ul class="flex flex-col gap-3 list-none p-0 m-0">
        <li v-for="item in responsibilities" :key="item.title" class="flex gap-3 items-start">
          <UIcon :name="item.icon" class="shrink-0 mt-0.5 text-(--brand) text-(length:--al-font-size-heading)"
            aria-hidden="true" />
          <div class="flex flex-col gap-1 min-w-0">
            <h4 class="learn-responsibility-title m-0">{{ item.title }}</h4>
            <p class="learn-paragraph m-0">{{ item.body }}</p>
          </div>
        </li>
      </ul>
    </section>
  </article>
</template>
