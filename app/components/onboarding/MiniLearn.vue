<script setup lang="ts">
// Static reduction of the LearnPanel pinned card. Reuses learn.pinnedForComponent
// ("Relevant to {component}") with a real nav label; the topic title/summary are
// sample copy. Mirrors the pinned card's brand-tinted left-rule styling.
const { t } = useI18n();
</script>

<template>
  <div
    class="w-[400px] p-3 bg-(--brand-soft) border border-(--brand-soft-2) border-l-[3px] border-l-(--brand) rounded-md flex flex-col gap-2.5"
  >
    <span
      class="inline-flex items-center gap-1.5 text-(length:--al-font-size-detail) font-semibold text-(--brand)"
    >
      <UIcon
        name="i-lucide-pin"
        class="size-3.5"
      />
      {{ t("learn.pinnedForComponent", { component: t("nav.buttonsActionTriggers") }) }}
    </span>
    <div
      class="flex items-center justify-between gap-2.5 p-3 bg-(--surface) border border-(--border) rounded-md"
    >
      <span class="flex flex-col gap-1">
        <span class="text-(length:--al-font-size-detail) font-semibold text-(--brand)">
          {{ t("onboarding.visuals.learn.title") }}
        </span>
        <span class="text-(length:--al-font-size-caption) text-(--text-secondary) leading-normal">
          {{ t("onboarding.visuals.learn.summary") }}
        </span>
      </span>
      <UIcon
        name="i-lucide-arrow-up-right"
        class="size-4 shrink-0 text-(--text-muted)"
      />
    </div>
  </div>
</template>
