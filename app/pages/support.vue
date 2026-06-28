<script setup lang="ts">
const { t } = useI18n();

// This page renders without a layout, so nothing else applies the `.theme-*`
// classes tokens.css keys off (the studio/reader get them via AppBar). Register
// the effect here so the page themes correctly in dark / high-contrast.
useTheme();

definePageMeta({ layout: false });

useSeoMeta({
  title: () => t("support.meta.title"),
  description: () => t("support.meta.description"),
  ogTitle: () => t("support.meta.title"),
  ogDescription: () => t("support.meta.description"),
});
</script>

<template>
  <div class="min-h-dvh bg-(--bg) text-(--text-secondary)">
    <main class="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <NuxtLink
        to="/"
        class="flex w-fit items-center gap-1.5 rounded-md py-1 text-(length:--al-font-size-nav) font-medium text-(--text-secondary) no-underline hover:text-(--brand) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) motion-safe:transition-colors"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        {{ t("support.back") }}
      </NuxtLink>

      <h1
        class="mt-8 text-(length:--al-learn-h1-font-size) font-semibold leading-[1.2] text-(--al-learn-h1-color)"
      >
        {{ t("support.title") }}
      </h1>
      <p class="mt-3 text-lg max-w-[22rem] leading-relaxed text-(--text-secondary)">
        {{ t("support.intro") }}
      </p>

      <KofiSupportCard class="mt-8" />
    </main>
  </div>
</template>
