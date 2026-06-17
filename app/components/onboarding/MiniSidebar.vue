<script setup lang="ts">
// Static reduction of AppSidebar's Buttons group - a fixed four-item excerpt
// with the first item shown active. Mirrors the real nav's active-item style
// (brand left-rule + brand-soft fill) and reuses the nav.* i18n labels.
const { t } = useI18n();

const items = computed(() => [
  { icon: "i-lucide-square-mouse-pointer", label: t("nav.buttonsActionTriggers"), active: true },
  { icon: "i-lucide-send", label: t("nav.buttonsFormButtons"), active: false },
  { icon: "i-lucide-circle-power", label: t("nav.buttonsToggleButtons"), active: false },
]);
</script>

<template>
  <div class="w-[280px] py-2.5 bg-(--surface) border border-(--border) rounded-md">
    <p
      class="m-0 px-3.5 pb-1 text-(length:--al-font-size-caption) font-semibold uppercase tracking-wider text-(--text-muted)"
    >
      {{ t("nav.buttons") }}
    </p>
    <div
      v-for="item in items"
      :key="item.label"
      class="flex items-center gap-2.5 py-1.5 px-3.5 border-l-[3px] text-(length:--al-font-size-nav)"
      :class="
        item.active
          ? 'border-(--brand) bg-(--brand-soft) text-(--brand) font-semibold'
          : 'border-transparent text-(--text-secondary) font-medium'
      "
    >
      <UIcon
        :name="item.icon"
        class="size-[15px]"
      />
      {{ item.label }}
    </div>
  </div>
</template>
