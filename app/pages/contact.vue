<script setup lang="ts">
const { t } = useI18n();

definePageMeta({ layout: "page" });

useSeoMeta({
  title: () => t("contact.meta.title"),
  description: () => t("contact.meta.description"),
  ogTitle: () => t("contact.meta.title"),
  ogDescription: () => t("contact.meta.description"),
});
</script>

<template>
  <main class="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
    <NuxtLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-md py-1 text-(length:--al-font-size-nav) font-medium text-(--text-secondary) no-underline hover:text-(--brand) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) motion-safe:transition-colors"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4 shrink-0"
        aria-hidden="true"
      />
      {{ t("contact.back") }}
    </NuxtLink>

    <h1
      class="mt-8 text-(length:--al-learn-h1-font-size) font-semibold leading-[1.2] text-(--al-learn-h1-color)"
    >
      {{ t("contact.title") }}
    </h1>
    <p class="mt-3 max-w-md text-lg leading-relaxed text-(--text-secondary)">
      {{ t("contact.intro") }}
    </p>

    <ContactForm class="mt-8" />
  </main>
</template>
