<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { isOpen: open, open: expand, close: collapse } = useSidebar();

const { t } = useI18n();

const navItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: t("nav.buttons"),
      type: "trigger",
      class: "text-lg",
      defaultOpen: true,
      children: [
        { label: t("nav.buttonsActionTriggers"), to: "/components/buttons/action-triggers", icon: "i-lucide-square-mouse-pointer" },
        { label: t("nav.buttonsFormButtons"), to: "/components/buttons/form-buttons", icon: "i-lucide-send" },
        { label: t("nav.buttonsToggleButtons"), to: "/components/buttons/toggle-buttons", icon: "i-lucide-toggle-left" },
        { label: t("nav.buttonsSwitches"), to: "/components/buttons/switches", icon: "i-lucide-toggle-right" },
        { label: t("nav.buttonsDisclosureTriggers"), to: "/components/buttons/disclosure-triggers", icon: "i-lucide-chevrons-down-up" },
        { label: t("nav.buttonsMenuTriggers"), to: "/components/buttons/menu-triggers", icon: "i-lucide-menu" },
      ],
    },
  ],
  [
    {
      label: t("nav.forms"),
      type: "trigger",
      class: "text-lg",
      defaultOpen: true,
      children: [
        { label: t("nav.input"), to: "/components/input", icon: "i-lucide-text-cursor-input" },
        { label: t("nav.checkbox"), to: "/components/checkbox", icon: "i-lucide-square-check-big" },
        { label: t("nav.radio"), to: "/components/radio", icon: "i-lucide-circle-dot" },
        { label: t("nav.select"), to: "/components/select", icon: "i-lucide-chevron-down-square" },
      ],
    },
  ],
]);
</script>

<template>
  <aside :aria-label="t('sidebar.ariaLabel')" class="border-r border-(--border) bg-(--bg) shrink-0">
    <div v-show="open" class="w-[260px] h-full overflow-y-auto">
      <div class="flex items-center justify-between pl-2 pr-2 pt-3">
        <span class="text-lg font-medium text-red">
          {{ t('nav.components') }}
        </span>
        <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-panel-left"
          :aria-label="t('sidebar.toggleClose')" :aria-pressed="true" @click="collapse" />
      </div>
      <UNavigationMenu :items="navItems" orientation="vertical" variant="link" :highlight="true" color="primary"
        highlight-color="primary" collapsible :ui="{
          link: 'text-md py-2.5 pl-2 pr-1 after:w-0.5',
          linkLabel: 'truncate',
          label: 'text-lg pl-3 pt-3',
          childList: 'ms-2 border-s-2 border-bg',
        }" />
    </div>

    <div v-show="!open" class="w-[44px] h-full flex flex-col items-center pt-3">
      <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-panel-left"
        :aria-label="t('sidebar.toggleOpen')" @click="expand" />
    </div>
  </aside>
</template>
