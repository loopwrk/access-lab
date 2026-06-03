<script setup lang="ts">
const { t } = useI18n();

useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
  link: [
    { rel: "icon", href: "/favicon.ico" },
  ],
});

useSeoMeta({
  title: t("app.title"),
  description: t("app.description"),
  ogTitle: t("app.title"),
  ogDescription: t("app.description"),
  twitterCard: "summary_large_image",
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
