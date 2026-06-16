<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const { t } = useI18n();
const { activeTab } = useInspectorTab();

const tabItems = computed<TabsItem[]>(() => [
  { label: t("inspector.controls"), value: "controls" },
  { label: t("inspector.issues"), value: "issues" },
  { label: t("inspector.manual"), value: "manual" },
  { label: t("inspector.learn"), value: "learn" },
]);
</script>

<template>
  <aside :aria-label="t('inspector.ariaLabel')"
    class="w-[420px] shrink-0 flex flex-col min-h-0 border-l border-(--border) bg-(--bg)">
    <UTabs v-model="activeTab" :items="tabItems" variant="link" color="primary" size="lg" :content="false"
      :ui="{ list: 'justify-around', label: 'overflow-visible whitespace-nowrap' }" />

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div v-show="activeTab === 'controls'" :id="INSPECTOR_PANEL_IDS.controls" role="tabpanel" tabindex="-1"
        :aria-label="t('inspector.controls')" class="p-4">
        <RootEmSlider />
      </div>

      <div v-show="activeTab === 'issues'" :id="INSPECTOR_PANEL_IDS.issues" role="tabpanel" tabindex="-1"
        :aria-label="t('inspector.issues')" class="p-4" />

      <div v-show="activeTab === 'manual'" :id="INSPECTOR_PANEL_IDS.manual" role="tabpanel" tabindex="-1"
        :aria-label="t('inspector.manual')" class="p-4" />

      <div v-show="activeTab === 'learn'" :id="INSPECTOR_PANEL_IDS.learn" role="tabpanel" tabindex="-1"
        :aria-label="t('inspector.learn')" class="p-4" />
    </div>
  </aside>
</template>
