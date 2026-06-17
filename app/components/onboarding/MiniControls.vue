<script setup lang="ts">
// Static reduction of the Controls panel - a label field, a colour row, and a
// focus-indicator switch. Reuses the real controls labels (controls.label /
// labelPlaceholder / background / focus). The hex is an inline sample literal.
const { t } = useI18n();
</script>

<template>
  <div
    class="w-[400px] p-3.5 bg-(--surface) border border-(--border) rounded-md flex flex-col gap-3"
  >
    <div class="flex flex-col gap-1.5">
      <span
        class="text-(length:--al-font-size-caption) font-semibold uppercase tracking-wider text-(--text-muted)"
      >
        {{ t("controls.label") }}
      </span>
      <div
        class="py-1.5 px-2.5 border border-(--border-strong) bg-(--surface) text-(length:--al-font-size-detail) text-(--text-primary)"
      >
        {{ t("controls.labelPlaceholder") }}
      </div>
    </div>

    <div class="flex items-center gap-2.5">
      <span class="size-[34px] p-1 border-2 border-(--border-strong) rounded-md shrink-0">
        <span class="block size-full bg-(--brand) rounded-[3px]" />
      </span>
      <div class="flex flex-col">
        <span class="text-(length:--al-font-size-detail) font-medium text-(--text-primary)">
          {{ t("controls.background") }}
        </span>
        <span class="text-(length:--al-font-size-caption) font-mono text-(--text-muted)"
          >#5700EE</span
        >
      </div>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-(length:--al-font-size-detail) text-(--text-secondary)">
        {{ t("controls.focus") }}
      </span>
      <span class="inline-flex items-center w-9 h-5 rounded-full bg-(--brand) p-0.5">
        <span class="size-4 rounded-full bg-(--on-brand) ml-auto" />
      </span>
    </div>
  </div>
</template>
