<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { isOpen: open, open: expand, close: collapse } = useSidebar();

const { t } = useI18n();

const route = useRoute();

// The active-item highlight is normally driven by the committed route, so it
// could not move until the destination page mounted — and each component page
// fully remounts, which takes up to ~1s. During that wait the clicked item
// briefly showed a dim, mid-transition highlight before the real one landed.
//
// The highlight is optimistically moved instead: the moment a link is activated
// we treat its path as the highlighted one, falling back to the real route once
// navigation settles. `aria-current` is left to the underlying link (driven by
// the committed route), so assistive technology is never told a page is current
// before it has actually loaded.
const pendingPath = ref<string | null>(null);
const highlightPath = computed(() => pendingPath.value ?? route.path);
watch(
  () => route.path,
  () => {
    pendingPath.value = null;
  },
);

// The line and text snap on/off (after:transition-none) rather than cross-fading,
// so the highlight never passes through a dimmed intermediate colour.
const activeLink = "text-primary after:bg-primary after:transition-none";
const inactiveLink = "text-muted after:bg-transparent after:transition-none";

function componentLink(label: string, to: string, icon: string): NavigationMenuItem {
  const isActive = to === highlightPath.value;
  return {
    label,
    to,
    icon,
    class: isActive ? activeLink : inactiveLink,
    ui: { linkLeadingIcon: isActive ? "text-primary" : "text-dimmed" },
    onSelect: () => {
      pendingPath.value = to;
    },
  };
}

const navItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: t("nav.buttons"),
      type: "trigger",
      class: "text-lg",
      defaultOpen: true,
      children: [
        componentLink(t("nav.buttonsActionTriggers"), "/components/buttons/action-triggers", "i-lucide-square-mouse-pointer"),
        componentLink(t("nav.buttonsFormButtons"), "/components/buttons/form-buttons", "i-lucide-send"),
        componentLink(t("nav.buttonsToggleButtons"), "/components/buttons/toggle-buttons", "i-lucide-toggle-left"),
        componentLink(t("nav.buttonsSwitches"), "/components/buttons/switches", "i-lucide-toggle-right"),
        componentLink(t("nav.buttonsDisclosureTriggers"), "/components/buttons/disclosure-triggers", "i-lucide-chevrons-down-up"),
        componentLink(t("nav.buttonsMenuTriggers"), "/components/buttons/menu-triggers", "i-lucide-menu"),
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
        componentLink(t("nav.input"), "/components/input", "i-lucide-text-cursor-input"),
        componentLink(t("nav.checkbox"), "/components/checkbox", "i-lucide-square-check-big"),
        componentLink(t("nav.radio"), "/components/radio", "i-lucide-circle-dot"),
        componentLink(t("nav.select"), "/components/select", "i-lucide-chevron-down-square"),
      ],
    },
  ],
]);
</script>

<template>
  <aside :aria-label="t('sidebar.ariaLabel')" class="border-r border-(--border) bg-(--bg) shrink-0">
    <div v-show="open" class="w-[260px] h-full overflow-y-auto">
      <div class="flex items-center justify-between pl-2 pr-2 pt-3">
        <span class="text-lg font-medium text-(--text-primary)">
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
