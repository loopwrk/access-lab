<script setup lang="ts">
const { t } = useI18n();

const REPO_URL = "https://github.com/loopwrk/access-lab";
</script>

<template>
  <section class="w-full border-t border-(--border) pt-10">
    <h2
      class="flex items-center gap-3 text-(length:--al-learn-h2-font-size) font-bold leading-tight text-(--brand)"
    >
      <UIcon
        name="i-simple-icons-github"
        class="size-8 shrink-0"
        aria-hidden="true"
      />
      {{ t("contact.contribute.heading") }}
    </h2>

    <p class="mt-5 max-w-xl text-lg leading-relaxed text-(--text-secondary)">
      {{ t("contact.contribute.body") }}
    </p>

    <a
      :href="REPO_URL"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-7 inline-flex items-center gap-1.5 font-bold text-(--brand) no-underline hover:text-(--brand-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) motion-safe:transition-colors"
    >
      {{ t("contact.contribute.cta") }}
      <UIcon
        name="i-lucide-arrow-up-right"
        class="size-5 shrink-0"
        aria-hidden="true"
      />
      <span class="sr-only">{{ t("contact.contribute.newTab") }}</span>
    </a>
  </section>
</template>
